"use client";

import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { useState } from "react";

import { MdxPreview } from "@/components/admin/mdx-preview";
import { MediaPicker } from "@/components/admin/media-picker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MdxEditor({
  value,
  onChange,
  minHeight = 420,
}: {
  value: string;
  onChange: (value: string) => void;
  minHeight?: number;
}) {
  const [showMedia, setShowMedia] = useState(false);

  function insertAtCursor(snippet: string) {
    onChange(value ? `${value}\n${snippet}` : snippet);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm text-muted-foreground">Body (MDX)</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowMedia((open) => !open)}
        >
          {showMedia ? "Hide media" : "Insert media"}
        </Button>
      </div>

      {showMedia ? (
        <MediaPicker
          onInsert={(url, alt) => {
            insertAtCursor(`![${alt ?? "image"}](${url})`);
            setShowMedia(false);
          }}
        />
      ) : null}

      <div
        className={cn("grid gap-4", "lg:grid-cols-2")}
        style={{ minHeight }}
      >
        <div className="overflow-hidden rounded-lg border border-border">
          <CodeMirror
            value={value}
            height={`${minHeight}px`}
            theme={oneDark}
            extensions={[markdown()]}
            onChange={onChange}
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              highlightActiveLine: true,
            }}
            className="text-sm [&_.cm-editor]:bg-[#0a0a0a] [&_.cm-scroller]:font-mono"
          />
        </div>

        <MdxPreview
          source={value}
          className="min-h-0"
        />
      </div>

      <p className="text-[10px] text-muted-foreground">
        Markdown + $inline math$ / $$display math$$. Code blocks get Shiki highlighting on the public site.
      </p>
    </div>
  );
}