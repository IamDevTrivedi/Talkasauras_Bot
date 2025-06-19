# 🦕 Talkasauras - AI Telegram Bot

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)

A sophisticated AI-powered Telegram bot built with Google's Gemini AI 2.0 Flash, featuring intelligent conversations, smart reminders, AI image generation, and comprehensive health monitoring. Designed to provide personalized assistance with advanced session management and admin capabilities.

## ✨ Features

### 🤖 AI-Powered Conversations

- **Google Gemini 2.0 Flash Integration**: Leverages Google's latest Gemini AI technology with search grounding capabilities
- **Context-Aware Chat**: Maintains conversation history for coherent, contextual interactions
- **Real-time Responses**: Fast and accurate AI-generated replies to user queries
- **Personalized Experience**: Addresses users by their first name for enhanced engagement

### 🎨 AI Image Generation

- **Text-to-Image**: Generate stunning images from text prompts using Gemini 2.0 Flash Experimental
- **Multimodal Responses**: Supports both text and image generation in conversations
- **Creative Assistance**: Perfect for artistic inspiration, concept visualization, and creative projects

### ⏰ Smart Reminder System

- **Natural Language Processing**: Uses Chrono-node for intelligent time parsing from casual text
- **Flexible Scheduling**: Set reminders with natural phrases like "remind me to take medicine in 30 minutes"
- **Automated Delivery**: Cron-job based system ensures timely reminder notifications
- **Persistent Storage**: MongoDB storage ensures reminders survive server restarts

### 💾 Advanced Session Management

- **Persistent Sessions**: Standard chat mode with conversation history storage in MongoDB
- **Temporary Sessions**: Privacy-focused temporary chats with auto-expiry (5 minutes)
- **Session Switching**: Easy toggle between standard and temporary modes
- **Data Control**: Complete chat history clearing functionality
- **Intelligent Context**: Maintains separate histories for different session types

### 🛠️ Comprehensive Command Set

- `/start` - Initialize conversation with personalized welcome message
- `/help` - Comprehensive command guide with visual formatting
- `/about` - Bot information with developer links and inline buttons
- `/contact` - Direct access to developer contact information
- `/feedback` - User feedback collection system with admin notifications
- `/remindme` - Set intelligent reminders using natural language
- `/imagine` - Generate AI images from text prompts
- `/clear` - Complete chat history reset
- `/current_mode` - Session status checker
- `/temporary_start` - Begin privacy-focused temporary session
- `/temporary_end` - End temporary session with data cleanup

### 🔧 Admin Features

- **Broadcast System**: Admin-only mass messaging to all registered users
- **User Management**: Complete user database tracking with MongoDB
- **Feedback Monitoring**: Centralized feedback collection and admin notifications
- **Admin Authentication**: Username-based admin verification system

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB database (local or cloud)
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- Google Gemini API Key

## Installation Guide

### 1. **Clone the Repository**

```bash
git clone https://github.com/IamDevTrivedi/Talkasauras-Bot.git
cd Talkasauras-Bot
```

### 2. **Install Dependencies**

Using **npm**:

```bash
npm install
```

Or using **pnpm** (recommended):

```bash
pnpm install
```

### 3. **Environment Configuration**

Create a `.env` file in the root directory with the following content:

```env
# Get your Google Gemini API Key from:
# https://aistudio.google.com/app/apikey
GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key_here

# Set environment (production or development)
ENVIRONMENT=production
# ENVIRONMENT=development

# Define the port for production and development
PORT_PROD=5000
PORT_DEV=5000

# Telegram Bot Token - get it from BotFather on Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# URL where your bot will receive webhook updates (for production)
WEBHOOK_URL=https://yourdomain.com

# Admin username (case-sensitive, without @)
MASTER_ADMIN=your_admin_username_here

# If you want to set multiple admins, separate them with commas
ADMIN_ARRAY=your_admin_username_here,another_admin_username_here

# Enable or disable logging (true or false)
LOGGING_ENABLED=false

# IV_LENGTH is used for encryption/decryption
# It should be 16 for AES encryption
IV_LENGTH=16

# SECRET_KEY is used for encryption/decryption
# It should be a string of your choice, ideally 16, 24, or 32 bytes long
SECRET_KEY=your_secret_key_here

# MongoDB connection string - create one from:
# https://cloud.mongodb.com/
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority&appName=YourAppName
```

### 4. **Start the Application**

For **production**:

```bash
npm start
```

For **development** with auto-restart:

```bash
npm run dev
```

Or execute directly using Node:

```bash
node index.js
```

## 🔧 Configuration Guide

### Environment Variables

