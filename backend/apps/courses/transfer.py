"""Export and import the full LMS course catalog as JSON.

Courses are matched by slug. Importing the same file again updates that
course's content and leaves enrollments in place.
"""
import json
from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify

from apps.users.models import User

from .models import (
    Category,
    Course,
    CourseAnnouncement,
    CourseLevel,
    CourseStatus,
    Lecture,
    LectureResource,
    LectureType,
    Quiz,
    QuizQuestion,
    Section,
)

FORMAT_NAME = 'prajnadhara-lms-courses'
FORMAT_VERSION = 1
MAX_COURSES = 500

LEVELS = {choice for choice, _label in CourseLevel.choices}
STATUSES = {choice for choice, _label in CourseStatus.choices}
LECTURE_TYPES = {choice for choice, _label in LectureType.choices}


def _text(value, limit=None):
    text = '' if value is None else str(value).strip()
    if limit:
        return text[:limit]
    return text


def _list(value):
    if isinstance(value, list):
        return value
    if isinstance(value, str) and value.strip():
        return [line.strip() for line in value.splitlines() if line.strip()]
    return []


def _dict(value):
    return value if isinstance(value, dict) else {}


def _money(value):
    try:
        return Decimal(str(value if value not in (None, '') else '0')).quantize(Decimal('0.01'))
    except (InvalidOperation, ValueError):
        return Decimal('0.00')


def _int(value, default=0):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _bool(value):
    if isinstance(value, str):
        return value.strip().lower() in ('1', 'true', 'yes', 'on')
    return bool(value)


def _person(user):
    if user is None:
        return {'email': '', 'username': '', 'name': ''}
    name = f'{user.first_name} {user.last_name}'.strip() or user.username
    return {'email': user.email or '', 'username': user.username or '', 'name': name}


def export_catalog():
    categories = []
    for category in Category.objects.all().order_by('order', 'name'):
        categories.append({
            'name': category.name,
            'slug': category.slug,
            'description': category.description,
            'semester': category.semester,
            'subcategories': category.subcategories or [],
            'iconName': category.icon_name,
            'order': category.order,
            'isTop': category.is_top,
        })

    courses = []
    queryset = Course.objects.select_related('category', 'instructor').prefetch_related(
        'instructors',
        'curriculum__lectures__resources',
        'quizzes__questions',
        'announcements__author',
    )
    for course in queryset:
        team = []
        seen = set()
        people = []
        if course.instructor_id:
            people.append(course.instructor)
        people.extend(list(course.instructors.all()))
        for person in people:
            if person is None or person.id in seen:
                continue
            seen.add(person.id)
            team.append(_person(person))

        curriculum = []
        for section in course.curriculum.all():
            lectures = []
            for lecture in section.lectures.all():
                lectures.append({
                    'title': lecture.title,
                    'durationMinutes': lecture.duration_minutes,
                    'type': lecture.type,
                    'previewFree': lecture.preview_free,
                    'videoUrl': lecture.video_url,
                    'content': lecture.content,
                    'order': lecture.order,
                    'resources': [
                        {'name': resource.name, 'size': resource.size, 'url': resource.url}
                        for resource in lecture.resources.all()
                    ],
                })
            curriculum.append({
                'title': section.title,
                'order': section.order,
                'lectures': lectures,
            })

        quizzes = []
        for quiz in course.quizzes.all():
            quizzes.append({
                'title': quiz.title,
                'passingScorePercent': quiz.passing_score_percent,
                'timeLimitMinutes': quiz.time_limit_minutes,
                'questions': [
                    {
                        'question': question.question,
                        'options': question.options or [],
                        'correctOptionIndex': question.correct_option_index,
                        'explanation': question.explanation,
                        'order': question.order,
                    }
                    for question in quiz.questions.all()
                ],
            })

        announcements = []
        for row in course.announcements.all():
            author = _person(row.author)
            announcements.append({
                'title': row.title,
                'body': row.body,
                'authorEmail': author['email'],
            })

        courses.append({
            'title': course.title,
            'subtitle': course.subtitle,
            'slug': course.slug,
            'categorySlug': course.category.slug if course.category_id else '',
            'categoryName': course.category.name if course.category_id else '',
            'subcategory': course.subcategory,
            'instructors': team,
            'price': str(course.price),
            'originalPrice': str(course.original_price),
            'isFree': course.is_free,
            'level': course.level,
            'language': course.language,
            'badges': course.badges or [],
            'thumbnail': course.thumbnail,
            'previewVideoUrl': course.preview_video_url,
            'whatYouWillLearn': course.what_you_will_learn or [],
            'requirements': course.requirements or [],
            'targetAudience': course.target_audience or [],
            'description': course.description,
            'status': course.status,
            'featured': course.featured,
            'reviewFeedback': course.review_feedback,
            'durationWeeks': course.duration_weeks,
            'tags': course.tags or [],
            'settings': course.settings or {},
            'curriculum': curriculum,
            'quizzes': quizzes,
            'announcements': announcements,
        })

    return {
        'format': FORMAT_NAME,
        'version': FORMAT_VERSION,
        'exportedAt': timezone.now().isoformat(),
        'courseCount': len(courses),
        'categories': categories,
        'courses': courses,
    }


