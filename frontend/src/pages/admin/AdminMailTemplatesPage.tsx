import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BellRing, RefreshCw } from 'lucide-react';
import { adminService } from '../../api/adminService';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/ui/Button';

type MailTemplate = {
  key: string;
  label: string;
  description: string;
  subject: string;
  bodyHtml: string;
  enabled: boolean;
  placeholders: string[];
};

export const AdminMailTemplatesPage: React.FC = () => {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<MailTemplate[]>([]);
  const [savingKey, setSavingKey] = useState('');

  useEffect(() => {
    adminService.getEmailTemplates()
      .then((rows) => setTemplates(Array.isArray(rows) ? rows : []))
      .catch(() => showToast('Could not load mail templates.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const setEnabled = async (template: MailTemplate, enabled: boolean) => {
    setSavingKey(template.key);
    setTemplates((prev) => prev.map((row) => row.key === template.key ? { ...row, enabled } : row));
    try {
      const saved = await adminService.updateEmailTemplate(template.key, { enabled });
      setTemplates((prev) => prev.map((row) => row.key === template.key ? saved : row));
    } catch {
      setTemplates((prev) => prev.map((row) => row.key === template.key ? { ...row, enabled: template.enabled } : row));
      showToast('Could not update this template.', 'error');
    } finally {
      setSavingKey('');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-800" />
        Loading mail templates...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
          Mail templates
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Each message can be rewritten and turned on or off. A message that is off is not sent.
        </p>
      </div>

      <div className="space-y-3">
        {templates.map((template) => (
          <div key={template.key} className="p-5 border border-slate-200 rounded-lg bg-white flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-800 rounded-md">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-sm text-slate-900">{template.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{template.description}</div>
                <div className="text-[11px] text-slate-400 mt-1">Subject: {template.subject}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={template.enabled}
                  disabled={savingKey === template.key}
                  onChange={(e) => setEnabled(template, e.target.checked)}
                />
                {template.enabled ? 'On' : 'Off'}
              </label>
              <Link to={`/admin/mail-templates/${template.key}`}>
                <Button type="button" size="sm" variant="outline">Edit</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
