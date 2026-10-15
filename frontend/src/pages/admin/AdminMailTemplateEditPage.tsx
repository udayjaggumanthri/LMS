import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { adminService } from '../../api/adminService';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { MailTemplateEditor } from '../../components/admin/MailTemplateEditor';

type MailTemplate = {
  key: string;
  label: string;
  description: string;
  subject: string;
  bodyHtml: string;
  enabled: boolean;
  placeholders: string[];
};

export const AdminMailTemplateEditPage: React.FC = () => {
  const { key = '' } = useParams();
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [template, setTemplate] = useState<MailTemplate | null>(null);

  useEffect(() => {
    adminService.getEmailTemplates()
      .then((rows: MailTemplate[]) => {
        const match = (Array.isArray(rows) ? rows : []).find((row) => row.key === key) || null;
        setTemplate(match);
      })
      .catch(() => showToast('Could not load this template.', 'error'))
      .finally(() => setLoading(false));
  }, [key]);

  const save = async (quiet = false) => {
    if (!template) return false;
    setSaving(true);
    try {
      const saved = await adminService.updateEmailTemplate(template.key, {
        subject: template.subject,
        bodyHtml: template.bodyHtml,
        enabled: template.enabled,
      });
      setTemplate(saved);
      if (!quiet) showToast(`${saved.label} saved.`, 'success');
      return true;
    } catch {
      showToast('Could not save this template.', 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    if (!template) return;
    if (!testEmail.trim()) {
      showToast('Enter a test inbox first.', 'error');
      return;
    }
    setTesting(true);
    try {
      const saved = await save(true);
      if (!saved) return;
      const result = await adminService.testEmailTemplate(template.key, testEmail.trim());
      showToast(result.message || 'Test sent.', result.success ? 'success' : 'error');
    } catch {
      showToast('Could not send this template.', 'error');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-800" />
        Loading template...
      </div>
    );
  }

  if (!template) {
    return (
      <div className="max-w-4xl mx-auto text-left space-y-3">
        <p className="text-sm text-slate-700">This template is not available.</p>
        <Link to="/admin/mail-templates" className="text-xs font-semibold text-emerald-800 hover:underline">Back to templates</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="pb-4 border-b border-slate-200 space-y-2">
        <Link to="/admin/mail-templates" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" />
          All templates
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
              {template.label}
            </h1>
            <p className="text-xs text-slate-500 mt-1">{template.description}</p>
          </div>
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={template.enabled}
              onChange={(e) => setTemplate({ ...template, enabled: e.target.checked })}
            />
            {template.enabled ? 'On' : 'Off'}
          </label>
        </div>
      </div>

      <div className="p-4 sm:p-6 border border-slate-200 rounded-lg bg-white">
        <MailTemplateEditor
          subject={template.subject}
          html={template.bodyHtml}
          variables={template.placeholders || []}
          onChange={(next) => setTemplate((current) => current ? { ...current, subject: next.subject, bodyHtml: next.bodyHtml } : current)}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-sm">
          <Input
            label="Send a test to"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="you@domain.com"
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" isLoading={testing} onClick={sendTest}>
            Send test
          </Button>
          <Button type="button" size="sm" isLoading={saving} onClick={() => save()}>
            Save template
          </Button>
        </div>
      </div>
    </div>
  );
};
