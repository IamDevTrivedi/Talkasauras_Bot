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
- **Health Monitoring**: Comprehensive system health endpoints
- **Admin Authentication**: Username-based admin verification system

### 📊 Health Monitoring & API

- **Express.js Server**: Robust web server with health check endpoints
- **Basic Health Check**: `/health` - Simple status verification
- **Detailed Health Check**: `/health/detailed` - System uptime, memory, and CPU information
- **Memory Monitoring**: `/health/memory` - Real-time memory usage statistics
- **Database Health**: `/health/database` - MongoDB connection status and details

### 🎨 Enhanced User Experience

- **Visual Formatting**: Clean, professional message layouts with dividers and spacing
- **Interactive Buttons**: Inline keyboards for external links (LinkedIn, GitHub, Portfolio)
- **Typing Indicators**: Real-time typing status for natural conversation flow
- **Error Handling**: Graceful error management with user-friendly messages
- **Logging System**: Comprehensive logging with configurable levels
- **Media Support**: Proper handling of unsupported media types with helpful responses

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

### Health Check Endpoints

Once running, you can monitor the bot's health:

- **Basic Health**: `http://localhost:5000/health`
- **Detailed Health**: `http://localhost:5000/health/detailed`
- **Memory Usage**: `http://localhost:5000/health/memory`
- **Database Status**: `http://localhost:5000/health/database`

## 🔧 Configuration Guide

### Environment Variables

| Variable                | Description                                  | Required |
| ----------------------- | -------------------------------------------- | -------- |
| `GOOGLE_GEMINI_API_KEY` | Google Gemini API key for AI functionality   | ✅       |
| `ENVIRONMENT`           | Runtime environment (production/development) | ✅       |
| `PORT_PROD`             | Production server port                       | ✅       |
| `PORT_DEV`              | Development server port                      | ✅       |
| `TELEGRAM_BOT_TOKEN`    | Bot token from @BotFather                    | ✅       |
| `WEBHOOK_URL`           | Production webhook URL (for deployment)      | ⚠️       |
| `MASTER_ADMIN`          | Primary admin Telegram username (without @)  | ✅       |
| `ADMIN_ARRAY`           | Comma-separated admin Telegram usernames     | ❌       |
| `LOGGING_ENABLED`       | Enable/disable comprehensive logging         | ❌       |
| `MONGODB_URL`           | MongoDB connection string                    | ✅       |

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

#### Health Monitoring

- Express.js REST API for system monitoring
- Memory, CPU, and database health checks
- Production-ready monitoring endpoints

## 🏗️ Project Structure

```
Talkasauras_Bot/
├── 📁 config.js              # Environment variables configuration
├── 📁 index.js               # Main application entry point
├── 📁 package.json           # Project dependencies and scripts
├── 📁 pnpm-lock.yaml         # Package manager lock file
├── 📁 README.md              # Project documentation
├── 📁 TODO.txt               # Development roadmap
├── 📁 controllers/
│   └── health.controller.js  # Health check endpoints controller
├── 📁 db/
│   └── connect.db.js         # MongoDB connection setup
├── 📁 models/
│   ├── chat.model.js         # User chat and session data schema
│   ├── feedback.model.js     # User feedback storage schema
│   └── reminder.model.js     # Reminder system data schema
├── 📁 routes/
│   └── health.route.js       # Health monitoring API routes
├── 📁 test-files/
│   ├── chrono.js             # Natural language time parsing tests
│   └── vercel-sdk.js         # AI SDK testing utilities
└── 📁 utils/
    ├── chrono.utils.js       # Reminder parsing and handling logic
    ├── gemini.utils.js       # Google Gemini AI integration
    ├── jobs.utils.js         # Cron job scheduler for reminders
    ├── logger.utils.js       # Comprehensive logging system
    └── telegram.utils.js     # Telegram bot initialization and handlers
```

## 👨‍💻 Developer

**Dev Trivedi**

- 🔗 LinkedIn: [contact-devtrivedi](https://in.linkedin.com/in/contact-devtrivedi)
- 💻 GitHub: [@IamDevTrivedi](https://github.com/IamDevTrivedi)
- 🌐 Portfolio: [dev-trivedi.me](https://www.dev-trivedi.me)

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**

    ```bash
    # Set production environment
    ENVIRONMENT=production
    ```

2. **Database Configuration**

    - Use MongoDB Atlas for production
    - Set up proper database indexes
    - Configure connection pooling

3. **Webhook Configuration**

    ```bash
    # Set your production webhook URL
    WEBHOOK_URL=https://yourdomain.com/webhook
    ```

4. **Health Monitoring**
    - Monitor `/health` endpoints
    - Set up alerts for system health
    - Monitor memory and database status

### Development

```bash
# Install dependencies
pnpm install

# Start development server with auto-restart
npm run dev

# Format code
npm run format
```

## 🔄 Roadmap

### Current Features ✅

- [x] AI-powered conversations with Google Gemini 2.0 Flash
- [x] Smart reminder system with natural language processing
- [x] AI image generation capabilities
- [x] Advanced session management (persistent & temporary)
- [x] Comprehensive health monitoring API
- [x] Admin broadcast system
- [x] User feedback collection

### Planned Features 🔮

- [ ] Redis caching for improved performance
- [ ] Webhook integration for production deployment
- [ ] Advanced analytics and user insights
- [ ] Multi-language support
- [ ] Voice message processing
- [ ] Calendar integration for reminders
- [ ] Custom AI personality settings

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for powering the intelligent conversations and image generation
- [Telegraf](https://telegraf.js.org/) for the excellent Telegram Bot framework
- [MongoDB](https://www.mongodb.com/) for reliable and scalable data storage
- [Express.js](https://expressjs.com/) for the robust and minimal web framework
- [Chrono-node](https://github.com/wanasit/chrono) for intelligent natural language date parsing
- [AI SDK](https://sdk.vercel.ai/) for streamlined AI integration
- [Node-cron](https://github.com/node-cron/node-cron) for reliable task scheduling

## � License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Support & Contributing

### Getting Help

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/IamDevTrivedi/Talkasauras-Bot/issues) section
2. Contact via [LinkedIn](https://in.linkedin.com/in/contact-devtrivedi)
3. Use the `/feedback` command within the bot
4. Visit the [Portfolio](https://www.dev-trivedi.me) for more projects

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and formatting
- Use meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed
- Ensure all health checks pass

---

<div align="center">
  <b>Made with ❤️ by Dev Trivedi</b>
  <br>
  <sub>If this project helped you, please consider giving it a ⭐!</sub>
</div>
