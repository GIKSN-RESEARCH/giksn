"use client";

import { useState } from "react";

import type { Category, Comment } from "@/lib/papers";
import { formatDate } from "@/lib/papers";
import { renderInline } from "@/lib/inlineMarkdown";
import { CommentForm } from "@/app/[category]/[slug]/CommentForm";

type Props = {
  comments: Comment[];
  category: Category;
  slug: string;
};

export function CommentThread({ comments, category, slug }: Props) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  if (!comments.length) {
    return (
      <div className="py-12 text-center">
        <p className="font-display italic text-ink-soft text-lg">
          No replies yet — be the first to weigh in.
        </p>
      </div>
    );
  }

  return (
    <ol className="divide-y divide-rule">
      {comments.map((c, i) => (
        <li key={c.id} className="py-7">
          <CommentItem
            comment={c}
            index={i + 1}
            onReply={() => setReplyingTo(c.id === replyingTo ? null : c.id)}
            isReplying={replyingTo === c.id}
          />
          {replyingTo === c.id && (
            <div className="mt-4 md:pl-[16.6667%]">
              <CommentForm
                category={category}
                slug={slug}
                parentId={c.id}
                onPosted={() => setReplyingTo(null)}
                compact
              />
            </div>
          )}
          {c.replies?.length ? (
            <ol className="mt-5 pl-6 border-l-2 border-accent/40 space-y-5">
              {c.replies.map((r, j) => (
                <li key={r.id} className="pl-2">
                  <CommentItem
                    comment={r}
                    index={i + 1}
                    subIndex={j + 1}
                    reply
                  />
                </li>
              ))}
            </ol>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function CommentItem({
  comment,
  index,
  subIndex,
  reply = false,
  onReply,
  isReplying,
}: {
  comment: Comment;
  index: number;
  subIndex?: number;
  reply?: boolean;
  onReply?: () => void;
  isReplying?: boolean;
}) {
  const ref = subIndex
    ? `${String(index).padStart(2, "0")}.${String(subIndex).padStart(2, "0")}`
    : String(index).padStart(2, "0");

  return (
    <div className="grid grid-cols-12 gap-3 md:gap-4">
      <div className="col-span-12 md:col-span-2 md:text-right flex md:block items-baseline gap-3 flex-wrap">
        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
          §{ref}
        </div>
        <div className="text-[14px] text-ink font-medium md:mt-1">
          {comment.author}
        </div>
        <div className="font-mono text-[11px] text-ink-faint md:mt-0.5">
          @{comment.handle}
        </div>
        <div className="font-mono text-[11px] text-ink-faint md:mt-2">
          {formatDate(comment.date)}
        </div>
      </div>
      <div className="col-span-12 md:col-span-10">
        <p className={`text-[15px] sm:text-[15.5px] leading-[1.7] text-ink ${reply ? "" : ""}`}>
          {renderInline(comment.body)}
        </p>
        {!reply && onReply && (
          <div className="mt-3 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
            <button
              type="button"
              onClick={onReply}
              className="hover:text-accent transition-colors"
            >
              {isReplying ? "Cancel" : "Reply"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
