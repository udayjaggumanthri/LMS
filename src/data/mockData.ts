import {
  Category,
  Course,
  User,
  Review,
  QAQuestion,
  Order,
  RefundRequest,
  PayoutRequest,
  Coupon,
  InstructorApplication,
  Certificate,
  UserCourseProgress,
  NotificationItem,
  Quiz
} from '../types';

export const HERO_IMAGE = '/src/assets/images/hero_learning_lifestyle_1791558511252.jpg';
export const TEACH_IMAGE = '/src/assets/images/teach_instructor_studio_1791558529974.jpg';

export const CATEGORIES: Category[] = [
  {
    id: 'cat-ai',
    name: 'AI',
    slug: 'ai',
    description: 'Autonomous systems, generative AI architectures, neural computing, and enterprise agent workflows.',
    subcategories: ['Autonomous Agents', 'LLM Architectures', 'Model Fine-Tuning', 'AI Safety & Alignment', 'Inference Engineering'],
    courseCount: 4,
    iconName: 'Cpu'
  },
  {
    id: 'cat-artificial-intelligence',
    name: 'Artificial Intelligence',
    slug: 'artificial-intelligence',
    description: 'Foundations of artificial intelligence, neural networks, computer vision, NLP, and machine learning.',
    subcategories: ['Machine Learning', 'Computer Vision', 'Deep Learning', 'Natural Language Processing', 'Reinforcement Learning'],
    courseCount: 8,
    iconName: 'Sparkles'
  },
  {
    id: 'cat-cybersecurity',
    name: 'Cybersecurity',
    slug: 'cybersecurity',
    description: 'Network defense, ethical hacking, SOC operations, cloud threat hunting, and cryptography.',
    subcategories: ['Ethical Hacking', 'Cloud Security', 'Network Defense', 'Incident Response', 'Zero Trust Architecture'],
    courseCount: 2,
    iconName: 'Shield'
  },
  {
    id: 'cat-data-science',
    name: 'Data Science',
    slug: 'data-science',
    description: 'Statistical modeling, predictive analytics, Python data engineering, visualization, and big data.',
    subcategories: ['Data Analytics', 'Pandas & NumPy', 'Predictive Modeling', 'Tableau & PowerBI', 'Data Pipelines'],
    courseCount: 3,
    iconName: 'BarChart3'
  },
  {
    id: 'cat-database',
    name: 'Database',
    slug: 'database',
    description: 'Relational database architecture, PostgreSQL tuning, distributed SQL, indexing, and NoSQL clusters.',
    subcategories: ['PostgreSQL Mastery', 'SQL Performance Tuning', 'Distributed Databases', 'MongoDB & Document DB', 'Redis & Caching'],
    courseCount: 2,
    iconName: 'Database'
  },
  {
    id: 'cat-devops',
    name: 'DevOps',
    slug: 'devops',
    description: 'CI/CD pipeline automation, Kubernetes clusters, Docker containerization, Terraform, and site reliability.',
    subcategories: ['Kubernetes & Helm', 'Docker Containers', 'Terraform & IaC', 'GitHub Actions', 'Prometheus & Grafana'],
    courseCount: 2,
    iconName: 'GitMerge'
  },
  {
    id: 'cat-digital-marketing',
    name: 'Digital Marketing',
    slug: 'digital-marketing',
    description: 'Growth marketing, search engine optimization, paid media conversion funnels, and retention analytics.',
    subcategories: ['SEO Strategy', 'Performance Marketing', 'Conversion Optimization', 'Email Campaigns', 'Content Marketing'],
    courseCount: 1,
    iconName: 'Megaphone'
  },
  {
    id: 'cat-mobile-app',
    name: 'Mobile App Development',
    slug: 'mobile-app-development',
    description: 'Cross-platform mobile apps with React Native and Flutter, native iOS Swift, and Android modern architectures.',
    subcategories: ['React Native', 'Flutter & Dart', 'iOS Swift', 'Android Jetpack Compose', 'Mobile Security'],
    courseCount: 1,
    iconName: 'Smartphone'
  },
  {
    id: 'cat-dev',
    name: 'Development',
    slug: 'development',
    description: 'Learn full-stack engineering, web development, system design, and algorithms.',
    subcategories: ['Full-Stack Web', 'Python & Data', 'JavaScript & React', 'Backend Architecture', 'Mobile Apps'],
    courseCount: 6,
    iconName: 'Code'
  },
  {
    id: 'cat-business',
    name: 'Business',
    slug: 'business',
    description: 'Master entrepreneurship, executive leadership, product strategy, and operations.',
    subcategories: ['Product Management', 'Startup Strategy', 'Executive Leadership', 'Operations', 'Negotiation'],
    courseCount: 4,
    iconName: 'Briefcase'
  }
];

export const INSTRUCTORS: User[] = [
  {
    id: 'inst-1',
    name: 'Dr. Ananya Sharma',
    email: 'ananya.sharma@prajnadhara.edu',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    role: 'instructor',
    title: 'Principal Distributed Systems Engineer & Ex-Staff Architect',
    bio: '15+ years architecting fault-tolerant backend infrastructures serving 100M+ DAUs. Author of "Reliable Distributed Systems" and keynote speaker.',
    enrolledCourseIds: [],
    wishlistCourseIds: [],
    rating: 4.9,
    reviewsCount: 3840,
    studentsCount: 42100,
    totalEarnings: 842000,
    payoutMethod: { type: 'bank', accountNumber: '918237461928', ifsc: 'HDFC0001824' },
    joinedAt: '2023-01-15',
    isApprovedInstructor: true
  },
  {
    id: 'inst-2',
    name: 'Vikram Malhotra',
    email: 'vikram.m@prajnadhara.edu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    role: 'instructor',
    title: 'Lead Product Designer & Design Systems Specialist',
    bio: 'Built enterprise-scale design tokens and UI architecture for leading fintech platforms. Obsessed with micro-interactions, accessibility and Figma token pipelines.',
    enrolledCourseIds: [],
    wishlistCourseIds: [],
    rating: 4.8,
    reviewsCount: 2190,
    studentsCount: 28400,
    totalEarnings: 540000,
    payoutMethod: { type: 'upi', upiId: 'vikram.design@okhdfcbank' },
    joinedAt: '2023-03-20',
    isApprovedInstructor: true
  },
  {
    id: 'inst-3',
    name: 'Priya Sundaram',
    email: 'priya.sundaram@prajnadhara.edu',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    role: 'instructor',
    title: 'Chartered Financial Analyst (CFA) & Private Equity Director',
    bio: 'Specializes in leveraged buyout (LBO) modeling, venture valuation, and cross-border M&A transactions. Former Wall Street and Mumbai PE advisor.',
    enrolledCourseIds: [],
    wishlistCourseIds: [],
    rating: 4.9,
    reviewsCount: 1620,
    studentsCount: 19800,
    totalEarnings: 610000,
    payoutMethod: { type: 'bank', accountNumber: '782910394857', ifsc: 'ICIC0000421' },
    joinedAt: '2023-02-10',
    isApprovedInstructor: true
  },
  {
    id: 'inst-4',
    name: 'Marcus Chen',
    email: 'marcus.chen@prajnadhara.edu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    role: 'instructor',
    title: 'Cloud Solutions Architect & CNCF Contributor',
    bio: 'Kubernetes certified instructor, multi-cloud consultant specializing in enterprise migration, Terraform automation, and observability clusters.',
    enrolledCourseIds: [],
    wishlistCourseIds: [],
    rating: 4.85,
    reviewsCount: 2980,
    studentsCount: 34500,
    totalEarnings: 720000,
    payoutMethod: { type: 'bank', accountNumber: '483920194857', ifsc: 'SBIN0008472' },
    joinedAt: '2023-04-12',
    isApprovedInstructor: true
  },
  {
    id: 'inst-5',
    name: 'Elena Rostova',
    email: 'elena.rostova@prajnadhara.edu',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    role: 'instructor',
    title: 'Director of Growth Marketing & Retention Analyst',
    bio: 'Scaled high-growth SaaS and consumer apps from zero to $50M ARR. Expert in algorithmic search architecture, attribution modeling, and unit economics.',
    enrolledCourseIds: [],
    wishlistCourseIds: [],
    rating: 4.75,
    reviewsCount: 1420,
    studentsCount: 16300,
    totalEarnings: 380000,
    payoutMethod: { type: 'upi', upiId: 'elena.growth@axisbank' },
    joinedAt: '2023-06-01',
    isApprovedInstructor: true
  },
  {
    id: 'inst-6',
    name: 'David Kim',
    email: 'david.kim@prajnadhara.edu',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    role: 'instructor',
    title: 'Executive Product Coach & Former VP of Product',
    bio: 'Mentored over 80 product leaders across Silicon Valley and Bengaluru. Teaches practical product strategy, PRD writing, customer discovery and metric telemetry.',
    enrolledCourseIds: [],
    wishlistCourseIds: [],
    rating: 4.9,
    reviewsCount: 2150,
    studentsCount: 24700,
    totalEarnings: 590000,
    payoutMethod: { type: 'bank', accountNumber: '109283746501', ifsc: 'KKBK0009281' },
    joinedAt: '2023-05-18',
    isApprovedInstructor: true
  },
  {
    id: 'inst-7',
    name: 'Neha Deshmukh',
    email: 'neha.deshmukh@prajnadhara.edu',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=300&auto=format&fit=crop&q=80',
    role: 'instructor',
    title: 'Full-Stack TypeScript & Next.js Core Contributor',
    bio: 'Passionate about type safety, server components, React compiler, and high-performance frontend engineering. Mentor to thousands of career switchers.',
    enrolledCourseIds: [],
    wishlistCourseIds: [],
    rating: 4.92,
    reviewsCount: 4100,
    studentsCount: 48900,
    totalEarnings: 980000,
    payoutMethod: { type: 'upi', upiId: 'neha.ts@paytm' },
    joinedAt: '2022-11-05',
    isApprovedInstructor: true
  },
  {
    id: 'inst-8',
    name: 'Rahul Verma',
    email: 'rahul.verma@prajnadhara.edu',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    role: 'instructor',
    title: 'Commercial Cinematographer & Senior Colorist',
    bio: 'Shot commercial campaigns for global brands, documentary features on Netflix, and music videos. Expert in DaVinci Resolve color pipelines and natural lighting.',
    enrolledCourseIds: [],
    wishlistCourseIds: [],
    rating: 4.88,
    reviewsCount: 980,
    studentsCount: 11200,
    totalEarnings: 310000,
    payoutMethod: { type: 'bank', accountNumber: '293847192837', ifsc: 'BARB0INDBAN' },
    joinedAt: '2023-07-22',
    isApprovedInstructor: true
  },
  {
    id: 'inst-9',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@prajnadhara.edu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    role: 'instructor',
    title: 'Audio Engineer & Certified Ableton Producer',
    bio: 'Mixed over 200 charting records. Teaches acoustic treatment, compression fundamentals, stereo imaging, and modular synthesis with zero fluff.',
    enrolledCourseIds: [],
    wishlistCourseIds: [],
    rating: 4.79,
    reviewsCount: 820,
    studentsCount: 9400,
    totalEarnings: 270000,
    payoutMethod: { type: 'bank', accountNumber: '948201948271', ifsc: 'UTIB0001092' },
    joinedAt: '2023-08-14',
    isApprovedInstructor: true
  },
  {
    id: 'inst-10',
    name: 'Tariq Mansoor',
    email: 'tariq.mansoor@prajnadhara.edu',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
    role: 'instructor',
    title: 'High-Performance Executive Coach & Cognitive Scientist',
    bio: 'Advises FTSE 100 executives and venture founders on sleep science, deep work protocols, mental model frameworks, and persuasive speech engineering.',
    enrolledCourseIds: [],
    wishlistCourseIds: [],
    rating: 4.86,
    reviewsCount: 1540,
    studentsCount: 18200,
    totalEarnings: 450000,
    payoutMethod: { type: 'upi', upiId: 'tariq.coach@okaxis' },
    joinedAt: '2023-09-02',
    isApprovedInstructor: true
  },
  {
    id: 'inst-admin',
    name: 'admin',
    email: 'admin@prajnadharaedu.com',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&auto=format&fit=crop&q=80',
    role: 'admin',
    title: 'Lead AI Architect & Program Director',
    bio: 'Fellowship lead and enterprise autonomous systems architect at Prajnadhara EDU.',
    enrolledCourseIds: [],
    wishlistCourseIds: [],
    rating: 5.0,
    reviewsCount: 140,
    studentsCount: 103,
    totalEarnings: 2450000,
    joinedAt: '2022-01-01',
    isApprovedInstructor: true
  }
];

