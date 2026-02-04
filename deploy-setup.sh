#!/bin/bash

# Quick Deployment Setup Script
echo "🚀 Pooja Academy - Quick Deploy Setup"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Pooja Academy Education Platform"
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << 'EOF'
node_modules
dist
.env
.env.local
*.log
.DS_Store
.cache
EOF
    echo "✅ .gitignore created"
fi

echo ""
echo "🎯 Next Steps:"
echo ""
echo "1. Create a GitHub repository:"
echo "   - Go to https://github.com/new"
echo "   - Name it: pooja-academy"
echo "   - Don't initialize with README"
echo ""
echo "2. Push your code to GitHub:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/pooja-academy.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Deploy to Vercel:"
echo "   - Go to https://vercel.com/new"
echo "   - Import your GitHub repository"
echo "   - Add environment variables (see DEPLOYMENT_GUIDE.md)"
echo "   - Click Deploy!"
echo ""
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""
