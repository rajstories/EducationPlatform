#!/bin/bash

# Database Setup Script for Pooja Academy
echo "🔧 Setting up Pooja Academy Database..."

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL not found!"
    echo ""
    echo "Please install PostgreSQL first:"
    echo "  brew install postgresql@14"
    echo "  brew services start postgresql@14"
    echo ""
    echo "Or use a cloud database like neon.tech"
    exit 1
fi

echo "✅ PostgreSQL found!"

# Create database if it doesn't exist
echo "📦 Creating database 'pooja_academy'..."
createdb pooja_academy 2>/dev/null || echo "Database already exists or couldn't be created"

# Update .env with correct connection string
echo "🔐 Updating .env file..."
# Get the current user
CURRENT_USER=$(whoami)

# Update DATABASE_URL in .env
sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=postgresql://$CURRENT_USER@localhost:5432/pooja_academy|" .env

echo "✅ .env updated with connection string"

# Run database migrations
echo "🚀 Running database migrations..."
npm run db:push

echo ""
echo "✅ Database setup complete!"
echo ""
echo "You can now run: npm run dev"
