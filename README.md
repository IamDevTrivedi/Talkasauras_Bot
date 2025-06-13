# 🦕 Talkasauras - AI Telegram Bot

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)

A sophisticated AI-powered Telegram bot built with Google's Gemini AI, designed to provide intelligent support, personalized guidance, and engaging conversation experiences.

## ✨ Features

### 🤖 AI-Powered Conversations

- **Google Gemini Integration**: Leverages Google's advanced Gemini AI for intelligent responses
- **Context-Aware Chat**: Maintains conversation history for coherent, contextual interactions
- **Real-time Responses**: Fast and accurate AI-generated replies to user queries

### 💾 Smart Session Management

- **Persistent Sessions**: Standard chat mode with conversation history storage
- **Temporary Sessions**: Privacy-focused temporary chats with auto-expiry (5 minutes)
- **Session Switching**: Easy toggle between standard and temporary modes
- **Data Control**: Complete chat history clearing functionality

### 🛠️ Rich Command Set

- `/start` - Initialize conversation with personalized welcome
- `/help` - Comprehensive command guide with visual formatting
- `/about` - Bot information with developer links
- `/contact` - Direct access to developer contact information
- `/feedback` - User feedback collection system
- `/clear` - Complete chat history reset
- `/current_mode` - Session status checker
- `/temporary_start` - Begin privacy-focused temporary session
- `/temporary_end` - End temporary session with data cleanup

### 🔧 Admin Features

- **Broadcast System**: Admin-only mass messaging to all users
- **User Management**: Complete user database tracking
- **Feedback Monitoring**: Centralized feedback collection and storage

### 🎨 User Experience

- **Visual Formatting**: Clean, professional message layouts with dividers and spacing
- **Interactive Buttons**: Inline keyboard for external links (LinkedIn, GitHub)
- **Typing Indicators**: Real-time typing status for natural conversation flow
- **Error Handling**: Graceful error management with user-friendly messages

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB database
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- Google Gemini API Key

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/IamDevTrivedi/Talkasauras-Bot.git
    cd Talkasauras-Bot
    ```

2. **Install dependencies**

    ```bash
    npm install
    # or using pnpm
    pnpm install
    ```

3. **Environment Configuration**

    Create a `.env` file in the root directory:

    ```env
    # Bot Configuration
    TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
    GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

    # Database
    MONGODB_URL=mongodb://localhost:27017/talkasauras

    # Server Configuration
    ENVIRONMENT=development
    PORT_DEV=3000
    PORT_PROD=8080

    # Admin Configuration
    ADMIN_USERNAME=your_telegram_username

    # Optional
    WEBHOOK_URL=your_webhook_url_for_production
    LOGGING_ENABLED=true
    ```

4. **Start the application**
    ```bash
    npm start
    # or
    node index.js
    ```

## 📁 Project Structure

```
Talkasauras-Bot/
├── 📁 controllers/          # Request handlers
│   └── health.controller.js
├── 📁 db/                   # Database configuration
│   └── connect.db.js
├── 📁 models/               # MongoDB schemas
│   ├── chat.model.js
│   └── feedback.model.js
├── 📁 routes/               # API routes
│   └── health.route.js
├── 📁 utils/                # Utility functions
│   ├── gemini.utils.js      # AI integration
│   ├── logger.utils.js      # Logging system
│   └── telegram.utils.js    # Bot logic
├── config.js                # Environment configuration
├── index.js                 # Application entry point
└── package.json
```

## 🔧 Configuration Guide

### Environment Variables

| Variable                | Description               |
| ----------------------- | ------------------------- |
| `TELEGRAM_BOT_TOKEN`    | Bot token from @BotFather |
| `GOOGLE_GEMINI_API_KEY` | Google Gemini API key     |
| `MONGODB_URL`           | MongoDB connection string |
| `ENVIRONMENT`           | Runtime environment       |
| `PORT_DEV`              | Development server port   |
| `PORT_PROD`             | Production server port    |
| `ADMIN_USERNAME`        | Telegram admin username   |
| `WEBHOOK_URL`           | Production webhook URL    |
| `LOGGING_ENABLED`       | Enable/disable logging    |

### Getting API Keys

#### Telegram Bot Token

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot` and follow the prompts
3. Save the provided token to your `.env` file

#### Google Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new project or select existing one
3. Generate an API key
4. Add the key to your `.env` file

## 💾 Database Schema

### Chat Model

```javascript
{
  firstName: String,           // User's first name
  userName: String,            // Telegram username
  telegramId: Number,          // Unique Telegram user ID
  chatHistory: [Message],      // Persistent conversation history
  temporaryChatHistory: [Message], // Temporary session messages
  lastMessageAt: Date,         // Last activity timestamp
  isTemporary: Boolean         // Current session type
}
```

### Feedback Model

```javascript
{
  telegramId: String,          // User identifier
  feedback: String,            // User feedback content
  checked: Boolean,            // Admin review status
  createdAt: Date,            // Submission timestamp
  updatedAt: Date             // Last modification
}
```

## 👨‍💻 Developer

**Dev Trivedi**

- 🔗 LinkedIn: [contact-devtrivedi](https://in.linkedin.com/in/contact-devtrivedi)
- 💻 GitHub: [@IamDevTrivedi](https://github.com/IamDevTrivedi)

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for powering the intelligent conversations
- [Telegraf](https://telegraf.js.org/) for the excellent Telegram Bot framework
- [MongoDB](https://www.mongodb.com/) for reliable data storage
- [Express.js](https://expressjs.com/) for the robust web framework

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/IamDevTrivedi/Talkasauras-Bot/issues) section
2. Contact via [LinkedIn](https://in.linkedin.com/in/contact-devtrivedi)
3. Use the `/feedback` command within the bot

---

<div align="center">
  <b>Made with ❤️ by Dev Trivedi</b>
  <br>
  <sub>If this project helped you, please consider giving it a ⭐!</sub>
</div>
