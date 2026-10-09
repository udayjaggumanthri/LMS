import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Video,
  FileText,
  HelpCircle,
  Download,
  ArrowRight,
  ArrowLeft,
  Upload
} from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Section, Lecture, CourseLevel } from '../../types';

export const CreateCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const { categories, addCourse } = useCourses();
  const { currentUser } = useAuth();

  // Wizard Step (1: Basics, 2: Intended Learners, 3: Curriculum Builder, 4: Landing Page, 5: Pricing, 6: Submit for Review)
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Basics
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-dev');
  const [subcategory, setSubcategory] = useState('Full-Stack Web');
  const [level, setLevel] = useState<CourseLevel>('All Levels');
  const [language, setLanguage] = useState('English');

  // Step 2: Intended Learners
  const [whatYouWillLearn, setWhatYouWillLearn] = useState<string[]>([
    'Build production-ready microservices from initial requirements',
    'Write automated unit and integration tests with 90%+ branch coverage',
    'Deploy containerized services using modern GitOps pipelines'
  ]);
  const [newLearnItem, setNewLearnItem] = useState('');

  const [requirements, setRequirements] = useState<string[]>([
    'Solid familiarity with fundamental programming constructs',
    'A computer with terminal command-line access'
  ]);
  const [newReqItem, setNewReqItem] = useState('');

  // Step 3: Curriculum Builder
  const [sections, setSections] = useState<Section[]>([
    {
      id: 'sec-new-1',
      title: 'Section 1: Architecture & Development Environment',
      lectures: [
        { id: 'lec-new-1', title: 'System Overview & Prerequisites', durationMinutes: 14, type: 'video', previewFree: true },
        { id: 'lec-new-2', title: 'Strict Type Configuration', durationMinutes: 20, type: 'video' }
      ]
    }
  ]);

  const [newSectionTitle, setNewSectionTitle] = useState('');

  // Step 4: Landing Page
  const [thumbnailUrl, setThumbnailUrl] = useState('https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80');
  const [description, setDescription] = useState('');

  // Step 5: Pricing
  const [price, setPrice] = useState(1299);
  const [originalPrice, setOriginalPrice] = useState(3499);
  const [isFree, setIsFree] = useState(false);

  // Step 6: Review submission notes
  const [instructorNotes, setInstructorNotes] = useState('');

  const stepsList = [
    { num: 1, label: 'Course Basics' },
    { num: 2, label: 'Intended Learners' },
    { num: 3, label: 'Curriculum Builder' },
    { num: 4, label: 'Landing Page' },
    { num: 5, label: 'Pricing & Coupons' },
    { num: 6, label: 'Submit for Review' }
  ];

  const handleAddLearnItem = () => {
    if (newLearnItem.trim()) {
      setWhatYouWillLearn(prev => [...prev, newLearnItem.trim()]);
      setNewLearnItem('');
    }
  };

  const handleAddReqItem = () => {
    if (newReqItem.trim()) {
      setRequirements(prev => [...prev, newReqItem.trim()]);
      setNewReqItem('');
    }
  };

  const handleAddSection = () => {
    if (newSectionTitle.trim()) {
      const newSec: Section = {
        id: `sec-user-${Date.now()}`,
        title: newSectionTitle.trim(),
        lectures: [
          { id: `lec-user-${Date.now()}`, title: 'Introduction to this module', durationMinutes: 15, type: 'video' }
        ]
      };
      setSections(prev => [...prev, newSec]);
      setNewSectionTitle('');
    }
  };

  const handleAddLecture = (sectionId: string) => {
    const titlePrompt = prompt('Enter lecture title:');
    if (!titlePrompt) return;
    setSections(prev => prev.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          lectures: [
            ...sec.lectures,
            {
              id: `lec-${Date.now()}`,
              title: titlePrompt,
              durationMinutes: 18,
              type: 'video'
            }
          ]
        };
      }
      return sec;
    }));
  };

  const handleRemoveLecture = (sectionId: string, lectureId: string) => {
    setSections(prev => prev.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          lectures: sec.lectures.filter(l => l.id !== lectureId)
        };
      }
      return sec;
    }));
  };

  const handleSubmitForReview = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const totalLectures = sections.reduce((acc, s) => acc + s.lectures.length, 0);
    const totalMinutes = sections.reduce((acc, s) => acc + s.lectures.reduce((lAcc, l) => lAcc + l.durationMinutes, 0), 0);
    const durationHours = Math.round((totalMinutes / 60) * 10) / 10;

    addCourse({
      title,
      subtitle,
      slug: slug || `course-${Date.now()}`,
      categoryId,
      subcategory,
      instructorId: currentUser?.id || 'inst-7',
      price: isFree ? 0 : price,
      originalPrice: isFree ? 0 : originalPrice,
      isFree,
      durationHours: durationHours || 12.0,
      lectureCount: totalLectures || 24,
      level,
      language,
      lastUpdated: 'October 2026',
      badges: ['New'],
      thumbnail: thumbnailUrl,
      whatYouWillLearn,
      requirements,
      description: description || 'Comprehensive practical course designed for production mastery.',
      curriculum: sections,
      status: 'in_review',
      reviewFeedback: instructorNotes ? `Instructor Note: ${instructorNotes}` : undefined
    });

    navigate('/instructor/courses');
  };

  return (
    <div className="max-w-5xl mx-auto text-left space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            Create New Masterclass
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Step-by-step curriculum architecture & verification wizard
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/instructor/courses')}>
          Exit to Dashboard
        </Button>
      </div>

      {/* Checklist Progress Indicator */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 border-b border-slate-200 pb-4 text-xs">
        {stepsList.map((step) => {
          const isDone = currentStep > step.num;
          const isCurrent = currentStep === step.num;
          return (
            <button
              key={step.num}
              type="button"
              onClick={() => setCurrentStep(step.num)}
              className={`p-2 rounded border text-left transition-colors ${
                isCurrent
                  ? 'border-emerald-800 bg-emerald-50 text-emerald-950 font-bold'
                  : isDone
                  ? 'border-slate-200 bg-slate-50 text-slate-700'
                  : 'border-slate-100 bg-white text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase font-bold">
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>Step {step.num}</span>
              </div>
              <div className="truncate text-[11px]">{step.label}</div>
            </button>
          );
        })}
      </div>

      {/* Wizard Form Panels */}
      <div className="p-8 border border-slate-200 rounded bg-white">
        {/* Step 1: Course Basics */}
        {currentStep === 1 && (
          <div className="space-y-5 text-xs max-w-2xl">
            <h2 className="text-base font-bold font-display text-slate-900 border-b border-slate-100 pb-2">
              Step 1: Course Basics
            </h2>

            <Input
              label="Course Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Modern Full-Stack React 19, TypeScript & Microservices"
              helper="Write a descriptive, outcome-oriented headline without buzzwords."
            />

            <Input
              label="Subtitle / Short Value Proposition"
              required
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Build production-ready web apps from scratch with strict TypeScript and CI/CD pipelines"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Subcategory / Focus"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. Full-Stack Web"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Target Skill Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>

              <Input
                label="Instructional Language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  if (!title.trim()) alert('Please enter a course title.');
                  else setCurrentStep(2);
                }}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Continue to Intended Learners &rarr;
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Intended Learners */}
        {currentStep === 2 && (
          <div className="space-y-6 text-xs max-w-2xl">
            <h2 className="text-base font-bold font-display text-slate-900 border-b border-slate-100 pb-2">
              Step 2: Intended Learners & Learning Outcomes
            </h2>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                What will students learn in your course? (At least 3 outcomes)
              </label>
              <div className="space-y-2 mb-3">
                {whatYouWillLearn.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="flex-1 text-slate-800">{item}</span>
                    <button
                      type="button"
                      onClick={() => setWhatYouWillLearn(prev => prev.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLearnItem}
                  onChange={(e) => setNewLearnItem(e.target.value)}
                  placeholder="e.g. Design modular compound components in React 19"
                  className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
                <Button variant="secondary" size="sm" onClick={handleAddLearnItem}>
                  Add Outcome
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Course Prerequisites & Technical Requirements
              </label>
              <div className="space-y-2 mb-3">
                {requirements.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded">
                    <span className="flex-1 text-slate-800">• {item}</span>
                    <button
                      type="button"
                      onClick={() => setRequirements(prev => prev.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newReqItem}
                  onChange={(e) => setNewReqItem(e.target.value)}
                  placeholder="e.g. Basic knowledge of JavaScript promises and async/await"
                  className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
                <Button variant="secondary" size="sm" onClick={handleAddReqItem}>
                  Add Requirement
                </Button>
              </div>
            </div>

            <div className="pt-4 flex justify-between border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)}>
                &larr; Back
              </Button>
              <Button variant="primary" size="md" onClick={() => setCurrentStep(3)}>
                Continue to Curriculum Builder &rarr;
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Curriculum Builder */}
        {currentStep === 3 && (
          <div className="space-y-6 text-xs">
            <h2 className="text-base font-bold font-display text-slate-900 border-b border-slate-100 pb-2">
              Step 3: Curriculum Builder (Sections & Lectures)
            </h2>

            <div className="space-y-4">
              {sections.map((section, secIdx) => (
                <div key={section.id} className="border border-slate-200 rounded bg-slate-50 p-4 space-y-3">
                  <div className="flex items-center justify-between font-bold text-slate-900 text-sm">
                    <span>{section.title}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddLecture(section.id)}
                      leftIcon={<Plus className="w-3 h-3" />}
                    >
                      Add Lecture
                    </Button>
                  </div>

                  <div className="divide-y divide-slate-200 bg-white border border-slate-200 rounded">
                    {section.lectures.map((lec) => (
                      <div key={lec.id} className="p-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {lec.type === 'video' && <Video className="w-3.5 h-3.5 text-slate-400" />}
                          {lec.type === 'article' && <FileText className="w-3.5 h-3.5 text-slate-400" />}
                          {lec.type === 'quiz' && <HelpCircle className="w-3.5 h-3.5 text-slate-400" />}
                          <span className="font-medium text-slate-800">{lec.title}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="tabular-nums text-slate-400">{lec.durationMinutes}m</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveLecture(section.id, lec.id)}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Section Input */}
            <div className="p-4 border border-dashed border-slate-300 rounded bg-white flex gap-2">
              <input
                type="text"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                placeholder="Enter title for a new section (e.g. Section 2: Concurrency & Kafka Streams)"
                className="flex-1 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
              <Button variant="secondary" size="sm" onClick={handleAddSection}>
                Add Section
              </Button>
            </div>

            <div className="pt-4 flex justify-between border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)}>
                &larr; Back
              </Button>
              <Button variant="primary" size="md" onClick={() => setCurrentStep(4)}>
                Continue to Landing Page &rarr;
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Landing Page */}
        {currentStep === 4 && (
          <div className="space-y-6 text-xs max-w-2xl">
            <h2 className="text-base font-bold font-display text-slate-900 border-b border-slate-100 pb-2">
              Step 4: Course Landing Page Presentation
            </h2>

            <div>
              <Input
                label="16:9 Thumbnail Image URL"
                required
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                helper="Use a high-quality 16:9 photographic asset representing your topic."
              />
              {thumbnailUrl && (
                <div className="mt-3 aspect-video max-w-xs rounded overflow-hidden border border-slate-200">
                  <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Course Description
              </label>
              <textarea
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail the course journey, tools used, production architectures, and real problems solved..."
                className="w-full bg-white border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="pt-4 flex justify-between border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setCurrentStep(3)}>
                &larr; Back
              </Button>
              <Button variant="primary" size="md" onClick={() => setCurrentStep(5)}>
                Continue to Pricing &rarr;
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Pricing & Coupons */}
        {currentStep === 5 && (
          <div className="space-y-6 text-xs max-w-2xl">
            <h2 className="text-base font-bold font-display text-slate-900 border-b border-slate-100 pb-2">
              Step 5: Pricing & Revenue Parameters
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="freeCheck"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-800"
                />
                <label htmlFor="freeCheck" className="font-semibold text-slate-800">
                  Offer this course for free as a community workshop
                </label>
              </div>

              {!isFree && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <Input
                    label="Selling Price in Indian Rupees (INR ₹)"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    helper="Recommended tier: ₹799 – ₹1,999"
                  />
                  <Input
                    label="Strikethrough Original Price (INR ₹)"
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    helper="Display discount anchor"
                  />
                </div>
              )}

              {!isFree && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Estimated Net Earning per Enrollment (85%):</span>
                    <span className="tabular-nums text-emerald-800">₹{Math.round(price * 0.85).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Platform retains 15% (₹{Math.round(price * 0.15).toLocaleString('en-IN')}) for video hosting, payment gateway, and certificate verification.
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-between border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setCurrentStep(4)}>
                &larr; Back
              </Button>
              <Button variant="primary" size="md" onClick={() => setCurrentStep(6)}>
                Proceed to Final Review &rarr;
              </Button>
            </div>
          </div>
        )}

        {/* Step 6: Submit for Review */}
        {currentStep === 6 && (
          <form onSubmit={handleSubmitForReview} className="space-y-6 text-xs max-w-2xl">
            <h2 className="text-base font-bold font-display text-slate-900 border-b border-slate-100 pb-2">
              Step 6: Submit Course to Editorial Board
            </h2>

            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded space-y-2">
              <h3 className="font-bold text-emerald-950 text-sm">Course Summary Readiness Check</h3>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                <div>Title: <strong>{title}</strong></div>
                <div>Category: <strong>{subcategory}</strong></div>
                <div>Sections: <strong>{sections.length}</strong></div>
                <div>Lectures: <strong>{sections.reduce((a, s) => a + s.lectures.length, 0)}</strong></div>
                <div>Price: <strong>{isFree ? 'Free' : `₹${price.toLocaleString('en-IN')}`}</strong></div>
                <div>Level: <strong>{level}</strong></div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Note for Platform Reviewers
              </label>
              <textarea
                rows={3}
                value={instructorNotes}
                onChange={(e) => setInstructorNotes(e.target.value)}
                placeholder="Include any specific links to starter repositories or test accounts for reviewers..."
                className="w-full bg-white border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 leading-relaxed">
              Upon submission, your course status will become <strong>In Review</strong>. Platform administrators review video clarity, code availability, and learning outcomes within 24–48 hours.
            </div>

            <div className="pt-4 flex justify-between border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setCurrentStep(5)}>
                &larr; Back
              </Button>
              <Button type="submit" variant="primary" size="md">
                Submit Course for Editorial Approval &rarr;
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
