import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

interface MarkdownRendererProps {
    content: string
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    // Pre-process content to handle some common format issues if needed
    // e.g. ensure math blocks have proper spacing
    const processedContent = content
        .replace(/\\\(/g, '$')   // Replace \( with $
        .replace(/\\\)/g, '$')   // Replace \) with $
        .replace(/\\\[/g, '$$')  // Replace \[ with $$
        .replace(/\\\]/g, '$$')  // Replace \] with $$

    return (
        <div className="prose prose-invert max-w-none break-words text-tera-primary">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    // Custom paragraph renderer to handle line breaks and spacing
                    p: ({ node, children }) => (
                        <p className="mb-4 last:mb-0 leading-relaxed whitespace-pre-wrap">{children}</p>
                    ),
                    // Custom link renderer
                    a: ({ node, href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-tera-neon hover:underline break-all"
                        >
                            {children}
                        </a>
                    ),
                    // Custom list renderers
                    ul: ({ node, children }) => (
                        <ul className="list-disc pl-5 mb-4 space-y-1 marker:text-tera-secondary">{children}</ul>
                    ),
                    ol: ({ node, children }) => (
                        <ol className="list-decimal pl-5 mb-4 space-y-1 marker:text-tera-secondary">{children}</ol>
                    ),
                    li: ({ node, children }) => (
                        <li className="leading-relaxed">{children}</li>
                    ),
                    // Custom header renderers
                    h1: ({ node, children }) => <h1 className="text-2xl font-bold mb-4 mt-6 text-tera-primary">{children}</h1>,
                    h2: ({ node, children }) => <h2 className="text-xl font-bold mb-3 mt-5 text-tera-primary">{children}</h2>,
                    h3: ({ node, children }) => <h3 className="text-lg font-bold mb-2 mt-4 text-tera-primary">{children}</h3>,
                    h4: ({ node, children }) => <h4 className="text-base font-bold mb-2 mt-3 text-tera-primary">{children}</h4>,
                    // Custom table renderer
                    table: ({ node, children }) => (
                        <div className="my-6 w-full overflow-x-auto rounded-lg border border-tera-border bg-tera-panel/30">
                            <table className="w-full text-sm text-left">{children}</table>
                        </div>
                    ),
                    thead: ({ node, children }) => (
                        <thead className="bg-black/20 text-xs uppercase text-tera-secondary font-semibold border-b border-tera-border">
                            {children}
                        </thead>
                    ),
                    tbody: ({ node, children }) => (
                        <tbody className="divide-y divide-tera-border/30">{children}</tbody>
                    ),
                    tr: ({ node, children }) => (
                        <tr className="hover:bg-white/5 transition-colors">{children}</tr>
                    ),
                    th: ({ node, children }) => (
                        <th className="px-4 py-3 font-medium whitespace-nowrap">{children}</th>
                    ),
                    td: ({ node, children }) => (
                        <td className="px-4 py-3 align-top">{children}</td>
                    ),
                    // Custom horizontal rule
                    hr: ({ node }) => <hr className="my-6 border-tera-border opacity-50" />,
                    // Custom blockquote
                    blockquote: ({ node, children }) => (
                        <blockquote className="border-l-4 border-tera-neon/50 pl-4 py-1 my-4 bg-tera-neon/5 rounded-r italic text-tera-secondary">
                            {children}
                        </blockquote>
                    ),
                    // Custom code block wrapper
                    pre: ({ node, children }) => (
                        <pre className="my-4 w-full max-w-full overflow-x-auto rounded-lg bg-black/50 p-4 font-mono text-sm border border-tera-border text-tera-primary">
                            {children}
                        </pre>
                    ),
                    // Code handling
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '')
                        const isMath = match && match[1] === 'math'

                        if (inline && !isMath) {
                            return (
                                <code className="bg-black/30 rounded px-1.5 py-0.5 text-sm font-mono text-tera-neon" {...props}>
                                    {children}
                                </code>
                            )
                        }

                        return (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        )
                    }
                }}
            >
                {processedContent}
            </ReactMarkdown>
        </div>
    )
}

export default MarkdownRenderer
