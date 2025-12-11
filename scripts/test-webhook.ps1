# Test Stripe Webhook Script for Windows
# Usage: .\scripts\test-webhook.ps1

Write-Host "🧪 Stripe Webhook Test Helper" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if Stripe CLI is installed
$stripeInstalled = Get-Command stripe -ErrorAction SilentlyContinue
if (-not $stripeInstalled) {
    Write-Host "❌ Stripe CLI is not installed!" -ForegroundColor Red
    Write-Host "`nInstall it using:" -ForegroundColor Yellow
    Write-Host "  scoop install stripe" -ForegroundColor White
    Write-Host "`nOr download from: https://github.com/stripe/stripe-cli/releases/latest`n" -ForegroundColor White
    exit 1
}

Write-Host "✅ Stripe CLI is installed`n" -ForegroundColor Green

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file with your Stripe keys`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Available Commands:`n" -ForegroundColor Cyan

Write-Host "1. Start Webhook Listener" -ForegroundColor Yellow
Write-Host "   stripe listen --forward-to localhost:3000/api/stripe/webhooks`n" -ForegroundColor White

Write-Host "2. Test Payment Success" -ForegroundColor Yellow
Write-Host "   stripe trigger payment_intent.succeeded`n" -ForegroundColor White

Write-Host "3. Test Payment Failure" -ForegroundColor Yellow
Write-Host "   stripe trigger payment_intent.payment_failed`n" -ForegroundColor White

Write-Host "4. Test Charge Success" -ForegroundColor Yellow
Write-Host "   stripe trigger charge.succeeded`n" -ForegroundColor White

Write-Host "5. View Webhook Events" -ForegroundColor Yellow
Write-Host "   stripe events list --limit 10`n" -ForegroundColor White

# Ask user what they want to do
Write-Host "What would you like to do?" -ForegroundColor Cyan
Write-Host "[1] Start webhook listener" -ForegroundColor White
Write-Host "[2] Trigger payment success event" -ForegroundColor White
Write-Host "[3] Trigger payment failure event" -ForegroundColor White
Write-Host "[4] View recent events" -ForegroundColor White
Write-Host "[Q] Quit`n" -ForegroundColor White

$choice = Read-Host "Enter your choice"

switch ($choice) {
    "1" {
        Write-Host "`n🎧 Starting webhook listener..." -ForegroundColor Green
        Write-Host "Press Ctrl+C to stop`n" -ForegroundColor Yellow
        stripe listen --forward-to localhost:3000/api/stripe/webhooks
    }
    "2" {
        Write-Host "`n💰 Triggering payment success event..." -ForegroundColor Green
        stripe trigger payment_intent.succeeded
        Write-Host "`n✅ Event triggered! Check your terminal running the webhook listener.`n" -ForegroundColor Green
    }
    "3" {
        Write-Host "`n❌ Triggering payment failure event..." -ForegroundColor Red
        stripe trigger payment_intent.payment_failed
        Write-Host "`n✅ Event triggered! Check your terminal running the webhook listener.`n" -ForegroundColor Green
    }
    "4" {
        Write-Host "`n📋 Recent webhook events:`n" -ForegroundColor Cyan
        stripe events list --limit 10
    }
    "Q" {
        Write-Host "`n👋 Goodbye!`n" -ForegroundColor Cyan
        exit 0
    }
    default {
        Write-Host "`n❌ Invalid choice!`n" -ForegroundColor Red
        exit 1
    }
}
