import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import rehypePrettyCode from 'rehype-pretty-code';
import type { Options as PrettyCodeOptions } from 'rehype-pretty-code';

import { mdxComponents } from './mdx-components';

// Shiki / pretty code config (monochrome friendly for the design system)
const prettyCodeOptions: PrettyCodeOptions = {
  theme: 'github-dark',
  keepBackground: false,
  defaultLang: 'plaintext',
  transformers: [
    {
      pre(node) {
        // Add some classes for our card-elevated / glass styles if needed
        this.addClassToHast(node, 'overflow-x-auto rounded-lg border border-border bg-card/50 p-4 text-sm');
      },
    },
  ],
};

export interface RenderMdxOptions {
  source: string;
}

export async function renderMdx({ source }: RenderMdxOptions) {
  if (!source) return null;

  return (
    <MDXRemote
      source={source}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkMath],
          rehypePlugins: [
            [rehypeKatex, { strict: false, throwOnError: false }],
            [rehypePrettyCode, prettyCodeOptions],
          ],
        },
      }}
      components={mdxComponents}
    />
  );
}
