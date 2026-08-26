'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      Image.configure({ inline: true, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return (
      <div className="h-48 w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-red-500 font-bold">
        جاري معالجة المحرر... (إذا توقفت الشاشة هنا، اضغط F12 واقرأ الخطأ في الـ Console)
      </div>
    );
  }

  const addImage = () => {
    const url = window.prompt('أدخل رابط الصورة (URL):');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('أدخل الرابط:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-xs">
      {/* شريط الأدوات */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-200 bg-gray-50 p-2 text-xs text-gray-700">
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`cursor-pointer rounded-lg px-2.5 py-1.5 font-bold transition ${
            editor.isActive('paragraph') ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
          }`}
        >
          فقرة P
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`cursor-pointer rounded-lg px-2.5 py-1.5 font-bold transition ${
            editor.isActive('heading', { level: 2 }) ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
          }`}
        >
          عنوان H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`cursor-pointer rounded-lg px-2.5 py-1.5 font-bold transition ${
            editor.isActive('heading', { level: 3 }) ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
          }`}
        >
          عنوان H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={`cursor-pointer rounded-lg px-2.5 py-1.5 font-bold transition ${
            editor.isActive('heading', { level: 4 }) ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
          }`}
        >
          عنوان H4
        </button>

        <span className="h-4 w-[1px] bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`cursor-pointer rounded-lg px-2.5 py-1.5 font-bold transition ${
            editor.isActive('bold') ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
          }`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`cursor-pointer rounded-lg px-2.5 py-1.5 italic font-bold transition ${
            editor.isActive('italic') ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
          }`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`cursor-pointer rounded-lg px-2.5 py-1.5 underline font-bold transition ${
            editor.isActive('underline') ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
          }`}
        >
          U
        </button>

        <span className="h-4 w-[1px] bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`cursor-pointer rounded-lg px-2.5 py-1.5 font-bold transition ${
            editor.isActive('bulletList') ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
          }`}
        >
          • قائمة
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`cursor-pointer rounded-lg px-2.5 py-1.5 font-bold transition ${
            editor.isActive('orderedList') ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
          }`}
        >
          1. قائمة
        </button>

        <span className="h-4 w-[1px] bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={setLink}
          className={`cursor-pointer rounded-lg px-2.5 py-1.5 font-bold transition ${
            editor.isActive('link') ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
          }`}
        >
          🔗 رابط
        </button>
        <button
          type="button"
          onClick={addImage}
          className="cursor-pointer rounded-lg px-2.5 py-1.5 font-bold hover:bg-gray-200 transition"
        >
          🖼️ صورة
        </button>
      </div>

      <div dir="rtl" className="prose max-w-none min-h-[300px] p-4 focus:outline-hidden [&_.ProseMirror]:min-h-[300px] [&_.ProseMirror]:focus:outline-hidden">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}