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
 * Unescapes basic HTML entities that might be inside math expressions
 */
function unescapeHtml(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

/**
 * Directly processes LaTeX math inside HTML content for pure rich-text HTML strings
 */
function renderMathInHtml(html: string): string {
  if (!html) return '';

  try {
    let processed = html;

    // 1. Process block math: \[...\]
    processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (_match, math) => {
      try {
        const cleanMath = unescapeHtml(math.replace(/<[^>]+>/g, '').trim());
        const rendered = katex.renderToString(cleanMath, {
          displayMode: true,
          throwOnError: false,
          strict: false,
        });
        return `<div class="katex-display-wrapper my-4 overflow-x-auto py-2 text-center">${rendered}</div>`;
      } catch {
        return _match;
      }
    });

    // 2. Process block math: $$...$$
    processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_match, math) => {
      try {
        const cleanMath = unescapeHtml(math.replace(/<[^>]+>/g, '').trim());
        const rendered = katex.renderToString(cleanMath, {
          displayMode: true,
          throwOnError: false,
          strict: false,
        });
        return `<div class="katex-display-wrapper my-4 overflow-x-auto py-2 text-center">${rendered}</div>`;
      } catch {
        return _match;
      }
    });

    // 3. Process LaTeX environments: \begin{equation}...\end{equation}, \begin{align}...\end{align}, etc.
    processed = processed.replace(/\\begin\{([a-zA-Z0-9*]+)\}([\s\S]*?)\\end\{\1\}/g, (_match, env, math) => {
      try {
        const fullMath = unescapeHtml(`\\begin{${env}}${math.replace(/<[^>]+>/g, '')}\\end{${env}}`.trim());
        const rendered = katex.renderToString(fullMath, {
          displayMode: true,
          throwOnError: false,
          strict: false,
        });
        return `<div class="katex-display-wrapper my-4 overflow-x-auto py-2 text-center">${rendered}</div>`;
      } catch {
        return _match;
      }
    });

    // 4. Process inline math: \(...\)
    processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (_match, math) => {
      try {
        const cleanMath = unescapeHtml(math.replace(/<[^>]+>/g, '').trim());
        return katex.renderToString(cleanMath, {
          displayMode: false,
          throwOnError: false,
          strict: false,
        });
      } catch {
        return _match;
      }
    });

    // 5. Process inline single dollar math: $...$ (when not empty or currency)
    processed = processed.replace(/(?<![\w$])\$([^\$\n\r]+?)\$(?![\w$])/g, (_match, math) => {
      try {
        const cleanMath = unescapeHtml(math.replace(/<[^>]+>/g, '').trim());
        if (!cleanMath) return _match;
        return katex.renderToString(cleanMath, {
          displayMode: false,
          throwOnError: false,
          strict: false,
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

  let processed = markdown;

  // 1. Standardize \[ ... \] display equations to $$ ... $$ (with isolated blank lines)
  processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (_match, math) => {
    const clean = unescapeHtml(math.trim());
    return `\n\n$$\n${clean}\n$$\n\n`;
  });

  // 2. Standardize standalone \begin{...}...\end{...} environments into $$ ... $$
  processed = processed.replace(
    /(?<!\$)\s*(\\begin\{([a-zA-Z0-9*]+)\}[\s\S]*?\\end\{\2\})\s*(?!\$)/g,
    (_match, fullEnv) => {
      const clean = unescapeHtml(fullEnv.trim());
      return `\n\n$$\n${clean}\n$$\n\n`;
    }
  );

  // 3. Standardize \( ... \) inline equations to $ ... $
  processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (_match, math) => {
    const clean = unescapeHtml(math.trim());
    return `$${clean}$`;
  });

  // 4. Ensure existing $$...$$ blocks have clean newline padding for remark-math parser
  processed = processed.replace(/(?<!\$)\$\$([\s\S]*?)\$\$(?!\$)/g, (_match, math) => {
    const clean = unescapeHtml(math.trim());
    return `\n\n$$\n${clean}\n$$\n\n`;
  });

  return processed;
}

export function LatexRenderer({ content, className = '', isHtml }: LatexRendererProps) {
  const isPureHtml = useMemo(() => {
    if (!content) return false;
    if (typeof isHtml === 'boolean') {
      // If user explicitly passed isHtml, check if it contains markdown headers or lists
      const hasMarkdownStructure = /(?:^|\n)(?:#{1,6}\s|[-*]\s|\d+\.\s|```)/.test(content);
      if (hasMarkdownStructure) return false;
      return isHtml;
    }
    
    const trimmed = content.trim();
    // Check if content starts with HTML opening tag and ends with closing tag, and lacks Markdown structure
    const looksLikeHtmlDoc = /^<[a-z0-9]+[^>]*>[\s\S]*<\/[a-z0-9]+>$/i.test(trimmed);
    const hasMarkdownStructure = /(?:^|\n)(?:#{1,6}\s|[-*]\s|\d+\.\s|```)/.test(content);
    
    return looksLikeHtmlDoc && !hasMarkdownStructure;
  }, [content, isHtml]);

  if (isPureHtml) {
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
