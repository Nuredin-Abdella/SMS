/**
 * MESOB Shashemene Telegram Bot - Professional Version
 * 
 * Modern, professional bot matching MESOB website functionality
 * - English, Amharic, and Afaan Oromo support
 * - 12 Service Pods matching MESOB structure
 * - Professional UI/UX with inline keyboards
 * - Advanced features: ratings, feedback, notifications
 */

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const https = require('https');
const fs = require('fs');

// Validate token
if (!process.env.BOT_TOKEN) {
    console.error('❌ BOT_TOKEN is required in .env file');
    process.exit(1);
}

console.log('🤖 MESOB Shashemene Professional Bot Starting...');

// Configure HTTPS agent with custom CA certificate if available
let httpsAgent;
if (process.env.NODE_EXTRA_CA_CERTS && fs.existsSync(process.env.NODE_EXTRA_CA_CERTS)) {
    httpsAgent = new https.Agent({
        ca: fs.readFileSync(process.env.NODE_EXTRA_CA_CERTS),
        family: 4
    });
    console.log('✅ Using custom SSL certificate');
}

// Create bot with custom agent
const botOptions = { polling: false };
if (httpsAgent) {
    botOptions.request = { agent: httpsAgent };
}

const bot = new TelegramBot(process.env.BOT_TOKEN, botOptions);

// Import utilities
const { getTranslation } = require('./src/config/languages');
const {
    getUserLanguage, setUserLanguage,
    setRegistrationStep, getRegistrationStep,
    setRegistrationData, getRegistrationData, clearRegistrationData,
    setAdminStatus, isAdmin, setAdminStep, getAdminStep,
    initializeUserStateManager
} = require('./src/utils/userState');
const {
    createMainMenuKeyboard, createServicesKeyboard,
    createLanguageKeyboard, createAdminDashboardKeyboard,
    createServicePodsKeyboard, createInlineServiceKeyboard
} = require('./src/utils/keyboards');
const smsService = require('./src/services/smsService');
const database = require('./src/database/db');
const applicationService = require('./src/services/applicationService');
const adminService = require('./src/services/adminService');

// Initialize services
database.initialize();
initializeUserStateManager();

console.log('✅ All modules loaded successfully');

// Service Pods matching MESOB website structure (12 Foddaalee)
const servicePods = {
    'pod1': {
        name: 'Identity Documents',
        emoji: '🆔',
        services: ['national_id', 'passport'],
        description: 'Kenna Ragaalee Bu\'uuraa'
    },
    'pod2': {
        name: 'Commercial Registration',
        emoji: '🏢',
        services: ['business_license', 'cooperatives'],
        description: 'Sassaabbii Galii fi Simannaa'
    },
    'pod3': {
        name: 'Business Services',
        emoji: '💼',
        services: ['investment', 'revenue'],
        description: 'Tajaajila Hayyamaa Daldala'
    },
    'pod4': {
        name: 'Banking Services',
        emoji: '🏦',
        services: ['bank_services', 'microfinance'],
        description: 'Tajaajila Baankii Idilee'
    },
    'pod5': {
        name: 'Land Services',
        emoji: '🏠',
        services: ['land', 'urban_planning'],
        description: 'Kenna Tajaajila Lafaa'
    },
    'pod6': {
        name: 'Investment Services',
        emoji: '📈',
        services: ['investment_permit', 'investment_license'],
        description: 'Kenna Tajaajila Investimentii'
    },
    'pod7': {
        name: 'Document Services',
        emoji: '📄',
        services: ['document_auth', 'vital_registration'],
        description: 'Tajaajila Sanadootaa fi Waliigaltee'
    },
    'pod8': {
        name: 'License Services',
        emoji: '📋',
        services: ['driving_license', 'professional_license'],
        description: 'Kenna Xalayaa Deggersa'
    },
    'pod9': {
        name: 'Administrative Services',
        emoji: '📝',
        services: ['civil_status', 'social'],
        description: 'Tajaajiloota Dhimmoota Bulchiinsaa'
    },
    'pod10': {
        name: 'Quality Assurance',
        emoji: '✅',
        services: ['certification', 'inspection'],
        description: 'Mirkaneessa Gahuumsa Ogummaa'
    },
    'pod11': {
        name: 'Construction Services',
        emoji: '🏗️',
        services: ['construction', 'sanitation'],
        description: 'Hayyamaa Ogummaa fi Ijaarsaa'
    },
    'pod12': {
        name: 'Special Services',
        emoji: '⭐',
        services: ['elections', 'special_cases'],
        description: 'Kaffaltii Adda Addaa'
    }
};

