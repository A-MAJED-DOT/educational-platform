
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type RichTextEditorProps = {
  content: string;
  onChange: (content: string) => void;
};

export default function RichTextEditor({
  content,
  onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[250px] w-full rounded-b-xl border border-slate-200 p-4 outline-none focus:ring-2 focus:ring-blue-500",
      },
    },
  });

  if (!editor) {
    return <p className="p-4 text-slate-500">Loading editor...</p>;
  }

  const buttonClass = (active: boolean) =>
    `rounded-lg px-3 py-2 text-sm font-semibold ${
      active
        ? "bg-blue-600 text-white"
        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
    }`;

  return (
    <div className="overflow-hidden rounded-xl bg-white">
      <div className="flex flex-wrap gap-2 border border-b-0 border-slate-200 p-3">
        <button type="button" className={buttonClass(editor.isActive("bold"))}
          onClick={() => editor.chain().focus().toggleBold().run()}>
          B
        </button>

        <button type="button" className={buttonClass(editor.isActive("italic"))}
          onClick={() => editor.chain().focus().toggleItalic().run()}>
          I
        </button>

        <button type="button" className={buttonClass(editor.isActive("heading", { level: 2 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </button>

        <button type="button" className={buttonClass(editor.isActive("heading", { level: 3 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </button>

        <button type="button" className={buttonClass(editor.isActive("bulletList"))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • List
        </button>

        <button type="button" className={buttonClass(editor.isActive("orderedList"))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1. List
        </button>

        <button type="button" className={buttonClass(editor.isActive("codeBlock"))}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          {"</>"} Code
        </button>

        <button type="button" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
          Clear
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
