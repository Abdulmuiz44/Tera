#!/usr/bin/env python3
"""
SerpScrap Service Wrapper
Provides web search functionality via SerpScrap instead of external APIs
"""

import sys
import json
import argparse
from typing import List, Dict, Any
import serpscrap


def perform_search(query: str, num_results: int = 10) -> Dict[str, Any]:
    """
    Perform web search using SerpScrap
    
    Args:
        query: Search query string
        num_results: Number of results to return (1-20, default 10)
    
    Returns:
        Dictionary with success status and search results
    """
    try:
        if not query or not query.strip():
            return {
                'success': False,
                'results': [],
                'message': 'Search query cannot be empty'
            }
        
        # Configure SerpScrap
        config = serpscrap.Config()
        
        # Set configuration options
        config.set('scrape_urls', False)  # Don't scrape individual URLs to save time
        config.set('num_pages', 1)  # Get only first page of results
        config.set('google_pause_between_scrapes', 1)  # 1 second delay between requests
        
        # Initialize and run scraper
        scraper = serpscrap.SerpScrap()
        scraper.init(config=config.get(), keywords=[query.strip()])
        
        # Get raw results
        raw_results = scraper.run()
        
        if not raw_results:
            return {
                'success': True,
                'results': [],
                'message': 'No results found for this query'
            }
        
        # Format results for consumption
        formatted_results = []
        
        for result in raw_results:
            # Get the serp results (standard search results)
            if 'results' in result and result['results']:
                for idx, item in enumerate(result['results']):
                    if len(formatted_results) >= num_results:
                        break
                    
                    # Extract relevant fields
                    formatted_item = {
                        'title': item.get('title', ''),
                        'url': item.get('url', ''),
                        'snippet': item.get('snippet', ''),
                        'source': extract_domain(item.get('url', '')),
                        'date': item.get('date'),
                        'rank': item.get('rank', idx + 1),
                        'type': 'result'
                    }
                    
                    # Only add if it has required fields
                    if formatted_item['title'] and formatted_item['url'] and formatted_item['snippet']:
                        formatted_results.append(formatted_item)
            
            # Stop if we have enough results
            if len(formatted_results) >= num_results:
                break
        
        return {
            'success': True,
            'results': formatted_results[:num_results],
            'query': query.strip(),
            'count': len(formatted_results)
        }
        
    except Exception as e:
        return {
            'success': False,
            'results': [],
            'message': f'SerpScrap error: {str(e)}',
            'error': str(e)
        }


def extract_domain(url: str) -> str:
    """Extract domain name from URL"""
    try:
        from urllib.parse import urlparse
        domain = urlparse(url).netloc
        return domain.replace('www.', '') if domain else 'unknown'
    except:
        return 'unknown'


def main():
    """Main entry point for the service"""
    parser = argparse.ArgumentParser(description='SerpScrap Web Search Service')
    parser.add_argument('--query', type=str, required=True, help='Search query')
    parser.add_argument('--limit', type=int, default=10, help='Number of results (1-20)')
    parser.add_argument('--json', action='store_true', help='Output as JSON')
    
    args = parser.parse_args()
    
    # Validate limit
    limit = max(1, min(args.limit, 20))
    
    # Perform search
    results = perform_search(args.query, limit)
    
    # Output results
    if args.json:
        print(json.dumps(results, indent=2))
    else:
        import pprint
        pprint.pprint(results)
    
    return 0 if results['success'] else 1


if __name__ == '__main__':
    sys.exit(main())
