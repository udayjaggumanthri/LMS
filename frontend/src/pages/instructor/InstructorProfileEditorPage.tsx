import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { CheckCircle2, Globe, ExternalLink, Star, Users, BookOpen } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { userTeachesCourse } from '../../utils/courseFaculty';

export const InstructorProfileEditorPage: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const { courses } = useCourses();
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState<'profile' | 'social'>('profile');

  // Bio & Identity
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [title, setTitle] = useState(currentUser?.title || '');
  const [bio, setBio] = useState(currentUser?.bio || '');

  const myCourses = courses.filter((c) => currentUser?.role === 'admin' || userTeachesCourse(c, currentUser?.id));
  const learnerCount = myCourses.reduce((sum, c) => sum + Number(c.studentCount || 0), 0);
  const rated = myCourses.filter((c) => Number(c.reviewsCount) > 0);
  const averageRating = rated.length
    ? rated.reduce((sum, c) => sum + Number(c.rating || 0), 0) / rated.length
    : 0;

  // Social
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [website, setWebsite] = useState('');
  const [twitter, setTwitter] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      title,
      bio,
      avatar: ''
    });
    showToast('Instructor profile updated successfully!', 'success');
  };

  return (
    <div className="max-w-5xl text-left space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
          Public Instructor Profile & Studio Identity
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your name, credentials, and public profile
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section Tabs */}
          <div className="flex border-b border-slate-200 gap-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-emerald-800 text-emerald-950'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Public Bio
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('social')}
              className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                activeTab === 'social'
                  ? 'border-emerald-800 text-emerald-950'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Social & Portfolio
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {activeTab === 'profile' && (
              <div className="p-6 border border-slate-200 rounded bg-white space-y-4">
                <Input
                  label="Display Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <Input
                  label="Professional Headline / Job Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  helper="e.g. Staff Distributed Systems Engineer & Ex-Google SRE"
                />

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Full Biography & Industry Background
                  </label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 leading-relaxed"
                  />
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="p-6 border border-slate-200 rounded bg-white space-y-4">
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                  Verified Online Links
                </h3>
                <Input
                  label="LinkedIn Profile URL"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
                <Input
                  label="GitHub Profile URL"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/username"
                />
                <Input
                  label="Personal Website / Portfolio"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourdomain.com"
                />
                <Input
                  label="Twitter / X Handle"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="@handle"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button type="submit" variant="primary" size="md">
                Save & Update Profile &rarr;
              </Button>
            </div>
          </form>
        </div>

        {/* Right Preview Card: 5 cols */}
        <div className="lg:col-span-5 sticky top-20 space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Live Storefront Profile Preview
          </div>

          <div className="p-6 border border-slate-200 rounded bg-white shadow-sm space-y-4 text-xs">
            <div className="flex items-start gap-4">
              <Avatar name={name} size="xl" className="!w-16 !h-16" />
              <div>
                <h3 className="font-bold text-base text-slate-950 font-display leading-tight">{name}</h3>
                <p className="text-emerald-800 font-semibold text-xs mt-0.5">{title}</p>
                <span className="inline-block px-2 py-0.5 mt-1 rounded bg-emerald-50 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
                  Verified Instructor
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center">
              <div>
                <div className="font-bold text-slate-900 text-sm tabular-nums">{averageRating ? averageRating.toFixed(2) : '—'}</div>
                <div className="text-[10px] text-slate-500">Rating</div>
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm tabular-nums">{learnerCount.toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-slate-500">Learners</div>
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm tabular-nums">{myCourses.length}</div>
                <div className="text-[10px] text-slate-500">Courses</div>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed line-clamp-4">
              {bio}
            </p>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-3 text-slate-500">
              {website && <Globe className="w-4 h-4 text-slate-600" />}
              {linkedin && <span className="font-bold text-[10px] text-slate-600">IN</span>}
              {github && <span className="font-bold text-[10px] text-slate-600">GH</span>}
              {twitter && <span className="font-bold text-[10px] text-slate-600">X</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
