"""Import the Prajnadhara LearnPress course catalog into the LMS.

Idempotent by course slug. Existing courses that are not in this catalog
are left untouched. Re-running replaces only the imported course curriculum.
"""
import html
import json
import os
import re
import sys
from decimal import Decimal
from html.parser import HTMLParser
from pathlib import Path

import django

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import transaction
from django.utils.text import slugify

from apps.courses.models import Category, Course, CourseLevel, CourseStatus, Lecture, LectureType, Section
from apps.users.models import User

DATA_PATH = ROOT / 'data' / 'learnpress-courses.json'

CATEGORY_ICONS = {
    'Mobile App Development': 'Smartphone',
    'Data Science': 'BarChart3',
    'Artificial Intelligence': 'Sparkles',
    'Programming Languages': 'Code',
    'Web Development': 'Globe',
    'Cybersecurity': 'Shield',
    'Database': 'Database',
    'DevOps': 'Server',
    'Software Architecture': 'Layers',
    'Digital Marketing': 'Megaphone',
    'AI': 'Cpu',
    'Quantum Computing': 'Atom',
}


class _Parts(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self._tag = None
        self._buf = []

    def handle_starttag(self, tag, attrs):
        if tag in ('h1', 'h2', 'h3', 'p', 'li'):
            self._tag = tag
            self._buf = []

    def handle_endtag(self, tag):
        if self._tag == tag:
            text = ' '.join(''.join(self._buf).split())
            if text:
                self.parts.append((tag, text))
            self._tag = None
            self._buf = []

    def handle_data(self, data):
        if self._tag:
            self._buf.append(data)


def clean_text(value):
    return html.unescape(str(value or '')).replace('\xa0', ' ').strip()


def parse_body(raw):
    text = re.sub(r'<!--.*?-->', ' ', raw or '', flags=re.S)
    parser = _Parts()
    parser.feed(text)
    parser.close()
    description = []
    learn = []
    mode = None
    for tag, part in parser.parts:
        heading = part.lower()
        if tag in ('h1', 'h2', 'h3'):
            if 'learn' in heading:
                mode = 'learn'
            elif 'description' in heading:
                mode = 'description'
            else:
                mode = None
            continue
        if mode == 'learn' and tag == 'li':
            learn.append(part)
        elif mode == 'description' and tag == 'p':
            description.append(part)
        elif mode is None and tag == 'p' and len(part) > 40:
            description.append(part)
    if not learn:
        learn = [part for tag, part in parser.parts if tag == 'li']
    return '\n\n'.join(description), learn


def duration_fields(label):
    match = re.match(r'(\d+)\s*(week|hour)', (label or '').lower())
    if not match:
        return 0, 0.0
    amount = int(match.group(1))
    if match.group(2) == 'week':
        return amount, 0.0
    return 0, float(amount)


def instructor():
    existing = (
        Course.objects.exclude(instructor_id=None)
        .order_by('id')
        .values_list('instructor_id', flat=True)
        .first()
    )
    if existing:
        return User.objects.get(pk=existing)
    user = User.objects.filter(role='instructor', is_approved_instructor=True).order_by('id').first()
    if user:
        return user
    user = User.objects.filter(role__in=['admin', 'instructor']).order_by('id').first()
    if not user:
        raise SystemExit('No instructor or admin user exists to own the imported courses.')
    return user


def category_for(name, order):
    slug = slugify(name)[:150] or 'category'
    category, _created = Category.objects.get_or_create(
        slug=slug,
        defaults={
            'name': name,
            'icon_name': CATEGORY_ICONS.get(name, 'BookOpen'),
            'order': order,
        },
    )
    if category.name != name:
        category.name = name
        category.save(update_fields=['name', 'updated_at'])
    return category


def import_courses(payload):
    owner = instructor()
    category_order = {}
    created = 0
    updated = 0
    section_count = 0
    lesson_count = 0
    for course_data in payload:
        names = [clean_text(name) for name in course_data.get('categories') or []]
        names = [name for name in names if name]
        if not names:
            names = ['General']
        for name in names:
            category_order.setdefault(name, len(category_order) + 1)
            category_for(name, category_order[name])
        primary = category_for(names[0], category_order[names[0]])
        extras = names[1:]
        weeks, hours = duration_fields((course_data.get('settings') or {}).get('duration'))
        description, learned = parse_body(course_data.get('content') or '')
        subtitle = description.split('\n', 1)[0][:300]
        price = Decimal(str((course_data.get('pricing') or {}).get('sale_price') or (course_data.get('pricing') or {}).get('price') or '0'))
        regular = Decimal(str((course_data.get('pricing') or {}).get('regular_price') or price))
        settings = {
            'keyFeatures': [clean_text(item) for item in course_data.get('key_features') or []],
            'faqs': [
                {'question': clean_text(pair[0]), 'answer': clean_text(pair[1])}
                for pair in (course_data.get('faqs') or [])
                if isinstance(pair, (list, tuple)) and len(pair) >= 2
            ],
            'durationLabel': (course_data.get('settings') or {}).get('duration') or '',
            'passingGrade': int((course_data.get('settings') or {}).get('passing_condition') or 80),
            'wordpressId': course_data.get('id'),
            'sourceUrl': course_data.get('url') or '',
            'categories': names,
        }
        defaults = {
            'title': course_data['title'],
            'subtitle': subtitle,
            'category': primary,
            'subcategory': ', '.join(extras)[:150],
            'instructor': owner,
            'price': price,
            'original_price': regular,
            'is_free': price == 0,
            'level': CourseLevel.ALL_LEVELS,
            'language': 'English',
            'thumbnail': (course_data.get('thumbnail') or '')[:500],
            'what_you_will_learn': learned,
            'requirements': [clean_text(item) for item in course_data.get('requirements') or []],
            'target_audience': [clean_text(item) for item in course_data.get('target_audiences') or []],
            'description': description,
            'status': CourseStatus.PUBLISHED,
            'duration_hours': hours,
            'duration_weeks': weeks,
            'tags': extras,
            'settings': settings,
        }
        with transaction.atomic():
            course, was_created = Course.objects.update_or_create(slug=course_data['slug'], defaults=defaults)
            course.curriculum.all().delete()
            lessons = 0
            for section_data in course_data.get('curriculum') or []:
                section = Section.objects.create(
                    course=course,
                    title=clean_text(section_data.get('section_name'))[:255] or 'Section',
                    order=int(section_data.get('section_order') or 0),
                )
                section_count += 1
                for index, item in enumerate(section_data.get('items') or [], start=1):
                    Lecture.objects.create(
                        section=section,
                        title=clean_text(item.get('title'))[:255] or 'Lesson',
                        duration_minutes=0,
                        type=LectureType.ARTICLE,
                        content=clean_text(item.get('content')),
                        order=index,
                    )
                    lessons += 1
                    lesson_count += 1
            course.lecture_count = lessons
            course.save(update_fields=['lecture_count', 'updated_at'])
        created += int(was_created)
        updated += int(not was_created)
        print(f"{'created' if was_created else 'updated'} {course.slug} price={course.price} sections={course.curriculum.count()} lessons={lessons}")
    print(f"categories={Category.objects.filter(name__in=category_order).count()} created={created} updated={updated} sections={section_count} lessons={lesson_count}")


def main():
    payload = json.loads(DATA_PATH.read_text())
    if len(payload) != 16:
        raise SystemExit(f'Expected 16 courses, found {len(payload)}')
    import_courses(payload)


if __name__ == '__main__':
    main()
