# Omni-Reply

Omni-Reply is a modern, enterprise-grade AI-powered multi-channel communication, marketing automation, and customer engagement platform built with **Laravel 12**, **Inertia.js**, and **React**.

---

## 🌟 Key Features

- **Multi-Channel Inbox**: Unified inbox for WhatsApp, Facebook Messenger, Instagram, Telegram, and Live Chat.
- **AI Automation & LLM Integration**: Powered by NVIDIA NIM, OpenAI, Anthropic, Gemini, DeepSeek, and Groq.
- **Visual Automation Flow Builder**: Drag-and-drop workflow canvas for intelligent chatbots and lead routing.
- **Social Media Marketing Suite**: Cross-platform scheduler and AI post creator for Facebook, Instagram, LinkedIn, and Twitter/X.
- **Billing & Subscription Engine**: 
  - Automated gateways: Stripe, PayPal, Paddle, Razorpay, Cashfree, Tap, Paystack, Mollie, Mercado Pago, etc.
  - **Manual / Local Payment Gateway**: bKash, Nagad, Rocket, Islami Bank (IBBL), Cellfin, RedoyPay, and Binance (USDT / Pay UID) with proof receipt verification.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for teams, workspaces, and administrators.
- **Real-Time WebSockets**: Live messaging and instant notifications powered by Pusher / Reverb.

---

## 🚀 Getting Started

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+ & npm
- SQLite / MySQL / PostgreSQL

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sojolhossen/Omni-Reply.git
   cd Omni-Reply
   ```

2. Install PHP & Node dependencies:
   ```bash
   composer install
   npm install
   ```

3. Set up environment:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. Run migrations & seeders:
   ```bash
   php artisan migrate --seed
   ```

5. Build frontend assets & start dev server:
   ```bash
   npm run build
   php artisan serve
   ```

---

## 📄 License
Proprietary. All rights reserved.
