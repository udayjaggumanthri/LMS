import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  User as UserIcon,
  Shield,
  Sliders,
  Bell,
  CheckCircle2,
  KeyRound,
  Smartphone,
  Laptop,
  Check,
  Award,
  Globe,
  ExternalLink
} from 'lucide-react';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
];

type SettingsTab = 'profile' | 'learning' | 'security' | 'notifications';

export const StudentAccountPage: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const { showToast } = useNotifications();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Profile Info
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [title, setTitle] = useState(currentUser?.title || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || AVATAR_OPTIONS[0]);
  const [githubHandle, setGithubHandle] = useState('prajna-learner');
  const [linkedinUrl, setLinkedinUrl] = useState('https://linkedin.com/in/');

  // Learning Preferences
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0');
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [defaultCaptions, setDefaultCaptions] = useState(true);
  const [codeTheme, setCodeTheme] = useState('github-dark');

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setNewPasswordConfirm] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Notification Preferences
  const [emailAnnouncements, setEmailAnnouncements] = useState(true);
  const [emailQaReplies, setEmailQaReplies] = useState(true);
  const [emailWeeklyDigest, setEmailWeeklyDigest] = useState(true);
  const [emailDiscounts, setEmailDiscounts] = useState(false);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Full name cannot be blank.');
      return;
    }
    updateProfile({ name, email, title, bio, avatar });
    showToast('success', 'Student profile details successfully updated!');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('error', 'Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      showToast('error', 'New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'New password and confirmation do not match.');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setNewPasswordConfirm('');
    showToast('success', 'Account security credentials updated successfully.');
  };

  const handlePreferencesSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('success', 'Learning & player preferences saved!');
  };

  const handleNotificationsSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('success', 'Communication preferences recorded.');
  };

  return (
    <div className="max-w-4xl text-left space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
          Learner Profile & Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your credentials, curriculum preferences, security, and notification delivery
        </p>
      </div>

      {/* Profile Overview Banner */}
      <div className="p-5 border border-slate-200 rounded-lg bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={avatar}
              alt={name}
              className="w-16 h-16 rounded-full object-cover border-2 border-emerald-800 shadow-xs"
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-700 border-2 border-white rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">{name || 'Enrolled Student'}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                {currentUser?.role || 'student'}
              </span>
            </div>
            <p className="text-xs text-slate-500">{email}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Member since {currentUser?.joinedAt ? new Date(currentUser.joinedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '2025'} &bull; {currentUser?.enrolledCourseIds?.length || 0} enrolled courses
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-center min-w-[70px]">
            <div className="font-bold text-slate-900 text-sm">{currentUser?.enrolledCourseIds?.length || 0}</div>
            <div className="text-[10px] text-slate-500">Courses</div>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-center min-w-[70px]">
            <div className="font-bold text-slate-900 text-sm">{currentUser?.wishlistCourseIds?.length || 0}</div>
            <div className="text-[10px] text-slate-500">Saved</div>
          </div>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-t transition-colors border-b-2 -mb-[3px] ${
            activeTab === 'profile'
              ? 'border-emerald-800 text-emerald-950 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span>Profile Info</span>
        </button>

        <button
          onClick={() => setActiveTab('learning')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-t transition-colors border-b-2 -mb-[3px] ${
            activeTab === 'learning'
              ? 'border-emerald-800 text-emerald-950 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Learning Preferences</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-t transition-colors border-b-2 -mb-[3px] ${
            activeTab === 'security'
              ? 'border-emerald-800 text-emerald-950 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Security & Sessions</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-t transition-colors border-b-2 -mb-[3px] ${
            activeTab === 'notifications'
              ? 'border-emerald-800 text-emerald-950 bg-emerald-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notifications</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-6 border border-slate-200 rounded-lg bg-white text-xs">
        {/* Tab 1: Profile Information */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Select Profile Avatar
              </label>
              <div className="flex flex-wrap gap-2.5">
                {AVATAR_OPTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(item)}
                    className={`relative rounded-full p-0.5 transition-transform hover:scale-105 ${
                      avatar === item ? 'ring-2 ring-emerald-800 ring-offset-2' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={item}
                      alt={`Avatar option ${idx + 1}`}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                    />
                    {avatar === item && (
                      <span className="absolute bottom-0 right-0 bg-emerald-800 text-white rounded-full p-0.5 shadow">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Priyanshu Sharma"
              />
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Input
              label="Professional Headline / Career Goal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Aspiring Distributed Systems Engineer"
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Biography & Learning Background
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your technical interests, open source projects, and what you aim to achieve on Prajnadhara..."
                className="w-full bg-white border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <Input
                label="GitHub Username"
                value={githubHandle}
                onChange={(e) => setGithubHandle(e.target.value)}
                placeholder="github_username"
              />
              <Input
                label="LinkedIn Public URL"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/yourname"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <Button type="submit" variant="primary" size="md">
                Save Profile Changes
              </Button>
            </div>
          </form>
        )}

        {/* Tab 2: Learning Preferences */}
        {activeTab === 'learning' && (
          <form onSubmit={handlePreferencesSave} className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Video Player & Course Defaults</h3>
              <p className="text-slate-500 text-xs mb-4">
                Tailor the curriculum video viewer to your optimal study tempo
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Default Playback Speed
                  </label>
                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value="0.75">0.75x (Detailed study)</option>
                    <option value="1.0">1.0x (Normal speed)</option>
                    <option value="1.25">1.25x (Recommended pace)</option>
                    <option value="1.5">1.5x (Accelerated)</option>
                    <option value="1.75">1.75x (Rapid review)</option>
                    <option value="2.0">2.0x (Sprint speed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Code Viewer Color Scheme
                  </label>
                  <select
                    value={codeTheme}
                    onChange={(e) => setCodeTheme(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  >
                    <option value="github-dark">GitHub Dark (Default)</option>
                    <option value="one-dark-pro">One Dark Pro</option>
                    <option value="night-owl">Night Owl</option>
                    <option value="github-light">GitHub Light</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={autoPlayNext}
                  onChange={(e) => setAutoPlayNext(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
                />
                <div>
                  <div className="font-semibold text-slate-800">Auto-advance to Next Lecture</div>
                  <div className="text-[11px] text-slate-500">Automatically start the next lesson when video ends</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={defaultCaptions}
                  onChange={(e) => setDefaultCaptions(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
                />
                <div>
                  <div className="font-semibold text-slate-800">Always Enable English Subtitles</div>
                  <div className="text-[11px] text-slate-500">Load synchronized captions whenever available</div>
                </div>
              </label>
            </div>

            {/* Certificate Preview */}
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2 text-emerald-900 font-bold text-xs">
                <Award className="w-4 h-4 text-emerald-700" />
                <span>Certificate Name Verification Preview</span>
              </div>
              <p className="text-[11px] text-slate-600 mb-3">
                This exact name will be engraved onto your verified graduation credentials:
              </p>
              <div className="bg-white p-3 border border-slate-200 rounded font-display font-bold text-sm text-slate-900 text-center tracking-wide">
                {name || 'Full Student Name'}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" size="md">
                Save Preferences
              </Button>
            </div>
          </form>
        )}

        {/* Tab 3: Security & Sessions */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-slate-700" />
                <span>Change Account Password</span>
              </h3>

              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  placeholder="Repeat new password"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="outline" size="sm">
                  Update Password
                </Button>
              </div>
            </form>

            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Two-Factor Authentication (2FA)</h4>
                  <p className="text-slate-500 text-[11px]">
                    Protect your student account and purchased licenses using TOTP authenticator codes
                  </p>
                </div>
                <Button
                  variant={twoFactorEnabled ? 'outline' : 'primary'}
                  size="sm"
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    showToast(twoFactorEnabled ? 'info' : 'success', twoFactorEnabled ? '2FA disabled.' : '2FA Authenticator activated!');
                  }}
                >
                  {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </Button>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="pt-6 border-t border-slate-100 space-y-3">
              <h4 className="text-sm font-bold text-slate-900">Active Login Sessions</h4>
              <div className="space-y-2">
                <div className="p-3 border border-slate-200 rounded flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <Laptop className="w-4 h-4 text-slate-700" />
                    <div>
                      <div className="font-semibold text-slate-800 flex items-center gap-2">
                        <span>Current Browser &bull; Chrome on Windows</span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-[10px] font-bold text-emerald-800">
                          Active Now
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">Bengaluru, Karnataka &bull; 103.21.244.12</div>
                    </div>
                  </div>
                </div>

                <div className="p-3 border border-slate-200 rounded flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-slate-500" />
                    <div>
                      <div className="font-semibold text-slate-800">Mobile App &bull; Prajnadhara iOS</div>
                      <div className="text-[11px] text-slate-500">Hyderabad, Telangana &bull; Last seen 2 days ago</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => showToast('info', 'Mobile session revoked.')}
                  >
                    Revoke
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Notifications */}
        {activeTab === 'notifications' && (
          <form onSubmit={handleNotificationsSave} className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Email Delivery Preferences</h3>
              <p className="text-slate-500 text-xs mb-4">
                Choose which notifications you wish to receive at {email}
              </p>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 border border-slate-200 rounded cursor-pointer hover:bg-slate-50">
                  <div>
                    <div className="font-semibold text-slate-800">Course Announcements</div>
                    <div className="text-[11px] text-slate-500">Instructor updates, new bonus lectures, and repo refreshes</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAnnouncements}
                    onChange={(e) => setEmailAnnouncements(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
                  />
                </label>

                <label className="flex items-center justify-between p-3 border border-slate-200 rounded cursor-pointer hover:bg-slate-50">
                  <div>
                    <div className="font-semibold text-slate-800">Q&A Responses & Mentor Mentions</div>
                    <div className="text-[11px] text-slate-500">Alerts when your questions receive replies or upvotes</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailQaReplies}
                    onChange={(e) => setEmailQaReplies(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
                  />
                </label>

                <label className="flex items-center justify-between p-3 border border-slate-200 rounded cursor-pointer hover:bg-slate-50">
                  <div>
                    <div className="font-semibold text-slate-800">Weekly Progress Digest</div>
                    <div className="text-[11px] text-slate-500">Summary of hours studied, modules completed, and learning streaks</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailWeeklyDigest}
                    onChange={(e) => setEmailWeeklyDigest(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
                  />
                </label>

                <label className="flex items-center justify-between p-3 border border-slate-200 rounded cursor-pointer hover:bg-slate-50">
                  <div>
                    <div className="font-semibold text-slate-800">Promotions & Fellowship Grants</div>
                    <div className="text-[11px] text-slate-500">Special seasonal discounts and early-access invitations</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailDiscounts}
                    onChange={(e) => setEmailDiscounts(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
                  />
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" size="md">
                Save Communication Settings
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
