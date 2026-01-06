# Speekly - AI Speech Therapist

A modern AI-powered speech therapy application built with Expo/React Native.

## 🚀 Features

- **AI Speech Analysis** - Real-time speech recognition with AI feedback
- **Relaxation Techniques** - Guided breathing and muscle relaxation exercises
- **SOS Panic Mode** - Emergency calming for unexpected speaking situations
- **Multiple Scenarios** - Job interviews, ordering coffee, small talk, and custom scenarios
- **Streak Tracking** - Gamified progress with daily streaks
- **Bilingual** - English and Czech language support

## 🛠️ Tech Stack

- **Frontend**: Expo / React Native Web
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe Checkout
- **AI**: OpenAI GPT-3.5

## ⚙️ Environment Variables

Set these in your Vercel Dashboard → Settings → Environment Variables:

### Required
```
OPENAI_API_KEY=sk-your-openai-key
STRIPE_SECRET_KEY=sk_live_your-stripe-key  (or sk_test_ for testing)
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key
```

## 🗄️ Database Setup (Supabase)

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor
3. Run the SQL from `database/schema.sql`
4. Copy your project URL and anon key to environment variables

## 💳 Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Get your Secret Key from Developers → API Keys
3. Set up webhook:
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-domain.vercel.app/api/webhook`
   - Select events: `checkout.session.completed`, `payment_intent.payment_failed`
   - Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

## 🏃 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run web

# Build for production
npm run build
```

## 📦 Deployment

The app auto-deploys to Vercel when you push to the `main` branch.

### Manual Deployment
```bash
vercel --prod
```

## 🔗 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/diagnose` | GET | System status with service checks |
| `/api/chat` | POST | OpenAI proxy for chat |
| `/api/checkout` | POST | Create Stripe checkout session |
| `/api/webhook` | POST | Stripe webhook handler |

## 📁 Project Structure

```
speekly/
├── App.js              # Main application
├── api/                # Serverless functions
│   ├── chat.js        # OpenAI proxy
│   ├── checkout.js    # Stripe checkout
│   ├── diagnose.js    # Health/status check
│   ├── health.js      # Simple health check
│   └── webhook.js     # Stripe webhook
├── components/
│   └── AuthScreen.js  # Authentication UI
├── lib/
│   └── supabase.js    # Supabase client
├── database/
│   └── schema.sql     # Database schema
├── public/
│   ├── icon.png       # App icon
│   └── manifest.json  # PWA manifest
└── vercel.json        # Vercel configuration
```

## 📄 License

Private - All rights reserved.
