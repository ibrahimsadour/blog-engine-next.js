"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Link } from "@tiptap/extension-link";
import { Underline } from "@tiptap/extension-underline";
import { Image } from "@tiptap/extension-image";
import { TextAlign } from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { Highlight } from "@tiptap/extension-highlight";
import { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Undo,
  Redo,
  Upload,
  Loader2,
  Table as TableIcon,
  Trash2,
  Highlighter,
  PhoneCall,
  Columns,
  Rows,
  Code,
  FileCode,
  Replace,
  X,
  Check,
  Edit3,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "اكتب المحتوى هنا...",
}: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceCode, setSourceCode] = useState(content || "");

  // نافذة الروابط
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkRel, setLinkRel] = useState("dofollow");
  const [linkTarget, setLinkTarget] = useState(false);

  // شريط البحث والاستبدال
  const [isReplaceOpen, setIsReplaceOpen] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceWithText, setReplaceWithText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer",
        },
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto my-4 mx-auto shadow-sm cursor-pointer border-2 border-transparent hover:border-blue-400 transition",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse border border-slate-300 w-full my-4 text-sm text-right",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "border-b border-slate-200",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "bg-slate-100 p-2 font-bold border border-slate-300",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "p-2 border border-slate-300 align-top",
        },
      }),
    ],
    content: content || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none min-h-[400px] p-4 focus:outline-none text-slate-800 dir-rtl",
        dir: "rtl",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setSourceCode(html);
      onChange(html);
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML() && !isSourceMode) {
      editor.commands.setContent(content || "");
      setSourceCode(content || "");
    }
  }, [content, editor, isSourceMode]);

  if (!editor) {
    return null;
  }

  // التبديل بين وضع المحرر المرئي ووضع كود المصدر
  const handleToggleSourceMode = () => {
    if (isSourceMode) {
      editor.commands.setContent(sourceCode);
      onChange(sourceCode);
      setIsSourceMode(false);
    } else {
      setSourceCode(editor.getHTML());
      setIsSourceMode(true);
    }
  };

  // فتح نافذة إعدادات الرابط
  const handleOpenLinkModal = () => {
    const attrs = editor.getAttributes("link");
    setLinkUrl(attrs.href || "");
    setLinkTarget(attrs.target === "_blank");
    setLinkRel(attrs.rel?.includes("nofollow") ? "nofollow" : "dofollow");
    setIsLinkModalOpen(true);
  };

  // تطبيق الرابط
  const handleApplyLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setIsLinkModalOpen(false);
      return;
    }

    const relAttr = linkRel === "nofollow" ? "nofollow noopener noreferrer" : undefined;
    const targetAttr = linkTarget ? "_blank" : undefined;

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: linkUrl.trim(),
        target: targetAttr,
        rel: relAttr,
      })
      .run();

    setIsLinkModalOpen(false);
  };

  // استبدال شامل في كامل المحتوى
  const handleReplaceAll = () => {
    if (!findText) return;
    const currentHtml = editor.getHTML();
    const updatedHtml = currentHtml.replaceAll(findText, replaceWithText);
    editor.commands.setContent(updatedHtml);
    setSourceCode(updatedHtml);
    onChange(updatedHtml);
    alert(`تم استبدال جميع مطابقات "${findText}" بنجاح.`);
  };

  // رفع صورة مع Alt Text للسيو
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const altText = window.prompt(
      "أدخل النص البديل للصورة (Alt Text للسيو):",
      file.name.replace(/\.[^/.]+$/, "")
    );
    if (altText === null) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("فشل الرفع");

      const data = await res.json();
      const imageUrl = data.url || data.filePath;

      if (imageUrl) {
        editor
          .chain()
          .focus()
          .setImage({ src: imageUrl, alt: altText.trim() || "صورة توضيحية" })
          .run();
      }
    } catch {
      alert("حدث خطأ أثناء رفع الصورة، يرجى المحاولة مجدداً.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // تعديل النص البديل للصورة المحددة داخل المحرر
  const handleEditImageAlt = () => {
    const currentAlt = editor.getAttributes("image").alt || "";
    const newAlt = window.prompt("تعديل النص البديل (Alt Text):", currentAlt);
    if (newAlt !== null) {
      editor.chain().focus().updateAttributes("image", { alt: newAlt }).run();
    }
  };

  // حذف الصورة المحددة نهائياً من السيرفر والمحرر
  const handleDeleteImage = async () => {
    const imageSrc = editor.getAttributes("image").src;
    if (!imageSrc) return;

    const confirmDelete = window.confirm("هل تريد حذف هذه الصورة نهائياً من المقال ومسحها من السيرفر؟");
    if (!confirmDelete) return;

    try {
      if (imageSrc.startsWith("/uploads/")) {
        await fetch(`/api/upload?src=${encodeURIComponent(imageSrc)}`, {
          method: "DELETE",
        });
      }
      editor.chain().focus().deleteSelection().run();
    } catch {
      alert("حدث خطأ أثناء حذف الصورة من السيرفر.");
    }
  };

  // زر تحويل سريع CTA
  const handleInsertCtaButton = () => {
    const buttonText = window.prompt("اكتب النص الظاهر على الزر:", "اتصل بنا الآن للحجز والاستفسار");
    if (!buttonText) return;

    const buttonLink = window.prompt("أدخل رابط الزر (رابط صفحة أو tel:رقم_الهاتف):", "tel:+965");
    if (!buttonLink) return;

    const ctaHtml = `
      <div class="my-6 text-center">
        <a href="${buttonLink}" class="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-md no-underline transition">
          <span>📞</span>
          <span>${buttonText}</span>
        </a>
      </div>
    `;

    editor.chain().focus().insertContent(ctaHtml).run();
  };

  // قيمة وسم العنوان الحالي
  const getCurrentHeadingValue = () => {
    for (let i = 1; i <= 6; i++) {
      if (editor.isActive("heading", { level: i })) return `h${i}`;
    }
    return "p";
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-visible bg-white shadow-sm relative">
      {/* شريط الأدوات Toolbar - ثابت أعلى الشاشة مع إزاحة الهيدر */}
      <div className="sticky top-16 z-30 flex flex-wrap items-center gap-1 p-2 bg-slate-50/95 backdrop-blur border-b border-slate-200 shadow-sm rounded-t-xl">
        {/* زر عرض كود المصدر HTML */}
        <button
          type="button"
          onClick={handleToggleSourceMode}
          className={`p-2 rounded font-semibold text-xs flex items-center gap-1 transition ${
            isSourceMode ? "bg-amber-500 text-white shadow-sm" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
          }`}
          title="عرض / تعديل كود HTML المصدري"
        >
          <FileCode size={16} />
          <span>{isSourceMode ? "المحرر المرئي" : "كود المصدر (HTML)"}</span>
        </button>

        <div className="w-[1px] h-6 bg-slate-300 mx-1" />

        {!isSourceMode && (
          <>
            {/* قائمة اختيار التاجات الهرمية (Paragraph إلى H6) */}
            <select
              value={getCurrentHeadingValue()}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "p") {
                  editor.chain().focus().setParagraph().run();
                } else {
                  const level = parseInt(val.replace("h", "")) as 1 | 2 | 3 | 4 | 5 | 6;
                  editor.chain().focus().toggleHeading({ level }).run();
                }
              }}
              className="text-xs font-semibold py-1.5 px-2 bg-white border border-slate-300 rounded hover:border-slate-400 focus:outline-none text-slate-700"
            >
              <option value="p">فقرة عادية (Paragraph)</option>
              <option value="h1">عنوان رئيسي (H1)</option>
              <option value="h2">عنوان فرعي (H2)</option>
              <option value="h3">عنوان فرعي (H3)</option>
              <option value="h4">عنوان فرعي (H4)</option>
              <option value="h5">عنوان فرعي (H5)</option>
              <option value="h6">عنوان فرعي (H6)</option>
            </select>

            <div className="w-[1px] h-6 bg-slate-300 mx-1" />

            {/* أدوات التنسيق */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-slate-200 transition ${
                editor.isActive("bold") ? "bg-slate-300 text-blue-600 font-bold" : "text-slate-700"
              }`}
              title="عريض"
            >
              <Bold size={17} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-slate-200 transition ${
                editor.isActive("italic") ? "bg-slate-300 text-blue-600" : "text-slate-700"
              }`}
              title="مائل"
            >
              <Italic size={17} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded hover:bg-slate-200 transition ${
                editor.isActive("underline") ? "bg-slate-300 text-blue-600" : "text-slate-700"
              }`}
              title="تسطير"
            >
              <UnderlineIcon size={17} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-2 rounded hover:bg-slate-200 transition ${
                editor.isActive("strike") ? "bg-slate-300 text-blue-600" : "text-slate-700"
              }`}
              title="يتوسطه خط"
            >
              <Strikethrough size={17} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={`p-2 rounded hover:bg-slate-200 transition ${
                editor.isActive("highlight") ? "bg-yellow-200 text-amber-800" : "text-slate-700"
              }`}
              title="تظليل النص"
            >
              <Highlighter size={17} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`p-2 rounded hover:bg-slate-200 transition ${
                editor.isActive("codeBlock") ? "bg-slate-300 text-blue-600" : "text-slate-700"
              }`}
              title="كتلة كود برمجي"
            >
              <Code size={17} />
            </button>

            <div className="w-[1px] h-6 bg-slate-300 mx-1" />

            {/* القوائم */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-slate-200 transition ${
                editor.isActive("bulletList") ? "bg-slate-300 text-blue-600" : "text-slate-700"
              }`}
              title="قائمة نقطية"
            >
              <List size={17} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded hover:bg-slate-200 transition ${
                editor.isActive("orderedList") ? "bg-slate-300 text-blue-600" : "text-slate-700"
              }`}
              title="قائمة رقمية"
            >
              <ListOrdered size={17} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded hover:bg-slate-200 transition ${
                editor.isActive("blockquote") ? "bg-slate-300 text-blue-600" : "text-slate-700"
              }`}
              title="اقتباس"
            >
              <Quote size={17} />
            </button>

            <div className="w-[1px] h-6 bg-slate-300 mx-1" />

            {/* المحاذاة */}
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={`p-2 rounded hover:bg-slate-200 transition ${
                editor.isActive({ textAlign: "right" }) ? "bg-slate-300 text-blue-600" : "text-slate-700"
              }`}
              title="محاذاة لليمين"
            >
              <AlignRight size={17} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              className={`p-2 rounded hover:bg-slate-200 transition ${
                editor.isActive({ textAlign: "center" }) ? "bg-slate-300 text-blue-600" : "text-slate-700"
              }`}
              title="محاذاة للوسط"
            >
              <AlignCenter size={17} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={`p-2 rounded hover:bg-slate-200 transition ${
                editor.isActive({ textAlign: "left" }) ? "bg-slate-300 text-blue-600" : "text-slate-700"
              }`}
              title="محاذاة لليسار"
            >
              <AlignLeft size={17} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("justify").run()}
              className={`p-2 rounded hover:bg-slate-200 transition ${
                editor.isActive({ textAlign: "justify" }) ? "bg-slate-300 text-blue-600" : "text-slate-700"
              }`}
              title="ضبط النص"
            >
              <AlignJustify size={17} />
            </button>

            <div className="w-[1px] h-6 bg-slate-300 mx-1" />

            {/* الروابط */}
            <button
              type="button"
              onClick={handleOpenLinkModal}
              className={`p-2 rounded hover:bg-slate-200 transition ${
                editor.isActive("link") ? "bg-blue-100 text-blue-600 font-bold" : "text-slate-700"
              }`}
              title="إضافة / تعديل رابط"
            >
              <LinkIcon size={17} />
            </button>
            {editor.isActive("link") && (
              <button
                type="button"
                onClick={() => editor.chain().focus().unsetLink().run()}
                className="p-2 rounded hover:bg-red-100 text-red-600 transition"
                title="إلغاء الرابط"
              >
                <Unlink size={17} />
              </button>
            )}

            <div className="w-[1px] h-6 bg-slate-300 mx-1" />

            {/* الجداول */}
            <button
              type="button"
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run()
              }
              className="p-2 rounded hover:bg-slate-200 text-slate-700 transition"
              title="إدراج جدول"
            >
              <TableIcon size={17} />
            </button>
            {editor.isActive("table") && (
              <>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                  className="p-2 rounded hover:bg-slate-200 text-slate-700 transition"
                  title="إضافة عمود"
                >
                  <Columns size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                  className="p-2 rounded hover:bg-slate-200 text-slate-700 transition"
                  title="إضافة صف"
                >
                  <Rows size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().deleteTable().run()}
                  className="p-2 rounded hover:bg-red-100 text-red-600 transition"
                  title="حذف الجدول"
                >
                  <Trash2 size={17} />
                </button>
              </>
            )}

            <div className="w-[1px] h-6 bg-slate-300 mx-1" />

            {/* البحث والاستبدال */}
            <button
              type="button"
              onClick={() => setIsReplaceOpen(!isReplaceOpen)}
              className={`p-2 rounded hover:bg-slate-200 transition ${
                isReplaceOpen ? "bg-blue-200 text-blue-800" : "text-slate-700"
              }`}
              title="البحث والاستبدال الشامل"
            >
              <Replace size={17} />
            </button>

            {/* زر التحويل CTA */}
            <button
              type="button"
              onClick={handleInsertCtaButton}
              className="p-2 rounded hover:bg-emerald-100 text-emerald-700 transition flex items-center gap-1 text-xs font-semibold border border-emerald-300 bg-emerald-50"
              title="إدراج زر اتصال"
            >
              <PhoneCall size={15} />
              <span>زر CTA</span>
            </button>

            <div className="w-[1px] h-6 bg-slate-300 mx-1" />

            {/* رفع وإدارة الصور */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-2 rounded hover:bg-slate-200 text-slate-700 transition flex items-center gap-1 text-xs bg-slate-100 border border-slate-200"
              title="رفع صورة من الجهاز"
            >
              {isUploading ? <Loader2 size={16} className="animate-spin text-blue-600" /> : <Upload size={16} />}
              <span className="font-medium">رفع صورة</span>
            </button>

            {/* أزرار التحكم بالصورة المحددة فور الضغط عليها */}
            {editor.isActive("image") && (
              <>
                <button
                  type="button"
                  onClick={handleEditImageAlt}
                  className="p-1.5 px-2.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold text-xs flex items-center gap-1 border border-blue-300 transition"
                  title="تعديل النص البديل للصورة المحددة"
                >
                  <Edit3 size={14} />
                  <span>تعديل Alt</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  className="p-1.5 px-2.5 rounded bg-red-100 hover:bg-red-200 text-red-700 font-semibold text-xs flex items-center gap-1 border border-red-300 transition"
                  title="حذف الصورة ومسحها من السيرفر"
                >
                  <Trash2 size={14} />
                  <span>حذف من السيرفر</span>
                </button>
              </>
            )}

            <div className="w-[1px] h-6 bg-slate-300 mx-1" />

            {/* تراجع وإعادة */}
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-2 rounded hover:bg-slate-200 disabled:opacity-40 text-slate-700 transition"
              title="تراجع"
            >
              <Undo size={17} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-2 rounded hover:bg-slate-200 disabled:opacity-40 text-slate-700 transition"
              title="إعادة"
            >
              <Redo size={17} />
            </button>
          </>
        )}
      </div>

      {/* شريط البحث والاستبدال */}
      {isReplaceOpen && !isSourceMode && (
        <div className="sticky top-[115px] z-20 flex flex-wrap items-center gap-2 p-3 bg-blue-50/95 backdrop-blur border-b border-blue-200 text-xs shadow-sm">
          <input
            type="text"
            placeholder="النص المراد البحث عنه..."
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            className="p-2 border border-slate-300 rounded bg-white w-48 focus:outline-none focus:border-blue-500"
          />
          <input
            type="text"
            placeholder="استبدال بـ..."
            value={replaceWithText}
            onChange={(e) => setReplaceWithText(e.target.value)}
            className="p-2 border border-slate-300 rounded bg-white w-48 focus:outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={handleReplaceAll}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition"
          >
            استبدال الكل
          </button>
          <button
            type="button"
            onClick={() => setIsReplaceOpen(false)}
            className="p-2 text-slate-500 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* مساحة التحرير */}
      {isSourceMode ? (
        <textarea
          value={sourceCode}
          onChange={(e) => {
            setSourceCode(e.target.value);
            onChange(e.target.value);
          }}
          className="w-full min-h-[420px] p-4 font-mono text-sm bg-slate-900 text-emerald-400 focus:outline-none border-0 resize-y leading-relaxed dir-ltr text-left"
          placeholder="<h1>اكتب كود HTML هنا...</h1>"
          dir="ltr"
        />
      ) : (
        <div className="min-h-[420px] bg-white cursor-text">
          <EditorContent editor={editor} />
        </div>
      )}

      {/* نافذة الرابط المتقدمة */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-5 dir-rtl">
            <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
              <LinkIcon size={18} className="text-blue-600" />
              <span>إعدادات الرابط للسيو</span>
            </h3>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  رابط الـ URL (داخلي أو خارجي):
                </label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com أو /category/services"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-left dir-ltr focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  نوع الرابط لمحركات البحث (SEO):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLinkRel("dofollow")}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1 ${
                      linkRel === "dofollow"
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {linkRel === "dofollow" && <Check size={14} />}
                    <span>Dofollow (ممرر للسلطة)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLinkRel("nofollow")}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1 ${
                      linkRel === "nofollow"
                        ? "bg-amber-50 border-amber-500 text-amber-800"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {linkRel === "nofollow" && <Check size={14} />}
                    <span>Nofollow (غير ممرر)</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="linkTargetCheckbox"
                  checked={linkTarget}
                  onChange={(e) => setLinkTarget(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="linkTargetCheckbox" className="text-xs text-slate-700 font-medium cursor-pointer">
                  فتح الرابط في تبويب جديد (<code>target="_blank"</code>)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleApplyLink}
                className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                حفظ الرابط
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}