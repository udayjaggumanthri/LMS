import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { Node, mergeAttributes } from '@tiptap/core';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  GripVertical,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Redo,
  Underline as UnderlineIcon,
  Undo,
} from 'lucide-react';

const FIELD_LABELS: Record<string, string> = {
  name: 'Student name',
  catalog_url: 'Catalog link',
  order_number: 'Order number',
  items: 'Order items',
  total: 'Amount paid',
  learning_url: 'My courses link',
  reset_url: 'Reset link',
  status: 'Payment status',
  checkout_url: 'Checkout link',
};

export function fieldLabel(name: string) {
  return FIELD_LABELS[name] || name.replace(/_/g, ' ');
}

const MailVariable = Node.create({
  name: 'mailVariable',
  group: 'inline',
  inline: true,
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      name: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-mail-var') || '',
        renderHTML: (attributes) => ({ 'data-mail-var': attributes.name }),
      },
    };
  },
  parseHTML() {
    return [{ tag: 'span[data-mail-var]' }];
  },
  renderHTML({ HTMLAttributes }) {
    const name = HTMLAttributes['data-mail-var'] || HTMLAttributes.name || '';
    return ['span', mergeAttributes(HTMLAttributes, { class: 'mail-var-chip', contenteditable: 'false' }), fieldLabel(name)];
  },
});

const MailBlock = Node.create({
  name: 'mailBlock',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      name: {
        default: 'items',
        parseHTML: (element) => element.getAttribute('data-mail-block') || 'items',
        renderHTML: (attributes) => ({ 'data-mail-block': attributes.name }),
      },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-mail-block]' }];
  },
  renderHTML({ HTMLAttributes }) {
    const name = HTMLAttributes['data-mail-block'] || 'items';
    return ['div', mergeAttributes(HTMLAttributes, { class: 'mail-block-chip', contenteditable: 'false' }), fieldLabel(name)];
  },
});

function tokensToNodes(value: string) {
  return value.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, name) => {
    if (name === 'items') return '<div data-mail-block="items"></div>';
    return `<span data-mail-var="${name}"></span>`;
  });
}

function replaceTokensInTree(root: ParentNode) {
  const doc = root.ownerDocument || document;
  const texts: Text[] = [];
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    texts.push(current as Text);
    current = walker.nextNode();
  }
  texts.forEach((text) => {
    const value = text.textContent || '';
    if (!value.includes('{{')) return;
    const fragment = doc.createDocumentFragment();
    const pattern = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
    let last = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(value))) {
      if (match.index > last) fragment.appendChild(doc.createTextNode(value.slice(last, match.index)));
      if (match[1] === 'items') {
        const block = doc.createElement('div');
        block.setAttribute('data-mail-block', 'items');
        fragment.appendChild(block);
      } else {
        const chip = doc.createElement('span');
        chip.setAttribute('data-mail-var', match[1]);
        fragment.appendChild(chip);
      }
      last = match.index + match[0].length;
    }
    if (last < value.length) fragment.appendChild(doc.createTextNode(value.slice(last)));
    text.parentNode?.replaceChild(fragment, text);
  });
}

export function prepareBodyHtml(html: string) {
  const doc = new DOMParser().parseFromString(html || '', 'text/html');
  replaceTokensInTree(doc.body);
  doc.querySelectorAll('table').forEach((table) => {
    if (table.querySelector('[data-mail-block="items"]')) {
      const block = doc.createElement('div');
      block.setAttribute('data-mail-block', 'items');
      table.replaceWith(block);
    }
  });
  const marked = doc.querySelector('[data-mail-body]');
  if (marked) return marked.innerHTML.trim() || '<p></p>';
  const candidates = [...doc.querySelectorAll('div')].filter((node) =>
    node.querySelector('[data-mail-var], [data-mail-block]'),
  );
  candidates.sort((left, right) => left.innerHTML.length - right.innerHTML.length);
  return (candidates[0]?.innerHTML || doc.body.innerHTML).trim() || '<p></p>';
}

