import React from 'react';

interface RichContentViewerProps {
  content: string;
  className?: string;
}

export const RichContentViewer: React.FC<RichContentViewerProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Determine if content is rich HTML (contains HTML tags)
  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  if (isHtml) {
    return (
      <div
        className={`rich-content prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Graceful fallback for legacy markdown / plain text
  const paragraphs = content.split('\n\n');

  return (
    <div className={`rich-content prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed space-y-4 ${className}`}>
      {paragraphs.map((para, idx) => {
        const text = para.trim();
        if (!text) return null;

        // Heading 1
        if (text.startsWith('# ')) {
          return (
            <h1 key={idx} className="text-2xl sm:text-3xl font-bold font-display text-slate-950 pt-2 pb-1">
              {text.replace(/^# /, '')}
            </h1>
          );
        }

        // Heading 2
        if (text.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-xl sm:text-2xl font-bold font-display text-slate-950 pt-3 pb-1 border-b border-slate-100">
              {text.replace(/^## /, '')}
            </h2>
          );
        }

        // Heading 3
        if (text.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-lg font-bold font-display text-slate-900 pt-2">
              {text.replace(/^### /, '')}
            </h3>
          );
        }

        // Blockquote
        if (text.startsWith('> ')) {
          return (
            <blockquote key={idx} className="p-4 bg-emerald-50/70 border-l-4 border-emerald-700 rounded-r-lg text-emerald-950 italic text-sm my-3">
              {text.replace(/^> /, '')}
            </blockquote>
          );
        }

        // Bullet list
        if (text.includes('\n- ') || text.startsWith('- ')) {
          const items = text.split('\n').filter(l => l.trim().startsWith('- '));
          return (
            <ul key={idx} className="space-y-1.5 list-disc list-inside pl-2 text-slate-700 my-3">
              {items.map((it, i) => (
                <li key={i} className="leading-relaxed">
                  {it.replace(/^- /, '')}
                </li>
              ))}
            </ul>
          );
        }

        // Code block
        if (text.startsWith('```')) {
          const codeLines = text.replace(/```[a-z]*/g, '').trim();
          return (
            <pre key={idx} className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800 my-3">
              <code>{codeLines}</code>
            </pre>
          );
        }

        return (
          <p key={idx} className="text-slate-700 leading-relaxed">
            {text}
          </p>
        );
      })}
    </div>
  );
};
