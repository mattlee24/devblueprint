"use client";

import { useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Code } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write a description…",
  minHeight = "200px",
  className = "",
}: RichTextEditorProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-[var(--accent)] underline" } }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none min-h-[200px] px-3 py-2 focus:outline-none text-[var(--text-primary)]",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (html === "<p></p>") onChangeRef.current("");
      else onChangeRef.current(html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const normalized = value || "<p></p>";
    if (current !== normalized) {
      editor.commands.setContent(normalized, { emitUpdate: false });
    }
  }, [value, editor]);

  return (
    <div
      className={`rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden ${className}`}
      style={{ minHeight }}
    >
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href;
    const url = window.prompt("URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex items-center gap-0.5 border-b border-[var(--border)] bg-[var(--bg-hover)]/50 px-2 py-1">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-[var(--bg-active)] transition-[var(--transition)] cursor-pointer ${editor.isActive("bold") ? "bg-[var(--bg-active)] text-[var(--accent)]" : "text-[var(--text-secondary)]"}`}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-[var(--bg-active)] transition-[var(--transition)] cursor-pointer ${editor.isActive("italic") ? "bg-[var(--bg-active)] text-[var(--accent)]" : "text-[var(--text-secondary)]"}`}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-[var(--bg-active)] transition-[var(--transition)] cursor-pointer ${editor.isActive("bulletList") ? "bg-[var(--bg-active)] text-[var(--accent)]" : "text-[var(--text-secondary)]"}`}
        title="Bullet list"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-[var(--bg-active)] transition-[var(--transition)] cursor-pointer ${editor.isActive("orderedList") ? "bg-[var(--bg-active)] text-[var(--accent)]" : "text-[var(--text-secondary)]"}`}
        title="Numbered list"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={setLink}
        className={`p-2 rounded hover:bg-[var(--bg-active)] transition-[var(--transition)] cursor-pointer ${editor.isActive("link") ? "bg-[var(--bg-active)] text-[var(--accent)]" : "text-[var(--text-secondary)]"}`}
        title="Link"
      >
        <LinkIcon className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`p-2 rounded hover:bg-[var(--bg-active)] transition-[var(--transition)] cursor-pointer ${editor.isActive("code") ? "bg-[var(--bg-active)] text-[var(--accent)]" : "text-[var(--text-secondary)]"}`}
        title="Code"
      >
        <Code className="w-4 h-4" />
      </button>
    </div>
  );
}
