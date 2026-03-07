"use client";

import { useState } from "react";
import { buildCommentTree, type TaskCommentWithAuthor, type TaskCommentTree } from "@/lib/queries/taskComments";
import { formatDate } from "@/lib/utils";
import { MessageSquare, Reply, X } from "lucide-react";

interface ThreadedCommentsProps {
  taskId: string;
  comments: TaskCommentWithAuthor[];
  currentUserId: string | null;
  onAddComment: (body: string) => Promise<void>;
  onAddReply: (parentId: string, body: string) => Promise<void>;
  onDeleteComment: (id: string) => Promise<void>;
}

function CommentNode({
  node,
  depth,
  currentUserId,
  onReply,
  onDelete,
}: {
  node: TaskCommentTree;
  depth: number;
  currentUserId: string | null;
  onReply: (parentId: string, body: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const authorLabel =
    currentUserId === node.user_id ? "You" : node.author_display_name?.trim() || "Comment";

  const handleSubmitReply = async () => {
    if (!replyBody.trim()) return;
    setSubmitting(true);
    await onReply(node.id, replyBody.trim());
    setReplyBody("");
    setReplyOpen(false);
    setSubmitting(false);
  };

  return (
    <div className={depth > 0 ? "ml-4 pl-3 border-l-2 border-neutral-200" : ""}>
      <div className="py-2 px-3 rounded-lg bg-white border border-neutral-200 mb-2">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-medium text-sm text-neutral-900">{authorLabel}</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-neutral-500">{formatDate(node.created_at)}</span>
            {currentUserId === node.user_id && (
              <button
                type="button"
                onClick={() => onDelete(node.id)}
                className="p-0.5 rounded hover:bg-neutral-100 text-neutral-400 cursor-pointer"
                aria-label="Delete comment"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        <p className="text-sm text-neutral-600 whitespace-pre-wrap">{node.body}</p>
        <div className="mt-2">
          {!replyOpen ? (
            <button
              type="button"
              onClick={() => setReplyOpen(true)}
              className="inline-flex items-center gap-1 text-xs text-teal-500 hover:underline cursor-pointer"
            >
              <Reply className="w-3.5 h-3.5" />
              Reply
            </button>
          ) : (
            <div className="mt-2 space-y-2">
              <textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Write a reply…"
                rows={2}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none resize-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSubmitReply}
                  disabled={!replyBody.trim() || submitting}
                  className="px-3 py-1.5 rounded-lg bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Posting…" : "Reply"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReplyOpen(false);
                    setReplyBody("");
                  }}
                  className="px-3 py-1.5 rounded-lg border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {node.replies.length > 0 && (
        <div className="space-y-0">
          {node.replies.map((reply) => (
            <CommentNode
              key={reply.id}
              node={reply}
              depth={depth + 1}
              currentUserId={currentUserId}
              onReply={onReply}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ThreadedComments({
  taskId,
  comments,
  currentUserId,
  onAddComment,
  onAddReply,
  onDeleteComment,
}: ThreadedCommentsProps) {
  const [newBody, setNewBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const tree = buildCommentTree(comments);

  const handleAdd = async () => {
    if (!newBody.trim()) return;
    setSubmitting(true);
    await onAddComment(newBody.trim());
    setNewBody("");
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <h3 className="text-sm font-semibold text-neutral-700 pb-3 border-b border-neutral-100 flex items-center gap-2 shrink-0">
        <MessageSquare className="w-4 h-4 text-neutral-500" />
        Comments {comments.length > 0 && `(${comments.length})`}
      </h3>
      <div className="flex flex-col gap-2 shrink-0 mb-3 mt-3">
        <textarea
          value={newBody}
          onChange={(e) => setNewBody(e.target.value)}
          placeholder="Add a comment…"
          rows={2}
          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none resize-none"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newBody.trim() || submitting}
          className="self-end text-sm px-3 py-1.5 rounded-lg bg-teal-500 text-white font-medium hover:bg-teal-600 disabled:opacity-50 cursor-pointer"
        >
          {submitting ? "Posting…" : "Comment"}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {tree.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center pt-8">No comments yet.</p>
        ) : (
          tree.map((node) => (
            <CommentNode
              key={node.id}
              node={node}
              depth={0}
              currentUserId={currentUserId}
              onReply={onAddReply}
              onDelete={onDeleteComment}
            />
          ))
        )}
      </div>
    </div>
  );
}
