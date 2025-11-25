import type { TeacherTool } from '@/components/ToolCard'

export const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Remove duplicate hyphens
    .trim()
}

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
  },
  {
    name: 'IEP Goal Drafter',
    description: 'Draft SMART goals aligned with student needs and standards.',
    icon: '🎯',
    tags: ['IEP', 'Special Ed', 'Goals']
  },
  {
    name: 'Group Project Generator',
    description: 'Create structured group projects with roles, timelines, and rubrics.',
    icon: '👥',
    tags: ['Collaboration', 'Projects', 'Roles']
  },
  {
    name: 'Icebreaker Generator',
    description: 'Fun and engaging activities to build classroom community.',
    icon: '🧊',
    tags: ['Community', 'Fun', 'Start']
  },
  {
    name: 'Substitute Teacher Plan',
    description: 'Emergency lesson plans and instructions for substitutes.',
    icon: '🆘',
    tags: ['Sub Plans', 'Emergency', 'Admin']
  },
  {
    name: 'Student Feedback Generator',
    description: 'Generate constructive and personalized feedback for students.',
    icon: '💬',
    tags: ['Feedback', 'Growth', 'Comments']
  },
  {
    name: 'Field Trip Planner',
    description: 'Plan logistics, permissions, and educational objectives for trips.',
    icon: '🚌',
    tags: ['Logistics', 'Events', 'Safety']
  }
]
