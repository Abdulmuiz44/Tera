/**
 * SerpScrap Integration Test
 * Use this to verify SerpScrap web search is working correctly
 * 
 * To test:
 * 1. Make sure Python 3 is installed and SerpScrap is set up (pip install -r requirements.txt)
 * 2. Run: npm run dev or npx ts-node lib/serpscrap-test.ts via the web interface
 * 3. Enable web search in a chat and enter a query
 */

import { searchWeb } from './web-search'

async function testSerpScrap(query: string = 'latest AI news 2024') {
  console.log('🔍 Testing SerpScrap Integration')
  console.log(`📝 Query: "${query}"`)
  console.log('─'.repeat(60))

  try {
    console.log('📤 Sending search request to SerpScrap...')
    
    const results = await searchWeb(query, 5)

    console.log(`\n📥 Response received`)
    console.log(`Success: ${results.success}`)
    console.log(`Results count: ${results.results?.length || 0}`)

    if (!results.success) {
      console.error(`❌ Error: ${results.message}`)
      process.exit(1)
    }

    console.log('\n✅ SUCCESS! SerpScrap is working correctly\n')
    console.log(`📊 Results Statistics:`)
    console.log(`   - Total results: ${results.results?.length || 0}`)
    console.log(`   - Query: ${results.query}`)

    if (results.results && results.results.length > 0) {
      console.log(`\n📰 First 3 Results:`)
      results.results.slice(0, 3).forEach((result, i) => {
        console.log(`\n${i + 1}. ${result.title}`)
        console.log(`   Source: ${result.source}`)
        console.log(`   URL: ${result.url}`)
        console.log(`   Snippet: ${result.snippet?.slice(0, 100)}...`)
      })
    }

    console.log('\n' + '─'.repeat(60))
    console.log('✅ SerpScrap integration verified!\n')

  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run test
testSerpScrap().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
