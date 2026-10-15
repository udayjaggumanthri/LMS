import React, { useEffect, useState } from 'react';
import { courseService } from '../../api/courseService';
import { apiErrorMessage } from '../../api/client';
import { useNotifications } from '../../context/NotificationContext';

interface Announcement {
  id: number;
  title: string;
  body: string;
  authorName: string;
  createdAt: string;
}

export const CourseAnnouncementsPanel: React.FC<{ courseId: string | number }> = ({ courseId }) => {
  const { showToast } = useNotifications();
  const [rows, setRows] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    courseService.getAnnouncements(courseId).then(setRows).catch(() => setRows([]));
  }, [courseId]);

  const publish = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    try {
      const saved = await courseService.addAnnouncement(courseId, { title: title.trim(), body: body.trim() });
      setRows((prev) => [saved, ...prev]);
      setTitle('');
      setBody('');
      showToast('Announcement posted.', 'success');
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not post the announcement.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    try {
      await courseService.deleteAnnouncement(courseId, id);
      setRows((prev) => prev.filter((row) => row.id !== id));
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not remove the announcement.'), 'error');
    }
  };

  return (
    <div className="max-w-3xl space-y-4">
      <form onSubmit={publish} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Post an announcement</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Message for enrolled students"
          rows={4}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
        />
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-emerald-800 text-white text-sm font-semibold disabled:opacity-60"
        >
          {saving ? 'Posting...' : 'Post announcement'}
        </button>
      </form>
      {rows.length === 0 && <p className="text-sm text-slate-500">No announcements yet.</p>}
      {rows.map((row) => (
        <article key={row.id} className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-950">{row.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{row.createdAt}{row.authorName ? ` · ${row.authorName}` : ''}</p>
            </div>
            <button type="button" onClick={() => remove(row.id)} className="text-sm text-rose-700 font-semibold">Remove</button>
          </div>
          <p className="mt-3 text-sm text-slate-700 whitespace-pre-line">{row.body}</p>
        </article>
      ))}
    </div>
  );
};
