"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Code, ImageIcon, SquareCode } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  /** Optional class for the toolbar (e.g. border-b border-neutral-200 bg-neutral-50 px-2 py-1.5). */
  toolbarClassName?: string;
  /** Optional class for the content area (e.g. bg-white px-4 py-3). */
  contentClassName?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write a description…",
  minHeight = "200px",
  className = "",
  toolbarClassName,
  contentClassName,
}: RichTextEditorProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: { HTMLAttributes: { class: "rounded bg-[var(--bg-hover)] p-2 font-mono text-sm" } },
      }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-[var(--accent)] underline" } }),
      Image.configure({ HTMLAttributes: { class: "rounded max-w-full h-auto" } }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: `prose prose-invert max-w-none min-h-[200px] focus:outline-none text-neutral-900 ${contentClassName ?? "px-4 py-3"}`,
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
      <Toolbar editor={editor} toolbarClassName={toolbarClassName} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor, toolbarClassName }: { editor: Editor | null; toolbarClassName?: string }) {
  const [linkUrl, setLinkUrl] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageOpen, setImageOpen] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href;
    setLinkUrl(previous ?? "https://");
    setLinkOpen(true);
    setTimeout(() => linkInputRef.current?.focus(), 0);
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    const url = linkUrl.trim();
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      const { from, to } = editor.state.selection;
      const hasSelection = to > from;
      if (hasSelection) {
        editor.chain().focus().setLink({ href: url }).run();
      } else {
        editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
      }
    }
    setLinkOpen(false);
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    const url = imageUrl.trim();
    if (!editor || !url) return;
    editor.chain().focus().setImage({ src: url }).run();
    setImageUrl("");
    setImageOpen(false);
  }, [editor, imageUrl]);

  if (!editor) return null;

  return (
    <div
      className={`flex items-center gap-0.5 flex-wrap border-b border-neutral-200 bg-neutral-50 px-2 py-1.5 ${toolbarClassName ?? ""}`}
    >
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-[var(--bg-active)] transition-[var(--transition)] cursor-pointer ${editor.isActive("bold") ? "bg-[var(--bg-active)] text-[var(--accent)]" : "text-[var(--text-secondary)]"}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-[var(--bg-active)] transition-[var(--transition)] cursor-pointer ${editor.isActive("italic") ? "bg-[var(--bg-active)] text-[var(--accent)]" : "text-[var(--text-secondary)]"}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-[var(--bg-active)] transition-[var(--transition)] cursor-pointer ${editor.isActive("bulletList") ? "bg-[var(--bg-active)] text-[var(--accent)]" : "text-[var(--text-secondary)]"}`}
          title="Bullet list"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-[var(--bg-active)] transition-[var(--transition)] cursor-pointer ${editor.isActive("orderedList") ? "bg-[var(--bg-active)] text-[var(--accent)]" : "text-[var(--text-secondary)]"}`}
          title="Numbered list"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={setLink}
          className={`p-2 rounded hover:bg-[var(--bg-active)] transition-[var(--transition)] cursor-pointer ${editor.isActive("link") ? "bg-[var(--bg-active)] text-[var(--accent)]" : "text-[var(--text-secondary)]"}`}
          title="Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-[var(--bg-active)] transition-[var(--transition)] cursor-pointer ${editor.isActive("code") ? "bg-[var(--bg-active)] text-[var(--accent)]" : "text-[var(--text-secondary)]"}`}
          title="Inline code"
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-[var(--bg-active)] transition-[var(--transition)] cursor-pointer ${editor.isActive("codeBlock") ? "bg-[var(--bg-active)] text-[var(--accent)]" : "text-[var(--text-secondary)]"}`}
          title="Code block"
        >
          <SquareCode className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setImageUrl("");
            setImageOpen(true);
            setTimeout(() => imageInputRef.current?.focus(), 0);
          }}
          className="p-2 rounded hover:bg-[var(--bg-active)] transition-[var(--transition)] cursor-pointer text-[var(--text-secondary)]"
          title="Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
      </div>
      {linkOpen && (
        <div className="flex items-center gap-2 ml-2 py-1">
          <input
            ref={linkInputRef}
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyLink();
              if (e.key === "Escape") setLinkOpen(false);
            }}
            placeholder="https://"
            className="px-2 py-1 text-sm bg-[var(--bg-elevated)] border border-[var(--border)] rounded text-[var(--text-primary)] w-48 focus:outline-none focus:border-[var(--border-active)]"
          />
          <button type="button" onClick={applyLink} className="text-xs px-2 py-1 rounded bg-[var(--accent)] text-[var(--accent-foreground)] cursor-pointer">
            Apply
          </button>
          <button type="button" onClick={() => setLinkOpen(false)} className="text-xs text-[var(--text-muted)] cursor-pointer">
            Cancel
          </button>
        </div>
      )}
      {imageOpen && (
        <div className="flex items-center gap-2 ml-2 py-1">
          <input
            ref={imageInputRef}
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addImage();
              if (e.key === "Escape") setImageOpen(false);
            }}
            placeholder="Image URL"
            className="px-2 py-1 text-sm bg-[var(--bg-elevated)] border border-[var(--border)] rounded text-[var(--text-primary)] w-48 focus:outline-none focus:border-[var(--border-active)]"
          />
          <button type="button" onClick={addImage} className="text-xs px-2 py-1 rounded bg-[var(--accent)] text-[var(--accent-foreground)] cursor-pointer">
            Insert
          </button>
          <button type="button" onClick={() => setImageOpen(false)} className="text-xs text-[var(--text-muted)] cursor-pointer">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
