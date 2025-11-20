import type { TeacherTool } from '@/components/ToolCard'

export const teacherTools: TeacherTool[] = [
  {
    name: 'Lesson Plan Generator',
    description: 'Create objective-aligned lessons with pacing, hooks, and transitions.',
    icon: '🗂️',
    tags: ['Lesson', 'Planning', 'Standards']
  },
  {
    name: 'Worksheet & Quiz Generator',
    description: 'Generate formative assessments with answer keys and differentiation.',
    icon: '📝',
    tags: ['Assessments', 'Forms', 'Print']
  },
  {
    name: 'Concept Explainer',
    description: 'Break down complex ideas into grade-level explanations.',
    icon: '🧠',
    tags: ['Explain', 'Grades', 'Models']
  },
  {
    name: 'Rubric Builder',
    description: 'Design scalable rubrics with leveled criteria and scoring.',
    icon: '📊',
    tags: ['Rubrics', 'Feedback', 'Grading']
  },
  {
    name: 'Parent Communication',
    description: 'Draft thoughtful updates, celebrations, and interventions.',
    icon: '📬',
    tags: ['Email', 'Tone', 'Care']
  },
  {
    name: 'Classroom Quick Assist',
    description: 'Instant strategies for behavior, pacing, or transitions.',
    icon: '⚡',
    tags: ['Support', 'Live', 'Ops']
  },
  {
    name: 'Rewrite & Differentiate',
    description: 'Simplify or enrich passages for different learners.',
    icon: '🔁',
    tags: ['Access', 'Differentiation']
  },
  {
    name: 'Teaching Materials Builder',
    description: 'Layer slides, posters, and handouts from prompts.',
    icon: '📚',
    tags: ['Materials', 'Design']
  },
  {
    name: 'Warm-up Question Generator',
    description: 'Kick off every class with crisp, engaging prompts.',
    icon: '🔥',
    tags: ['Warm-up', 'Engagement']
  },
  {
    name: 'Research & Reading Simplifier',
    description: 'Summarize articles and align to your syllabus.',
    icon: '📖',
    tags: ['Summary', 'Research']
  }
]