export const DEMO_USERS: Record<string, User> = {
  admin: {
    id: 'inst-admin',
    name: 'admin',
    email: 'admin@prajnadharaedu.com',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&auto=format&fit=crop&q=80',
    role: 'admin',
    title: 'Chief Operations Officer & Platform Administrator',
    bio: 'Overseeing curriculum standards, instructor governance, and catalog integrity across Prajnadhara EDU.',
    enrolledCourseIds: ['course-1', 'course-2', 'course-fellowship-1'],
    wishlistCourseIds: ['course-quantum-ai-2', 'course-ai-exec-3'],
    joinedAt: '2022-08-01',
    isApprovedInstructor: true
  },
  instructor: {
    id: 'inst-7',
    name: 'Neha Deshmukh',
    email: 'instructor@prajnadhara.edu',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=300&auto=format&fit=crop&q=80',
    role: 'instructor',
    title: 'Full-Stack TypeScript & Next.js Core Contributor',
    bio: 'Passionate about type safety, server components, React compiler, and high-performance frontend engineering.',
    enrolledCourseIds: ['course-1', 'course-3'],
    wishlistCourseIds: ['course-6'],
    rating: 4.92,
    reviewsCount: 4100,
    studentsCount: 48900,
    totalEarnings: 980000,
    payoutMethod: { type: 'upi', upiId: 'neha.ts@paytm' },
    joinedAt: '2022-11-05',
    isApprovedInstructor: true
  },
  student: {
    id: 'user-student-1',
    name: 'Arjun Nambiar',
    email: 'student@prajnadhara.edu',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
    role: 'student',
    title: 'Associate Software Engineer & Career Switcher',
    bio: 'Passionate learner leveling up full-stack development, design systems, and cloud fundamentals.',
    enrolledCourseIds: ['course-1', 'course-2', 'course-5'],
    wishlistCourseIds: ['course-3', 'course-7', 'course-12'],
    joinedAt: '2024-01-10'
  }
};

