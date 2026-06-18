import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';

import { cn } from './utils';

// Basic custom MDX components that fit the monochromatic industrial aesthetic.
// Extend as needed (callouts, figures, etc.).
export const mdxComponents: MDXComponents = {
  a: ({ href, children, ...props }) => {
    const isExternal = href?.startsWith('http');
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-muted-foreground/50 underline-offset-2 hover:decoration-foreground"
          {...props}
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        href={href || '#'}
        className="underline decoration-muted-foreground/50 underline-offset-2 hover:decoration-foreground"
        {...props}
      >
        {children}
      </Link>
    );
  },

  pre: ({ children, ...props }) => (
    <pre className="not-prose" {...props}>
      {children}
    </pre>
  ),

  code: ({ className, children, ...props }) => {
    // Inline code vs block handled by rehype-pretty-code mostly
    const isInline = !className;
    return (
      <code
        className={cn(
          isInline
            ? 'rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]'
            : 'font-mono',
          className
        )}
        {...props}
      >
        {children}
      </code>
    );
  },

  // Simple callout / note for MDX authors
  Callout: ({ children, type = 'note' }: { children: React.ReactNode; type?: 'note' | 'warning' | 'info' }) => {
    const styles: Record<string, string> = {
      note: 'border-l-4 border-foreground/60 bg-muted/30',
      warning: 'border-l-4 border-yellow-500/70 bg-yellow-500/5',
      info: 'border-l-4 border-cyan-500/70 bg-cyan-500/5',
    };
    return (
      <div className={cn('my-6 rounded-r-lg p-4 text-sm', styles[type])}>
        {children}
      </div>
    );
  },

  // Math is handled by rehype-katex; we can wrap if needed
};

export type { MDXComponents };
