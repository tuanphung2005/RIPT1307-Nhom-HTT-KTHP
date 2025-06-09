#!/bin/bash

# Forum Environment Setup Script
# This script helps you quickly switch between development and production environments

set -e

echo "🚀 Forum Environment Setup"
echo "=========================="

# Function to copy environment file
copy_env() {
    local source=$1
    local target=$2
    
    if [ -f "$source" ]; then
        cp "$source" "$target"
        echo "✅ Copied $source to $target"
    else
        echo "❌ Source file $source not found"
        exit 1
    fi
}

# Function to show current configuration
show_config() {
    echo ""
    echo "📋 Current Environment Configuration:"
    echo "===================================="
    
    if [ -f ".env" ]; then
        echo "Frontend (.env):"
        grep "REACT_APP_FORUM" .env || echo "No REACT_APP_FORUM variables found"
    else
        echo "❌ No .env file found"
    fi
    
    echo ""
    
    if [ -f "backend/.env" ]; then
        echo "Backend (backend/.env):"
        grep -E "(NODE_ENV|PORT|FRONTEND_URL)" backend/.env || echo "Basic backend variables not found"
    else
        echo "❌ No backend/.env file found"
    fi
    
    echo ""
}

# Function to setup development environment
setup_dev() {
    echo "🔧 Setting up DEVELOPMENT environment..."
    
    copy_env ".env.development" ".env"
    
    echo ""
    echo "✅ Development environment configured!"
    echo "Backend: http://localhost:3001"
    echo "Frontend: http://localhost:8000"
    echo ""
    echo "To start development:"
    echo "1. cd backend && npm run dev"
    echo "2. npm run dev"
}

# Function to setup production environment
setup_prod() {
    echo "🌍 Setting up PRODUCTION environment..."
    
    if [ ! -f ".env.production" ]; then
        echo "❌ .env.production template not found!"
        echo "Please create .env.production with your production URLs"
        exit 1
    fi
    
    copy_env ".env.production" ".env"
    
    echo ""
    echo "⚠️  IMPORTANT: Update the URLs in .env for your production environment!"
    echo "⚠️  Also update backend/.env with production database and settings!"
    echo ""
    echo "✅ Production environment template configured!"
}

# Function to create custom environment
setup_custom() {
    echo "⚙️  Custom Environment Setup"
    echo ""
    
    read -p "Enter your API domain (e.g., api.yourdomain.com): " api_domain
    read -p "Enter your frontend domain (e.g., yourdomain.com): " frontend_domain
    read -p "Use HTTPS? (y/n): " use_https
    
    if [[ $use_https =~ ^[Yy]$ ]]; then
        protocol="https"
        ws_protocol="wss"
    else
        protocol="http"
        ws_protocol="ws"
    fi
    
    # Create custom .env
    cat > .env << EOF
# Custom Environment Configuration
REACT_APP_FORUM_API_BASE_URL=${protocol}://${api_domain}/api
REACT_APP_FORUM_BACKEND_URL=${protocol}://${api_domain}
REACT_APP_FORUM_FRONTEND_URL=${protocol}://${frontend_domain}
REACT_APP_FORUM_WS_URL=${ws_protocol}://${api_domain}
EOF
    
    echo ""
    echo "✅ Custom environment created!"
    echo "Don't forget to update backend/.env with:"
    echo "FRONTEND_URL=\"${protocol}://${frontend_domain}\""
}

# Main menu
case "${1:-}" in
    "dev"|"development")
        setup_dev
        ;;
    "prod"|"production")
        setup_prod
        ;;
    "custom")
        setup_custom
        ;;
    "show"|"status")
        show_config
        ;;
    *)
        echo "Usage: $0 [dev|prod|custom|show]"
        echo ""
        echo "Commands:"
        echo "  dev     - Setup development environment (localhost)"
        echo "  prod    - Setup production environment (from template)"
        echo "  custom  - Interactive setup for custom domains"
        echo "  show    - Show current configuration"
        echo ""
        echo "Examples:"
        echo "  $0 dev          # Setup for local development"
        echo "  $0 prod         # Setup for production"
        echo "  $0 custom       # Interactive custom setup"
        echo "  $0 show         # Show current config"
        
        show_config
        ;;
esac
