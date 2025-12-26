import { Router, Response } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { generateTool } from '../services/mistral.js';

const router = Router();

// Define available tools
const TOOLS = [
  {
    id: 'concept-explainer',
    name: 'Concept Explainer',
    description: 'Break down any topic into simple, understandable chunks',
    category: 'learning',
  },
  {
    id: 'study-buddy',
    name: 'Study Buddy',
    description: 'Get homework help, practice problems, and exam prep',
    category: 'learning',
  },
  {
    id: 'lesson-plan-generator',
    name: 'Lesson Plan Generator',
    description: 'Create comprehensive lesson plans with pacing and engagement',
    category: 'teaching',
  },
  {
    id: 'worksheet-generator',
    name: 'Worksheet & Quiz Generator',
    description: 'Generate formative assessments with answer keys',
    category: 'teaching',
  },
  {
    id: 'rubric-builder',
    name: 'Rubric Builder',
    description: 'Build clear, scalable grading criteria',
    category: 'teaching',
  },
  {
    id: 'study-guide',
    name: 'Study Guide',
    description: 'Create personalized study guides with key concepts and practice',
    category: 'learning',
  },
];

// Get all tools
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      success: true,
      data: TOOLS,
    });
  } catch (error) {
    console.error('Error fetching tools:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tools',
    });
  }
});

// Get single tool
router.get('/:toolId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { toolId } = req.params;
    const tool = TOOLS.find(t => t.id === toolId);

    if (!tool) {
      return res.status(404).json({
        success: false,
        error: 'Tool not found',
      });
    }

    res.json({
      success: true,
      data: tool,
    });
  } catch (error) {
    console.error('Error fetching tool:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tool',
    });
  }
});

// Process tool
router.post('/:toolId/process', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { toolId } = req.params;
    const { input, context } = req.body;

    const tool = TOOLS.find(t => t.id === toolId);

    if (!tool) {
      return res.status(404).json({
        success: false,
        error: 'Tool not found',
      });
    }

    // Map tool IDs to Mistral function types
    const toolTypeMap: { [key: string]: string } = {
      'lesson-plan-generator': 'lessonPlan',
      'worksheet-generator': 'worksheet',
      'rubric-builder': 'rubric',
      'study-guide': 'studyGuide',
      'concept-explainer': 'conceptExplainer',
      'study-buddy': 'studyGuide',
    };

    const toolType = toolTypeMap[toolId] || toolId;

    // Generate content using Mistral
    const result = await generateTool(toolType, input, context);

    res.json({
      success: true,
      data: {
        toolId,
        result,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Error processing tool:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process tool',
    });
  }
});

export default router;
