import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, Star } from 'lucide-react';
import { cmsService } from '../../api/cmsService';

export const AboutPage: React.FC = () => {
  const [heroCMS, setHeroCMS] = useState({
    badge: 'What they say!!',
    title: 'Empowering students with accessible, high-quality, and career-focused education.',
    subtitle: 'PrajnadharaEdu is a dedicated online learning platform committed to empowering students with high-quality, accessible, and career-focused education. We provide a wide range of courses designed to help learners build strong academic foundations, develop practical skills, and achieve their professional goals.',
    content: 'At PrajnadharaEdu, we believe in simplifying education through expert-led content, interactive learning experiences, and student-centric resources. Our mission is to bridge the gap between knowledge and real-world application by offering affordable and effective learning solutions. Whether you are a beginner or looking to upgrade your skills, PrajnadharaEdu is your trusted partner in continuous learning and career growth.',
    primaryBtnText: 'Explore Now',
    primaryBtnLink: '/courses',
    secondaryBtnText: 'Contact Us',
    secondaryBtnLink: '/contact'
  });

  const [missionCMS, setMissionCMS] = useState({
    badge: 'your skill',
    title: 'Why Choose Prajnadhara Edu?',
    subtitle: 'At Prajnadhara Edu, we build a complete learning ecosystem for students and professionals. Learning here is not limited to watching lessons. It’s about practicing skills, collaborating with peers, and growing together with guidance from experienced mentors.'
  });

  useEffect(() => {
    cmsService.getPage('about').then(data => {
      const hero = data?.sectionMap?.['hero'] || data?.sections?.find(s => s.sectionKey === 'hero');
      if (hero) {
        setHeroCMS(prev => ({
          badge: hero.badgeText || prev.badge,
          title: hero.title || prev.title,
          subtitle: hero.subtitle || prev.subtitle,
          content: hero.content || prev.content,
          primaryBtnText: hero.primaryBtnText || prev.primaryBtnText,
          primaryBtnLink: hero.primaryBtnLink || prev.primaryBtnLink,
          secondaryBtnText: hero.secondaryBtnText || prev.secondaryBtnText,
          secondaryBtnLink: hero.secondaryBtnLink || prev.secondaryBtnLink
        }));
      }

      const mission = data?.sectionMap?.['mission'] || data?.sections?.find(s => s.sectionKey === 'mission');
      if (mission) {
        setMissionCMS(prev => ({
          badge: mission.badgeText || prev.badge,
          title: mission.title || prev.title,
          subtitle: mission.subtitle || prev.subtitle
        }));
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="w-full text-slate-900 bg-white">
      {/* 1. Header & Hero Story */}
      <section className="border-b border-slate-200 bg-white py-12 lg:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-left">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'About Us' }
            ]}
            className="mb-6"
          />

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded text-xs font-bold uppercase tracking-wider text-emerald-900 mb-4">
            {heroCMS.badge}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight text-slate-950 leading-[1.15]">
            {heroCMS.title}
          </h1>

          <div className="mt-6 space-y-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
            <p>{heroCMS.subtitle}</p>
            {heroCMS.content && <p>{heroCMS.content}</p>}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to={heroCMS.primaryBtnLink}>
              <Button variant="primary" size="lg" className="bg-emerald-800 hover:bg-emerald-900 text-white font-semibold">
                {heroCMS.primaryBtnText}
              </Button>
            </Link>
            <Link to={heroCMS.secondaryBtnLink}>
              <Button variant="outline" size="lg" className="border-slate-300 text-slate-800 hover:bg-slate-50 font-semibold">
                {heroCMS.secondaryBtnText}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Platform Numbers Stats Band */}
      <section className="py-12 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 text-center">
            <div className="p-4 sm:p-6 bg-slate-800/40 rounded border border-slate-800">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-white tabular-nums">
                103 <span className="text-emerald-400 text-lg sm:text-xl font-normal">k+</span>
              </div>
              <div className="text-[11px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">
                Active Students
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-slate-800/40 rounded border border-slate-800">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-white tabular-nums">
                33 <span className="text-emerald-400 text-lg sm:text-xl font-normal">k</span>
              </div>
              <div className="text-[11px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">
                Total Courses
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-slate-800/40 rounded border border-slate-800">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-white tabular-nums">
                11 <span className="text-emerald-400 text-lg sm:text-xl font-normal">k</span>
              </div>
              <div className="text-[11px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">
                Instructors
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-slate-800/40 rounded border border-slate-800">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-white tabular-nums">
                100 <span className="text-emerald-400 text-lg sm:text-xl font-normal">%+</span>
              </div>
              <div className="text-[11px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">
                Satisfaction Rate
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Why Choose Prajnadhara Edu? */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-left">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
            {missionCMS.badge}
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-display text-slate-900 tracking-tight leading-tight">
            {missionCMS.title}
          </h2>

          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            {missionCMS.subtitle}
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded">
              <CheckCircle2 className="w-5 h-5 text-emerald-800 shrink-0" />
              <span className="text-sm font-semibold text-slate-900">Structured Learning Paths</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded">
              <CheckCircle2 className="w-5 h-5 text-emerald-800 shrink-0" />
              <span className="text-sm font-semibold text-slate-900">Free Courses</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded">
              <CheckCircle2 className="w-5 h-5 text-emerald-800 shrink-0" />
              <span className="text-sm font-semibold text-slate-900">Industry-Recognized Certifications</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded">
              <CheckCircle2 className="w-5 h-5 text-emerald-800 shrink-0" />
              <span className="text-sm font-semibold text-slate-900">Lifetime Learning Access</span>
            </div>
          </div>

          <div className="mt-8">
            <Link to="/courses">
              <Button variant="primary" size="md" className="bg-emerald-800 hover:bg-emerald-900">
                Discover More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Student Feedbacks */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-left">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
              Student Feedbacks
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
              Discover how our learners gained real-world skills, boosted confidence, and achieved their career goals through PrajnadharaEdu.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sneha Reddy */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  "Prajnadhara Edu helped me start my journey in web development from zero. The courses are very well structured and easy to follow. I was able to build my own website within a few weeks. Highly recommended for beginners!"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-emerald-800 text-white font-bold flex items-center justify-center text-sm">
                  SR
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Sneha Reddy</div>
                  <div className="text-xs text-slate-500">Aspiring Web Developer</div>
                </div>
              </div>
            </div>

            {/* Rahul Kumar */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  "The Data Science course was amazing! The explanations were simple, and the practical examples made it easy to understand complex concepts. I feel confident working with data now. Thank you Prajnadhara Edu!"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-emerald-800 text-white font-bold flex items-center justify-center text-sm">
                  RK
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">Rahul Kumar</div>
                  <div className="text-xs text-slate-500">Data Science Student</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Brand Statement Callout */}
      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed">
            At PrajnadharaEdu offers smart, career-aligned online learning designed to help you rise. Gain the skills you need and the confidence you deserve.
          </p>
          <div className="mt-6">
            <Link to="/courses">
              <Button variant="primary" size="md" className="bg-emerald-800 hover:bg-emerald-900">
                Browse All Programs &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