export const COURSES: Course[] = [
  {
    id: 'course-fellowship-1',
    title: 'Global AI Innovation & Autonomous Systems Architect Fellowship',
    subtitle: 'Access industry-relevant curriculum designed to master autonomous systems, multi-agent frameworks, and scalable machine intelligence.',
    slug: 'global-ai-innovation-autonomous-systems-architect-fellowship',
    categoryId: 'cat-ai',
    subcategory: 'Autonomous Systems',
    instructorId: 'inst-admin',
    price: 100987,
    originalPrice: 120000,
    rating: 5.0,
    reviewsCount: 24,
    studentCount: 0,
    durationHours: 64.0,
    lectureCount: 0,
    level: 'Advanced',
    language: 'English',
    lastUpdated: 'October 2026',
    badges: ['Bestseller', 'Featured'],
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    whatYouWillLearn: [
      'Architect autonomous distributed agent systems with real-time feedback loops',
      'Deploy enterprise LLMs with private RAG, embeddings, and vector clustering',
      'Implement multi-agent consensus protocols and automated tool usage',
      'Optimize high-throughput inference pipelines with GPU cluster orchestration'
    ],
    requirements: [
      'Basic familiarity with Python or modern JavaScript/TypeScript',
      'Understanding of core computer science and systems concepts'
    ],
    targetAudience: [
      'Software engineers transitioning into AI architecture',
      'Engineering leads and technology architects building autonomous systems'
    ],
    curriculum: [
      {
        id: 'sec-f1',
        title: 'Fellowship Orientation & High-Performance AI Infrastructure',
        lectures: [
          {
            id: 'lec-f1-1',
            title: 'Welcome to the Fellowship & Systems Architecture Blueprint',
            durationMinutes: 18,
            type: 'video',
            previewFree: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
          }
        ]
      }
    ],
    status: 'published',
    featured: true,
    description: 'Elite fellowship program covering autonomous multi-agent systems, deep reinforcement learning, and production scale inference architecture.'
  },
  {
    id: 'course-quantum-ai-2',
    title: 'Quantum AI & Advanced Computing Architect Program',
    subtitle: 'Pioneer the intersection of quantum algorithms, tensor network representations, and advanced computing paradigms.',
    slug: 'quantum-ai-advanced-computing-architect-program',
    categoryId: 'cat-ai',
    subcategory: 'Quantum Computing',
    instructorId: 'inst-admin',
    price: 95100,
    originalPrice: 96584,
    rating: 5.0,
    reviewsCount: 19,
    studentCount: 0,
    durationHours: 18.5,
    lectureCount: 3,
    level: 'Advanced',
    language: 'English',
    lastUpdated: 'October 2026',
    badges: ['Featured'],
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    whatYouWillLearn: [
      'Formulate variational quantum eigensolvers (VQE) for hybrid optimization',
      'Implement quantum neural network layers and quantum kernel algorithms',
      'Bridge classical machine learning workflows with quantum hardware simulators'
    ],
    requirements: [
      'Linear algebra and matrix mechanics fundamentals',
      'Familiarity with Python scientific computing (NumPy, SciPy)'
    ],
    targetAudience: [
      'Research scientists and advanced computing specialists',
      'Architects looking ahead to quantum acceleration in enterprise workloads'
    ],
    curriculum: [
      {
        id: 'sec-q1',
        title: 'Core Quantum Computing Foundations',
        lectures: [
          {
            id: 'lec-q1-1',
            title: 'Qubits, Superposition & Quantum Circuit Principles',
            durationMinutes: 24,
            type: 'video',
            previewFree: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
          },
          {
            id: 'lec-q1-2',
            title: 'Quantum Entanglement & Teleportation Protocols',
            durationMinutes: 30,
            type: 'video'
          },
          {
            id: 'lec-q1-3',
            title: 'Hybrid Quantum-Classical Optimization Setup',
            durationMinutes: 36,
            type: 'video'
          }
        ]
      }
    ],
    status: 'published',
    featured: true,
    description: 'Pioneer the intersection of quantum algorithms, tensor network representations, and advanced computing paradigms.'
  },
  {
    id: 'course-ai-exec-3',
    title: 'Executive AI Leadership & Future Technologies Fellowship',
    subtitle: 'Strategic roadmap for CTOs, VPs, and enterprise leaders driving high-impact AI strategy, ethical governance, and ROI.',
    slug: 'executive-ai-leadership-future-technologies-fellowship',
    categoryId: 'cat-ai',
    subcategory: 'Executive Leadership',
    instructorId: 'inst-admin',
    price: 90105,
    originalPrice: 92585,
    rating: 5.0,
    reviewsCount: 31,
    studentCount: 0,
    durationHours: 32.0,
    lectureCount: 16,
    level: 'Executive',
    language: 'English',
    lastUpdated: 'October 2026',
    badges: ['Featured'],
    thumbnail: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    whatYouWillLearn: [
      'Formulate comprehensive AI adoption frameworks across organizational units',
      'Evaluate model economics, proprietary data defensive moats, and vendor risks',
      'Drive ethical AI compliance, governance boards, and safety audits'
    ],
    requirements: [
      'Experience in technical, product, or business leadership roles'
    ],
    targetAudience: [
      'VP of Engineering, CTOs, CIOs, and Chief Digital Officers',
      'Strategic leaders scaling tech departments'
    ],
    curriculum: [
      {
        id: 'sec-ex1',
        title: 'Module 1: Enterprise AI Strategy & Capital Allocation',
        lectures: [
          {
            id: 'lec-ex1-1',
            title: 'Assessing High-ROI Generative AI Opportunities',
            durationMinutes: 28,
            type: 'video',
            previewFree: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
          },
          {
            id: 'lec-ex1-2',
            title: 'Build vs. Buy vs. Fine-Tune Decision Frameworks',
            durationMinutes: 32,
            type: 'video'
          }
        ]
      }
    ],
    status: 'published',
    featured: true,
    description: 'Strategic roadmap for CTOs, VPs, and enterprise leaders driving high-impact AI strategy and governance.'
  },
  {
    id: 'course-1',
    title: 'Modern Full-Stack React, TypeScript & Node Architecture',
    subtitle: 'Build production-ready web applications from scratch with strict TypeScript, clean architecture, automated testing, and CI/CD pipelines.',
    slug: 'modern-full-stack-react-typescript-node',
    categoryId: 'cat-dev',
    subcategory: 'Full-Stack Web',
    instructorId: 'inst-7',
    price: 1299,
    originalPrice: 3499,
    rating: 4.9,
    reviewsCount: 1840,
    studentCount: 16420,
    durationHours: 32.5,
    lectureCount: 148,
    level: 'All Levels',
    language: 'English',
    lastUpdated: 'October 2026',
    badges: ['Bestseller'],
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    whatYouWillLearn: [
      'Design modular frontends using React 19, Server Components, and custom state machines',
      'Architect resilient REST and tRPC backends with Express, Prisma, and PostgreSQL',
      'Implement enterprise-grade JWT authentication, refresh tokens, and RBAC authorization',
      'Deploy containerized services using Docker, GitHub Actions, and production reverse proxies',
      'Write exhaustive unit and integration test suites using Vitest, Playwright, and Mock Service Worker'
    ],
    requirements: [
      'Solid understanding of core JavaScript (ES6+ variables, promises, async/await)',
      'Basic familiarity with HTML, CSS and command-line terminal operations',
      'A computer running macOS, Windows or Linux with Node.js installed'
    ],
    description: `Welcome to the definitive full-stack engineering masterclass on Prajnadhara EDU. Rather than teaching toy examples, this course guides you through building a real-world, multi-tenant collaboration platform from initial requirements gathering to multi-region cloud deployment.

You will master clean architecture patterns, domain-driven design principles, and end-to-end type safety across the entire stack. Every section includes practical coding assignments, real architectural trade-off discussions, and downloadable boilerplates ready for production use.`,
    curriculum: [
      {
        id: 'sec-1',
        title: 'Section 1: Foundations of Production TypeScript & Tooling',
        lectures: [
          {
            id: 'lec-1-1',
            title: 'Course Architecture Overview & Repository Setup',
            durationMinutes: 14,
            type: 'video',
            previewFree: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            resources: [
              { id: 'res-1', name: 'Starter-Repository-Guide.pdf', size: '1.4 MB', url: '#' },
              { id: 'res-2', name: 'Architecture-Diagrams.zip', size: '8.2 MB', url: '#' }
            ]
          },
          {
            id: 'lec-1-2',
            title: 'Strict TypeScript: Generics, Discriminated Unions & Utility Types',
            durationMinutes: 22,
            type: 'video',
            previewFree: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
          },
          {
            id: 'lec-1-3',
            title: 'Architecting Monorepos with Turborepo & pnpm Workspaces',
            durationMinutes: 18,
            type: 'video'
          },
          {
            id: 'lec-1-4',
            title: 'Knowledge Check: Advanced Type System Patterns',
            durationMinutes: 10,
            type: 'quiz',
            quizId: 'quiz-1'
          }
        ]
      },
      {
        id: 'sec-2',
        title: 'Section 2: High-Performance React 19 Frontend Engineering',
        lectures: [
          {
            id: 'lec-2-1',
            title: 'Component Composition & Compound Component Patterns',
            durationMinutes: 25,
            type: 'video'
          },
          {
            id: 'lec-2-2',
            title: 'State Management Without Spaghetti: Signals, Context & Zustand',
            durationMinutes: 30,
            type: 'video'
          },
          {
            id: 'lec-2-3',
            title: 'Reading Material: React 19 Compiler In-Depth',
            durationMinutes: 15,
            type: 'article',
            content: `The React Compiler automates memoization across component subtrees. In this comprehensive guide, we examine the compilation pipeline, bailout conditions, and how to structure reactive dependencies to minimize unnecessary DOM reconciliation.`
          },
          {
            id: 'lec-2-4',
            title: 'Optimistic UI Updates & Offline Synchronization',
            durationMinutes: 28,
            type: 'video'
          }
        ]
      },
      {
        id: 'sec-3',
        title: 'Section 3: Resilient Backend Architecture & Data Integrity',
        lectures: [
          {
            id: 'lec-3-1',
            title: 'Clean Domain-Driven Design in Node.js Services',
            durationMinutes: 34,
            type: 'video'
          },
          {
            id: 'lec-3-2',
            title: 'Relational Schema Design & Indexing Strategies in PostgreSQL',
            durationMinutes: 26,
            type: 'video'
          },
          {
            id: 'lec-3-3',
            title: 'Stateless Authentication with Sliding JWTs and Redis Blacklists',
            durationMinutes: 24,
            type: 'video'
          }
        ]
      }
    ],
    status: 'published',
    featured: true
  },
  {
    id: 'course-2',
    title: 'Enterprise Design Systems with Figma & Tailwind CSS',
    subtitle: 'From typography tokens to headless accessibility: design, build, document, and maintain a battle-tested design system used by millions.',
    slug: 'enterprise-design-systems-figma-tailwind',
    categoryId: 'cat-design',
    subcategory: 'Design Systems',
    instructorId: 'inst-2',
    price: 899,
    originalPrice: 2799,
    rating: 4.8,
    reviewsCount: 1120,
    studentCount: 12400,
    durationHours: 19.0,
    lectureCount: 86,
    level: 'Intermediate',
    language: 'English',
    lastUpdated: 'September 2026',
    badges: ['Highest rated'],
    thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    whatYouWillLearn: [
      'Create multi-tier design tokens (global, semantic, component-level) in Figma and code',
      'Configure automated Figma to GitHub sync using Style Dictionary and Tokens Studio',
      'Implement accessible, keyboard-navigable headless primitives following WAI-ARIA APG',
      'Enforce zero-pill discipline, optical typography compensations, and layout math',
      'Package and distribute your design system as a versioned private npm library'
    ],
    requirements: [
      'Working knowledge of Figma (Auto Layout, Components, Variants)',
      'Basic familiarity with CSS / Tailwind utility classes'
    ],
    description: `A scalable design system is not just a UI kit; it is the shared contract between engineering, product and design. In this course, lead designer Vikram Malhotra breaks down how enterprise organizations govern hundreds of components across platforms with mathematical consistency.`,
    curriculum: [
      {
        id: 'sec-2-1',
        title: 'Section 1: The Design Token Architecture',
        lectures: [
          {
            id: 'lec-2-1-1',
            title: 'Why Most Design Systems Fail: Alignment & Governance',
            durationMinutes: 18,
            type: 'video',
            previewFree: true
          },
          {
            id: 'lec-2-1-2',
            title: 'Establishing 3-Tier Design Tokens in Figma',
            durationMinutes: 24,
            type: 'video',
            previewFree: true
          },
          {
            id: 'lec-2-1-3',
            title: 'Design Token Specification Checklist',
            durationMinutes: 12,
            type: 'article',
            content: 'Tokens must be deterministic, semantic, and decoupled from brand-specific hardcoded values. Review the 12-point rubric before moving into component implementation.'
          }
        ]
      },
      {
        id: 'sec-2-2',
        title: 'Section 2: Code Implementation with React & Tailwind',
        lectures: [
          {
            id: 'lec-2-2-1',
            title: 'Headless Radix Primitives & Tailwind v4 Integration',
            durationMinutes: 32,
            type: 'video'
          },
          {
            id: 'lec-2-2-2',
            title: 'Building Complex Data Tables with Virtualization',
            durationMinutes: 28,
            type: 'video'
          }
        ]
      }
    ],
    status: 'published',
    featured: true
  },
  {
    id: 'course-3',
    title: 'Financial Modeling, Valuation & M&A Deal Structuring',
    subtitle: 'Build 3-statement forecast models, discounted cash flow (DCF) models, and leveraged buyout (LBO) waterfalls used by top investment banks.',
    slug: 'financial-modeling-valuation-ma-structuring',
    categoryId: 'cat-finance',
    subcategory: 'Financial Modeling',
    instructorId: 'inst-3',
    price: 1599,
    originalPrice: 4999,
    rating: 4.9,
    reviewsCount: 890,
    studentCount: 8950,
    durationHours: 28.0,
    lectureCount: 112,
    level: 'Expert',
    language: 'English',
    lastUpdated: 'August 2026',
    badges: ['Bestseller'],
    thumbnail: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    whatYouWillLearn: [
      'Construct linked 3-statement financial models in Excel with zero circularity errors',
      'Perform rigorous Discounted Cash Flow (DCF) analysis and sensitivity matrix evaluations',
      'Build fully dynamic Leveraged Buyout (LBO) debt schedules with revolving credit facilities',
      'Audit financial statements for revenue recognition flags and working capital traps',
      'Structure pitch books and executive summary decks for investment committees'
    ],
    requirements: [
      'Basic understanding of Income Statement, Balance Sheet, and Cash Flow Statement',
      'Microsoft Excel installed on Windows or Mac'
    ],
    description: `Taught by CFA charterholder and private equity veteran Priya Sundaram, this course bypasses theoretical finance to immerse you in real transactions. You will reconstruct the financial models from landmark tech and consumer acquisitions.`,
    curriculum: [
      {
        id: 'sec-3-1',
        title: 'Section 1: 3-Statement Modeling Foundations',
        lectures: [
          { id: 'lec-3-1-1', title: 'Accounting Invariants & Linking Statements', durationMinutes: 20, type: 'video', previewFree: true },
          { id: 'lec-3-1-2', title: 'Revenue Build: Bottoms-Up Driver Modeling', durationMinutes: 28, type: 'video' },
          { id: 'lec-3-1-3', title: 'Working Capital & Depreciation Schedules', durationMinutes: 22, type: 'video' }
        ]
      }
    ],
    status: 'published',
    featured: true
  },
  {
    id: 'course-4',
    title: 'Kubernetes & Multi-Cloud Infrastructure as Code',
    subtitle: 'Container orchestration at scale: deploy zero-downtime microservices using Terraform, Helm, ArgoCD, and Prometheus telemetry.',
    slug: 'kubernetes-multi-cloud-iac-terraform',
    categoryId: 'cat-it',
    subcategory: 'DevOps & Kubernetes',
    instructorId: 'inst-4',
    price: 1499,
    originalPrice: 3999,
    rating: 4.85,
    reviewsCount: 1540,
    studentCount: 14200,
    durationHours: 26.5,
    lectureCount: 118,
    level: 'Intermediate',
    language: 'English',
    lastUpdated: 'September 2026',
    badges: ['Highest rated'],
    thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop&q=80',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    whatYouWillLearn: [
      'Master Kubernetes primitives: Pods, Deployments, StatefulSets, Services, and Ingress',
      'Provision multi-region production clusters on AWS and GCP using declarative Terraform',
      'Set up GitOps continuous delivery pipelines using ArgoCD and sealed secrets',
      'Configure Prometheus, Grafana dashboards, and Alertmanager for cluster observability',
      'Implement network security policies, mTLS with Istio service mesh, and RBAC'
    ],
    requirements: [
      'Basic familiarity with Linux command-line and Docker containers',
      'Free-tier cloud account (AWS, Google Cloud, or local Minikube/Kind)'
    ],
    description: `Stop deploying fragile servers by hand. This intensive guide by CNCF contributor Marcus Chen equips you to manage enterprise cloud estates with repeatable infrastructure as code and resilient GitOps pipelines.`,
    curriculum: [
      {
        id: 'sec-4-1',
        title: 'Section 1: Container Orchestration Foundations',
        lectures: [
          { id: 'lec-4-1-1', title: 'Why Kubernetes? Control Planes and Workers', durationMinutes: 16, type: 'video', previewFree: true },
          { id: 'lec-4-1-2', title: 'Deploying Your First Production Pod & Service', durationMinutes: 24, type: 'video', previewFree: true },
          { id: 'lec-4-1-3', title: 'Ingress Controllers and TLS Termination', durationMinutes: 30, type: 'video' }
        ]
      }
    ],
    status: 'published'
  },
  {
    id: 'course-5',
    title: 'Product Leadership: Strategy, Metrics & Execution',
    subtitle: 'From zero-to-one problem discovery to leading cross-functional teams, roadmap prioritization, and business outcome delivery.',
    slug: 'product-leadership-strategy-metrics-execution',
    categoryId: 'cat-business',
    subcategory: 'Product Management',
    instructorId: 'inst-6',
    price: 999,
    originalPrice: 2999,
    rating: 4.9,
    reviewsCount: 1450,
    studentCount: 13800,
    durationHours: 21.0,
    lectureCount: 94,
    level: 'All Levels',
    language: 'English',
    lastUpdated: 'September 2026',
    badges: ['Bestseller'],
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80',
    whatYouWillLearn: [
      'Conduct rigorous customer discovery interviews that uncover genuine willingness-to-pay',
      'Construct outcome-oriented product roadmaps using North Star metrics and OKRs',
      'Author crisp Product Requirement Documents (PRDs) that engineers and designers love',
      'Manage executive stakeholders, negotiate tradeoffs, and run high-velocity sprints',
      'Analyze churn funnels and cohort retention data to drive sustainable unit economics'
    ],
    requirements: [
      'Curiosity about technology products and consumer psychology',
      'No engineering background required'
    ],
    description: `Former VP of Product David Kim distills 16 years of leadership across hypergrowth scale-ups into practical frameworks. Learn how to turn ambiguous market signals into high-impact product launches that move real business metrics.`,
    curriculum: [
      {
        id: 'sec-5-1',
        title: 'Section 1: The Product Strategy Blueprint',
        lectures: [
          { id: 'lec-5-1-1', title: 'The Anatomy of a Compelling Product Thesis', durationMinutes: 20, type: 'video', previewFree: true },
          { id: 'lec-5-1-2', title: 'Defining the North Star Metric & Input Metrics', durationMinutes: 26, type: 'video' }
        ]
      }
    ],
    status: 'published'
  },
  {
    id: 'course-6',
    title: 'Distributed Systems & Microservices in Go',
    subtitle: 'Design fault-tolerant backend architectures with gRPC, Apache Kafka, distributed consensus, and event sourcing.',
    slug: 'distributed-systems-microservices-golang',
    categoryId: 'cat-dev',
    subcategory: 'Backend Architecture',
    instructorId: 'inst-1',
    price: 1799,
    originalPrice: 4499,
    rating: 4.95,
    reviewsCount: 2210,
    studentCount: 18700,
    durationHours: 36.0,
    lectureCount: 162,
    level: 'Expert',
    language: 'English',
    lastUpdated: 'October 2026',
    badges: ['Bestseller'],
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    whatYouWillLearn: [
      'Master Go concurrency primitives: Goroutines, channels, sync packages, and atomics',
      'Build low-latency microservices communicating over protobuf and gRPC streaming',
      'Implement event-driven architectures with Apache Kafka, consumer groups, and dead-letter queues',
      'Solve distributed consistency challenges with the Saga pattern, outbox pattern, and 2PC',
      'Profile memory allocations and optimize GC latency under million-RPS workloads'
    ],
    requirements: [
      'Intermediate programming experience in Go, Java, C++, or Rust',
      'Basic understanding of networking (TCP/IP, sockets, HTTP/2)'
    ],
    description: `Taught by Dr. Ananya Sharma, this masterclass demystifies what happens when software outgrows a single machine. You will implement distributed locking with Raft, stream real-time events over Kafka, and benchmark production services for maximum throughput.`,
    curriculum: [
      {
        id: 'sec-6-1',
        title: 'Section 1: Advanced Concurrency & Low-Level Go',
        lectures: [
          { id: 'lec-6-1-1', title: 'Memory Models & the Go Runtime Scheduler', durationMinutes: 28, type: 'video', previewFree: true },
          { id: 'lec-6-1-2', title: 'Implementing Lock-Free Queues with Atomics', durationMinutes: 32, type: 'video' }
        ]
      }
    ],
    status: 'published',
    featured: true
  },
  {
    id: 'course-7',
    title: 'Data-Driven Growth Marketing & Algorithmic SEO',
    subtitle: 'Systematize customer acquisition: build programmatically generated SEO engines, optimize conversion funnels, and run scientific A/B tests.',
    slug: 'data-driven-growth-marketing-algorithmic-seo',
    categoryId: 'cat-marketing',
    subcategory: 'Growth Marketing',
    instructorId: 'inst-5',
    price: 799,
    originalPrice: 2499,
    rating: 4.78,
    reviewsCount: 890,
    studentCount: 9600,
    durationHours: 18.5,
    lectureCount: 78,
    level: 'Intermediate',
    language: 'English',
    lastUpdated: 'July 2026',
    badges: ['New'],
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    whatYouWillLearn: [
      'Build programmatic SEO architectures that index thousands of high-converting landing pages',
      'Set up server-side event tracking and attribution modeling with Segment and PostHog',
      'Run statistically sound A/B tests that avoid false positives and sample ratio mismatches',
      'Optimize multi-step conversion funnels using cohort analysis and session recordings',
      'Master high-ROI paid search and social campaigns without wasting marketing budget'
    ],
    requirements: [
      'Basic familiarity with digital marketing concepts',
      'Access to a website or staging app to practice analytics setup'
    ],
    description: `Growth marketing is an engineering discipline, not guesswork. Elena Rostova reveals the exact operational playbooks used to scale high-performing acquisition flywheels from first principles.`,
    curriculum: [
      {
        id: 'sec-7-1',
        title: 'Section 1: Algorithmic Search & Programmatic SEO',
        lectures: [
          { id: 'lec-7-1-1', title: 'Reverse Engineering Google Ranking Factors in 2026', durationMinutes: 22, type: 'video', previewFree: true },
          { id: 'lec-7-1-2', title: 'Designing Dynamic Templates for Database-Driven Pages', durationMinutes: 29, type: 'video' }
        ]
      }
    ],
    status: 'published'
  },
  {
    id: 'course-8',
    title: 'Commercial Cinematography & DaVinci Resolve Color Grading',
    subtitle: 'From camera optics and studio lighting rigs to professional node-based color science: grade film like a Hollywood colorist.',
    slug: 'commercial-cinematography-davinci-resolve-color',
    categoryId: 'cat-photo',
    subcategory: 'Color Grading',
    instructorId: 'inst-8',
    price: 1199,
    originalPrice: 3299,
    rating: 4.92,
    reviewsCount: 640,
    studentCount: 7300,
    durationHours: 24.0,
    lectureCount: 98,
    level: 'Intermediate',
    language: 'English',
    lastUpdated: 'August 2026',
    badges: ['Highest rated'],
    thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80',
    whatYouWillLearn: [
      'Understand sensor science, dynamic range, log gammas, and color spaces (ACES & DaVinci Wide Gamut)',
      'Construct clean node trees for exposure normalization, contrast control, and color balance',
      'Master commercial skin-tone qualification, hue curves, and secondary isolations',
      'Shape light with natural window diffusion, negative fill, and practical fixtures',
      'Deliver calibrated masters for theatrical projection, broadcast, and streaming standards'
    ],
    requirements: [
      'DaVinci Resolve (free or Studio version) installed',
      'Camera capable of recording flat or Log video (RAW optional)'
    ],
    description: `Elevate your visual storytelling. Commercial cinematographer Rahul Verma walks you through lighting setups, camera movement philosophy, and deep color grading techniques using real raw footage provided in the course package.`,
    curriculum: [
      {
        id: 'sec-8-1',
        title: 'Section 1: The Physics of Light & Camera Science',
        lectures: [
          { id: 'lec-8-1-1', title: 'Color Science Fundamentals: Gamut vs Gamma', durationMinutes: 24, type: 'video', previewFree: true },
          { id: 'lec-8-1-2', title: 'Building a Non-Destructive Node Pipeline', durationMinutes: 32, type: 'video' }
        ]
      }
    ],
    status: 'published'
  },
  {
    id: 'course-9',
    title: 'Deep Work & Cognitive Architecture for High Performers',
    subtitle: 'Build unbreakable focus habits, eradicate digital fragmentation, optimize sleep and circadian cycles, and execute deliberate practice.',
    slug: 'deep-work-cognitive-architecture-high-performers',
    categoryId: 'cat-personal',
    subcategory: 'Deep Work & Focus',
    instructorId: 'inst-10',
    price: 599,
    originalPrice: 1999,
    rating: 4.88,
    reviewsCount: 1320,
    studentCount: 15400,
    durationHours: 14.0,
    lectureCount: 56,
    level: 'All Levels',
    language: 'English',
    lastUpdated: 'October 2026',
    badges: ['Bestseller'],
    thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80',
    whatYouWillLearn: [
      'Engineer physical and digital environments that eliminate dopamine friction and distractions',
      'Structure 90-minute ultradian work blocks aligned with natural neurochemical cycles',
      'Implement mental model frameworks for strategic problem solving and stress reduction',
      'Develop reading synthesis workflows that convert information intake into long-term retention',
      'Establish nighttime protocols that improve REM sleep and cognitive restoration'
    ],
    requirements: [
      'Commitment to tracking habits for at least 14 days',
      'Willingness to rethink personal workspace and notification hygiene'
    ],
    description: `Knowledge workers are paid to produce rare and valuable insights, not respond to chat pings. Tariq Mansoor brings neuroscience and executive coaching rigor to help you reclaim your cognitive bandwidth and achieve peak intellectual output.`,
    curriculum: [
      {
        id: 'sec-9-1',
        title: 'Section 1: The Science of Sustained Attention',
        lectures: [
          { id: 'lec-9-1-1', title: 'Attention Residue & the Cost of Task Switching', durationMinutes: 18, type: 'video', previewFree: true },
          { id: 'lec-9-1-2', title: 'Designing Your 4-Hour Daily Deep Work Ritual', durationMinutes: 22, type: 'video' }
        ]
      }
    ],
    status: 'published'
  },
  {
    id: 'course-10',
    title: 'Audio Engineering: Mixing & Mastering with Ableton Live',
    subtitle: 'Professional in-the-box music production: acoustic fundamentals, surgical EQ, multiband compression, and pristine loudness mastering.',
    slug: 'audio-engineering-mixing-mastering-ableton',
    categoryId: 'cat-music',
    subcategory: 'Audio Engineering',
    instructorId: 'inst-9',
    price: 899,
    originalPrice: 2899,
    rating: 4.82,
    reviewsCount: 710,
    studentCount: 8200,
    durationHours: 20.0,
    lectureCount: 84,
    level: 'Intermediate',
    language: 'English',
    lastUpdated: 'September 2026',
    badges: ['New'],
    thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
    whatYouWillLearn: [
      'Configure studio monitor calibration, gain staging, and headroom discipline',
      'Apply surgical and musical EQ curves to carve frequency space in crowded mixes',
      'Master dynamic control using serial compression, sidechaining, and parallel processing',
      'Create 3-dimensional stereo width using subtle delays, Haas effect, and reverb decay tuning',
      'Achieve streaming-compliant LUFS loudness targets with true-peak limiting'
    ],
    requirements: [
      'Ableton Live 11 or 12 (Standard or Suite)',
      'A pair of studio headphones or calibrated monitor speakers'
    ],
    description: `Stop struggling with muddy mixes and weak low-end. In this hands-on workshop, veteran mixing engineer Sarah Jenkins guides you through multi-track stems across multiple genres, showing you every knob turn and critical listening decision.`,
    curriculum: [
      {
        id: 'sec-10-1',
        title: 'Section 1: Gain Staging & Frequency Architecture',
        lectures: [
          { id: 'lec-10-1-1', title: 'Setting Up the Mix Session & Reference Tracks', durationMinutes: 19, type: 'video', previewFree: true },
          { id: 'lec-10-1-2', title: 'Sub-Bass Management & Phase Correlation', durationMinutes: 26, type: 'video' }
        ]
      }
    ],
    status: 'published'
  },
  {
    id: 'course-11',
    title: 'Applied Exercise Physiology & Sports Nutrition Science',
    subtitle: 'Evidence-based biomechanics, progressive overload programming, macronutrient timing, and athletic recovery protocols.',
    slug: 'applied-exercise-physiology-sports-nutrition',
    categoryId: 'cat-health',
    subcategory: 'Exercise Physiology',
    instructorId: 'inst-10',
    price: 699,
    originalPrice: 2199,
    rating: 4.86,
    reviewsCount: 650,
    studentCount: 7900,
    durationHours: 16.0,
    lectureCount: 68,
    level: 'All Levels',
    language: 'English',
    lastUpdated: 'August 2026',
    badges: [],
    thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    whatYouWillLearn: [
      'Understand muscle fiber recruitment, bioenergetics, and neuromuscular adaptations',
      'Design periodized strength and hypertrophy programs tailored to individual leverage',
      'Calculate personalized caloric, protein, and micronutrient targets with scientific precision',
      'Identify mobility restrictions and implement corrective joint preparation exercises',
      'Utilize heart rate variability (HRV) and deload weeks to prevent overtraining'
    ],
    requirements: [
      'An interest in human biology and fitness training',
      'No prerequisite degree needed'
    ],
    description: `Cut through social media fitness myths. This course delivers peer-reviewed exercise science and sports nutrition guidelines structured for personal trainers, competitive athletes, and health enthusiasts looking for tangible results.`,
    curriculum: [
      {
        id: 'sec-11-1',
        title: 'Section 1: Biomechanics & Neuromuscular Signaling',
        lectures: [
          { id: 'lec-11-1-1', title: 'The Mechanical Tension Cascade Explained', durationMinutes: 22, type: 'video', previewFree: true },
          { id: 'lec-11-1-2', title: 'Programming Volume vs Intensity vs Frequency', durationMinutes: 28, type: 'video' }
        ]
      }
    ],
    status: 'published'
  },
  {
    id: 'course-12',
    title: 'Foundations of Cloud Security & Zero Trust Architecture',
    subtitle: 'Defend enterprise infrastructure: IAM least privilege, container vulnerability scanning, secrets rotation, and threat modeling.',
    slug: 'cloud-security-zero-trust-architecture',
    categoryId: 'cat-it',
    subcategory: 'Cybersecurity',
    instructorId: 'inst-4',
    price: 1399,
    originalPrice: 3799,
    rating: 4.89,
    reviewsCount: 1140,
    studentCount: 10900,
    durationHours: 23.0,
    lectureCount: 92,
    level: 'Intermediate',
    language: 'English',
    lastUpdated: 'September 2026',
    badges: ['Highest rated'],
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    whatYouWillLearn: [
      'Implement Zero Trust security perimeters with contextual identity verification',
      'Audit AWS and GCP IAM roles to eradicate privilege escalation risks',
      'Automate static container security scanning in CI/CD using Trivy and Grype',
      'Manage cryptographic secrets with HashiCorp Vault and automated certificate renewal',
      'Formulate incident response runbooks and conduct tabletop threat modeling exercises'
    ],
    requirements: [
      'Basic knowledge of networking (ports, CIDR blocks, DNS)',
      'Basic experience with AWS or Linux server administration'
    ],
    description: `Cloud breaches rarely stem from zero-days; they happen because of misconfigured policies and leaked credentials. Learn the defense-in-depth principles used by security architects to protect critical banking and healthcare infrastructure.`,
    curriculum: [
      {
        id: 'sec-12-1',
        title: 'Section 1: Zero Trust Core Tenets',
        lectures: [
          { id: 'lec-12-1-1', title: 'Beyond Castle-and-Moat: Why Zero Trust Matters', durationMinutes: 18, type: 'video', previewFree: true },
          { id: 'lec-12-1-2', title: 'Hardening IAM Policies with Automated Scanners', durationMinutes: 25, type: 'video' }
        ]
      }
    ],
    status: 'published'
  },
  {
    id: 'course-13',
    title: 'Python for Algorithmic Trading & Quantitative Research',
    subtitle: 'Build backtesting engines, analyze time-series market data, compute risk metrics (VaR, Sharpe), and execute automated order strategies.',
    slug: 'python-algorithmic-trading-quantitative-research',
    categoryId: 'cat-dev',
    subcategory: 'Python & Data',
    instructorId: 'inst-3',
    price: 1699,
    originalPrice: 4299,
    rating: 4.91,
    reviewsCount: 1780,
    studentCount: 14600,
    durationHours: 30.0,
    lectureCount: 134,
    level: 'Expert',
    language: 'English',
    lastUpdated: 'October 2026',
    badges: ['Bestseller'],
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
    whatYouWillLearn: [
      'Fetch, clean, and align tick-level and order-book data using Pandas and Polars',
      'Code vectorised and event-driven backtesting engines with realistic slippage modeling',
      'Implement statistical arbitrage, mean reversion, and momentum factor models',
      'Calculate Sortino, maximum drawdown, and Monte Carlo portfolio simulations',
      'Connect algorithms to broker APIs with automated circuit breakers and risk limits'
    ],
    requirements: [
      'Intermediate Python proficiency (functions, OOP, basic NumPy)',
      'Basic knowledge of capital markets and trading vocabulary'
    ],
    description: `Combine financial intuition with computational power. Guided by CFA Priya Sundaram, you will write institutional-grade quantitative strategies from clean data pipeline ingestion to rigorous out-of-sample backtesting.`,
    curriculum: [
      {
        id: 'sec-13-1',
        title: 'Section 1: Market Data Wrangling with Polars',
        lectures: [
          { id: 'lec-13-1-1', title: 'Microstructure: Order Books, Bids, Asks & Spreads', durationMinutes: 22, type: 'video', previewFree: true },
          { id: 'lec-13-1-2', title: 'Processing 10 Million Trades with Zero Memory Leaks', durationMinutes: 30, type: 'video' }
        ]
      }
    ],
    status: 'published'
  },
  {
    id: 'course-14',
    title: 'The Art of Executive Communication & High-Stakes Negotiation',
    subtitle: 'Persuade C-suite stakeholders, master crisis communication, speak with calm presence, and negotiate favorable commercial terms.',
    slug: 'executive-communication-high-stakes-negotiation',
    categoryId: 'cat-business',
    subcategory: 'Negotiation',
    instructorId: 'inst-10',
    price: 899,
    originalPrice: 2499,
    rating: 4.87,
    reviewsCount: 940,
    studentCount: 11100,
    durationHours: 15.5,
    lectureCount: 62,
    level: 'All Levels',
    language: 'English',
    lastUpdated: 'August 2026',
    badges: ['Highest rated'],
    thumbnail: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
    whatYouWillLearn: [
      'Structure high-impact presentations using the Minto Pyramid Principle',
      'Master tactical empathy, calibrated questions, and anchoring in contract negotiations',
      'Command physical presence, vocal resonance, and pacing under hostile interrogation',
      'Draft concise executive memos that lead directly to approved budgets',
      'De-escalate interdepartmental conflicts without burning professional bridges'
    ],
    requirements: [
      'A desire to lead and communicate with greater clarity and authority'
    ],
    description: `Technical brilliance without persuasive communication severely limits your career trajectory. Learn how leaders frame issues, handle objections in real-time, and close enterprise deals with poise and confidence.`,
    curriculum: [
      {
        id: 'sec-14-1',
        title: 'Section 1: The Minto Pyramid & Executive Framing',
        lectures: [
          { id: 'lec-14-1-1', title: 'Start with the Answer: The Executive Summary Rule', durationMinutes: 16, type: 'video', previewFree: true },
          { id: 'lec-14-1-2', title: 'Calibrating Questions That Create Immediate Value', durationMinutes: 24, type: 'video' }
        ]
      }
    ],
    status: 'published'
  },
  {
    id: 'course-15',
    title: 'Brand Identity Strategy & Commercial Typography',
    subtitle: 'From brand positioning discovery to type classification, grid systems, optical kerning, and comprehensive identity guidelines.',
    slug: 'brand-identity-strategy-commercial-typography',
    categoryId: 'cat-design',
    subcategory: 'Visual Identity',
    instructorId: 'inst-2',
    price: 799,
    originalPrice: 2399,
    rating: 4.84,
    reviewsCount: 780,
    studentCount: 8800,
    durationHours: 17.0,
    lectureCount: 74,
    level: 'Intermediate',
    language: 'English',
    lastUpdated: 'September 2026',
    badges: [],
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    whatYouWillLearn: [
      'Conduct brand archetype workshops and crystallize core brand positioning statements',
      'Select, pair, and customize typefaces with rigorous historical and optical knowledge',
      'Construct harmonic typographic scales and grid systems for print and digital surfaces',
      'Design distinctive logos that withstand vector reduction and diverse media contexts',
      'Author thorough brand guidelines that prevent visual degradation over time'
    ],
    requirements: [
      'Basic knowledge of vector design software (Illustrator, Figma, or Affinity Designer)'
    ],
    description: `Move beyond superficial aesthetics. Discover how senior creative directors establish unforgettable visual personalities for premium brands through typographic discipline and thoughtful strategic rationale.`,
    curriculum: [
      {
        id: 'sec-15-1',
        title: 'Section 1: Strategic Foundations of Visual Identity',
        lectures: [
          { id: 'lec-15-1-1', title: 'Brand Personality Mapping & Positioning Matrices', durationMinutes: 21, type: 'video', previewFree: true },
          { id: 'lec-15-1-2', title: 'The Mechanics of Type: Anatomy, X-Height & Stress', durationMinutes: 27, type: 'video' }
        ]
      }
    ],
    status: 'published'
  },
  {
    id: 'course-16',
    title: 'Corporate Financial Accounting & Forensic Statement Analysis',
    subtitle: 'Master revenue recognition standards (IFRS 15/ASC 606), lease accounting, working capital red flags, and forensic statement audits.',
    slug: 'corporate-accounting-forensic-statement-analysis',
    categoryId: 'cat-finance',
    subcategory: 'Taxation & Audit',
    instructorId: 'inst-3',
    price: 1099,
    originalPrice: 3299,
    rating: 4.86,
    reviewsCount: 520,
    studentCount: 5800,
    durationHours: 22.0,
    lectureCount: 96,
    level: 'Intermediate',
    language: 'English',
    lastUpdated: 'July 2026',
    badges: ['New'],
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
    whatYouWillLearn: [
      'Deconstruct complex financial statements to identify aggressive accounting maneuvers',
      'Audit revenue recognition timing and unbilled receivable buildups',
      'Normalize EBITDA by stripping out non-recurring items and capitalize research costs',
      'Understand debt covenant compliance and off-balance sheet obligations',
      'Interpret corporate annual reports with the skepticism of a forensic auditor'
    ],
    requirements: [
      'Basic understanding of debit and credit bookkeeping',
      'Interest in corporate financial integrity'
    ],
    description: `Don't rely blindly on reported earnings numbers. This forensic accounting masterclass gives analysts, investors, and controllers the exact lenses needed to unearth hidden balance-sheet liabilities and assess real economic earnings.`,
    curriculum: [
      {
        id: 'sec-16-1',
        title: 'Section 1: Revenue Quality & Earnings Management',
        lectures: [
          { id: 'lec-16-1-1', title: 'The Five-Step Revenue Recognition Model in Practice', durationMinutes: 25, type: 'video', previewFree: true },
          { id: 'lec-16-1-2', title: 'Red Flags in Days Sales Outstanding (DSO) Trends', durationMinutes: 22, type: 'video' }
        ]
      }
    ],
    status: 'published'
  },
  {
    id: 'course-17',
    title: 'Linux Systems Administration & Kernel Tuning',
    subtitle: 'From systemd, cgroups and namespaces to eBPF tracing, networking performance, and automated server hardening.',
    slug: 'linux-systems-administration-kernel-tuning',
    categoryId: 'cat-it',
    subcategory: 'Linux Systems',
    instructorId: 'inst-4',
    price: 1199,
    originalPrice: 3199,
    rating: 4.88,
    reviewsCount: 910,
    studentCount: 9400,
    durationHours: 25.0,
    lectureCount: 110,
    level: 'Intermediate',
    language: 'English',
    lastUpdated: 'August 2026',
    badges: [],
    thumbnail: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&auto=format&fit=crop&q=80',
    whatYouWillLearn: [
      'Manage systemd service units, timers, targets, and journal log retention',
      'Inspect low-level CPU and disk I/O bottlenecks with perf and eBPF tools',
      'Configure Linux networking: bridge interfaces, iptables/nftables, and TCP window tuning',
      'Automate system provisioning and user management with Ansible scripts',
      'Harden enterprise servers following CIS benchmark security recommendations'
    ],
    requirements: [
      'Familiarity with standard bash shell commands',
      'A virtual machine or cloud instance running Ubuntu or Debian'
    ],
    description: `Master the operating system powering the internet. Marcus Chen takes you deep into Linux internals, explaining what happens beneath the system calls and showing you how to tune systems for peak I/O throughput.`,
    curriculum: [
      {
        id: 'sec-17-1',
        title: 'Section 1: Modern Linux Architecture & systemd',
        lectures: [
          { id: 'lec-17-1-1', title: 'Kernel Space vs User Space: The Boundary Decoded', durationMinutes: 20, type: 'video', previewFree: true },
          { id: 'lec-17-1-2', title: 'Authoring Resilient systemd Service Files with Sandboxing', durationMinutes: 28, type: 'video' }
        ]
      }
    ],
    status: 'published'
  },
  {
    id: 'course-18',
    title: 'Speed Reading & Cognitive Synthesis for Researchers',
    subtitle: 'Read 3x faster with high comprehension: eliminate subvocalization, expand saccadic eye spans, and organize knowledge in Obsidian.',
    slug: 'speed-reading-cognitive-synthesis-obsidian',
    categoryId: 'cat-personal',
    subcategory: 'Speed Reading',
    instructorId: 'inst-10',
    price: 499,
    originalPrice: 1599,
    rating: 4.79,
    reviewsCount: 680,
    studentCount: 8400,
    durationHours: 11.0,
    lectureCount: 44,
    level: 'Beginner',
    language: 'English',
    lastUpdated: 'September 2026',
    badges: ['New'],
    thumbnail: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&auto=format&fit=crop&q=80',
    whatYouWillLearn: [
      'Triple your reading speed while preserving deep conceptual comprehension',
      'Break subconscious vocalization habits using visual pacing techniques',
      'Extract main arguments from dense academic textbooks and papers in 20 minutes',
      'Construct a connected second brain using markdown notes in Obsidian',
      'Synthesize disparate sources into cohesive essays and research outlines'
    ],
    requirements: [
      'A physical book and digital reading materials to practice with',
      'Free Obsidian desktop app installed'
    ],
    description: `Information overload is the primary obstacle to career acceleration. Learn the proven cognitive techniques that enable top scholars and analysts to digest hundreds of pages each week and effortlessly recall critical points.`,
    curriculum: [
      {
        id: 'sec-18-1',
        title: 'Section 1: The Mechanics of Visual Reading',
        lectures: [
          { id: 'lec-18-1-1', title: 'Why You Subvocalize and How the Eye Really Processes Text', durationMinutes: 16, type: 'video', previewFree: true },
          { id: 'lec-18-1-2', title: 'Pacer Exercises to Broaden Peripheral Word Clusters', durationMinutes: 20, type: 'video' }
        ]
      }
    ],
    status: 'published'
  },
  {
    id: 'course-19',
    title: 'Free Workshop: Introduction to TypeScript and Modern Web Standards',
    subtitle: 'Get started with modern type annotations, basic interfaces, and web primitives without paying a single rupee.',
    slug: 'free-introduction-typescript-modern-web',
    categoryId: 'cat-dev',
    subcategory: 'JavaScript & React',
    instructorId: 'inst-7',
    price: 0,
    originalPrice: 999,
    isFree: true,
    rating: 4.88,
    reviewsCount: 3200,
    studentCount: 38000,
    durationHours: 6.5,
    lectureCount: 28,
    level: 'Beginner',
    language: 'English',
    lastUpdated: 'October 2026',
    badges: ['Bestseller'],
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    whatYouWillLearn: [
      'Understand static vs dynamic typing and why TypeScript dominates industry software',
      'Write type annotations for primitive values, objects, and function signatures',
      'Work with interfaces, type aliases, and basic union types',
      'Set up a TypeScript development environment with zero boilerplate'
    ],
    requirements: [
      'No prior TypeScript experience required',
      'Basic familiarity with web browser consoles'
    ],
    description: `A 100% free community course by Neha Deshmukh. Designed as an unhurried, rigorous introduction to type safety for anyone transitioning from plain JavaScript.`,
    curriculum: [
      {
        id: 'sec-19-1',
        title: 'Section 1: Welcoming Type Safety',
        lectures: [
          { id: 'lec-19-1-1', title: 'Why Types Save Hours of Debugging', durationMinutes: 12, type: 'video', previewFree: true },
          { id: 'lec-19-1-2', title: 'Annotating Functions and Variables', durationMinutes: 18, type: 'video', previewFree: true }
        ]
      }
    ],
    status: 'published'
  },
  {
    id: 'course-20',
    title: 'B2B Performance Ads: Meta, Google & LinkedIn at Scale',
    subtitle: 'Build profitable acquisition campaigns: audience targeting, creative testing frameworks, CAC reduction, and multi-touch attribution.',
    slug: 'b2b-performance-ads-meta-google-linkedin',
    categoryId: 'cat-marketing',
    subcategory: 'Performance Ads',
    instructorId: 'inst-5',
    price: 999,
    originalPrice: 2899,
    rating: 4.8,
    reviewsCount: 720,
    studentCount: 8100,
    durationHours: 19.0,
    lectureCount: 80,
    level: 'Intermediate',
    language: 'English',
    lastUpdated: 'September 2026',
    badges: [],
    thumbnail: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&auto=format&fit=crop&q=80',
    whatYouWillLearn: [
      'Set up high-intent Google Search campaigns that capture purchase-ready buyers',
      'Design modular ad creative iterations that overcome creative fatigue on Meta',
      'Target high-LTV enterprise decision makers with account-based LinkedIn campaigns',
      'Implement conversion APIs to safeguard attribution accuracy against browser privacy limits',
      'Scale ad budgets profitably without blowing up customer acquisition costs (CAC)'
    ],
    requirements: [
      'Access to a business manager ad account or plan to manage ad spend',
      'Basic understanding of marketing metrics (CTR, CPC, CPA)'
    ],
    description: `Stop burning cash on generic boosted posts. Elena Rostova provides step-by-step blueprints for structuring enterprise paid media accounts, writing conversion-focused ad copy, and analyzing lifetime value metrics.`,
    curriculum: [
      {
        id: 'sec-20-1',
        title: 'Section 1: Search Intent & Google Ads Structure',
        lectures: [
          { id: 'lec-20-1-1', title: 'Account Architecture: Single Theme Ad Groups Decoded', durationMinutes: 24, type: 'video', previewFree: true },
          { id: 'lec-20-1-2', title: 'Negative Keyword Harvesting to Eliminate Wasted Spend', durationMinutes: 20, type: 'video' }
        ]
      }
    ],
    status: 'published'
  },
  {
    id: 'course-21',
    title: 'Advanced Figma: Variables, Component Sets & Prototypes',
    subtitle: 'Level up your UI craft: design multi-mode components, build interactive smart animate prototypes, and hand off to dev with tokens.',
    slug: 'advanced-figma-variables-component-sets-prototypes',
    categoryId: 'cat-design',
    subcategory: 'Figma Advanced',
    instructorId: 'inst-2',
    price: 699,
    originalPrice: 1999,
    rating: 4.93,
    reviewsCount: 1680,
    studentCount: 17200,
    durationHours: 16.0,
    lectureCount: 72,
    level: 'Intermediate',
    language: 'English',
    lastUpdated: 'October 2026',
    badges: ['Highest rated', 'Bestseller'],
    thumbnail: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800&auto=format&fit=crop&q=80',
    whatYouWillLearn: [
      'Harness Figma Variables for color themes, spacing tokens, and responsive typography',
      'Build bulletproof responsive components using Auto Layout v4 and min/max dimensions',
      'Create high-fidelity interactive prototypes with variable conditionals and expressions',
      'Streamline developer handoff with structured code annotations and CSS inspection',
      'Organize file hierarchies and shared libraries for teams of 50+ designers'
    ],
    requirements: [
      'Free or paid Figma account',
      'Comfortable with basic Figma tools and vector drawing'
    ],
    description: `Unlock the full power of modern Figma. Vikram Malhotra shares the techniques and keyboard shortcuts used by design leads to build flexible, mathematically sound interfaces in half the time.`,
    curriculum: [
      {
        id: 'sec-21-1',
        title: 'Section 1: Mastering Variables & Modes',
        lectures: [
          { id: 'lec-21-1-1', title: 'Variable Collections: Color, Number, String and Boolean', durationMinutes: 20, type: 'video', previewFree: true },
          { id: 'lec-21-1-2', title: 'Setting Up Dark Mode and Dense Display Modes Instantly', durationMinutes: 26, type: 'video' }
        ]
      }
    ],
    status: 'published'
  },
  {
    id: 'course-22',
    title: 'Startup Fundraising & Cap Table Economics',
    subtitle: 'From SAFE notes and pre-money valuation to investor term sheets, option pool dilution, and board governance.',
    slug: 'startup-fundraising-cap-table-economics',
    categoryId: 'cat-business',
    subcategory: 'Startup Strategy',
    instructorId: 'inst-6',
    price: 1199,
    originalPrice: 3499,
    rating: 4.88,
    reviewsCount: 610,
    studentCount: 6900,
    durationHours: 17.5,
    lectureCount: 66,
    level: 'Intermediate',
    language: 'English',
    lastUpdated: 'September 2026',
    badges: ['New'],
    thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
    whatYouWillLearn: [
      'Calculate dilution across Seed, Series A, and Series B rounds on dynamic cap tables',
      'Understand the fine print of term sheets: liquidation preferences, pro-rata rights, drag-along',
      'Structure SAFE and convertible note financing rounds without valuation traps',
      'Pitch venture capitalists with pitch decks that answer critical underwriting questions',
      'Run productive board meetings and establish founder-friendly corporate governance'
    ],
    requirements: [
      'An interest in high-growth startups and venture capital mechanisms'
    ],
    description: `Navigating venture fundraising without financial literacy is dangerous for founders. David Kim walks you through actual term sheets, showing you where founders inadvertently surrender control or equity, and how to negotiate from strength.`,
    curriculum: [
      {
        id: 'sec-22-1',
        title: 'Section 1: The Anatomy of a Financing Round',
        lectures: [
          { id: 'lec-22-1-1', title: 'Pre-Money vs Post-Money: The Simple Math Most Founders Botch', durationMinutes: 18, type: 'video', previewFree: true },
          { id: 'lec-22-1-2', title: 'How Option Pools Silently Dilute the Founding Team', durationMinutes: 25, type: 'video' }
        ]
      }
    ],
    status: 'published'
  },
  {
    id: 'course-23',
    title: 'Modern Mobile App Development with React Native & Expo',
    subtitle: 'Build native iOS and Android apps with a single codebase: gesture handlers, offline SQLite caching, push notifications, and App Store submission.',
    slug: 'modern-react-native-expo-cross-platform',
    categoryId: 'cat-dev',
    subcategory: 'Mobile Apps',
    instructorId: 'inst-7',
    price: 1299,
    originalPrice: 3599,
    rating: 4.89,
    reviewsCount: 1410,
    studentCount: 13500,
    durationHours: 27.0,
    lectureCount: 124,
    level: 'Intermediate',
    language: 'English',
    lastUpdated: 'October 2026',
    badges: [],
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80',
    whatYouWillLearn: [
      'Build snappy, 60fps mobile interfaces using React Native New Architecture and Fabric',
      'Implement fluid 120Hz gestures using Reanimated 3 and Gesture Handler',
      'Persist offline relational state with SQLite and background sync workers',
      'Configure native push notifications for iOS APNs and Android FCM',
      'Automate builds and distribution with Expo Application Services (EAS)'
    ],
    requirements: [
      'Proficiency in React and JavaScript/TypeScript',
      'A physical iOS or Android phone, or emulator installed'
    ],
    description: `Deliver smooth native experiences without managing duplicate Objective-C and Kotlin codebases. Neha Deshmukh takes you from empty terminal to ready-to-publish mobile application with real native performance.`,
    curriculum: [
      {
        id: 'sec-23-1',
        title: 'Section 1: React Native Architecture & Setup',
        lectures: [
          { id: 'lec-23-1-1', title: 'The New Architecture Explained: JSI vs The Old Bridge', durationMinutes: 21, type: 'video', previewFree: true },
          { id: 'lec-23-1-2', title: 'Building Fluid Gesture Interactions with Reanimated', durationMinutes: 28, type: 'video' }
        ]
      }
    ],
    status: 'published'
  },
  {
    id: 'course-24',
    title: 'Draft Course: Next-Gen Web Assembly & Rust Modules',
    subtitle: 'Compile high-speed Rust algorithms to WebAssembly for browser performance.',
    slug: 'web-assembly-rust-browser-performance',
    categoryId: 'cat-dev',
    subcategory: 'Full-Stack Web',
    instructorId: 'inst-7',
    price: 1499,
    originalPrice: 3899,
    rating: 0,
    reviewsCount: 0,
    studentCount: 0,
    durationHours: 18.0,
    lectureCount: 42,
    level: 'Expert',
    language: 'English',
    lastUpdated: 'October 2026',
    badges: [],
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    whatYouWillLearn: [
      'Understand WASM memory buffers and zero-copy data passing',
      'Compile Rust crates to Wasm with wasm-pack and wasm-bindgen',
      'Accelerate image processing and audio synthesis in web browsers'
    ],
    requirements: ['Solid Rust foundations'],
    description: 'An advanced draft course currently being drafted by instructor Neha Deshmukh.',
    curriculum: [
      {
        id: 'sec-24-1',
        title: 'Section 1: Rust to Wasm Foundations',
        lectures: [
          { id: 'lec-24-1-1', title: 'Linear Memory & WebAssembly Semantics', durationMinutes: 18, type: 'video' }
        ]
      }
    ],
    status: 'in_review',
    reviewFeedback: 'Curriculum structure looks promising. Please attach sample code exercises for Section 2 before final approval.'
  }
];

