# Forum Environment Setup Script (PowerShell)
# This script helps you quickly switch between development and production environments

param(
    [Parameter(Position=0)]
    [ValidateSet("dev", "development", "prod", "production", "custom", "show", "status")]
    [string]$Command = "show"
)

function Copy-EnvFile {
    param($Source, $Target)
    
    if (Test-Path $Source) {
        Copy-Item $Source $Target
        Write-Host "✅ Copied $Source to $Target" -ForegroundColor Green
    } else {
        Write-Host "❌ Source file $Source not found" -ForegroundColor Red
        exit 1
    }
}

function Show-Config {
    Write-Host ""
    Write-Host "📋 Current Environment Configuration:" -ForegroundColor Cyan
    Write-Host "====================================" -ForegroundColor Cyan
      if (Test-Path ".env") {
        Write-Host "Frontend (.env):" -ForegroundColor Yellow
        Get-Content ".env" | Where-Object { $_ -like "REACT_APP_FORUM*" } | ForEach-Object { Write-Host $_ }
    } else {
        Write-Host "❌ No .env file found" -ForegroundColor Red
    }
    
    Write-Host ""    if (Test-Path "backend\.env") {
        Write-Host "Backend (backend\.env):" -ForegroundColor Yellow
        Get-Content "backend\.env" | Where-Object { $_ -like "NODE_ENV*" -or $_ -like "PORT*" -or $_ -like "FRONTEND_URL*" } | ForEach-Object { Write-Host $_ }
    } else {
        Write-Host "❌ No backend\.env file found" -ForegroundColor Red
    }
    
    Write-Host ""
}

function Setup-Development {
    Write-Host "🔧 Setting up DEVELOPMENT environment..." -ForegroundColor Blue
    
    Copy-EnvFile ".env.development" ".env"
    
    Write-Host ""
    Write-Host "✅ Development environment configured!" -ForegroundColor Green
    Write-Host "Backend: http://localhost:3001" -ForegroundColor White
    Write-Host "Frontend: http://localhost:8000" -ForegroundColor White
    Write-Host ""
    Write-Host "To start development:" -ForegroundColor Yellow
    Write-Host "1. cd backend && npm run dev" -ForegroundColor White
    Write-Host "2. npm run dev" -ForegroundColor White
}

function Setup-Production {
    Write-Host "🌍 Setting up PRODUCTION environment..." -ForegroundColor Blue
    
    if (-not (Test-Path ".env.production")) {
        Write-Host "❌ .env.production template not found!" -ForegroundColor Red
        Write-Host "Please create .env.production with your production URLs" -ForegroundColor Yellow
        exit 1
    }
    
    Copy-EnvFile ".env.production" ".env"
    
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Update the URLs in .env for your production environment!" -ForegroundColor Yellow
    Write-Host "⚠️  Also update backend\.env with production database and settings!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "✅ Production environment template configured!" -ForegroundColor Green
}

function Setup-Custom {
    Write-Host "⚙️  Custom Environment Setup" -ForegroundColor Blue
    Write-Host ""
    
    $apiDomain = Read-Host "Enter your API domain (e.g., api.yourdomain.com)"
    $frontendDomain = Read-Host "Enter your frontend domain (e.g., yourdomain.com)"
    $useHttps = Read-Host "Use HTTPS? (y/n)"
    
    if ($useHttps -match "^[Yy]$") {
        $protocol = "https"
        $wsProtocol = "wss"
    } else {
        $protocol = "http"
        $wsProtocol = "ws"
    }
    
    # Create custom .env
    $envContent = @"
# Custom Environment Configuration
REACT_APP_FORUM_API_BASE_URL=$protocol`://$apiDomain/api
REACT_APP_FORUM_BACKEND_URL=$protocol`://$apiDomain
REACT_APP_FORUM_FRONTEND_URL=$protocol`://$frontendDomain
REACT_APP_FORUM_WS_URL=$wsProtocol`://$apiDomain
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    
    Write-Host ""
    Write-Host "✅ Custom environment created!" -ForegroundColor Green
    Write-Host "Don't forget to update backend\.env with:" -ForegroundColor Yellow
    Write-Host "FRONTEND_URL=`"$protocol`://$frontendDomain`"" -ForegroundColor White
}

# Main logic
Write-Host "🚀 Forum Environment Setup" -ForegroundColor Magenta
Write-Host "==========================" -ForegroundColor Magenta

switch ($Command) {
    { $_ -in "dev", "development" } {
        Setup-Development
    }
    { $_ -in "prod", "production" } {
        Setup-Production
    }
    "custom" {
        Setup-Custom
    }
    { $_ -in "show", "status" } {
        Show-Config
    }
    default {
        Write-Host "Usage: .\setup-env.ps1 [dev|prod|custom|show]" -ForegroundColor White
        Write-Host ""
        Write-Host "Commands:" -ForegroundColor Yellow
        Write-Host "  dev     - Setup development environment (localhost)" -ForegroundColor White
        Write-Host "  prod    - Setup production environment (from template)" -ForegroundColor White
        Write-Host "  custom  - Interactive setup for custom domains" -ForegroundColor White
        Write-Host "  show    - Show current configuration" -ForegroundColor White
        Write-Host ""
        Write-Host "Examples:" -ForegroundColor Yellow
        Write-Host "  .\setup-env.ps1 dev          # Setup for local development" -ForegroundColor White
        Write-Host "  .\setup-env.ps1 prod         # Setup for production" -ForegroundColor White
        Write-Host "  .\setup-env.ps1 custom       # Interactive custom setup" -ForegroundColor White
        Write-Host "  .\setup-env.ps1 show         # Show current config" -ForegroundColor White
        
        Show-Config
    }
}
