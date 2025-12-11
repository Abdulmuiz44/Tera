#!/bin/bash

# Setup script for SerpScrap integration
# This script installs Python dependencies required for web search functionality

set -e

echo "🔍 Setting up SerpScrap for web search..."
echo ""

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    echo "Please install Python 3.4 or higher from https://www.python.org/downloads/"
    exit 1
fi

python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "✅ Python $python_version found"
echo ""

# Install Python dependencies
echo "📦 Installing Python dependencies from requirements.txt..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "✅ SerpScrap setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure NEXT_PUBLIC_APP_URL is set in .env.local"
echo "2. Ensure Python 3 and pip are accessible from your application environment"
echo "3. Run 'npm run dev' or 'npm start' to begin using web search"
echo ""
echo "🔍 Web search is now available using SerpScrap (free, self-hosted)"