export const QUIZZES: Record<string, Quiz> = {
  'quiz-1': {
    id: 'quiz-1',
    title: 'Knowledge Check: TypeScript Systems & Architecture',
    passingScorePercent: 80,
    timeLimitMinutes: 10,
    questions: [
      {
        id: 'q1',
        question: 'Which TypeScript operator creates a union of all property keys of an object type T?',
        options: ['typeof T', 'keyof T', 'in T', 'extends T'],
        correctOptionIndex: 1,
        explanation: 'keyof T produces a string or numeric literal union of all known public property keys of the type.'
      },
      {
        id: 'q2',
        question: 'What is the primary benefit of a discriminated union pattern in TypeScript?',
        options: [
          'It automatically converts types at runtime',
          'It provides exhaustive compile-time type narrowing via a shared literal tag',
          'It eliminates the need for unit testing',
          'It reduces bundle size by tree-shaking functions'
        ],
        correctOptionIndex: 1,
        explanation: 'A discriminated union uses a common singleton property (discriminant) so TypeScript can narrow the union variant safely in conditional blocks.'
      },
      {
        id: 'q3',
        question: 'When should you prefer the `satisfies` operator over a type annotation?',
        options: [
          'When you want to validate that an expression matches a type while preserving the expression’s specific inferred type',
          'Only when declaring classes',
          'When you need runtime data validation',
          'When working exclusively with external JSON APIs'
        ],
        correctOptionIndex: 0,
        explanation: '`satisfies` validates structural conformance without widening the inferred type to the generic interface.'
      },
      {
        id: 'q4',
        question: 'What happens when `strict: true` is enabled in tsconfig.json?',
        options: [
          'Code is compiled to C++',
          'All strict type-checking flags including strictNullChecks, noImplicitAny, and strictFunctionTypes are enabled',
          'No external npm libraries can be imported',
          'Variables can never be reassigned'
        ],
        correctOptionIndex: 1,
        explanation: 'The `strict` flag turns on a comprehensive suite of safety checks, ensuring no implicit any and strict null handling.'
      },
      {
        id: 'q5',
        question: 'In React 19, what is the recommended way to handle asynchronous data mutation in forms?',
        options: ['useAsyncEffect hook', 'React Actions with useActionState', 'Manual window.fetch with useEffect', 'Inline setTimeout calls'],
        correctOptionIndex: 1,
        explanation: 'React 19 introduces first-class Actions and useActionState to manage pending states, optimistic updates, and form submissions automatically.'
      }
    ]
  }
};

