import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { MediaUploader } from '../../components/common/MediaUploader';
import { CheckCircle2, User, Globe, ExternalLink, Star, Users, BookOpen } from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
];

export const InstructorProfileEditorPage: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState<'profile' | 'social'>('profile');

  // Bio & Identity
  const [name, setName] = useState(currentUser?.name || 'Neha Deshmukh');
  const [email, setEmail] = useState(currentUser?.email || 'instructor@prajnadhara.edu');
  const [title, setTitle] = useState(currentUser?.title || 'Lead Distributed Systems Architect & Ex-Googler');
  const [bio, setBio] = useState(
    currentUser?.bio ||
    'Senior distributed systems engineer with 12+ years designing mission-critical high-throughput microservices. Passionate about practical, zero-fluff software architecture.'
  );
  const [avatar, setAvatar] = useState(currentUser?.avatar || AVATAR_PRESETS[0]);

  // Social
  const [linkedin, setLinkedin] = useState('https://linkedin.com/in/nehadeshmukh-systems');
  const [github, setGithub] = useState('https://github.com/neha-cloud');
  const [website, setWebsite] = useState('https://nehadeshmukh.dev');
  const [twitter, setTwitter] = useState('@neha_systems');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      title,
      bio,
      avatar
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
          Manage your faculty credentials, social links, payout accounts, and preview your storefront presence
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
                {/* Avatar selection via MediaUploader */}
                <div>
                  <MediaUploader
                    label="Profile Photo / Avatar"
                    value={avatar}
                    onChange={(url) => setAvatar(url)}
                    helperText="Upload your official instructor portrait or pick an asset"
                  />
                </div>

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
              <img
                src={avatar}
                alt={name}
                className="w-16 h-16 rounded object-cover border border-slate-200 shrink-0"
              />
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
                <div className="font-bold text-slate-900 text-sm tabular-nums">4.92</div>
                <div className="text-[10px] text-slate-500">Rating</div>
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm tabular-nums">14,200+</div>
                <div className="text-[10px] text-slate-500">Learners</div>
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm tabular-nums">5</div>
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
