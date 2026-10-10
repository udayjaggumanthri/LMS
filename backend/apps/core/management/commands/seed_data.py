import uuid
from decimal import Decimal
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.users.models import User, UserRole
from apps.courses.models import Category, Course, Section, Lecture, LectureResource, Quiz, QuizQuestion
from apps.cart.models import Coupon
from apps.cms.models import Page, PageSection
from apps.interactions.models import Review, QAQuestion, QAAnswer
from apps.admin_governance.models import PlatformSettings

class Command(BaseCommand):
    help = 'Seeds initial LMS database with categories, courses, instructors, coupons, and CMS content'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Initializing PrajnadharaEdu Database Seeding..."))

        # 1. Platform Settings
        PlatformSettings.objects.get_or_create(
            key='global',
            defaults={
                'platform_name': 'PrajnadharaEdu',
                'support_email': 'support@prajnadhara.edu',
                'instructor_revenue_share_percent': 70,
                'platform_fee_percent': 30,
                'gst_rate_percent': 18,
                'currency': 'INR',
                'currency_symbol': '₹'
            }
        )

        # 2. Production & Admin Users
        uday_user, _ = User.objects.get_or_create(
            username='uday',
            defaults={
                'email': 'udayjaggumanthri@gmail.com',
                'first_name': 'uday',
                'last_name': '',
                'role': UserRole.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'is_approved_instructor': True,
                'title': 'Platform Administrator & Lead Architect',
                'avatar': 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300'
            }
        )
        uday_user.email = 'udayjaggumanthri@gmail.com'
        uday_user.set_password('Test@123')
        uday_user.save()

        admin_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@prajnadhara.edu',
                'first_name': 'Kavita',
                'last_name': 'Ramanathan',
                'role': UserRole.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'title': 'Academic Registrar & Platform Administrator',
                'avatar': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300'
            }
        )
        admin_user.set_password('AdminPass123!')
        admin_user.save()

        inst_user, _ = User.objects.get_or_create(
            username='instructor',
            defaults={
                'email': 'instructor@prajnadhara.edu',
                'first_name': 'Dr. Ananya',
                'last_name': 'Sharma',
                'role': UserRole.INSTRUCTOR,
                'is_approved_instructor': True,
                'title': 'Principal Distributed Systems Engineer & Ex-Staff Architect',
                'bio': '15+ years architecting fault-tolerant backend infrastructures serving 100M+ DAUs. Author of "Reliable Distributed Systems".',
                'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
                'rating': 4.9,
                'reviews_count': 3840,
                'students_count': 42100,
                'total_earnings': Decimal('842000.00'),
                'payout_method': {'type': 'bank', 'accountNumber': '918237461928', 'ifsc': 'HDFC0001824'}
            }
        )
        inst_user.set_password('InstructorPass123!')
        inst_user.save()

        inst_vikram, _ = User.objects.get_or_create(
            username='vikram',
            defaults={
                'email': 'vikram.m@prajnadhara.edu',
                'first_name': 'Vikram',
                'last_name': 'Malhotra',
                'role': UserRole.INSTRUCTOR,
                'is_approved_instructor': True,
                'title': 'Lead Product Designer & Design Systems Specialist',
                'bio': 'Built enterprise design token architectures for fintech platforms. Obsessed with accessibility and micro-interactions.',
                'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
                'rating': 4.85,
                'reviews_count': 1920,
                'students_count': 18500,
                'total_earnings': Decimal('370000.00')
            }
        )
        inst_vikram.set_password('InstructorPass123!')
        inst_vikram.save()

        student_user, _ = User.objects.get_or_create(
            username='student',
            defaults={
                'email': 'student@prajnadhara.edu',
                'first_name': 'Priyanshu',
                'last_name': 'Verma',
                'role': UserRole.STUDENT,
                'title': 'Associate Backend Engineer',
                'bio': 'Passionate about Go, Kubernetes, and distributed architectures.',
                'avatar': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200'
            }
        )
        student_user.set_password('StudentPass123!')
        student_user.save()

        # 3. Categories
        cat_dev, _ = Category.objects.get_or_create(
            slug='development',
            defaults={
                'name': 'Development',
                'description': 'Master modern programming languages, system design, API engineering, and cloud platforms.',
                'subcategories': ['Full-Stack Web', 'Backend Systems', 'Mobile Development', 'DevOps & SRE', 'Distributed Systems'],
                'icon_name': 'Code',
                'order': 1
            }
        )

        cat_ai, _ = Category.objects.get_or_create(
            slug='ai',
            defaults={
                'name': 'Artificial Intelligence',
                'description': 'Autonomous agents, generative AI architectures, neural computing, and enterprise agent workflows.',
                'subcategories': ['Autonomous Agents', 'LLM Architectures', 'Model Fine-Tuning', 'Inference Engineering'],
                'icon_name': 'Cpu',
                'order': 2
            }
        )

        cat_design, _ = Category.objects.get_or_create(
            slug='design',
            defaults={
                'name': 'Design',
                'description': 'Figma design tokens, responsive typography, spatial design, and micro-interactions.',
                'subcategories': ['Design Systems', 'UI/UX Architecture', 'Design Tokens', 'Product Design'],
                'icon_name': 'Palette',
                'order': 3
            }
        )

        cat_cloud, _ = Category.objects.get_or_create(
            slug='cloud-devops',
            defaults={
                'name': 'Cloud & DevOps',
                'description': 'Kubernetes orchestration, Terraform infrastructure as code, GitOps, and observability pipelines.',
                'subcategories': ['Kubernetes', 'Terraform', 'CI/CD Pipelines', 'AWS Architecture', 'Observability'],
                'icon_name': 'Cloud',
                'order': 4
            }
        )

        # 4. Courses
        c1, _ = Course.objects.get_or_create(
            slug='production-microservices-in-go-kubernetes',
            defaults={
                'title': 'Production Microservices in Go & Kubernetes',
                'subtitle': 'Architect, build, test, and deploy resilient event-driven microservices with gRPC, Kafka, and Helm on EKS.',
                'category': cat_dev,
                'subcategory': 'Backend Systems',
                'instructor': inst_user,
                'price': Decimal('1499.00'),
                'original_price': Decimal('3999.00'),
                'is_free': False,
                'level': 'Advanced',
                'language': 'English',
                'badges': ['Bestseller', 'Featured'],
                'thumbnail': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
                'preview_video_url': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                'what_you_will_learn': [
                    'Architect fault-tolerant Go microservices using clean domain-driven hex architecture',
                    'Implement high-throughput gRPC services with bi-directional streaming',
                    'Integrate Apache Kafka for reliable asynchronous event pub/sub with idempotent consumers',
                    'Package and orchestrate services using Docker, Helm charts, and Kubernetes deployments'
                ],
                'requirements': [
                    'Familiarity with foundational Go syntax and concurrent goroutines',
                    'Docker installed locally with basic terminal fluency'
                ],
                'target_audience': ['Backend engineers looking to advance to Senior or Staff systems engineering'],
                'description': 'Comprehensive masterclass guiding you from initial domain design to multi-region Kubernetes production deployments.',
                'status': 'published',
                'featured': True,
                'rating': 4.92,
                'reviews_count': 1420,
                'student_count': 12450,
                'duration_hours': 18.5,
                'lecture_count': 42
            }
        )

        # Add Curriculum to Course 1
        s1, _ = Section.objects.get_or_create(course=c1, title='Section 1: Architecture Blueprint & Domain Design', order=1)
        Lecture.objects.get_or_create(
            section=s1,
            title='1.1 System Overview & Production Prerequisites',
            defaults={
                'duration_minutes': 14,
                'type': 'video',
                'preview_free': True,
                'video_url': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                'order': 1
            }
        )
        Lecture.objects.get_or_create(
            section=s1,
            title='1.2 Structuring Clean Hexagonal Architecture in Go',
            defaults={'duration_minutes': 22, 'type': 'video', 'order': 2}
        )

        s2, _ = Section.objects.get_or_create(course=c1, title='Section 2: High-Performance gRPC & Protobuf', order=2)
        Lecture.objects.get_or_create(
            section=s2,
            title='2.1 Protocol Buffers Schema Definition & Code Generation',
            defaults={'duration_minutes': 18, 'type': 'video', 'order': 1}
        )
        Lecture.objects.get_or_create(
            section=s2,
            title='2.2 Implementing Bidirectional Streaming Endpoints',
            defaults={'duration_minutes': 26, 'type': 'video', 'order': 2}
        )

        # Course 2: Design Tokens
        c2, _ = Course.objects.get_or_create(
            slug='enterprise-design-tokens-figma-ui-architecture',
            defaults={
                'title': 'Enterprise Design Tokens & Figma UI Architecture',
                'subtitle': 'Establish scalable multi-brand design tokens, automated CI/CD style pipelines, and React components.',
                'category': cat_design,
                'subcategory': 'Design Systems',
                'instructor': inst_vikram,
                'price': Decimal('1299.00'),
                'original_price': Decimal('3299.00'),
                'is_free': False,
                'level': 'Intermediate',
                'language': 'English',
                'badges': ['Highest rated'],
                'thumbnail': 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
                'what_you_will_learn': [
                    'Build cohesive color, typography, and elevation scales with HSL tokens',
                    'Export Figma variables into Style Dictionary transforms for CSS and Tailwind',
                    'Construct accessible, zero-runtime React UI components'
                ],
                'requirements': ['Basic understanding of Figma and modern CSS variables'],
                'description': 'Master the exact design token workflow used by Fortune 500 design systems teams.',
                'status': 'published',
                'featured': True,
                'rating': 4.88,
                'reviews_count': 940,
                'student_count': 8200,
                'duration_hours': 12.0,
                'lecture_count': 28
            }
        )

        s2_1, _ = Section.objects.get_or_create(course=c2, title='Section 1: Token Taxonomy & Foundations', order=1)
        Lecture.objects.get_or_create(
            section=s2_1,
            title='1.1 Semantic vs Global Design Tokens',
            defaults={'duration_minutes': 16, 'type': 'video', 'preview_free': True, 'order': 1}
        )

        # 5. Coupons
        Coupon.objects.get_or_create(
            code='WELCOME50',
            defaults={
                'discount_percent': 50,
                'max_uses': 2000,
                'used_count': 142,
                'expires_at': date(2027, 12, 31),
                'active': True
            }
        )
        Coupon.objects.get_or_create(
            code='PRAKASH20',
            defaults={
                'discount_percent': 20,
                'max_uses': 1000,
                'used_count': 88,
                'expires_at': date(2027, 12, 31),
                'active': True
            }
        )
        Coupon.objects.get_or_create(
            code='FLASH30',
            defaults={
                'discount_percent': 30,
                'max_uses': 500,
                'used_count': 45,
                'expires_at': date(2027, 6, 30),
                'active': True
            }
        )

        # 6. CMS Pages & Sections (Elementor / Inbuilt Page Editor Engine)
        home_page, _ = Page.objects.get_or_create(
            slug='home',
            defaults={
                'title': 'Homepage',
                'meta_title': 'PrajnadharaEdu — Practical Skill-Based Online Learning Marketplace',
                'meta_description': 'Enterprise-grade online course marketplace for practical, skill-based engineering masterclasses.'
            }
        )

        PageSection.objects.get_or_create(
            page=home_page,
            section_key='hero',
            defaults={
                'section_name': 'Hero Banner & Value Proposition',
                'badge_text': 'Enterprise-Grade Practical Engineering Curriculum',
                'title': 'Master High-Impact Technical Skills from Proven Staff Architects',
                'subtitle': 'Immerse yourself in deep-dive production engineering, autonomous AI workflows, and distributed systems. Real repositories, zero fluff.',
                'primary_btn_text': 'Explore All Masterclasses',
                'primary_btn_link': '/courses',
                'secondary_btn_text': 'Become an Instructor',
                'secondary_btn_link': '/teach',
                'media_url': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
                'json_data': {
                    'metrics': [
                        {'label': 'Active Learners', 'value': '48,000+'},
                        {'label': 'Verified Curriculum Tracks', 'value': '24+'},
                        {'label': 'Average Course Rating', 'value': '4.9 / 5.0'}
                    ]
                },
                'order': 1
            }
        )

        PageSection.objects.get_or_create(
            page=home_page,
            section_key='features',
            defaults={
                'section_name': 'Platform Value Pillars',
                'badge_text': 'Why PrajnadharaEdu',
                'title': 'Engineered Specifically for Practicing Technical Leaders',
                'subtitle': 'Every track is designed with real industry architectures and peer-reviewed code standards.',
                'json_data': {
                    'cards': [
                        {'title': 'Production Codebases', 'desc': 'Fork and run enterprise repositories with automated testing suites.'},
                        {'title': 'Verifiable Credentials', 'desc': 'Official certificates backed by cryptographic verification hashes.'},
                        {'title': 'Staff Architect Mentorship', 'desc': 'Direct Q&A access to course authors who have shipped systems at scale.'}
                    ]
                },
                'order': 2
            }
        )

        # About Page
        about_page, _ = Page.objects.get_or_create(
            slug='about',
            defaults={
                'title': 'About Us',
                'meta_title': 'About PrajnadharaEdu',
                'meta_description': 'Our mission to elevate technical education through rigorous practical craftsmanship.'
            }
        )

        PageSection.objects.get_or_create(
            page=about_page,
            section_key='hero',
            defaults={
                'section_name': 'About Mission Statement',
                'badge_text': 'The Prajnadhara Mission',
                'title': 'Elevating Engineering Craftsmanship Through Real-World Mastery',
                'subtitle': 'Founded on the principle that true technical mastery requires building actual distributed systems, not clicking through multiple-choice questions.',
                'order': 1
            }
        )

        # 7. Sample Reviews
        Review.objects.get_or_create(
            course=c1,
            user=student_user,
            defaults={
                'rating': 5,
                'comment': 'Hands down the best Go microservices course on the web. The Kafka consumer idempotency module alone saved our team months of production debugging.',
                'helpful_count': 38,
                'instructor_reply_comment': 'Thank you Priyanshu! Ensuring message deduplication is crucial in high-throughput pipelines. Glad it unblocked your production deployment!',
                'instructor_reply_date': date(2026, 8, 14)
            }
        )

        # 8. Sample Q&A
        q1, _ = QAQuestion.objects.get_or_create(
            course=c1,
            user=student_user,
            title='Recommended dead-letter queue retry policy for Kafka consumers?',
            defaults={
                'content': 'When processing payment events via Kafka in Section 2, what is the best practice for handling transient database lock timeouts before routing to a DLQ?'
            }
        )
        QAAnswer.objects.get_or_create(
            question=q1,
            user=inst_user,
            defaults={
                'content': 'We recommend using an exponential backoff retry with jitter (e.g. 3 attempts over 5 seconds). If transient locks persist, commit the offset and publish to an async dead-letter topic.',
                'is_instructor': True
            }
        )

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully! All demo users, categories, masterclasses, coupons, and CMS sections are ready."))
