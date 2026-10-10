import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  FileCode,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Undo,
  Redo,
  Code2,
  Eye,
  Check,
  X
} from 'lucide-react';

interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (htmlContent: string) => void;
  placeholder?: string;
  minHeight?: string;
  helperText?: string;
  required?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Write article content, headings, lists, code snippets...',
  minHeight = '240px',
  helperText,
  required = false
}) => {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'rounded-lg bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto my-3 border border-slate-800'
          }
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-emerald-600 pl-4 py-1 italic my-3 text-slate-700 bg-emerald-50/40 rounded-r'
          }
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-5 my-2 space-y-1 text-slate-800'
          }
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-5 my-2 space-y-1 text-slate-800'
          }
        }
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-emerald-700 underline font-medium hover:text-emerald-900 cursor-pointer',
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-3 border border-slate-200 shadow-xs'
        }
      }),
      Placeholder.configure({
        placeholder
      })
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: `prose prose-slate max-w-none p-4 text-xs sm:text-sm text-slate-800 focus:outline-none leading-relaxed`
      }
    }
  });

  // Sync external value changes into editor
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (value !== currentHtml) {
      // Avoid resetting selection if user is actively editing
      const isSameContent = (value || '').trim() === currentHtml.trim();
      if (!isSameContent && !editor.isFocused) {
        editor.commands.setContent(value || '');
      }
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const handleOpenLinkModal = () => {
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setLinkModalOpen(true);
  };

  const handleSaveLink = () => {
    if (linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.trim() }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setLinkModalOpen(false);
    setLinkUrl('');
  };

  const handleInsertImage = () => {
    if (imageUrl.trim()) {
      editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
    }
    setImageModalOpen(false);
    setImageUrl('');
  };

  return (
    <div className="space-y-1.5 text-left">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          <button
            type="button"
            onClick={() => setIsHtmlMode(!isHtmlMode)}
            className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-emerald-800 transition-colors"
          >
            {isHtmlMode ? (
              <>
                <Eye className="w-3 h-3 text-emerald-700" />
                <span>Switch to Visual Editor</span>
              </>
            ) : (
              <>
                <Code2 className="w-3 h-3 text-slate-600" />
                <span>Raw HTML Mode</span>
              </>
            )}
          </button>
        </div>
      )}

      <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs focus-within:ring-2 focus-within:ring-emerald-700 focus-within:border-emerald-700 transition-all">
        {/* WYSIWYG Toolbar */}
        {!isHtmlMode && (
          <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 select-none">
            {/* History */}
            <div className="flex items-center gap-0.5 pr-1.5 border-r border-slate-200">
              <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Undo (Ctrl+Z)"
                className="p-1.5 rounded hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <Undo className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Redo (Ctrl+Y)"
                className="p-1.5 rounded hover:bg-slate-200 text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <Redo className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Headings */}
            <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                title="Heading 1"
                className={`p-1.5 rounded text-xs font-bold transition-colors ${
                  editor.isActive('heading', { level: 1 })
                    ? 'bg-emerald-700 text-white'
                    : 'hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Heading1 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                title="Heading 2"
                className={`p-1.5 rounded text-xs font-bold transition-colors ${
                  editor.isActive('heading', { level: 2 })
                    ? 'bg-emerald-700 text-white'
                    : 'hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                title="Heading 3"
                className={`p-1.5 rounded text-xs font-bold transition-colors ${
                  editor.isActive('heading', { level: 3 })
                    ? 'bg-emerald-700 text-white'
                    : 'hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Heading3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Inline Formatting */}
            <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                title="Bold (Ctrl+B)"
                className={`p-1.5 rounded transition-colors ${
                  editor.isActive('bold')
                    ? 'bg-emerald-700 text-white'
                    : 'hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                title="Italic (Ctrl+I)"
                className={`p-1.5 rounded transition-colors ${
                  editor.isActive('italic')
                    ? 'bg-emerald-700 text-white'
                    : 'hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                title="Underline (Ctrl+U)"
                className={`p-1.5 rounded transition-colors ${
                  editor.isActive('underline')
                    ? 'bg-emerald-700 text-white'
                    : 'hover:bg-slate-200 text-slate-700'
                }`}
              >
                <UnderlineIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                title="Strikethrough"
                className={`p-1.5 rounded transition-colors ${
                  editor.isActive('strike')
                    ? 'bg-emerald-700 text-white'
                    : 'hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                title="Inline Code"
                className={`p-1.5 rounded transition-colors ${
                  editor.isActive('code')
                    ? 'bg-emerald-700 text-white'
                    : 'hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Alignment */}
            <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200">
              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                title="Align Left"
                className={`p-1.5 rounded transition-colors ${
                  editor.isActive({ textAlign: 'left' })
                    ? 'bg-emerald-700 text-white'
                    : 'hover:bg-slate-200 text-slate-700'
                }`}
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                title="Align Center"
                className={`p-1.5 rounded transition-colors ${
                  editor.isActive({ textAlign: 'center' })
                    ? 'bg-emerald-700 text-white'
                    : 'hover:bg-slate-200 text-slate-700'
                }`}
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                title="Align Right"
                className={`p-1.5 rounded transition-colors ${
                  editor.isActive({ textAlign: 'right' })
                    ? 'bg-emerald-700 text-white'
                    : 'hover:bg-slate-200 text-slate-700'
                }`}
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Lists & Structural Blocks */}
            <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                title="Bullet List"
                className={`p-1.5 rounded transition-colors ${
                  editor.isActive('bulletList')
                    ? 'bg-emerald-700 text-white'
                    : 'hover:bg-slate-200 text-slate-700'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                title="Numbered List"
                className={`p-1.5 rounded transition-colors ${
                  editor.isActive('orderedList')
                    ? 'bg-emerald-700 text-white'
                    : 'hover:bg-slate-200 text-slate-700'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                title="Blockquote"
                className={`p-1.5 rounded transition-colors ${
                  editor.isActive('blockquote')
                    ? 'bg-emerald-700 text-white'
                    : 'hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                title="Code Block"
                className={`p-1.5 rounded transition-colors ${
                  editor.isActive('codeBlock')
                    ? 'bg-emerald-700 text-white'
                    : 'hover:bg-slate-200 text-slate-700'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                title="Divider Rule"
                className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Links & Embeds */}
            <div className="flex items-center gap-0.5 pl-1.5">
              <button
                type="button"
                onClick={handleOpenLinkModal}
                title="Insert / Edit Link"
                className={`p-1.5 rounded transition-colors ${
                  editor.isActive('link')
                    ? 'bg-emerald-700 text-white'
                    : 'hover:bg-slate-200 text-slate-700'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
              </button>
              {editor.isActive('link') && (
                <button
                  type="button"
                  onClick={() => editor.chain().focus().unsetLink().run()}
                  title="Remove Link"
                  className="p-1.5 rounded hover:bg-rose-100 text-rose-700"
                >
                  <Unlink className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setImageModalOpen(true)}
                title="Insert Image"
                className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
              >
                <ImageIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        {isHtmlMode ? (
          <textarea
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              editor.commands.setContent(e.target.value);
            }}
            style={{ minHeight }}
            className="w-full p-4 font-mono text-xs text-slate-900 bg-slate-50 focus:outline-none focus:bg-white leading-relaxed resize-y"
            placeholder="Edit raw HTML markup..."
          />
        ) : (
          <div style={{ minHeight }} className="cursor-text bg-white">
            <EditorContent editor={editor} />
          </div>
        )}
      </div>

      {helperText && (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      )}

      {/* Link Insertion Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-sm p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-emerald-700" />
                <span>Insert Hyperlink</span>
              </h4>
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Target URL (Web address)
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com or /courses"
                autoFocus
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveLink();
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLink}
                className="px-3 py-1 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Insertion Modal */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-sm p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
                <span>Embed Image</span>
              </h4>
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Image Source URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or /media/uploads/..."
                autoFocus
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleInsertImage();
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertImage}
                className="px-3 py-1 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Insert Image</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