export const REVIEWS: Review[] = [
  {
    id: 'rev-1',
    courseId: 'course-1',
    userId: 'user-student-1',
    userName: 'Arjun Nambiar',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
    rating: 5,
    date: '2 weeks ago',
    comment: 'The depth here is unmatched. Most online courses stop at todo lists, but Neha builds a real multi-tenant architecture with bulletproof auth and Docker deployments. Worth ten times the price.',
    helpfulCount: 42,
    instructorReply: {
      date: '1 week ago',
      comment: 'Thank you Arjun! Glad the multi-tenancy section proved valuable in your day-to-day work.'
    }
  },
  {
    id: 'rev-2',
    courseId: 'course-1',
    userId: 'user-std-2',
    userName: 'Ritu Sen',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    rating: 5,
    date: '1 month ago',
    comment: 'Transformed my confidence with strict TypeScript generics. The explanations of discriminated unions and clean domain boundaries are crystal clear.',
    helpfulCount: 28
  },
  {
    id: 'rev-3',
    courseId: 'course-2',
    userId: 'user-std-3',
    userName: 'Kabir Mehta',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    rating: 5,
    date: '3 weeks ago',
    comment: 'Vikram teaches design systems from an engineering-first perspective. The section on automated token synchronisation with GitHub saved our team weeks of debate.',
    helpfulCount: 31,
    instructorReply: {
      date: '2 weeks ago',
      comment: 'So glad to hear that Kabir! Token pipelines bridge the designer-developer divide permanently.'
    }
  },
  {
    id: 'rev-4',
    courseId: 'course-3',
    userId: 'user-std-4',
    userName: 'Sunil Chawla',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    rating: 5,
    date: '2 months ago',
    comment: 'Priya’s LBO modeling walkthrough is better than the training I received at my investment bank. Realistic, clean, and zero fluff.',
    helpfulCount: 54
  }
];

