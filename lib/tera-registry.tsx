'use client'

import dynamic from 'next/dynamic'
import { defineRegistry } from '@json-render/react'
import { teraCatalog } from './tera-catalog'
import MarkdownRenderer from '@/components/MarkdownRenderer'

// Dynamic imports to avoid SSR issues with visual components
const ChartRenderer = dynamic(() => import('@/components/visuals/ChartRenderer'), { ssr: false })
const MermaidRenderer = dynamic(() => import('@/components/visuals/MermaidRenderer'), { ssr: false })
const QuizRenderer = dynamic(() => import('@/components/visuals/QuizRenderer'), { ssr: false })
const SpreadsheetRenderer = dynamic(() => import('@/components/visuals/SpreadsheetRenderer'), { ssr: false })

/**
 * Web component registry.
 * Maps catalog entries to actual React components for rendering.
 */
export const { registry: teraRegistry } = defineRegistry(teraCatalog, {
    components: {
        Chart: ({ props }) => <ChartRenderer config={props as any} />,
        MermaidDiagram: ({ props }) => <MermaidRenderer chart={(props as any).chart} />,
        Quiz: ({ props }) => {
            const quizProps = props as any
            return <QuizRenderer quiz={{ action: 'quiz', topic: quizProps.topic, questions: quizProps.questions }} />
        },
        Spreadsheet: ({ props }) => <SpreadsheetRenderer config={props as any} />,
        RichText: ({ props }) => <MarkdownRenderer content={(props as any).content} />,
    },
})