// Detailed service information
const services = {
    'national_id': {
        name: 'National ID',
        emoji: '🆔',
        description: 'Ethiopian national ID card issuance and renewal',
        processingTime: '3-5 days',
        fee: '100 ETB',
        documents: 'Birth certificate, Photos, Previous ID (if renewal)',
        pod: 'pod1'
    },
    'passport': {
        name: 'Passport',
        emoji: '🛂',
        description: 'Ethiopian passport issuance and renewal',
        processingTime: '7-14 days',
        fee: '500-1000 ETB',
        documents: 'ID, Photos, Birth certificate, Previous passport (if renewal)',
        pod: 'pod1'
    },
    'business_license': {
        name: 'Business License',
        emoji: '🏢',
        description: 'New business license registration and renewal',
        processingTime: '5-7 days',
        fee: '500 ETB',
        documents: 'Business plan, ID, Tax clearance',
        pod: 'pod2'
    },
    'cooperatives': {
        name: 'Cooperatives',
        emoji: '🤝',
        description: 'Cooperative formation and registration',
        processingTime: '7-10 days',
        fee: '300 ETB',
        documents: 'Bylaws, Member list, ID',
        pod: 'pod2'
    },
    'investment': {
        name: 'Investment',
        emoji: '💼',
        description: 'Investment permit and licensing services',
        processingTime: '5-7 days',
        fee: '200 ETB',
        documents: 'Business plan, Investment proof, ID',
        pod: 'pod3'
    },
    'revenue': {
        name: 'Revenue Services',
        emoji: '💰',
        description: 'Tax registration and certificate services',
        processingTime: '2-3 days',
        fee: '25 ETB',
        documents: 'ID, Business license',
        pod: 'pod3'
    },
    'vital_registration': {
        name: 'Vital Registration',
        emoji: '📋',
        description: 'Birth, death, marriage, and divorce registration',
        processingTime: '2-3 days',
        fee: '50 ETB',
        documents: 'Birth certificate, ID, Photos',
        pod: 'pod7'
    },
    'civil_status': {
        name: 'Civil Status',
        emoji: '👤',
        description: 'Civil status documentation and updates',
        processingTime: '3-5 days',
        fee: '100 ETB',
        documents: 'ID, Photos, Previous certificates',
        pod: 'pod9'
    },
    'land': {
        name: 'Land Services',
        emoji: '🏠',
        description: 'Land registration and title services',
        processingTime: '10-14 days',
        fee: '1000 ETB',
        documents: 'Land deed, ID, Survey map',
        pod: 'pod5'
    },
    'document_auth': {
        name: 'Document Auth',
        emoji: '📄',
        description: 'Document authentication and notarization',
        processingTime: '1-2 days',
        fee: '50 ETB',
        documents: 'Original documents, ID',
        pod: 'pod7'
    },
    'transport': {
        name: 'Transport',
        emoji: '🚗',
        description: 'Transport and vehicle licensing services',
        processingTime: '3-5 days',
        fee: '150 ETB',
        documents: 'Vehicle registration, ID, Insurance',
        pod: 'pod8'
    },
    'construction': {
        name: 'Construction',
        emoji: '🏗️',
        description: 'Construction permits and inspections',
        processingTime: '7-10 days',
        fee: '500 ETB',
        documents: 'Building plan, Land deed, ID',
        pod: 'pod11'
    },
    'sanitation': {
        name: 'Sanitation',
        emoji: '🧹',
        description: 'Sanitation and environmental health services',
        processingTime: '2-3 days',
        fee: '75 ETB',
        documents: 'ID, Property documents',
        pod: 'pod11'
    },
    'social': {
        name: 'Social Services',
        emoji: '🛎️',
        description: 'Social services and support programs',
        processingTime: '3-5 days',
        fee: 'Free',
        documents: 'ID, Income proof',
        pod: 'pod9'
    },
    'urban_planning': {
        name: 'Urban Planning',
        emoji: '🗺️',
        description: 'Urban planning and zoning services',
        processingTime: '5-7 days',
        fee: '200 ETB',
        documents: 'Land deed, ID, Site plan',
        pod: 'pod5'
    },
    'elections': {
        name: 'Elections',
        emoji: '🗳️',
        description: 'Voter registration and election services',
        processingTime: '1-2 days',
        fee: 'Free',
        documents: 'ID, Address proof',
        pod: 'pod12'
    }
};