export const QA_QUESTIONS: QAQuestion[] = [
  {
    id: 'qa-1',
    courseId: 'course-1',
    lectureId: 'lec-1-2',
    userId: 'user-student-1',
    userName: 'Arjun Nambiar',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
    title: 'How should we handle branded nominal types for database IDs?',
    content: 'When using UUIDs as primary keys across multiple tables, how do you prevent passing a UserId to a function expecting an OrderId without runtime overhead?',
    createdAt: '3 days ago',
    answers: [
      {
        id: 'ans-1',
        userId: 'inst-7',
        userName: 'Neha Deshmukh',
        userAvatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=300&auto=format&fit=crop&q=80',
        isInstructor: true,
        content: `Great question, Arjun! We use the "branded type" pattern with unique symbols:
\`\`\`ts
declare const __brand: unique symbol;
export type Brand<T, B> = T & { readonly [__brand]: B };
export type UserId = Brand<string, 'UserId'>;
export type OrderId = Brand<string, 'OrderId'>;
\`\`\`
This compiles away completely to simple strings at runtime but produces compile-time type errors if you cross-assign them.`,
        createdAt: '2 days ago'
      }
    ]
  },
  {
    id: 'qa-2',
    courseId: 'course-1',
    lectureId: 'lec-2-2',
    userId: 'user-std-5',
    userName: 'Devika Nair',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    title: 'Migrating legacy Redux reducers to Zustand slices',
    content: 'What is the cleanest phased migration strategy when working in a 40,000-line codebase where we cannot afford a rewrite?',
    createdAt: '5 days ago',
    answers: [
      {
        id: 'ans-2',
        userId: 'inst-7',
        userName: 'Neha Deshmukh',
        userAvatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=300&auto=format&fit=crop&q=80',
        isInstructor: true,
        content: 'I recommend the Strangler Fig pattern: keep the Redux provider mounted at root, but implement all newly created feature modules in isolated Zustand stores. You can dispatch Redux actions from Zustand subscriptions during the transition period.',
        createdAt: '4 days ago'
      }
    ]
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'PJ-2026-8819',
    userId: 'user-student-1',
    items: [
      {
        courseId: 'course-1',
        courseTitle: 'Modern Full-Stack React, TypeScript & Node Architecture',
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
        price: 1299,
        instructorName: 'Neha Deshmukh'
      },
      {
        courseId: 'course-2',
        courseTitle: 'Enterprise Design Systems with Figma & Tailwind CSS',
        thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
        price: 899,
        instructorName: 'Vikram Malhotra'
      }
    ],
    subtotal: 2198,
    discount: 439,
    total: 1759,
    couponCode: 'WELCOME20',
    paymentMethod: 'upi',
    status: 'completed',
    createdAt: '2026-09-20',
    invoiceNumber: 'INV-2026-09281'
  },
  {
    id: 'ord-1002',
    orderNumber: 'PJ-2026-9142',
    userId: 'user-student-1',
    items: [
      {
        courseId: 'course-5',
        courseTitle: 'Product Leadership: Strategy, Metrics & Execution',
        thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80',
        price: 999,
        instructorName: 'David Kim'
      }
    ],
    subtotal: 999,
    discount: 0,
    total: 999,
    paymentMethod: 'card',
    status: 'completed',
    createdAt: '2026-10-02',
    invoiceNumber: 'INV-2026-10014'
  }
];

