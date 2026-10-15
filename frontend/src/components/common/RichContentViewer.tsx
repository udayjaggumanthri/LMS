import React from 'react';

interface RichContentViewerProps {
  content: string;
  className?: string;
}

const ALLOWED_TAGS = new Set(['p', 'strong', 'em', 'b', 'i', 'a', 'ul', 'ol', 'li', 'code', 'pre', 'br', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'span']);

function sanitizeHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const clean = (node: Node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType !== Node.ELEMENT_NODE) return;
      const el = child as HTMLElement;
      const tag = el.tagName.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) {
        const parent = el.parentNode;
        if (!parent) return;
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        parent.removeChild(el);
        clean(parent);
        return;
      }
      Array.from(el.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        if (name.startsWith('on') || name === 'style') {
          el.removeAttribute(attr.name);
          return;
        }
        if (tag === 'a' && name === 'href') {
          if (!/^https?:\/\//i.test(attr.value.trim())) el.removeAttribute(attr.name);
          return;
        }
        if (name !== 'class') el.removeAttribute(attr.name);
      });
      if (tag === 'a' && el.getAttribute('href')) {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
      }
      clean(el);
    });
  };
  clean(doc.body);
  return doc.body.innerHTML;
}

export const RichContentViewer: React.FC<RichContentViewerProps> = ({ content, className = '' }) => {
  if (!content) return null;

  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  if (isHtml) {
    return (
      <div
        className={`rich-content max-w-none text-sm sm:text-base leading-relaxed [&_p]:mb-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-emerald-700 [&_a]:underline [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.9em] [&_strong]:font-semibold ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
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