/**
 * Error handlers
 */
bot.on('polling_error', (error) => {
    console.error('❌ Polling error:', error.message);
    if (error.code === 'EFATAL') {
        console.log('🔄 Fatal error detected. Attempting restart in 5 seconds...');
        setTimeout(() => process.exit(1), 5000);
    }
});

/**
 * Handle callback queries (inline keyboard interactions)
 */
bot.on('callback_query', async (query) => {
    try {
        const chatId = query.message.chat.id;
        const data = query.data;
        const userLang = getUserLanguage(chatId) || 'en';

        console.log(`🔘 Callback: ${data} from user ${chatId}`);

        // Handle service pod selection
        if (data.startsWith('pod_')) {
            const podId = data.replace('pod_', '');
            const pod = servicePods[podId];

            if (pod) {
                await bot.answerCallbackQuery(query.id);
                const podServices = pod.services.map(s => services[s]).filter(Boolean);

                if (podServices.length > 0) {
                    const inlineKeyboard = createInlineServiceKeyboard(podServices);
                    await bot.sendMessage(chatId,
                        `${pod.emoji} ${pod.name}\n\n${pod.description}\n\nSelect a service:`,
                        { reply_markup: inlineKeyboard }
                    );
                } else {
                    await bot.sendMessage(chatId, 'Services coming soon for this pod.');
                }
            }
        }

        // Handle service pod button clicks from inline keyboard
        const podNames = Object.values(servicePods).map(p => p.name);
        if (podNames.includes(data)) {
            const pod = Object.values(servicePods).find(p => p.name === data);
            if (pod) {
                await bot.answerCallbackQuery(query.id);
                const podServices = pod.services.map(s => services[s]).filter(Boolean);

                if (podServices.length > 0) {
                    const inlineKeyboard = createInlineServiceKeyboard(podServices);
                    await bot.sendMessage(chatId,
                        `${pod.emoji} ${pod.name}\n\n${pod.description}\n\nSelect a service:`,
                        { reply_markup: inlineKeyboard }
                    );
                } else {
                    await bot.sendMessage(chatId, 'Services coming soon for this pod.');
                }
            }
        }

        // Handle service selection
        if (data.startsWith('service_')) {
            const serviceName = data.replace('service_', '').replace(/_/g, ' ');
            const service = Object.values(services).find(s => s.name.toLowerCase() === serviceName.toLowerCase());

            if (service) {
                await bot.answerCallbackQuery(query.id);
                const user = await database.getUser(chatId);
                const isVerified = user && user.personalInfo && user.personalInfo.phoneVerified;

                const serviceDetails = `${service.emoji} ${service.name}\n\n` +
                    `📝 ${service.description}\n\n` +
                    `⏱️ Processing Time: ${service.processingTime}\n` +
                    `💰 Fee: ${service.fee}\n` +
                    `📄 Required Documents: ${service.documents}\n\n` +
                    `🏢 Visit MESOB office with required documents.\n` +
                    `📞 For inquiries: +251 913 116898\n` +
                    `🌐 Visit: mesobshashe.gov.et`;

                await bot.sendMessage(chatId, serviceDetails);

                if (isVerified) {
                    setTimeout(async () => {
                        const serviceKey = Object.keys(services).find(key => services[key].name === service.name);
                        const appStart = applicationService.startApplication(chatId, userLang, serviceKey);
                        await bot.sendMessage(chatId, appStart.firstPrompt);
                    }, 2000);
                } else {
                    setTimeout(async () => {
                        await bot.sendMessage(chatId, '📱 Please register first to apply for this service.\n\nEnter your phone number:');
                    }, 2000);
                }
            }
        }

        // Handle back to menu
        if (data === 'back_to_menu') {
            await bot.answerCallbackQuery(query.id);
            const keyboard = createMainMenuKeyboard(userLang);
            return await bot.sendMessage(chatId, '🏠 Main Menu', { reply_markup: keyboard });
        }

        // Handle language selection
        if (data.startsWith('lang_')) {
            const lang = data.replace('lang_', '');
            const langNames = { 'en': '🇺🇸 English', 'am': '🇪🇹 አማርኛ', 'om': '🇪🇹 Afaan Oromo' };

            setUserLanguage(chatId, lang);
            await bot.answerCallbackQuery(query.id);
            await bot.sendMessage(chatId, `✅ Language set to ${langNames[lang]}`);

            const keyboard = createMainMenuKeyboard(lang);
            await bot.sendMessage(chatId, '🏠 Main Menu', { reply_markup: keyboard });
        }

    } catch (error) {
        console.error('❌ Error handling callback:', error);
        await bot.answerCallbackQuery(query.id, { text: 'An error occurred', show_alert: true });
    }
});

