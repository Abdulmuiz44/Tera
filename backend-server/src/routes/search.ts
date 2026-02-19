import * as express from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import axios from 'axios';

const router = express.Router();

// Web search
router.post('/web', authMiddleware, async (req: AuthRequest, res: express.Response) => {
  try {
    const { query, limit = 10 } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required',
      });
    }

    // Using SerpAPI (you can replace with any search service)
    const searchResults = await performWebSearch(query, limit);

    res.json({
      success: true,
      data: {
        query,
        results: searchResults,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
    });
  }
});

async function performWebSearch(query: string, limit: number) {
  try {
    const { searchWebWithSearxng } = await import('../lib/searxngClient.js');
    const response = await searchWebWithSearxng({
      query,
      numResults: limit
    });
    return response.results;
  } catch (error) {
    console.error('Web search error:', error);
    throw new Error('Failed to perform search via SearXNG');
  }
}

export default router;