| Variable                | Description                                   | Required |
| ----------------------- | --------------------------------------------- | -------- |
| `GOOGLE_GEMINI_API_KEY` | Google Gemini API key for AI functionality    | ✅       |
| `ENVIRONMENT`           | Runtime environment (production/development)  | ✅       |
| `PORT_PROD`             | Production server port                        | ✅       |
| `PORT_DEV`              | Development server port                       | ✅       |
| `TELEGRAM_BOT_TOKEN`    | Bot token from @BotFather                     | ✅       |
| `MASTER_ADMIN`          | Primary admin Telegram username (without @)   | ✅       |
| `MONGODB_URL`           | MongoDB connection string                     | ✅       |
| `IV_LENGTH`             | Initialization vector length (for encryption) | ✅       |
| `SECRET_KEY`            | Secret key for encryption/decryption          | ✅       |
| `WEBHOOK_URL`           | Production webhook URL (for deployment)       | ❌       |
| `ADMIN_ARRAY`           | Comma-separated admin Telegram usernames      | ❌       |
| `LOGGING_ENABLED`       | Enable/disable comprehensive logging          | ❌       |

### Getting API Keys

#### Telegram Bot Token

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot` and follow the prompts
3. Choose a unique name and username for your bot
4. Save the provided token to your `.env` file
5. Optionally set commands using `/setcommands` with BotFather

#### Google Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" and create a new project if needed
4. Generate an API key for Gemini AI
5. Add the key to your `.env` file

#### MongoDB Setup

1. Visit [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Set up database access credentials
4. Get the connection string and add to `.env`

## 🤖 Bot Commands

### User Commands

| Command            | Description                                |
| ------------------ | ------------------------------------------ |
| `/start`           | Initialize bot and show welcome message    |
| `/help`            | Display comprehensive help documentation   |
| `/about`           | Show bot information and developer details |
| `/contact`         | Get developer contact information          |
| `/feedback`        | Submit feedback to the development team    |
| `/remindme`        | Set smart reminders using natural language |
| `/imagine`         | Generate AI images from text descriptions  |
| `/clear`           | Clear your entire chat history             |
| `/current_mode`    | Check current session mode status          |
| `/temporary_start` | Start a temporary privacy-focused session  |
| `/temporary_end`   | End temporary session and clear data       |

### Admin Commands

| Command                 | Description                               |
| ----------------------- | ----------------------------------------- |
| `/sendUpdateToAllUsers` | Broadcast message to all registered users |

### Natural Language Features

- **Smart Reminders**: "Remind me to take medicine in 30 minutes"
- **Creative Requests**: "Imagine a futuristic city at sunset"
- **Casual Conversations**: Just chat naturally with the AI assistant

## 🛠️ Technical Architecture

### Core Technologies

- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **AI Integration**: Google Gemini 2.0 Flash & Experimental models
- **Bot Framework**: Telegraf for Telegram Bot API
- **Natural Language Processing**: Chrono-node for time parsing
- **Task Scheduling**: Node-cron for reminder system
- **Package Manager**: PNPM for efficient dependency management

### Key Features Implementation

#### Session Management

- Persistent and temporary chat modes
- Separate conversation histories stored in MongoDB
- Automatic session expiry for privacy-focused interactions

#### Reminder System

- Natural language time parsing using Chrono-node
- Cron-job based automated reminder delivery
- MongoDB persistence for reliability

#### AI Integration

- Multiple Gemini models for different use cases
- Search grounding for enhanced accuracy
- Image generation capabilities with base64 handling

## 👨‍💻 Developer

**Dev Trivedi**

- 🔗 LinkedIn: [contact-devtrivedi](https://in.linkedin.com/in/contact-devtrivedi)
- 💻 GitHub: [@IamDevTrivedi](https://github.com/IamDevTrivedi)
- 🌐 Portfolio: [dev-trivedi.me](https://www.dev-trivedi.me)

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for powering the intelligent conversations and image generation
- [Telegraf](https://telegraf.js.org/) for the excellent Telegram Bot framework
- [MongoDB](https://www.mongodb.com/) for reliable and scalable data storage
- [Express.js](https://expressjs.com/) for the robust and minimal web framework
- [Chrono-node](https://github.com/wanasit/chrono) for intelligent natural language date parsing
- [AI SDK](https://sdk.vercel.ai/) for streamlined AI integration
- [Node-cron](https://github.com/node-cron/node-cron) for reliable task scheduling

## Support & Contributing

### Getting Help

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/IamDevTrivedi/Talkasauras-Bot/issues) section
2. Contact via [LinkedIn](https://in.linkedin.com/in/contact-devtrivedi)
3. Use the `/feedback` command within the bot
4. Visit the [Portfolio](https://www.dev-trivedi.me) for more projects

---

<div align="center">
  <b>Made with ❤️ by Dev Trivedi</b>
  <br>
  <sub>If this project helped you, please consider giving it a ⭐!</sub>
</div>