def _load_payload(raw):
    if isinstance(raw, (bytes, str)):
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise ValueError('The file is not valid JSON.') from exc
    elif isinstance(raw, dict):
        payload = raw
    else:
        raise ValueError('Upload the JSON file exported from this catalog.')
    courses = payload.get('courses')
    if payload.get('format') not in (None, FORMAT_NAME) or not isinstance(courses, list):
        raise ValueError('This file is not a Prajnadhara course export.')
    if len(courses) > MAX_COURSES:
        raise ValueError(f'A single import can contain at most {MAX_COURSES} courses.')
    return payload


def _category_from_row(row):
    name = _text(row.get('name') or row.get('categoryName'), 150)
    slug = slugify(_text(row.get('slug') or row.get('categorySlug') or name, 150))[:150]
    if not name or not slug:
        return None
    defaults = {
        'name': name,
        'description': row.get('description') or '',
        'semester': _text(row.get('semester'), 50),
        'subcategories': _list(row.get('subcategories')),
        'icon_name': _text(row.get('iconName') or 'Code', 50) or 'Code',
        'order': _int(row.get('order')),
        'is_top': _bool(row.get('isTop')),
    }
    category, created = Category.objects.get_or_create(slug=slug, defaults=defaults)
    if not created:
        changed = False
        if row.get('name'):
            category.name = name
            changed = True
        if 'description' in row:
            category.description = row.get('description') or ''
            changed = True
        if 'semester' in row:
            category.semester = defaults['semester']
            changed = True
        if 'subcategories' in row:
            category.subcategories = defaults['subcategories']
            changed = True
        if row.get('iconName'):
            category.icon_name = defaults['icon_name']
            changed = True
        if 'order' in row:
            category.order = defaults['order']
            changed = True
        if 'isTop' in row:
            category.is_top = defaults['is_top']
            changed = True
        if changed:
            category.save()
    return category, created


def _find_user(email, username):
    email = _text(email, 254).lower()
    username = _text(username, 150)
    if email:
        user = User.objects.filter(email__iexact=email).first()
        if user:
            return user
    if username:
        return User.objects.filter(username__iexact=username).first()
    return None


def _teaching_team(row, actor):
    found = []
    seen = set()
    for person in _list(row.get('instructors')):
        if not isinstance(person, dict):
            continue
        user = _find_user(person.get('email'), person.get('username'))
        if user and user.id not in seen and user.role in ('instructor', 'admin'):
            seen.add(user.id)
            found.append(user)
    if not found and actor is not None:
        found = [actor]
    return found


def _save_curriculum(course, sections):
    course.curriculum.all().delete()
    total_lectures = 0
    total_minutes = 0
    for index, section_row in enumerate(sections):
        if not isinstance(section_row, dict):
            continue
        section = Section.objects.create(
            course=course,
            title=_text(section_row.get('title') or f'Section {index + 1}', 255),
            order=_int(section_row.get('order'), index),
        )
        for lecture_index, lecture_row in enumerate(_list(section_row.get('lectures'))):
            if not isinstance(lecture_row, dict):
                continue
            minutes = max(0, _int(lecture_row.get('durationMinutes'), 10))
            lecture_type = lecture_row.get('type') if lecture_row.get('type') in LECTURE_TYPES else LectureType.VIDEO
            lecture = Lecture.objects.create(
                section=section,
                title=_text(lecture_row.get('title') or f'Lecture {lecture_index + 1}', 255),
                duration_minutes=minutes,
                type=lecture_type,
                preview_free=_bool(lecture_row.get('previewFree')),
                video_url=_text(lecture_row.get('videoUrl'), 500),
                content=lecture_row.get('content') or '',
                order=_int(lecture_row.get('order'), lecture_index),
            )
            total_lectures += 1
            total_minutes += minutes
            for resource in _list(lecture_row.get('resources')):
                if not isinstance(resource, dict):
                    continue
                name = _text(resource.get('name'), 255)
                url = _text(resource.get('url'), 500)
                if not name or not url:
                    continue
                LectureResource.objects.create(
                    lecture=lecture,
                    name=name,
                    size=_text(resource.get('size') or '1.2 MB', 50),
                    url=url,
                )
    course.lecture_count = total_lectures
    if total_minutes > 0:
        course.duration_hours = round(total_minutes / 60, 1)


def _save_quizzes(course, quizzes):
    course.quizzes.all().delete()
    for quiz_row in quizzes:
        if not isinstance(quiz_row, dict):
            continue
        quiz = Quiz.objects.create(
            course=course,
            title=_text(quiz_row.get('title') or 'Quiz', 255),
            passing_score_percent=max(0, min(100, _int(quiz_row.get('passingScorePercent'), 80))),
            time_limit_minutes=max(0, _int(quiz_row.get('timeLimitMinutes'), 30)),
        )
        for index, question_row in enumerate(_list(quiz_row.get('questions'))):
            if not isinstance(question_row, dict):
                continue
            options = [str(option) for option in _list(question_row.get('options'))]
            QuizQuestion.objects.create(
                quiz=quiz,
                question=question_row.get('question') or '',
                options=options,
                correct_option_index=max(0, _int(question_row.get('correctOptionIndex'))),
                explanation=question_row.get('explanation') or '',
                order=_int(question_row.get('order'), index),
            )


