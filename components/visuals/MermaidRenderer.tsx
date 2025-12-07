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
        <div className="w-full my-4 rounded-xl border border-white/10 bg-[#0A0A0A] p-4 shadow-lg overflow-x-auto">
            {error ? (
                <div className="text-red-400 text-xs p-2 bg-red-900/10 rounded border border-red-900/20">
                    {error}
                    <pre className="mt-2 opacity-50 overflow-auto">{chart}</pre>
                </div>
            ) : (
                <div
                    ref={ref}
                    className="flex justify-center min-w-[300px]"
                    dangerouslySetInnerHTML={{ __html: svg }}
                />
            )}
        </div>
    )
}