/**
 * Handle all text messages
 */
bot.on('message', async (msg) => {
    try {
        if (!msg.text) return;

        const chatId = msg.chat.id;
        const text = msg.text;
        const userLang = getUserLanguage(chatId) || 'en';

        // Set default language if not set
        if (!getUserLanguage(chatId)) {
            setUserLanguage(chatId, 'en');
        }

        console.log(`👤 User ${msg.from.first_name || 'Unknown'}: "${text}"`);

        // Handle commands
        if (text.startsWith('/')) {
            switch (text) {
                case '/start':
                    setUserLanguage(chatId, 'en');
                    const keyboard = createLanguageKeyboard();
                    await bot.sendMessage(chatId,
                        '🏛️ Welcome to MESOB Shashemene!\n\n' +
                        'Your digital gateway to government services.\n\n' +
                        'Please select your preferred language:',
                        { reply_markup: keyboard }
                    );
                    return;

                case '/help':
                    const helpText = `🤖 MESOB Bot Help\n\n` +
                        `📋 Available Commands:\n` +
                        `/start - Start the bot\n` +
                        `/help - Show this help\n` +
                        `/menu - Main menu\n\n` +
                        `🎯 Features:\n` +
                        `• 12 Service Pods with 130+ services\n` +
                        `• Application tracking\n` +
                        `• Multilingual support\n` +
                        `• Professional UI/UX\n\n` +
                        `📞 Support: +251 913 116898\n` +
                        `🌐 Website: mesobshashe.gov.et`;
                    return await bot.sendMessage(chatId, helpText);

                case '/menu':
                    const menuKeyboard = createMainMenuKeyboard(userLang);
                    return await bot.sendMessage(chatId, '🏠 Main Menu', { reply_markup: menuKeyboard });

                default:
                    await bot.sendMessage(chatId, "❓ Unknown command. Type /help to see available commands.");
                    return;
            }
        }

        // Handle language selection
        if (['🇺🇸 English', '🇪🇹 አማርኛ', '🇪🇹 Afaan Oromo'].includes(text)) {
            const langMap = { '🇺🇸 English': 'en', '🇪ᇹ አማርኛ': 'am', '🇪ᇹ Afaan Oromo': 'om' };
            const selectedLang = langMap[text];
            setUserLanguage(chatId, selectedLang);
            await bot.sendMessage(chatId, `✅ Language set to ${text}`);
            const keyboard = createMainMenuKeyboard(selectedLang);
            return await bot.sendMessage(chatId, '🏠 Main Menu', { reply_markup: keyboard });
        }

        // Handle main menu options
        if (text === '🏛️ Services') {
            const keyboard = createServicePodsKeyboard(userLang);
            return await bot.sendMessage(chatId,
                '🏛️ MESOB Service Pods\n\nSelect a service pod to explore:',
                { reply_markup: keyboard }
            );
        }

        // Handle service pod button clicks from main keyboard
        const podNames = Object.values(servicePods).map(p => p.name);
        if (podNames.includes(text)) {
            const pod = Object.values(servicePods).find(p => p.name === text);
            if (pod) {
                const podServices = pod.services.map(s => services[s]).filter(Boolean);

                if (podServices.length > 0) {
                    const inlineKeyboard = createInlineServiceKeyboard(podServices);
                    await bot.sendMessage(chatId,
                        `${pod.emoji} ${pod.name}\n\n${pod.description}\n\nSelect a service:`,
                        { reply_markup: inlineKeyboard }
                    );
                } else {
                    await bot.sendMessage(chatId, 'Services coming soon for this pod.');
                }
            }
            return;
        }

        if (text === '🔍 Track Application') {
            return await bot.sendMessage(chatId,
                '🔍 Track Application\n\nEnter your tracking number to check your application status:'
            );
        }

        if (text === '📋 My Applications') {
            const user = await database.getUser(chatId);
            if (!user || !user.personalInfo || !user.personalInfo.phoneVerified) {
                await bot.sendMessage(chatId, '📱 Please register first to access your applications.');
                setTimeout(() => {
                    const keyboard = createMainMenuKeyboard(userLang);
                    bot.sendMessage(chatId, '📱 Please enter your phone number to register:');
                }, 2000);
                return;
            }

            const applications = await database.getApplicationsByChatId(chatId);
            if (!applications || applications.length === 0) {
                return await bot.sendMessage(chatId, '📋 You have no applications yet.');
            }

            const appList = applications.map((app, index) =>
                `${index + 1}. ${app.service} - ${app.trackingNumber} (${app.status})`
            ).join('\n');

            return await bot.sendMessage(chatId, `📋 My Applications:\n\n${appList}`);
        }

        if (text === '📱 Register') {
            const user = await database.getUser(chatId);
            if (user && user.personalInfo && user.personalInfo.phoneVerified) {
                return await bot.sendMessage(chatId,
                    `✅ You are already registered!\n\nPhone: ${user.personalInfo.phoneNumber}\nName: ${user.personalInfo.fullName}`
                );
            }
            return await bot.sendMessage(chatId,
                '📱 Registration\n\nPlease enter your phone number (format: 0912345678 or +251912345678):'
            );
        }

        if (text === '❓ Help') {
            const helpText = `🤖 MESOB Bot Help\n\n` +
                `📋 Features:\n` +
                `• 🏛️ Access 12 service pods with 130+ services\n` +
                `• 🔍 Track applications\n` +
                `• 📱 Simple registration\n` +
                `• 🌐 Multilingual support\n` +
                `• ⭐ Professional UI/UX\n\n` +
                `📞 Support: +251 913 116898\n` +
                `🌐 Website: mesobshashe.gov.et`;
            await bot.sendMessage(chatId, helpText);
            setTimeout(() => {
                const keyboard = createMainMenuKeyboard(userLang);
                bot.sendMessage(chatId, '🏠 Main Menu', { reply_markup: keyboard });
            }, 3000);
            return;
        }

        if (text === '🌐 Language') {
            const keyboard = createLanguageKeyboard();
            return await bot.sendMessage(chatId, '🌐 Select Language:', { reply_markup: keyboard });
        }

        if (text === '🔙 Back to Menu') {
            const keyboard = createMainMenuKeyboard(userLang);
            return await bot.sendMessage(chatId, '🏠 Main Menu', { reply_markup: keyboard });
        }

        // Handle phone number input (registration)
        if (/^\d{9,15}$/.test(text.replace(/[^0-9]/g, ''))) {
            const phoneNumber = smsService.formatPhoneNumber(text);

            if (!smsService.validatePhoneNumber(phoneNumber)) {
                return await bot.sendMessage(chatId, '❌ Invalid phone number. Please try again:');
            }

            const existingUser = await database.getUserByPhoneNumber(phoneNumber);
            if (existingUser) {
                return await bot.sendMessage(chatId, `❌ This phone number is already registered.`);
            }

            setRegistrationStep(chatId, 'name');
            setRegistrationData(chatId, { phoneNumber });
            return await bot.sendMessage(chatId, '📝 Please enter your full name:');
        }

        // Handle registration flow
        const registrationStep = getRegistrationStep(chatId);
        if (registrationStep === 'name') {
            const regData = getRegistrationData(chatId);
            setRegistrationData(chatId, { ...regData, fullName: text });

            await database.saveUser({
                chatId,
                personalInfo: {
                    phoneNumber: regData.phoneNumber,
                    phoneVerified: true,
                    fullName: text
                }
            });

            clearRegistrationData(chatId);

            await bot.sendMessage(chatId,
                '✅ Registration completed successfully!\n\nYou can now access all MESOB services.'
            );

            setTimeout(() => {
                const keyboard = createMainMenuKeyboard(userLang);
                bot.sendMessage(chatId, '🏠 Main Menu', { reply_markup: keyboard });
            }, 2000);
            return;
        }

        // Handle application form steps
        if (applicationService.hasActiveApplication(chatId)) {
            const result = await applicationService.processApplicationStep(chatId, text, bot, getTranslation, userLang);

            if (result.success) {
                if (result.completed) {
                    await bot.sendMessage(chatId, result.message);
                    setTimeout(() => {
                        const keyboard = createMainMenuKeyboard(userLang);
                        bot.sendMessage(chatId, '🏠 Main Menu', { reply_markup: keyboard });
                    }, 3000);
                } else {
                    await bot.sendMessage(chatId, result.nextPrompt);
                }
            } else {
                await bot.sendMessage(chatId, `❌ ${result.error}`);
                setTimeout(() => {
                    const keyboard = createMainMenuKeyboard(userLang);
                    bot.sendMessage(chatId, '🏠 Main Menu', { reply_markup: keyboard });
                }, 2000);
            }
            return;
        }

        // Handle tracking number
        if (text.length >= 6 && /^[a-z0-9]+$/i.test(text)) {
            const application = await database.getApplication(text.toUpperCase());
            if (application) {
                const statusMessages = {
                    'submitted': '📝 Submitted - Under Review',
                    'pending': '⏳ Pending - Being Processed',
                    'approved': '✅ Approved - Ready for Collection',
                    'rejected': '❌ Rejected - Please Contact Office',
                    'in_progress': '🔄 In Progress - Additional Processing',
                    'completed': '🎉 Completed - Service Delivered'
                };

                const statusMessage = statusMessages[application.status] || application.status;

                const message = `📋 Application Status\n\n` +
                    `🔍 Tracking Number: ${application.trackingNumber}\n` +
                    `🏛️ Service: ${application.service}\n` +
                    `📊 Status: ${statusMessage}\n` +
                    `📅 Submitted: ${application.createdAt.toLocaleDateString()}\n` +
                    `🕐 Last Updated: ${application.updatedAt.toLocaleDateString()}\n\n` +
                    `📞 For inquiries: +251 913 116898\n` +
                    `🌐 Visit: mesobshashe.gov.et`;

                await bot.sendMessage(chatId, message);
            } else {
                await bot.sendMessage(chatId,
                    `❌ Application not found.\n\nPlease check your tracking number and try again.`
                );
            }
            setTimeout(() => {
                const keyboard = createMainMenuKeyboard(userLang);
                bot.sendMessage(chatId, '🏠 Main Menu', { reply_markup: keyboard });
            }, 4000);
            return;
        }

        // Handle greetings
        if (['hello', 'hi', 'ሰላም', 'akkam', 'nagaa'].includes(text.toLowerCase())) {
            await bot.sendMessage(chatId, '👋 Hello! Welcome to MESOB Shashemene.');
            setTimeout(() => {
                const keyboard = createMainMenuKeyboard(userLang);
                bot.sendMessage(chatId, '🏠 Main Menu', { reply_markup: keyboard });
            }, 1000);
            return;
        }

        // Handle admin login
        if (text.includes(':') && !isAdmin(chatId)) {
            const [email, password] = text.split(':');
            if (email && password) {
                const authResult = adminService.authenticate(email.trim(), password.trim());
                if (authResult.success) {
                    setAdminStatus(chatId, true);
                    setAdminStep(chatId, 'dashboard');
                    await bot.sendMessage(chatId, '✅ Admin login successful!');
                    const keyboard = createAdminDashboardKeyboard(userLang);
                    return await bot.sendMessage(chatId, '📊 Admin Dashboard', { reply_markup: keyboard });
                } else {
                    return await bot.sendMessage(chatId, '❌ Invalid credentials.');
                }
            }
        }

        // Handle admin dashboard
        if (isAdmin(chatId)) {
            const adminStep = getAdminStep(chatId);
            if (adminStep === 'dashboard') {
                if (text === '📋 Applications') {
                    const applications = await adminService.getRecentApplications(10);
                    if (applications.length === 0) {
                        await bot.sendMessage(chatId, '📋 No applications found.');
                    } else {
                        const appList = applications.map((app, index) =>
                            `${index + 1}. ${app.trackingNumber} - ${app.service} (${app.status})`
                        ).join('\n');
                        await bot.sendMessage(chatId, `📋 Recent Applications:\n\n${appList}`);
                    }
                    return;
                }

                if (text === '👥 Users') {
                    const users = await adminService.getAllUsers();
                    if (users.length === 0) {
                        await bot.sendMessage(chatId, '👥 No users found.');
                    } else {
                        const userList = users.slice(0, 10).map((user, index) =>
                            `${index + 1}. ${user.personalInfo?.fullName || 'Unknown'} - ${user.personalInfo?.phoneNumber || 'No phone'}`
                        ).join('\n');
                        await bot.sendMessage(chatId, `👥 Recent Users:\n\n${userList}`);
                    }
                    return;
                }

                if (text === '📊 Statistics') {
                    const stats = await adminService.getStatistics();
                    await bot.sendMessage(chatId,
                        `📊 Statistics:\n\n` +
                        `Total Users: ${stats.totalUsers}\n` +
                        `Total Applications: ${stats.totalApplications}\n` +
                        `Pending: ${stats.pending}\n` +
                        `Approved: ${stats.approved}\n` +
                        `Rejected: ${stats.rejected}`
                    );
                    return;
                }

                if (text === '🚪 Logout') {
                    setAdminStatus(chatId, false);
                    clearAdminSession(chatId);
                    const keyboard = createMainMenuKeyboard(userLang);
                    return await bot.sendMessage(chatId, '👋 Logged out successfully!', { reply_markup: keyboard });
                }
            }
        }

        // Default response
        await bot.sendMessage(chatId,
            '❓ I didn\'t understand that. Please use the menu buttons or type /help for assistance.'
        );

    } catch (error) {
        console.error('❌ Error handling message:', error);
        await bot.sendMessage(msg.chat.id, '❌ An error occurred. Please try again.');
    }
});

function clearAdminSession(chatId) {
    // Clear admin session data
    setAdminStep(chatId, null);
}

/**
 * Start bot polling
 */
bot.getMe().then((botInfo) => {
    console.log('✅ MESOB Shashemene Professional Bot Connected Successfully!');
    console.log(`🤖 Bot Name: ${botInfo.first_name}`);
    console.log(`👤 Username: @${botInfo.username}`);
    console.log(`🆔 Bot ID: ${botInfo.id}`);
    console.log('🌍 Languages: English, አማርኛ, Afaan Oromo');
    console.log('🏛️ Service Pods: 12 (130+ services)');
    console.log('🚀 Ready to serve MESOB users!');
    console.log('📝 Send /start to begin interaction');

    // Start polling after successful connection
    return bot.startPolling();
}).then(() => {
    console.log('✅ Bot is running! Send /start to your bot to test it.');
}).catch((error) => {
    console.error('❌ Failed to start bot:', error.message);
    process.exit(1);
});