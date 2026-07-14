# MESOB Shashemene Professional Telegram Bot 🏛️

A professional, production-ready multilingual Telegram bot for MESOB (Ministry of Electronic Services and Operations Bureau) Shashemene, providing digital access to 130+ government services across 12 service pods.

## 🌟 Features

### 🌍 Multilingual Support

- **English** - Full interface support
- **አማርኛ (Amharic)** - Complete localization
- **Afaan Oromo** - Native language support
- Dynamic language switching with instant UI updates

### 🏛️ 12 Service Pods (130+ Services)

- **Pod 1: Identity Documents** - National ID, Passport services
- **Pod 2: Commercial Registration** - Business licenses, Cooperatives
- **Pod 3: Business Services** - Investment, Revenue services
- **Pod 4: Banking Services** - Bank services, Microfinance
- **Pod 5: Land Services** - Land registration, Urban planning
- **Pod 6: Investment Services** - Investment permits, licenses
- **Pod 7: Document Services** - Document authentication, Vital registration
- **Pod 8: License Services** - Driving licenses, Professional licenses
- **Pod 9: Administrative Services** - Civil status, Social services
- **Pod 10: Quality Assurance** - Certification, Inspection
- **Pod 11: Construction Services** - Construction permits, Sanitation
- **Pod 12: Special Services** - Elections, Special cases

### 🤖 Professional Features

- **Modern UI/UX** - Professional inline keyboards and intuitive navigation
- **Service Pod Structure** - Organized like MESOB website
- **Application Tracking** - Real-time status updates with tracking numbers
- **User Registration** - Simple phone-based registration
- **Admin Dashboard** - Comprehensive admin panel for management
- **Database Integration** - MongoDB support with fallback to memory storage
- **Error Handling** - Robust error handling and logging
- **Session Management** - Efficient user state management

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- MongoDB (optional, falls back to memory storage)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd mesob_bot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env and add your bot token
   BOT_TOKEN=your_telegram_bot_token_here
   MONGODB_URI=mongodb://localhost:27017/mesob_bot  # Optional
   ```

4. **Start the bot**

   ```bash
   npm start
   ```

   For development with auto-reload:

   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
mesob_bot/
├── bot.js                      # Main bot application
├── package.json               # Dependencies and scripts
├── .env                      # Environment configuration
├── src/
│   ├── config/
│   │   └── languages.js      # Translation dictionary
│   ├── database/
│   │   └── db.js             # Database connection and operations
│   ├── services/
│   │   ├── adminService.js   # Admin dashboard operations
│   │   ├── applicationService.js  # Application form handling
│   │   └── smsService.js     # SMS validation services
│   └── utils/
│       ├── keyboards.js      # Dynamic keyboard generation
│       └── userState.js      # User session management
└── README.md                 # This file
```

## 📋 Bot Commands

|| Command     | Description                           |
|| ----------- | ------------------------------------- |
|| `/start`    | Initialize bot and language selection |
|| `/help`     | Show help information and features    |
|| `/menu`     | Return to main menu                   |

## 🎯 Usage Flow

1. **Start**: User sends `/start` command
2. **Language Selection**: Choose from English, Amharic, or Afaan Oromo
3. **Main Menu**: Navigate through service pods using keyboard buttons
4. **Service Selection**: Choose a service pod and select specific service
5. **Service Information**: Get detailed info about government services
6. **Application**: Submit applications with tracking numbers
7. **Application Tracking**: Enter reference numbers to track status
8. **Multi-language**: Switch languages anytime

## 🛠️ Configuration

### Environment Variables

```env
# Required
BOT_TOKEN=your_telegram_bot_token_here

# Optional
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mesob_bot
ADMIN_EMAIL=admin@mesob.gov.et
ADMIN_PASSWORD=your_admin_password
```

### Adding New Services

To add new services to service pods:

1. **Update service pods in `bot.js`**:

   ```javascript
   const servicePods = {
       'pod1': {
           name: 'Identity Documents',
           emoji: '🆔',
           services: ['national_id', 'passport', 'new_service'],
           description: 'Kenna Ragaalee Bu\'uuraa'
       }
   };
   ```

2. **Add service details**:

   ```javascript
   const services = {
       'new_service': {
           name: 'New Service',
           emoji: '🔧',
           description: 'Service description',
           processingTime: '3-5 days',
           fee: '100 ETB',
           documents: 'Required documents',
           pod: 'pod1'
       }
   };
   ```

3. **Add form requirements in `applicationService.js`**

## 🔧 Development

### Code Style

- Clean, modular architecture
- Comprehensive error handling
- Detailed logging for debugging
- Scalable user state management
- Professional UI/UX patterns

### Key Principles

- **No hardcoded text** - All strings use translation system
- **Dynamic keyboards** - All UI elements adapt to selected language
- **Graceful fallbacks** - English used when translations missing
- **Memory efficient** - Automatic cleanup of inactive user sessions
- **Professional design** - Modern inline keyboards and intuitive navigation

### Testing

```bash
# Start bot in development mode
npm run dev

# Test with your Telegram account
# Send /start to your bot
```

## 📊 Monitoring

The bot includes built-in statistics and monitoring:

- **User Statistics**: Total users, language breakdown
- **Application Tracking**: Status and progress monitoring
- **Admin Dashboard**: Comprehensive management interface
- **Error Logging**: Comprehensive error tracking
- **Database Statistics**: Storage and performance metrics

Access admin features by logging in with `email:password` format.

## 🚀 Deployment

### Local Deployment

```bash
npm start
```

### Production Deployment

1. **Environment Setup**:

   ```bash
   NODE_ENV=production
   BOT_TOKEN=your_production_token
   MONGODB_URI=your_production_mongodb_uri
   ```

2. **Process Management** (using PM2):

   ```bash
   npm install -g pm2
   pm2 start bot.js --name "mesob-bot"
   pm2 startup
   pm2 save
   ```

3. **Docker** (optional):
   ```dockerfile
   FROM node:16-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   CMD ["npm", "start"]
   ```

## 🔮 Professional Features

### Current Implementation

- ✅ **12 Service Pods** matching MESOB website structure
- ✅ **130+ Services** across all service pods
- ✅ **Professional UI/UX** with inline keyboards
- ✅ **Multilingual Support** (English, Amharic, Afaan Oromo)
- ✅ **Application Tracking** with unique tracking numbers
- ✅ **User Registration** with phone verification
- ✅ **Admin Dashboard** for comprehensive management
- ✅ **Database Integration** with MongoDB support
- ✅ **Error Handling** and logging
- ✅ **Session Management** for user states

### Scalability

- **MongoDB Integration** - Scalable database storage
- **Memory Fallback** - Works without database
- **Efficient State Management** - Automatic cleanup
- **Modular Architecture** - Easy to extend
- **Professional Code Structure** - Maintainable and scalable

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Guidelines

- Follow existing code style
- Add translations for new features
- Test with all supported languages
- Update documentation
- Maintain professional UI/UX standards

## 📞 Support

- **Technical Issues**: Create GitHub issue
- **MESOB Services**: Visit [https://mesobshashe.gov.et](https://mesobshashe.gov.et)
- **Bot Support**: Contact support@mesobshashe.gov.et
- **Phone**: +251 913 116898

## 📄 License

MIT License - See LICENSE file for details