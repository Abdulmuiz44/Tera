import { NextRequest, NextResponse } from 'next/server'
import { getWebSearchRemaining, incrementWebSearchCount } from '@/lib/web-search-usage'
import { spawn } from 'child_process'
import { promisify } from 'util'

const execFile = promisify(require('child_process').execFile)

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 10, userId } = await request.json()

    // Validate input
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required and must be a string' },
        { status: 400 }
      )
    }

    const trimmedQuery = query.trim().slice(0, 500)
    if (trimmedQuery.length === 0) {
      return NextResponse.json(
        { error: 'Query cannot be empty' },
        { status: 400 }
      )
    }

    // Check usage limit if userId provided
    if (userId) {
      try {
        const { remaining, total, resetDate, plan } = await getWebSearchRemaining(userId)
        
        console.log(`🔍 [${plan.toUpperCase()}] Web Search Check: ${remaining}/${total} remaining`)
        
        if (remaining <= 0) {
          const formattedResetDate = resetDate 
            ? new Date(resetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'next month'
          
          console.warn(`⚠️ User ${userId} reached monthly web search limit (${total}/${total})`)
          return NextResponse.json(
            {
              success: false,
              results: [],
              message: `🔍 Monthly search limit reached (${total} searches used). Resets ${formattedResetDate}. Upgrade for more searches.`,
              remaining: 0,
              total,
              resetDate
            },
            { status: 429 }
          )
        }
      } catch (limitError) {
        console.error('⚠️ Error checking limits:', limitError)
        // Continue - don't block search if limit check fails
      }
    }

    // Perform SerpScrap search
    console.log(`🔍 Searching with SerpScrap: "${trimmedQuery}" (limit: ${limit})`)
    const searchResults = await performSerpScrapSearch(trimmedQuery, limit)

    if (!searchResults.success) {
      console.error(`❌ SerpScrap Error: ${searchResults.message}`)
      return NextResponse.json({
        success: false,
        results: [],
        query: trimmedQuery,
        message: searchResults.message || 'Web search failed. Please try again.'
      }, { status: 500 })
    }

    if (!searchResults.results || searchResults.results.length === 0) {
      console.warn(`⚠️ No results for: "${trimmedQuery}"`)
      return NextResponse.json({
        success: true,
        results: [],
        query: trimmedQuery,
        message: 'No search results found. Try a different search term.'
      })
    }

    const results = searchResults.results.slice(0, limit)

    console.log(`✅ Search successful: ${results.length} results found for "${trimmedQuery}"`)

    // Increment usage counter
    if (userId) {
      try {
        await incrementWebSearchCount(userId)
        console.log(`📊 Search count incremented for user ${userId}`)
      } catch (countError) {
        console.warn('⚠️ Failed to increment search count:', countError)
        // Don't fail the response if counter update fails
      }
    }

    return NextResponse.json({
      success: true,
      results,
      query: trimmedQuery
    })

  } catch (error) {
    console.error('❌ Web search error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    return NextResponse.json(
      {
        success: false,
        results: [],
        message: 'Web search failed. Please try again.',
        ...(process.env.NODE_ENV === 'development' && { error: errorMessage })
      },
      { status: 500 }
    )
  }
}

/**
 * Perform web search using SerpScrap Python service
 */
async function performSerpScrapSearch(query: string, limit: number): Promise<any> {
  try {
    const { execFile: exec } = require('child_process')
    const { promisify } = require('util')
    const execFileAsync = promisify(exec)

    console.log(`📡 Calling SerpScrap with query: "${query}"`)

    // Call the Python SerpScrap service
    const { stdout, stderr } = await execFileAsync('python3', [
      'serpscrap_service.py',
      '--query', query,
      '--limit', String(Math.min(Math.max(limit, 1), 20)),
      '--json'
    ], {
      timeout: 30000, // 30 second timeout
      encoding: 'utf-8'
    })

    if (stderr) {
      console.warn(`⚠️ SerpScrap stderr: ${stderr}`)
    }

    // Parse JSON output
    const result = JSON.parse(stdout)
    console.log(`📥 SerpScrap Response: ${result.success ? 'success' : 'failed'} (${result.count || 0} results)`)
    
    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`❌ SerpScrap execution error: ${errorMessage}`)
    
    return {
      success: false,
      results: [],
      message: 'SerpScrap search service failed. Please try again.'
    }
  }
}

// Enable streaming for long-running searches
export const config = {
  maxDuration: 60, // 60 seconds for Vercel
}
