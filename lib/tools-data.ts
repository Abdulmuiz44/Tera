import type { TeacherTool } from '@/components/ToolCard'

export const slugify = (text: string) => {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-')      // Remove duplicate hyphens
        .trim()
}

export const UniversalTool: TeacherTool = {
    name: 'Universal Companion',
    description: 'I adapt to whatever you need - teaching, learning, or exploring.',
    icon: '✨',
    tags: ['Adaptive', 'Smart', 'All-Purpose']
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
    },
    {
        name: 'Report Card Generator',
        description: 'Generate professional, personalized report card comments in bulk.',
        icon: '📝',
        tags: ['Grading', 'Admin', 'Writing']
    },
    {
        name: 'Newsletter Creator',
        description: 'Design engaging weekly newsletters for parents and staff.',
        icon: '📰',
        tags: ['Communication', 'Updates', 'Design']
    },
    {
        name: 'Paper Grader Agent',
        description: 'Upload student essays or assignments. I\'ll grade them and provide feedback.',
        icon: '📝',
        tags: ['Grading', 'Analysis', 'Time-Saver']
    }
]

export const studentTools: TeacherTool[] = [
    {
        name: 'Homework Helper',
        description: 'Step-by-step guidance to help you solve problems (without just giving answers!).',
        icon: '💡',
        tags: ['Study', 'Math', 'Science', 'Help']
    },
    {
        name: 'Study Buddy',
        description: 'I\'ll quiz you, create flashcards, and help you review for exams.',
        icon: '📚',
        tags: ['Review', 'Quiz', 'Prep']
    },
    {
        name: 'Essay Coach',
        description: 'Help with brainstorming, outlining, thesis statements, and editing.',
        icon: '✍️',
        tags: ['Writing', 'English', 'Structure']
    },
    {
        name: 'Concept Clarifier',
        description: 'Confused about a topic? I\'ll explain it in simple terms with examples.',
        icon: '🤔',
        tags: ['Understanding', 'Simple', 'Examples']
    },
    {
        name: 'Project Planner',
        description: 'Break down big school projects into manageble steps and timelines.',
        icon: '📅',
        tags: ['Organization', 'Tasks', 'Planning']
    },
    {
        name: 'Presentation Outliner',
        description: 'Create structured outlines and talking points for slide decks.',
        icon: '📽️',
        tags: ['Slides', 'Speaking', 'Planning']
    },
    {
        name: 'Citation Helper',
        description: 'Format citations (APA, MLA, Chicago) for your bibliography.',
        icon: '📖',
        tags: ['Research', 'Writing', 'Format']
    },
    {
        name: 'Math Solver',
        description: 'Get step-by-step explanations for complex math problems.',
        icon: '➗',
        tags: ['Math', 'Problem Solving', 'Logic']
    },
    {
        name: 'Research Agent',
        description: 'I conduct deep web searches to build comprehensive reports with citations.',
        icon: '🕵️',
        tags: ['Research', 'Web', 'Deep Dive']
    }
]

export const learnerTools: TeacherTool[] = [
    {
        name: 'Skill Explorer',
        description: 'Want to learn something new? I\'ll create a roadmap for you.',
        icon: '🗺️',
        tags: ['New Skills', 'Roadmap', 'Hobby']
    },
    {
        name: 'Deep Dive',
        description: 'Explore a topic in depth - history, science, philosophy, anything!',
        icon: '🧐',
        tags: ['Knowledge', 'Research', 'Curiosity']
    },
    {
        name: 'Idea Generator',
        description: 'Brainstorm ideas for creative writing, art, business, or just fun.',
        icon: '💡',
        tags: ['Creativity', 'Brainstorm', 'Inspiration']
    },
    {
        name: 'Book & Resource Finder',
        description: 'Get recommendations for books, videos, and articles on any topic.',
        icon: '🔎',
        tags: ['Resources', 'Reading', 'Media']
    },
    {
        name: 'Language Practice',
        description: 'Practice conversation and grammar in a new language.',
        icon: '🗣️',
        tags: ['Language', 'Conversation', 'Practice']
    },
    {
        name: 'Resume Builder',
        description: 'Draft and polish professional resumes and cover letters.',
        icon: '💼',
        tags: ['Career', 'Jobs', 'Writing']
    },
    {
        name: 'Interview Coach',
        description: 'Practice answering common interview questions with feedback.',
        icon: '🤝',
        tags: ['Career', 'Speaking', 'Prep']
    },
    {
        name: 'Debate Partner',
        description: 'Challenge your views and strengthen your arguments on any topic.',
        icon: '⚖️',
        tags: ['Critical Thinking', 'Logic', 'Discussion']
    },
    {
        name: 'Data Analyst',
        description: 'Upload data files. I\'ll analyze trends, visualize patterns, and generating insights.',
        icon: '📈',
        tags: ['Data', 'Analysis', 'Visuals']
    }
]

export const spreadsheetTools: TeacherTool[] = [
    {
        name: 'Spreadsheet Creator',
        description: 'Create and populate Google Sheets with data, charts, and visualizations.',
        icon: '📊',
        tags: ['Spreadsheet', 'Data', 'Charts', 'Google Sheets']
    }
]

export const allTools = [...teacherTools, ...studentTools, ...learnerTools, ...spreadsheetTools]
