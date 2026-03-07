"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getAttachmentsByTask,
  createTaskAttachment,
  deleteTaskAttachment,
  getAttachmentSignedUrl,
  type TaskAttachmentRow,
} from "@/lib/queries/taskAttachments";
import { Paperclip, Trash2, FileText, Loader2 } from "lucide-react";

interface TaskAttachmentsProps {
  taskId: string;
  attachments: TaskAttachmentRow[];
  onAttachmentsChange: (attachments: TaskAttachmentRow[]) => void;
}

function formatBytes(bytes: number | null): string {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TaskAttachments({
  taskId,
  attachments,
  onAttachmentsChange,
}: TaskAttachmentsProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      const supabase = createClient();
      const path = `${taskId}/${crypto.randomUUID()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("task-attachments")
        .upload(path, file, { upsert: false });
      if (uploadError) {
        console.error(uploadError);
        return;
      }
      const { data, error } = await createTaskAttachment(taskId, {
        storage_path: path,
        filename: file.name,
        content_type: file.type || null,
        byte_size: file.size,
      });
      if (error || !data) return;
      onAttachmentsChange([...attachments, data]);
    },
    [taskId, attachments, onAttachmentsChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;
      setUploading(true);
      Promise.all(files.map((f) => uploadFile(f))).finally(() => setUploading(false));
    },
    [uploadFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (files.length === 0) return;
      setUploading(true);
      Promise.all(files.map((f) => uploadFile(f))).finally(() => setUploading(false));
      e.target.value = "";
    },
    [uploadFile]
  );

  const handleDelete = useCallback(
    async (att: TaskAttachmentRow) => {
      const supabase = createClient();
      await supabase.storage.from("task-attachments").remove([att.storage_path]);
      await deleteTaskAttachment(att.id);
      onAttachmentsChange(attachments.filter((a) => a.id !== att.id));
    },
    [attachments, onAttachmentsChange]
  );

  const handleDownload = useCallback(async (att: TaskAttachmentRow) => {
    const { data: url } = await getAttachmentSignedUrl(att.storage_path);
    if (url) window.open(url, "_blank");
  }, []);

  return (
    <div className="space-y-2">
      {attachments.length === 0 && !expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-sm text-teal-500 hover:text-teal-600 font-medium cursor-pointer flex items-center gap-1.5"
        >
          <Paperclip className="w-4 h-4" />
          + Add attachment
        </button>
      ) : (
        <>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <Paperclip className="w-4 h-4" />
            Attachments
          </h3>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
              dragOver ? "border-teal-400 bg-teal-50/50" : "border-neutral-200 bg-neutral-50"
            }`}
          >
            <label className="flex flex-col items-center gap-2 cursor-pointer">
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileInput}
                disabled={uploading}
              />
              {uploading ? (
                <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
              ) : (
                <Paperclip className="w-8 h-8 text-neutral-400" />
              )}
              <span className="text-sm text-neutral-500">
                {uploading ? "Uploading…" : "Drop files or click to upload"}
              </span>
            </label>
          </div>
          {attachments.length > 0 && (
            <ul className="space-y-2">
              {attachments.map((att) => (
                <li
                  key={att.id}
                  className="flex items-center gap-2 py-2 px-3 rounded-lg bg-neutral-50 border border-neutral-200"
                >
                  <FileText className="w-4 h-4 shrink-0 text-neutral-400" />
                  <button
                    type="button"
                    onClick={() => handleDownload(att)}
                    className="flex-1 min-w-0 text-left text-sm text-neutral-900 truncate hover:text-teal-600 cursor-pointer"
                  >
                    {att.filename}
                  </button>
                  <span className="text-xs text-neutral-500 shrink-0">{formatBytes(att.byte_size)}</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(att)}
                    className="p-1 rounded hover:bg-neutral-200 text-neutral-400 hover:text-red-600 cursor-pointer"
                    aria-label="Remove attachment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