export function prepareSubjectHtml(subject: string) {
  const escaped = (subject || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `<p>${tokensToNodes(escaped)}</p>`;
}

function serializeFragment(html: string) {
  const doc = new DOMParser().parseFromString(`<div id="mail-root">${html}</div>`, 'text/html');
  const root = doc.getElementById('mail-root');
  if (!root) return '';
  root.querySelectorAll('[data-mail-block]').forEach((node) => {
    const table = doc.createElement('table');
    table.setAttribute('style', 'width:100%;border-collapse:collapse;margin:12px 0;');
    const body = doc.createElement('tbody');
    body.textContent = '{{items}}';
    table.appendChild(body);
    node.replaceWith(table);
  });
  root.querySelectorAll('[data-mail-var]').forEach((node) => {
    const name = node.getAttribute('data-mail-var') || '';
    node.replaceWith(doc.createTextNode(`{{${name}}}`));
  });
  root.querySelectorAll('p').forEach((paragraph) => {
    const meaningful = [...paragraph.childNodes].filter((child) => child.nodeType !== 3 || child.textContent?.trim());
    if (meaningful.length === 1 && meaningful[0].nodeName === 'A') {
      paragraph.setAttribute('style', 'text-align:center;margin:16px 0;');
      (meaningful[0] as HTMLElement).setAttribute(
        'style',
        'display:inline-block;background:#047857;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-weight:600;',
      );
      return;
    }
    paragraph.setAttribute('style', 'margin:0 0 12px;font-size:14px;line-height:1.6;color:#1e293b;');
  });
  root.querySelectorAll('a').forEach((anchor) => {
    if (!anchor.getAttribute('style')) {
      anchor.setAttribute('style', 'color:#047857;font-weight:600;text-decoration:underline;');
    }
  });
  root.querySelectorAll('h2, h3').forEach((heading) => {
    heading.setAttribute('style', 'margin:0 0 8px;font-size:18px;color:#064e3b;');
  });
  root.querySelectorAll('ul, ol').forEach((list) => {
    list.setAttribute('style', 'margin:0 0 12px;padding-left:20px;color:#1e293b;');
  });
  return root.innerHTML;
}

export function wrapEmailHtml(editorHtml: string) {
  const inner = serializeFragment(editorHtml);
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f8fafc;margin:0;padding:24px;color:#1e293b;"><div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;"><div style="background:#064e3b;padding:28px 24px;text-align:center;color:#ffffff;"><h1 style="margin:0;font-size:20px;">PrajnadharaEdu</h1></div><div data-mail-body="1" style="padding:28px 24px;font-size:14px;line-height:1.6;color:#1e293b;">${inner}</div></div></div>`;
}

export function serializeSubject(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('[data-mail-var]').forEach((node) => {
    const name = node.getAttribute('data-mail-var') || '';
    node.replaceWith(doc.createTextNode(`{{${name}}}`));
  });
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
}

function insertField(editor: Editor, name: string) {
  if (name === 'items') {
    editor.chain().focus().insertContent({ type: 'mailBlock', attrs: { name: 'items' } }).run();
    return;
  }
  editor.chain().focus().insertContent({ type: 'mailVariable', attrs: { name } }).run();
}

function dropField(view: Editor['view'], event: DragEvent) {
  const name = event.dataTransfer?.getData('application/x-mail-var') || '';
  if (!name) return false;
  const typeName = name === 'items' ? 'mailBlock' : 'mailVariable';
  const nodeType = view.state.schema.nodes[typeName];
  if (!nodeType) return true;
  const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
  if (!coords) return true;
  view.dispatch(view.state.tr.insert(coords.pos, nodeType.create({ name })));
  return true;
}

interface MailTemplateEditorProps {
  subject: string;
  html: string;
  variables: string[];
  onChange: (next: { subject: string; bodyHtml: string }) => void;
}

export const MailTemplateEditor: React.FC<MailTemplateEditorProps> = ({ subject, html, variables, onChange }) => {
  const lastFocus = useRef<'subject' | 'body'>('body');
  const [dragOver, setDragOver] = useState<'subject' | 'body' | ''>('');
  const emitted = useRef({ subject, html });

  const subjectEditor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      MailVariable,
      Placeholder.configure({ placeholder: 'Subject line' }),
    ],
    content: prepareSubjectHtml(subject),
    editorProps: {
      attributes: { class: 'mail-subject-editor' },
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false;
        return dropField(view, event);
      },
      handleKeyDown: (_view, event) => event.key === 'Enter',
    },
    onFocus: () => {
      lastFocus.current = 'subject';
    },
    onUpdate: ({ editor }) => {
      const nextSubject = serializeSubject(editor.getHTML());
      emitted.current = { ...emitted.current, subject: nextSubject };
      onChange({ subject: nextSubject, bodyHtml: emitted.current.html });
    },
  });

  const bodyEditor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      MailVariable,
      MailBlock,
      Placeholder.configure({ placeholder: 'Write the message. Drop a field anywhere in the text.' }),
    ],
    content: prepareBodyHtml(html),
    editorProps: {
      attributes: { class: 'mail-body-editor' },
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false;
        return dropField(view, event);
      },
    },
    onFocus: () => {
      lastFocus.current = 'body';
    },
    onUpdate: ({ editor }) => {
      const bodyHtml = wrapEmailHtml(editor.getHTML());
      emitted.current = { ...emitted.current, html: bodyHtml };
      onChange({ subject: emitted.current.subject, bodyHtml });
    },
  });

  useEffect(() => {
    if (!subjectEditor || subjectEditor.isFocused) return;
    if (subject === emitted.current.subject) return;
    subjectEditor.commands.setContent(prepareSubjectHtml(subject));
    emitted.current = { ...emitted.current, subject };
  }, [subject, subjectEditor]);

  useEffect(() => {
    if (!bodyEditor || bodyEditor.isFocused) return;
    if (html === emitted.current.html) return;
    bodyEditor.commands.setContent(prepareBodyHtml(html));
    emitted.current = { ...emitted.current, html };
  }, [html, bodyEditor]);

  const placeField = (name: string) => {
    const target = lastFocus.current === 'subject' && name !== 'items' ? subjectEditor : bodyEditor;
    if (!target) return;
    lastFocus.current = name === 'items' ? 'body' : lastFocus.current;
    insertField(target, name);
  };

  return (
    <div className="space-y-3">
      <style>{`
        .mail-var-chip, .mail-block-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin: 0 2px;
          padding: 1px 8px;
          border-radius: 999px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #065f46;
          font-size: 12px;
          font-weight: 600;
          line-height: 1.6;
          cursor: grab;
          user-select: none;
        }
        .mail-block-chip { display: flex; justify-content: center; margin: 12px 0; padding: 10px 12px; border-radius: 8px; }
        .mail-subject-editor, .mail-body-editor { outline: none; }
        .mail-subject-editor { min-height: 24px; font-size: 14px; color: #0f172a; }
        .mail-subject-editor p { margin: 0; }
        .mail-body-editor { min-height: 180px; font-size: 14px; line-height: 1.6; color: #1e293b; }
        .mail-body-editor p { margin: 0 0 12px; }
        .mail-body-editor a { color: #047857; font-weight: 600; }
        .mail-body-editor p.is-editor-empty:first-child::before,
        .mail-subject-editor p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          height: 0;
          color: #94a3b8;
          pointer-events: none;
        }
      `}</style>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Fields</p>
        <div className="flex flex-wrap gap-2">
          {variables.map((name) => (
            <button
              key={name}
              type="button"
              draggable
              title={`Drag ${fieldLabel(name)} into the message, or click to insert it`}
              onDragStart={(event) => {
                event.dataTransfer.setData('application/x-mail-var', name);
                event.dataTransfer.setData('text/plain', `{{${name}}}`);
                event.dataTransfer.effectAllowed = 'copy';
              }}
              onClick={() => placeField(name)}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-900 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-3 h-3 text-emerald-700" />
              {fieldLabel(name)}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] text-slate-500">Drag a field into the subject or the message. Click a field to insert it where you were last typing. Drag a field that is already in the message to move it.</p>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">Subject</label>
        <div
          className={`rounded border bg-white px-3 py-2 ${dragOver === 'subject' ? 'border-emerald-600 ring-2 ring-emerald-200' : 'border-slate-300'}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver('subject');
          }}
          onDragLeave={() => setDragOver('')}
          onDrop={() => setDragOver('')}
        >
          <EditorContent editor={subjectEditor} />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">Message</p>
        <div className="rounded-lg bg-slate-100 p-3 sm:p-4">
          <div className={`mx-auto max-w-[600px] overflow-hidden rounded-lg border bg-white shadow-sm ${dragOver === 'body' ? 'border-emerald-600 ring-2 ring-emerald-200' : 'border-slate-200'}`}>
            <div className="bg-emerald-950 px-4 py-4 text-center text-white">
              <p className="text-base font-semibold">PrajnadharaEdu</p>
            </div>
            {bodyEditor && (
              <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
                <ToolbarButton label="Undo" onClick={() => bodyEditor.chain().focus().undo().run()} disabled={!bodyEditor.can().undo()}>
                  <Undo className="w-3.5 h-3.5" />
                </ToolbarButton>
                <ToolbarButton label="Redo" onClick={() => bodyEditor.chain().focus().redo().run()} disabled={!bodyEditor.can().redo()}>
                  <Redo className="w-3.5 h-3.5" />
                </ToolbarButton>
                <span className="mx-1 h-4 w-px bg-slate-200" />
                <ToolbarButton label="Bold" active={bodyEditor.isActive('bold')} onClick={() => bodyEditor.chain().focus().toggleBold().run()}>
                  <Bold className="w-3.5 h-3.5" />
                </ToolbarButton>
                <ToolbarButton label="Italic" active={bodyEditor.isActive('italic')} onClick={() => bodyEditor.chain().focus().toggleItalic().run()}>
                  <Italic className="w-3.5 h-3.5" />
                </ToolbarButton>
                <ToolbarButton label="Underline" active={bodyEditor.isActive('underline')} onClick={() => bodyEditor.chain().focus().toggleUnderline().run()}>
                  <UnderlineIcon className="w-3.5 h-3.5" />
                </ToolbarButton>
                <span className="mx-1 h-4 w-px bg-slate-200" />
                <ToolbarButton label="Bulleted list" active={bodyEditor.isActive('bulletList')} onClick={() => bodyEditor.chain().focus().toggleBulletList().run()}>
                  <List className="w-3.5 h-3.5" />
                </ToolbarButton>
                <ToolbarButton label="Numbered list" active={bodyEditor.isActive('orderedList')} onClick={() => bodyEditor.chain().focus().toggleOrderedList().run()}>
                  <ListOrdered className="w-3.5 h-3.5" />
                </ToolbarButton>
                <span className="mx-1 h-4 w-px bg-slate-200" />
                <ToolbarButton label="Align left" active={bodyEditor.isActive({ textAlign: 'left' })} onClick={() => bodyEditor.chain().focus().setTextAlign('left').run()}>
                  <AlignLeft className="w-3.5 h-3.5" />
                </ToolbarButton>
                <ToolbarButton label="Align center" active={bodyEditor.isActive({ textAlign: 'center' })} onClick={() => bodyEditor.chain().focus().setTextAlign('center').run()}>
                  <AlignCenter className="w-3.5 h-3.5" />
                </ToolbarButton>
                <ToolbarButton label="Align right" active={bodyEditor.isActive({ textAlign: 'right' })} onClick={() => bodyEditor.chain().focus().setTextAlign('right').run()}>
                  <AlignRight className="w-3.5 h-3.5" />
                </ToolbarButton>
                <ToolbarButton
                  label="Link"
                  active={bodyEditor.isActive('link')}
                  onClick={() => {
                    const previous = bodyEditor.getAttributes('link').href || '';
                    const href = window.prompt('Link address', previous);
                    if (href === null) return;
                    if (!href.trim()) bodyEditor.chain().focus().unsetLink().run();
                    else bodyEditor.chain().focus().extendMarkRange('link').setLink({ href: href.trim() }).run();
                  }}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </ToolbarButton>
              </div>
            )}
            <div
              className="px-4 py-4"
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver('body');
              }}
              onDragLeave={() => setDragOver('')}
              onDrop={() => setDragOver('')}
            >
              <EditorContent editor={bodyEditor} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ToolbarButton: React.FC<{
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ label, active, disabled, onClick, children }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={onClick}
    className={`rounded p-1.5 disabled:opacity-30 ${active ? 'bg-emerald-700 text-white' : 'text-slate-700 hover:bg-slate-200'}`}
  >
    {children}
  </button>
);