export const INITIAL_REFUNDS: RefundRequest[] = [
  {
    id: 'ref-1',
    orderId: 'ord-1002',
    courseId: 'course-5',
    courseTitle: 'Product Leadership: Strategy, Metrics & Execution',
    userId: 'user-student-1',
    userName: 'Arjun Nambiar',
    userEmail: 'student@prajnadhara.edu',
    amount: 999,
    reason: 'I accidentally bought this course twice on two different personal emails.',
    status: 'pending',
    createdAt: '2026-10-06'
  }
];

export const INITIAL_PAYOUTS: PayoutRequest[] = [
  {
    id: 'pay-1',
    instructorId: 'inst-7',
    instructorName: 'Neha Deshmukh',
    instructorEmail: 'instructor@prajnadhara.edu',
    amount: 85000,
    method: 'UPI (neha.ts@paytm)',
    status: 'pending',
    requestedAt: '2026-10-07'
  },
  {
    id: 'pay-2',
    instructorId: 'inst-1',
    instructorName: 'Dr. Ananya Sharma',
    instructorEmail: 'ananya.sharma@prajnadhara.edu',
    amount: 145000,
    method: 'HDFC Bank (918237461928)',
    status: 'completed',
    requestedAt: '2026-09-30',
    processedAt: '2026-10-01'
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-1',
    code: 'WELCOME50',
    discountPercent: 50,
    maxUses: 1000,
    usedCount: 482,
    expiresAt: '2026-12-31',
    active: true
  },
  {
    id: 'coup-2',
    code: 'PRAKASH20',
    discountPercent: 20,
    maxUses: 500,
    usedCount: 194,
    expiresAt: '2026-11-30',
    active: true
  },
  {
    id: 'coup-3',
    code: 'SKILLBOOST',
    discountPercent: 35,
    maxUses: 200,
    usedCount: 78,
    expiresAt: '2026-10-31',
    active: true
  }
];