def _save_announcements(course, rows, actor):
    course.announcements.all().delete()
    for row in rows:
        if not isinstance(row, dict):
            continue
        title = _text(row.get('title'), 200)
        body = row.get('body') or ''
        if not title or not str(body).strip():
            continue
        author = _find_user(row.get('authorEmail'), '') or actor
        CourseAnnouncement.objects.create(course=course, author=author, title=title, body=str(body))


def _apply_course(row, actor, categories_by_slug):
    if not isinstance(row, dict):
        raise ValueError('One course entry is not an object.')
    title = _text(row.get('title'), 255)
    if not title:
        raise ValueError('A course is missing its title.')
    slug = slugify(_text(row.get('slug') or title, 255))[:255] or 'course'
    category_slug = slugify(_text(row.get('categorySlug') or row.get('categoryName') or 'general', 150))[:150]
    category = categories_by_slug.get(category_slug)
    if category is None:
        created = _category_from_row({
            'name': row.get('categoryName') or category_slug.replace('-', ' ').title(),
            'slug': category_slug,
        })
        if created is None:
            raise ValueError(f'Course "{title}" has no category.')
        category, _was_new = created
        categories_by_slug[category.slug] = category

    team = _teaching_team(row, actor)
    level = row.get('level') if row.get('level') in LEVELS else CourseLevel.ALL_LEVELS
    status = row.get('status') if row.get('status') in STATUSES else CourseStatus.DRAFT
    fields = {
        'title': title,
        'subtitle': _text(row.get('subtitle'), 300),
        'category': category,
        'subcategory': _text(row.get('subcategory'), 150),
        'price': _money(row.get('price')),
        'original_price': _money(row.get('originalPrice')),
        'is_free': _bool(row.get('isFree')),
        'level': level,
        'language': _text(row.get('language') or 'English', 50) or 'English',
        'badges': _list(row.get('badges')),
        'thumbnail': _text(row.get('thumbnail'), 500),
        'preview_video_url': _text(row.get('previewVideoUrl'), 500),
        'what_you_will_learn': [str(item) for item in _list(row.get('whatYouWillLearn'))],
        'requirements': [str(item) for item in _list(row.get('requirements'))],
        'target_audience': [str(item) for item in _list(row.get('targetAudience'))],
        'description': row.get('description') or '',
        'status': status,
        'featured': _bool(row.get('featured')),
        'review_feedback': row.get('reviewFeedback') or '',
        'duration_weeks': max(0, _int(row.get('durationWeeks'), 10)),
        'tags': _list(row.get('tags')),
        'settings': _dict(row.get('settings')),
    }
    existing = Course.objects.filter(slug=slug).first()
    if existing:
        for key, value in fields.items():
            setattr(existing, key, value)
        if team:
            existing.instructor = team[0]
            existing.save()
            existing.instructors.set(team)
        else:
            existing.save()
        course = existing
        action = 'updated'
    else:
        base = slug
        counter = 1
        while Course.objects.filter(slug=slug).exists():
            counter += 1
            slug = f'{base}-{counter}'[:255]
        course = Course.objects.create(
            slug=slug,
            instructor=team[0] if team else actor,
            **fields,
        )
        course.instructors.set(team or [actor])
        action = 'created'

    if 'curriculum' in row:
        _save_curriculum(course, _list(row.get('curriculum')))
        course.save(update_fields=['lecture_count', 'duration_hours', 'updated_at'])
    if 'quizzes' in row:
        _save_quizzes(course, _list(row.get('quizzes')))
    if 'announcements' in row:
        _save_announcements(course, _list(row.get('announcements')), actor)
    return action, course.slug


def import_catalog(raw, actor):
    payload = _load_payload(raw)
    categories_by_slug = {category.slug: category for category in Category.objects.all()}
    categories_created = 0
    for row in _list(payload.get('categories')):
        if not isinstance(row, dict):
            continue
        result = _category_from_row(row)
        if result is None:
            continue
        category, created = result
        categories_by_slug[category.slug] = category
        if created:
            categories_created += 1

    created = 0
    updated = 0
    errors = []
    for index, row in enumerate(payload.get('courses') or []):
        label = ''
        if isinstance(row, dict):
            label = _text(row.get('slug') or row.get('title'), 255)
        try:
            with transaction.atomic():
                action, slug = _apply_course(row, actor, categories_by_slug)
            if action == 'created':
                created += 1
            else:
                updated += 1
        except Exception as exc:
            errors.append({'course': label or f'row {index + 1}', 'error': str(exc)})
    return {
        'created': created,
        'updated': updated,
        'categoriesCreated': categories_created,
        'errors': errors,
    }
