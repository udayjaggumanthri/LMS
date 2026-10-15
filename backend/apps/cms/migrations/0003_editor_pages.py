from django.db import migrations, models


def seed_storefront_pages(apps, schema_editor):
    Page = apps.get_model('cms', 'Page')
    PageSection = apps.get_model('cms', 'PageSection')

    pages = [
        ('home', 'Home', 'Home'),
        ('about', 'About', 'About Us'),
        ('teach', 'Teach', 'Teach with Us'),
        ('contact', 'Contact', 'Contact Us'),
        ('terms', 'Terms & Conditions', 'Terms & Conditions'),
        ('privacy', 'Privacy Policy', 'Privacy Policy'),
        ('refund', 'Refund Policy', 'Refund & Cancellation Policy'),
        ('instructor-terms', 'Instructor Terms', 'Instructor Terms'),
    ]
    created = {}
    for slug, title, meta in pages:
        page, _ = Page.objects.get_or_create(
            slug=slug,
            defaults={'title': title, 'meta_title': meta, 'is_published': True},
        )
        created[slug] = page

    sections = [
        {
            'page': 'home',
            'section_key': 'hero',
            'section_name': 'Home hero',
            'badge_text': 'Practical Skill-Based Learning Marketplace',
            'title': 'Build Your Future in Technology',
            'subtitle': 'Access industry-relevant courses designed to help you master programming, cloud technologies, and modern digital skills demanded by top employers.',
            'primary_btn_text': 'Get Started Now',
            'primary_btn_link': '/courses',
            'secondary_btn_text': 'Contact Us',
            'secondary_btn_link': '/contact',
            'order': 0,
        },
        {
            'page': 'home',
            'section_key': 'faq',
            'section_name': 'Home questions',
            'title': 'Frequently Asked Questions',
            'json_data': {
                'items': [
                    {
                        'title': 'How does PrajnadharaEdu differ from traditional institutes or universities?',
                        'content': 'PrajnadharaEdu operates as an open, practical marketplace for skill-based learning. There are no rigid admissions, semesters, batches, or academic quotas. Every course is crafted by industry practitioners and comes with lifetime access, practical projects, and a verifiable certificate of completion.',
                    },
                    {
                        'title': 'Do I get lifetime access to purchased courses?',
                        'content': 'Yes! Once enrolled in any course on PrajnadharaEdu, you receive unlimited lifetime access to all course lectures, resources, exercise files, and future curriculum updates at no extra charge.',
                    },
                    {
                        'title': 'Are PrajnadharaEdu certificates industry-recognized?',
                        'content': 'Yes. Upon completing all lessons and passing assessment evaluations, you receive a verifiable digital certificate with a unique cryptographic verification serial number that you can attach to resumes and LinkedIn.',
                    },
                    {
                        'title': 'Can anyone apply to teach on PrajnadharaEdu?',
                        'content': 'Yes. Experienced practitioners and instructors can apply to publish courses, set their own prices in INR, launch coupons, and earn revenue after a transparent platform commission.',
                    },
                ]
            },
            'order': 1,
        },
        {
            'page': 'about',
            'section_key': 'hero',
            'section_name': 'About hero',
            'badge_text': 'What they say!!',
            'title': 'Empowering students with accessible, high-quality, and career-focused education.',
            'subtitle': 'PrajnadharaEdu is a dedicated online learning platform committed to empowering students with high-quality, accessible, and career-focused education. We provide a wide range of courses designed to help learners build strong academic foundations, develop practical skills, and achieve their professional goals.',
            'content': 'At PrajnadharaEdu, we believe in simplifying education through expert-led content, interactive learning experiences, and student-centric resources. Our mission is to bridge the gap between knowledge and real-world application by offering affordable and effective learning solutions. Whether you are a beginner or looking to upgrade your skills, PrajnadharaEdu is your trusted partner in continuous learning and career growth.',
            'primary_btn_text': 'Explore Now',
            'primary_btn_link': '/courses',
            'order': 0,
        },
        {
            'page': 'about',
            'section_key': 'mission',
            'section_name': 'Why choose us',
            'badge_text': 'your skill',
            'title': 'Why Choose PrajnadharaEdu?',
            'subtitle': 'At PrajnadharaEdu, we build a complete learning ecosystem for students and professionals. Learning here is not limited to watching lessons. It’s about practicing skills, collaborating with peers, and growing together with guidance from experienced mentors.',
            'order': 1,
        },
        {
            'page': 'teach',
            'section_key': 'hero',
            'section_name': 'Teach hero',
            'badge_text': 'Prajnadhara Instructor Program',
            'title': 'Teach the tradecraft you practice every day.',
            'subtitle': 'Deliver rigorous, semester-aligned curricula on PrajnadharaEdu. Create practical courses, organize modular lessons, attach project source code, and directly publish to thousands of enrolled students.',
            'order': 0,
        },
        {
            'page': 'contact',
            'section_key': 'hero',
            'section_name': 'Contact hero',
            'badge_text': 'Support & Communications',
            'title': 'Contact PrajnadharaEdu',
            'subtitle': 'Have an inquiry regarding courses, instructor onboarding, or a 30-day refund? Our team responds within 24 hours.',
            'order': 0,
        },
        {
            'page': 'terms',
            'section_key': 'hero',
            'section_name': 'Terms heading',
            'badge_text': 'Policy',
            'title': 'Terms & Conditions',
            'subtitle': 'Please read these terms carefully before using our website and services.',
            'order': 0,
        },
        {
            'page': 'privacy',
            'section_key': 'hero',
            'section_name': 'Privacy heading',
            'badge_text': 'Policy',
            'title': 'Privacy Policy',
            'subtitle': 'Last Updated: 2026 · PrajnadharaEdu',
            'order': 0,
        },
        {
            'page': 'refund',
            'section_key': 'hero',
            'section_name': 'Refund heading',
            'badge_text': 'Statutory Student Protection',
            'title': 'Refund & Cancellation Policy',
            'subtitle': 'We offer a transparent 30-day money-back guarantee for eligible course purchases.',
            'order': 0,
        },
        {
            'page': 'instructor-terms',
            'section_key': 'hero',
            'section_name': 'Instructor terms heading',
            'badge_text': 'Instructor Partnership Agreement',
            'title': 'Instructor Terms & Revenue Sharing Agreement',
            'subtitle': 'Last Updated: October 1, 2026 · Standard 85/15 Economics',
            'order': 0,
        },
    ]
    for spec in sections:
        page = created[spec.pop('page')]
        key = spec['section_key']
        if PageSection.objects.filter(page=page, section_key=key).exists():
            continue
        PageSection.objects.create(page=page, **spec)


class Migration(migrations.Migration):

    dependencies = [
        ('cms', '0002_blogcategory_blogpost'),
    ]

    operations = [
        migrations.AlterField(
            model_name='pagesection',
            name='media_url',
            field=models.CharField(blank=True, default='', max_length=500),
        ),
        migrations.RunPython(seed_storefront_pages, migrations.RunPython.noop),
    ]