export const INITIAL_INSTRUCTOR_APPLICATIONS: InstructorApplication[] = [
  {
    id: 'app-1',
    userId: 'user-app-1',
    applicantName: 'Karthik Balakrishnan',
    email: 'karthik.b@example.com',
    expertise: 'Embedded Systems, FreeRTOS & Robotics',
    experienceBio: '12 years designing autonomous drone flight controllers and firmware in C/C++. Led robotics R&D at aerospace startup.',
    sampleTopic: 'Industrial FreeRTOS: Priority Inversion, Memory Pools and CAN Bus Interfaces',
    linkedinOrPortfolio: 'https://linkedin.com/in/karthik-robotics',
    status: 'pending',
    submittedAt: '2026-10-05'
  },
  {
    id: 'app-2',
    userId: 'user-app-2',
    applicantName: 'Dr. Soumya Roy',
    email: 'soumya.roy@example.com',
    expertise: 'Genomic Data Science & Bioinformatics',
    experienceBio: 'Postdoctoral researcher at IISc specializing in next-generation sequencing pipelines and variant analysis in Python.',
    sampleTopic: 'Practical Next-Gen Sequencing with Biopython & Nextflow',
    linkedinOrPortfolio: 'https://scholar.google.com/citations?user=soumya-roy',
    status: 'approved',
    submittedAt: '2026-09-28'
  }
];

export const INITIAL_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-1',
    certificateNumber: 'PJE-CERT-2026-89104',
    courseId: 'course-1',
    courseTitle: 'Modern Full-Stack React, TypeScript & Node Architecture',
    userId: 'user-student-1',
    userName: 'Arjun Nambiar',
    instructorName: 'Neha Deshmukh',
    issueDate: 'October 4, 2026',
    grade: 'Excellence (94%)',
    totalHours: 32.5,
    verifyUrl: 'https://prajnadhara.edu/verify/PJE-CERT-2026-89104'
  }
];

export const INITIAL_PROGRESS: Record<string, UserCourseProgress> = {
  'course-1': {
    courseId: 'course-1',
    completedLectureIds: ['lec-1-1', 'lec-1-2', 'lec-1-3', 'lec-1-4'],
    lastAccessedLectureId: 'lec-2-1',
    archived: false
  },
  'course-2': {
    courseId: 'course-2',
    completedLectureIds: ['lec-2-1-1'],
    lastAccessedLectureId: 'lec-2-1-2',
    archived: false
  },
  'course-5': {
    courseId: 'course-5',
    completedLectureIds: [],
    lastAccessedLectureId: 'lec-5-1-1',
    archived: false
  }
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'user-student-1',
    title: 'Certificate Awarded',
    message: 'Congratulations! You completed Modern Full-Stack React, TypeScript & Node Architecture. Your official verifiable certificate is ready.',
    read: false,
    createdAt: '2 days ago',
    type: 'course',
    link: '/student/certificates'
  },
  {
    id: 'notif-2',
    userId: 'user-student-1',
    title: 'Instructor Answered Your Question',
    message: 'Neha Deshmukh replied to your question on branded nominal types.',
    read: true,
    createdAt: '2 days ago',
    type: 'qa',
    link: '/student/course/course-1'
  },
  {
    id: 'notif-3',
    userId: 'inst-7',
    title: 'New Student Question',
    message: 'Devika Nair asked a question in Section 2 regarding Zustand slices.',
    read: false,
    createdAt: '1 day ago',
    type: 'qa',
    link: '/instructor/qa'
  },
  {
    id: 'notif-4',
    userId: 'user-admin-1',
    title: 'Course Submitted for Review',
    message: 'Neha Deshmukh submitted "Draft Course: Next-Gen Web Assembly & Rust Modules" for approval.',
    read: false,
    createdAt: '3 days ago',
    type: 'course',
    link: '/admin/course-reviews'
  }
];

export const MOCK_STUDENTS_LIST = Array.from({ length: 60 }).map((_, index) => {
  const firstNames = ['Aarav', 'Diya', 'Rohan', 'Ananya', 'Vivaan', 'Isha', 'Kabir', 'Aditi', 'Reyansh', 'Meera', 'Arjun', 'Tanvi', 'Siddharth', 'Pooja', 'Nikhil', 'Sneha'];
  const lastNames = ['Sharma', 'Verma', 'Patel', 'Iyer', 'Menon', 'Rao', 'Nambiar', 'Chatterjee', 'Gupta', 'Singh', 'Desai', 'Kulkarni'];
  const fName = firstNames[index % firstNames.length];
  const lName = lastNames[(index * 3) % lastNames.length];
  return {
    id: `student-${index + 1}`,
    name: `${fName} ${lName}`,
    email: `${fName.toLowerCase()}.${lName.toLowerCase()}${index + 10}@example.com`,
    avatar: `https://images.unsplash.com/photo-${1500000000000 + (index * 732918)}?w=150&auto=format&fit=crop&q=80`,
    role: 'student' as const,
    enrolledCount: (index % 5) + 1,
    completedCount: index % 3,
    joinedDate: `2024-0${(index % 8) + 1}-15`,
    spentAmount: ((index % 5) + 1) * 1199
  };
});
