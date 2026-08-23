'use client';

import React, { useMemo } from 'react';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import katex from 'katex';

interface LatexRendererProps {
  content: string;
  className?: string;
  isHtml?: boolean;
}

/**
 * Safely renders LaTeX math inside HTML content without breaking existing HTML tags.
 */
function renderMathInHtml(html: string): string {
  if (!html) return '';

  try {
    // 1. Process block math: $$...$$ and \[...\]
    let processed = html.replace(/\$\$([\s\S]*?)\$\$/g, (_match, math) => {
      try {
        const cleanMath = math.replace(/<[^>]+>/g, '').trim();
        return `<div class="katex-display-wrapper my-4 overflow-x-auto py-2 text-center">${katex.renderToString(cleanMath, {
          displayMode: true,
          throwOnError: false,
        })}</div>`;
      } catch {
        return _match;
      }
    });

    processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (_match, math) => {
      try {
        const cleanMath = math.replace(/<[^>]+>/g, '').trim();
        return `<div class="katex-display-wrapper my-4 overflow-x-auto py-2 text-center">${katex.renderToString(cleanMath, {
          displayMode: true,
          throwOnError: false,
        })}</div>`;
      } catch {
        return _match;
      }
    });

    // 2. Process LaTeX environments: \begin{equation}...\end{equation}, \begin{align}...\end{align}, etc.
    processed = processed.replace(/\\begin\{([a-zA-Z0-9*]+)\}([\s\S]*?)\\end\{\1\}/g, (_match, env, math) => {
      try {
        const fullMath = `\\begin{${env}}${math}\\end{${env}}`.replace(/<[^>]+>/g, '').trim();
        return `<div class="katex-display-wrapper my-4 overflow-x-auto py-2 text-center">${katex.renderToString(fullMath, {
          displayMode: true,
          throwOnError: false,
        })}</div>`;
      } catch {
        return _match;
      }
    });

    // 3. Process inline math: \(...\)
    processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (_match, math) => {
      try {
        const cleanMath = math.replace(/<[^>]+>/g, '').trim();
        return katex.renderToString(cleanMath, {
          displayMode: false,
          throwOnError: false,
        });
      } catch {
        return _match;
      }
    });

    // 4. Process single dollar math: $...$ (ensuring no double dollar or currency mismatch)
    // Matches $...$ when not preceded or followed by other $, digits with dollar (like $50), or empty
    processed = processed.replace(/(?<![\w$])\$([^\$\n\r]+?)\$(?![\w$])/g, (_match, math) => {
      try {
        const cleanMath = math.replace(/<[^>]+>/g, '').trim();
        if (!cleanMath) return _match;
        return katex.renderToString(cleanMath, {
          displayMode: false,
          throwOnError: false,
        });
      } catch {
        return _match;
      }
    });

    return processed;
  } catch (err) {
    console.warn('Error processing LaTeX in HTML:', err);
    return html;
  }
}

/**
 * Preprocesses markdown text to ensure LaTeX math blocks are formatted properly for remark-math
 */
function preprocessMarkdown(markdown: string): string {
  if (!markdown) return '';

  // Standardize standalone \begin{...}...\end{...} environments into $$ \begin{...} \end{...} $$ if not already wrapped
  let processed = markdown.replace(
    /(?<!\$)\s*(\\begin\{([a-zA-Z0-9*]+)\}[\s\S]*?\\end\{\2\})\s*(?!\$)/g,
    '\n\n$$\n$1\n$$\n\n'
  );

  // Standardize \[ ... \] to $$ ... $$
  processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, '\n\n$$\n$1\n$$\n\n');

  // Standardize \( ... \) to $ ... $
  processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

  return processed;
}

export function LatexRenderer({ content, className = '', isHtml }: LatexRendererProps) {
  const contentIsHtml = useMemo(() => {
    if (typeof isHtml === 'boolean') return isHtml;
    // Auto-detect HTML tags
    return /<[a-z][\s\S]*>/i.test(content || '');
  }, [content, isHtml]);

  if (contentIsHtml) {
    const htmlWithMath = renderMathInHtml(content || '');
    return (
      <div
        className={`markdown-body prose prose-lg dark:prose-invert max-w-none prose-a:text-info-light leading-relaxed break-words ${className}`}
        dangerouslySetInnerHTML={{ __html: htmlWithMath }}
      />
    );
  }

  const processedMd = preprocessMarkdown(content || '');

  return (
    <div className={`markdown-body prose prose-lg dark:prose-invert max-w-none prose-a:text-info-light leading-relaxed break-words ${className}`}>
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, [rehypeKatex, { throwOnError: false, strict: false }]]}
      >
        {processedMd}
      </Markdown>
    </div>
  );
}

export default LatexRenderer;
