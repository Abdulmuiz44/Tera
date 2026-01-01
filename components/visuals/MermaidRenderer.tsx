"use client"

import React, { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

interface MermaidRendererProps {
    chart: string
}

export default function MermaidRenderer({ chart }: MermaidRendererProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [svg, setSvg] = useState<string>('')
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'loose',
            fontFamily: 'Inter, sans-serif'
        })
    }, [])

    useEffect(() => {
        const renderChart = async () => {
            if (!chart) return

            try {
                const id = `mermaid-${crypto.randomUUID().replace(/-/g, '')}`
                const { svg } = await mermaid.render(id, chart)
                setSvg(svg)
                setError(null)
            } catch (err) {
                console.error('Mermaid render error:', err)
                setError('Failed to render diagram. Please check syntax.')
                // Mermaid puts error text in the DOM automatically sometimes, so we might not need to show much.
            }
        }

        renderChart()
    }, [chart])

    return (
        <div className="w-full my-4 space-y-3">
            {/* Code Section */}
            <div className="rounded-lg border border-white/10 bg-[#0a0a0a]/60 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
                    <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                        📝 Mermaid Diagram Code
                    </h3>
                </div>
                <pre className="p-4 text-xs text-white/70 overflow-x-auto max-h-[200px]">
                    <code>{chart}</code>
                </pre>
            </div>

            {/* Diagram Rendering Section */}
            <div className="rounded-xl border border-white/10 bg-[#0A0A0A] p-4 shadow-lg overflow-x-auto">
                {error ? (
                    <div className="text-red-400 text-xs p-2 bg-red-900/10 rounded border border-red-900/20">
                        <p className="font-semibold mb-2">⚠️ Error Rendering Diagram</p>
                        {error}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider flex items-center gap-2">
                            <span>✨</span>
                            Generated Diagram
                        </h3>
                        <div
                            ref={ref}
                            className="flex justify-center min-w-[300px]"
                            dangerouslySetInnerHTML={{ __html: svg }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
