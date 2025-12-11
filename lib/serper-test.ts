/**
 * Serper API Integration Test
 * Use this to verify your SERPER_API_KEY is working correctly
 * 
 * To test:
 * 1. Make sure SERPER_API_KEY is set in your .env.local
 * 2. Run: npx ts-node lib/serper-test.ts
 */

async function testSerperAPI(query: string = 'latest AI news 2024') {
  const apiKey = process.env.SERPER_API_KEY

  if (!apiKey) {
    console.error('❌ SERPER_API_KEY not found in environment variables')
    console.error('Add SERPER_API_KEY=your_key to .env.local')
    process.exit(1)
  }

  console.log('🔍 Testing Serper API Integration')
  console.log(`📝 Query: "${query}"`)
  console.log(`🔑 API Key: ${apiKey.slice(0, 8)}...${apiKey.slice(-8)}`)
  console.log('─'.repeat(60))

  try {
    const requestBody = {
      q: query,
      num: 5,
      gl: 'us',
      hl: 'en',
      autocorrect: true
    }

    console.log('📤 Sending request to https://google.serper.dev/search...')
    console.log(`Request body:`, JSON.stringify(requestBody, null, 2))

    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    console.log(`\n📥 Response Status: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Error Response: ${errorText}`)
      process.exit(1)
    }

    const data = await response.json()

    console.log('\n✅ SUCCESS! Serper API is working correctly\n')
    console.log(`📊 Results Statistics:`)
    console.log(`   - Organic results: ${data.organic?.length || 0}`)
    console.log(`   - News results: ${data.news?.length || 0}`)
    console.log(`   - Related searches: ${data.related?.length || 0}`)

    if (data.organic && data.organic.length > 0) {
      console.log(`\n📰 First 3 Results:`)
      data.organic.slice(0, 3).forEach((result: any, i: number) => {
        console.log(`\n${i + 1}. ${result.title}`)
        console.log(`   Source: ${result.source || new URL(result.link).hostname}`)
        console.log(`   URL: ${result.link}`)
        console.log(`   Snippet: ${result.snippet?.slice(0, 100)}...`)
      })
    }

    console.log('\n' + '─'.repeat(60))
    console.log('✅ Serper API integration verified!\n')

  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run test
testSerperAPI().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
