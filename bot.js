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
const botOptions = {
    polling: {
        interval: 300,
        params: {
            timeout: 10
        }
    }
};
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
    setAdminData, getAdminData,
    initializeUserStateManager
} = require('./src/utils/userState');
const {
    createMainMenuKeyboard, createServicesKeyboard,
    createLanguageKeyboard, createAdminDashboardKeyboard,
    createCoordinatorDashboardKeyboard,
    createServicePodsKeyboard, createInlineServiceKeyboard,
    createAdminApplicationsKeyboard, createAdminActionsKeyboard
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
        services: ['national_id', 'passport'],
        emoji: '🆔'
    },
    'pod2': {
        services: ['business_license', 'cooperatives'],
        emoji: '🏢'
    },
    'pod3': {
        services: ['investment', 'revenue'],
        emoji: '💼'
    },
    'pod4': {
        services: ['bank_services', 'microfinance'],
        emoji: '🏦'
    },
    'pod5': {
        services: ['land', 'urban_planning'],
        emoji: '🏠'
    },
    'pod6': {
        services: ['investment_permit', 'investment_license'],
        emoji: '📈'
    },
    'pod7': {
        services: ['document_auth', 'vital_registration'],
        emoji: '📄'
    },
    'pod8': {
        services: ['driving_license', 'professional_license'],
        emoji: '📋'
    },
    'pod9': {
        services: ['civil_status', 'social'],
        emoji: '📝'
    },
    'pod10': {
        services: ['certification', 'inspection'],
        emoji: '✅'
    },
    'pod11': {
        services: ['construction', 'sanitation'],
        emoji: '🏗️'
    },
    'pod12': {
        services: ['elections', 'special_cases'],
        emoji: '⭐'
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
    },
    'bank_services': {
        name: 'Bank Services',
        emoji: '🏦',
        description: 'Banking and financial services',
        processingTime: '1-3 days',
        fee: 'Varies',
        documents: 'ID, Account information',
        pod: 'pod4'
    },
    'microfinance': {
        name: 'Microfinance',
        emoji: '💵',
        description: 'Microfinance and small loan services',
        processingTime: '3-5 days',
        fee: 'Varies',
        documents: 'ID, Business plan, Guarantors',
        pod: 'pod4'
    },
    'investment_permit': {
        name: 'Investment Permit',
        emoji: '📈',
        description: 'Investment permit and licensing',
        processingTime: '5-7 days',
        fee: '200 ETB',
        documents: 'Business plan, Investment proof, ID',
        pod: 'pod6'
    },
    'investment_license': {
        name: 'Investment License',
        emoji: '📊',
        description: 'Investment license and business registration',
        processingTime: '5-7 days',
        fee: '300 ETB',
        documents: 'Investment permit, ID, Business documents',
        pod: 'pod6'
    },
    'professional_license': {
        name: 'Professional License',
        emoji: '📋',
        description: 'Professional licensing and certification',
        processingTime: '5-10 days',
        fee: '150 ETB',
        documents: 'Qualifications, ID, Experience proof',
        pod: 'pod8'
    },
    'driving_license': {
        name: 'Driving License',
        emoji: '🚗',
        description: 'Driving license issuance and renewal',
        processingTime: '7-14 days',
        fee: '200 ETB',
        documents: 'ID, Medical certificate, Photos',
        pod: 'pod8'
    },
    'certification': {
        name: 'Certification',
        emoji: '✅',
        description: 'Quality certification and inspection',
        processingTime: '3-7 days',
        fee: '100 ETB',
        documents: 'Product samples, ID, Business license',
        pod: 'pod10'
    },
    'inspection': {
        name: 'Inspection',
        emoji: '🔍',
        description: 'Quality inspection and compliance',
        processingTime: '1-3 days',
        fee: '50 ETB',
        documents: 'Product information, ID',
        pod: 'pod10'
    },
    'special_cases': {
        name: 'Special Cases',
        emoji: '⭐',
        description: 'Special case handling and services',
        processingTime: 'Varies',
        fee: 'Varies',
        documents: 'Case-specific documents, ID',
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
                    const inlineKeyboard = createInlineServiceKeyboard(podServices, userLang);
                    const podName = getTranslation(`pod${podId.replace('pod', '')}_name`, userLang);
                    const podDescription = getTranslation(`pod${podId.replace('pod', '')}_description`, userLang);

                    await bot.sendMessage(chatId,
                        `${pod.emoji} ${podName}\n\n${podDescription}\n\n${getTranslation('select_service', userLang)}`,
                        { reply_markup: inlineKeyboard }
                    );
                } else {
                    await bot.sendMessage(chatId, getTranslation('services_coming_soon', userLang));
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

                const serviceKey = Object.keys(services).find(key => services[key].name === service.name);
                const serviceNameTrans = getTranslation(`service_${serviceKey}`, userLang);
                const serviceDescTrans = getTranslation(`${serviceKey}_description`, userLang);

                const serviceDetails = `${service.emoji} ${serviceNameTrans}\n\n` +
                    `${getTranslation('service_description_label', userLang)} ${serviceDescTrans}\n\n` +
                    `${getTranslation('service_processing_time', userLang)} ${service.processingTime}\n` +
                    `${getTranslation('service_fee', userLang)} ${service.fee}\n` +
                    `${getTranslation('service_documents', userLang)} ${service.documents}\n\n` +
                    `${getTranslation('service_visit_office', userLang)}\n` +
                    `${getTranslation('service_contact', userLang)}\n` +
                    `${getTranslation('service_website', userLang)}`;

                await bot.sendMessage(chatId, serviceDetails);

                if (isVerified) {
                    setTimeout(async () => {
                        const appStart = applicationService.startApplication(chatId, userLang, serviceKey);
                        await bot.sendMessage(chatId, appStart.firstPrompt);
                    }, 2000);
                } else {
                    setTimeout(async () => {
                        await bot.sendMessage(chatId, getTranslation('registration_prompt', userLang));
                    }, 2000);
                }
            }
        }

        // Handle back to menu
        if (data === 'back_to_menu') {
            await bot.answerCallbackQuery(query.id);
            const keyboard = createMainMenuKeyboard(userLang);
            return await bot.sendMessage(chatId, getTranslation('main_menu', userLang), { reply_markup: keyboard });
        }

        // Handle language selection
        if (data.startsWith('lang_')) {
            const lang = data.replace('lang_', '');
            const langNames = { 'en': '🇺🇸 English', 'am': '🇪🇹 አማርኛ', 'om': '🇪🇹 Afaan Oromo' };

            setUserLanguage(chatId, lang);
            await bot.answerCallbackQuery(query.id);
            await bot.sendMessage(chatId, getTranslation('language_changed', lang));

            const keyboard = createMainMenuKeyboard(lang);
            await bot.sendMessage(chatId, getTranslation('main_menu', lang), { reply_markup: keyboard });
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
                    let helpText = `🤖 MESOB Bot Help\n\n` +
                        `📋 Available Commands:\n` +
                        `/start - Start the bot\n` +
                        `/help - Show this help\n` +
                        `/menu - Main menu\n` +
                        `/language - Change language\n` +
                        `/status - Check your registration status\n` +
                        `/cancel - Cancel current operation\n` +
                        `/admin - Access admin dashboard\n`;

                    if (isAdmin(chatId)) {
                        helpText += `/admins - List all administrators\n`;
                    }

                    helpText += `\n🎯 Features:\n` +
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

                case '/language':
                    const languageKeyboard = createLanguageKeyboard();
                    return await bot.sendMessage(chatId,
                        '🌐 Select your preferred language:\n\nምርጫ ቋንቋ ይምረጡ:\n\nAfaan keessan filaa:',
                        { reply_markup: languageKeyboard }
                    );

                case '/status':
                    const user = await database.getUser(chatId);
                    const isRegistered = user && user.personalInfo && user.personalInfo.phoneVerified;
                    const statusMessage = isRegistered
                        ? `✅ Registered\n👤 Name: ${user.personalInfo.fullName}\n📱 Phone: ${user.personalInfo.phoneNumber}`
                        : '❌ Not registered. Send /start to register.';
                    return await bot.sendMessage(chatId, `📊 Your Status:\n\n${statusMessage}`);

                case '/cancel':
                    // Clear any ongoing processes
                    setRegistrationStep(chatId, null);
                    clearRegistrationData(chatId);
                    if (applicationService.hasActiveApplication(chatId)) {
                        applicationService.cancelApplication(chatId);
                    }
                    const cancelKeyboard = createMainMenuKeyboard(userLang);
                    return await bot.sendMessage(chatId,
                        '❌ Operation cancelled. Returning to main menu.',
                        { reply_markup: cancelKeyboard }
                    );

                case '/admin':
                    if (isAdmin(chatId)) {
                        const keyboard = createAdminDashboardKeyboard(userLang);
                        return await bot.sendMessage(chatId, getTranslation('admin_dashboard', userLang), { reply_markup: keyboard });
                    } else {
                        return await bot.sendMessage(chatId, getTranslation('admin_login_prompt', userLang));
                    }

                case '/admins':
                    if (isAdmin(chatId)) {
                        const adminList = adminService.admins;
                        let adminInfo = '👥 MESOB Administrators:\n\n';
                        let count = 1;
                        for (const [email, admin] of adminList) {
                            adminInfo += `${count}. ${admin.name}\n   📧 ${email}\n   🏷️ Role: ${admin.role}\n\n`;
                            count++;
                        }
                        adminInfo += '🔐 Login Format: email:password\n';
                        adminInfo += '💡 Example: admin@mesob.gov.et:admin123';
                        return await bot.sendMessage(chatId, adminInfo);
                    } else {
                        return await bot.sendMessage(chatId, '❌ Access denied. Admin privileges required.');
                    }

                default:
                    await bot.sendMessage(chatId, "❓ Unknown command. Type /help to see available commands.");
                    return;
            }
        }

        // Handle language selection
        if (['🇺🇸 English', '🇪🇹 አማርኛ', '🇪🇹 Afaan Oromo'].includes(text)) {
            const langMap = {
                '🇺🇸 English': 'en',
                '🇪🇹 አማርኛ': 'am',
                '🇪🇹 Afaan Oromo': 'om'
            };

            const selectedLang = langMap[text];
            if (selectedLang) {
                setUserLanguage(chatId, selectedLang);
                await bot.sendMessage(chatId, getTranslation('language_changed', selectedLang));

                const keyboard = createMainMenuKeyboard(selectedLang);
                return await bot.sendMessage(chatId, getTranslation('main_menu', selectedLang), {
                    reply_markup: keyboard
                });
            }
        }

        // Handle main menu options
        if (text === getTranslation('menu_services', userLang)) {
            const keyboard = createServicesKeyboard(userLang);
            return await bot.sendMessage(chatId, getTranslation('services_title', userLang), {
                reply_markup: keyboard
            });
        }

        // Handle service pod button clicks from main keyboard
        const podKeys = Object.keys(servicePods);
        for (const podKey of podKeys) {
            const podName = getTranslation(`pod${podKey.replace('pod', '')}_name`, userLang);
            if (text === podName) {
                const pod = servicePods[podKey];
                if (pod) {
                    const podServices = pod.services.map(s => services[s]).filter(Boolean);

                    if (podServices.length > 0) {
                        const inlineKeyboard = createInlineServiceKeyboard(podServices, userLang);
                        const podDescription = getTranslation(`pod${podKey.replace('pod', '')}_description`, userLang);

                        await bot.sendMessage(chatId,
                            `${pod.emoji} ${podName}\n\n${podDescription}\n\n${getTranslation('select_service', userLang)}`,
                            { reply_markup: inlineKeyboard }
                        );
                    } else {
                        await bot.sendMessage(chatId, getTranslation('services_coming_soon', userLang));
                    }
                }
                return;
            }
        }

        if (text === getTranslation('menu_track', userLang)) {
            return await bot.sendMessage(chatId,
                `${getTranslation('menu_track', userLang)}\n\n${getTranslation('track_prompt', userLang)}`
            );
        }

        if (text === getTranslation('menu_my_applications', userLang)) {
            const user = await database.getUser(chatId);
            if (!user || !user.personalInfo || !user.personalInfo.phoneVerified) {
                await bot.sendMessage(chatId, getTranslation('registration_prompt', userLang));
                setTimeout(() => {
                    const keyboard = createMainMenuKeyboard(userLang);
                    bot.sendMessage(chatId, getTranslation('registration_prompt', userLang));
                }, 2000);
                return;
            }

            const applications = await database.getApplicationsByChatId(chatId);
            if (!applications || applications.length === 0) {
                return await bot.sendMessage(chatId, getTranslation('no_applications', userLang));
            }

            const appList = applications.map((app, index) =>
                `${index + 1}. ${app.service} - ${app.trackingNumber} (${app.status})`
            ).join('\n');

            return await bot.sendMessage(chatId, `${getTranslation('menu_my_applications', userLang)}:\n\n${appList}`);
        }

        if (text === getTranslation('menu_register', userLang)) {
            const user = await database.getUser(chatId);
            if (user && user.personalInfo && user.personalInfo.phoneVerified) {
                return await bot.sendMessage(chatId,
                    getTranslation('registration_already_registered', userLang).replace('{phone}', user.personalInfo.phoneNumber)
                );
            }
            return await bot.sendMessage(chatId, getTranslation('registration_prompt', userLang));
        }

        if (text === getTranslation('menu_howto', userLang)) {
            const helpText = getTranslation('howto_content', userLang);
            await bot.sendMessage(chatId, helpText);
            setTimeout(() => {
                const keyboard = createMainMenuKeyboard(userLang);
                bot.sendMessage(chatId, getTranslation('main_menu', userLang), { reply_markup: keyboard });
            }, 3000);
            return;
        }

        if (text === getTranslation('menu_language', userLang)) {
            const keyboard = createLanguageKeyboard();
            return await bot.sendMessage(chatId, getTranslation('language_selection', 'en'), {
                reply_markup: keyboard
            });
        }

        if (text === getTranslation('menu_faq', userLang)) {
            const faqText = getTranslation('faq_general_content', userLang);
            await bot.sendMessage(chatId, faqText);
            setTimeout(() => {
                const keyboard = createMainMenuKeyboard(userLang);
                bot.sendMessage(chatId, getTranslation('main_menu', userLang), { reply_markup: keyboard });
            }, 3000);
            return;
        }

        if (text === getTranslation('menu_contact', userLang)) {
            const contactText = getTranslation('contact_info', userLang);
            await bot.sendMessage(chatId, contactText);
            setTimeout(() => {
                const keyboard = createMainMenuKeyboard(userLang);
                bot.sendMessage(chatId, getTranslation('main_menu', userLang), { reply_markup: keyboard });
            }, 3000);
            return;
        }

        // Handle back to menu
        if (text === getTranslation('back_to_menu', userLang)) {
            const keyboard = createMainMenuKeyboard(userLang);
            return await bot.sendMessage(chatId, getTranslation('main_menu', userLang), { reply_markup: keyboard });
        }

        // Handle individual services - matching exact website services
        const serviceHandlers = {
            // Core services from the website
            'service_national_id': ['🆔 National ID', 'National ID'],
            'service_passport': ['🛂 Passport', 'Passport'],
            'service_vital_registration': ['📋 Vital Registration', 'Vital Registration'],
            'service_civil_status': ['📋 Civil Status', 'Civil Status'],
            'service_business_licensing': ['🏢 Business Licensing', 'Business Licensing'],
            'service_cooperatives': ['🤝 Cooperatives & Enterprises', 'Cooperatives'],
            'service_revenue': ['💰 Revenue Collection', 'Revenue Services'],
            'service_land': ['🏞️ Land Services', 'Land Services'],
            'service_investment': ['💼 Investment Services', 'Investment'],
            'service_document_auth': ['📋 Document Authentication', 'Document Auth'],
            'service_transport': ['🚛 Transport & Traffic', 'Transport'],
            'service_construction': ['🏗️ Construction & Design', 'Construction'],
            'service_sanitation': ['🌿 Sanitation & Municipal', 'Sanitation'],
            'service_social': ['👥 Social Affairs', 'Social Services'],
            'service_urban_planning': ['🏗️ Urban Planning', 'Urban Planning'],
            'service_elections': ['🗳️ Elections', 'Elections']
        };

        // Check if the user clicked on any service
        for (const [serviceKey, serviceNames] of Object.entries(serviceHandlers)) {
            for (const serviceName of serviceNames) {
                if (text === serviceName) {
                    // Check if user is registered
                    const user = await database.getUser(chatId);
                    const isVerified = user && user.personalInfo && user.personalInfo.phoneVerified;

                    if (!isVerified) {
                        // Show service info then prompt registration
                        const serviceInfo = getTranslation(serviceKey + '_info', userLang) ||
                            `📋 ${getTranslation(serviceKey, userLang)}\n\n✅ Processing Time: 3-5 days\n💰 Fee: Contact MESOB office\n📄 Required documents will be specified during application.\n\n🏢 Visit MESOB office with required documents.`;

                        await bot.sendMessage(chatId, serviceInfo);

                        setTimeout(() => {
                            bot.sendMessage(chatId, getTranslation('registration_prompt', userLang));
                        }, 3000);
                        return;
                    } else {
                        // User is registered - show service info and start application
                        const serviceInfo = getTranslation(serviceKey + '_info', userLang) ||
                            `📋 ${getTranslation(serviceKey, userLang)}\n\n✅ Processing Time: 3-5 days\n💰 Fee: Contact MESOB office\n📄 Required documents will be specified during application.\n\n🏢 Visit MESOB office with required documents.`;

                        await bot.sendMessage(chatId, serviceInfo);

                        setTimeout(() => {
                            const result = applicationService.startApplication(chatId, userLang, serviceKey.replace('service_', ''));
                            if (result.success) {
                                bot.sendMessage(chatId, result.firstPrompt);
                            } else {
                                bot.sendMessage(chatId, '❌ Failed to start application. Please try again.');
                            }
                        }, 3000);
                        return;
                    }
                }
            }
        }

        // Also handle services using exact translation text (more reliable)
        const serviceKeys = [
            'service_national_id', 'service_passport', 'service_vital_registration',
            'service_civil_status', 'service_business_licensing', 'service_cooperatives',
            'service_revenue', 'service_land', 'service_investment', 'service_document_auth',
            'service_transport', 'service_construction', 'service_sanitation',
            'service_social', 'service_urban_planning', 'service_elections'
        ];

        for (const serviceKey of serviceKeys) {
            const translatedText = getTranslation(serviceKey, userLang);
            if (text === translatedText) {
                // Check if user is registered
                const user = await database.getUser(chatId);
                const isVerified = user && user.personalInfo && user.personalInfo.phoneVerified;

                if (!isVerified) {
                    // Show service info then prompt registration
                    const serviceInfo = getTranslation(serviceKey + '_info', userLang) ||
                        `📋 ${getTranslation(serviceKey, userLang)}\n\n✅ Processing Time: 3-5 days\n💰 Fee: Contact MESOB office\n📄 Required documents will be specified during application.\n\n🏢 Visit MESOB office with required documents.`;

                    await bot.sendMessage(chatId, serviceInfo);

                    setTimeout(() => {
                        bot.sendMessage(chatId, getTranslation('registration_prompt', userLang));
                    }, 3000);
                    return;
                } else {
                    // User is registered - show service info and start application
                    const serviceInfo = getTranslation(serviceKey + '_info', userLang) ||
                        `📋 ${getTranslation(serviceKey, userLang)}\n\n✅ Processing Time: 3-5 days\n💰 Fee: Contact MESOB office\n📄 Required documents will be specified during application.\n\n🏢 Visit MESOB office with required documents.`;

                    await bot.sendMessage(chatId, serviceInfo);

                    setTimeout(() => {
                        const result = applicationService.startApplication(chatId, userLang, serviceKey.replace('service_', ''));
                        if (result.success) {
                            bot.sendMessage(chatId, result.firstPrompt);
                        } else {
                            bot.sendMessage(chatId, '❌ Failed to start application. Please try again.');
                        }
                    }, 3000);
                    return;
                }
            }
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

                    // Store admin email for role-specific features
                    const adminData = adminService.admins.get(email.trim());
                    setAdminData(chatId, { email: email.trim(), role: adminData.role });

                    await bot.sendMessage(chatId, getTranslation('admin_login_success', userLang));

                    // Choose dashboard based on role
                    if (adminData.role === 'coordinator') {
                        const keyboard = createCoordinatorDashboardKeyboard(userLang);
                        const welcomeMsg = `🎯 Welcome ${adminData.name}!\n\n` +
                            `📋 Your Services: ${adminData.services.join(', ')}\n\n` +
                            `Select an option from your coordinator dashboard:`;
                        return await bot.sendMessage(chatId, welcomeMsg, { reply_markup: keyboard });
                    } else {
                        const keyboard = createAdminDashboardKeyboard(userLang);
                        return await bot.sendMessage(chatId, getTranslation('admin_dashboard', userLang), { reply_markup: keyboard });
                    }
                } else {
                    return await bot.sendMessage(chatId, getTranslation('admin_login_failed', userLang));
                }
            }
        }

        // Handle admin dashboard
        if (isAdmin(chatId)) {
            const adminStep = getAdminStep(chatId);
            if (adminStep === 'dashboard') {
                if (text === getTranslation('admin_view_applications', userLang)) {
                    const keyboard = createAdminApplicationsKeyboard(userLang);
                    setAdminStep(chatId, 'applications');
                    const applications = await adminService.getRecentApplications(10);
                    if (applications.length === 0) {
                        await bot.sendMessage(chatId, '📋 No applications found.', { reply_markup: keyboard });
                    } else {
                        const appList = applications.map((app, index) =>
                            `${index + 1}. ${app.trackingNumber} - ${app.service} (${app.status})`
                        ).join('\n');
                        await bot.sendMessage(chatId, `📋 Recent Applications:\n\n${appList}`, { reply_markup: keyboard });
                    }
                    return;
                }

                if (text === getTranslation('admin_view_users', userLang)) {
                    const users = await adminService.getAllUsers();
                    if (users.length === 0) {
                        await bot.sendMessage(chatId, getTranslation('admin_statistics', userLang));
                    } else {
                        const userList = users.slice(0, 10).map((user, index) =>
                            `${index + 1}. ${user.personalInfo?.fullName || 'Unknown'} - ${user.personalInfo?.phoneNumber || 'No phone'}`
                        ).join('\n');
                        await bot.sendMessage(chatId, `👥 Recent Users:\n\n${userList}`);
                    }
                    return;
                }

                // Management-only feature: View all coordinators
                if (text === '👥 View Coordinators') {
                    const adminData = getAdminData(chatId);
                    if (adminData && ['super_admin', 'director', 'manager', 'supervisor'].includes(adminData.role)) {
                        const coordinators = adminService.getAllCoordinators();
                        if (coordinators.length === 0) {
                            await bot.sendMessage(chatId, '👥 No coordinators found.');
                        } else {
                            const coordList = coordinators.map((coord, index) =>
                                `${index + 1}. ${coord.name}\n   📧 ${coord.email}\n   🏛️ Services: ${coord.services.join(', ')}`
                            ).join('\n\n');
                            await bot.sendMessage(chatId, `👥 All Service Coordinators:\n\n${coordList}`);
                        }
                    } else {
                        await bot.sendMessage(chatId, '❌ Access denied. Management privileges required.');
                    }
                    return;
                }

                if (text === getTranslation('admin_statistics', userLang)) {
                    const stats = await adminService.getStatistics();
                    const serviceBreakdown = Object.entries(stats.serviceBreakdown)
                        .map(([service, count]) => `${service}: ${count}`)
                        .join('\n');

                    const statsMessage = getTranslation('admin_statistics_summary', userLang)
                        .replace('{totalUsers}', stats.totalUsers)
                        .replace('{totalApplications}', stats.totalApplications)
                        .replace('{pending}', stats.pending)
                        .replace('{approved}', stats.approved)
                        .replace('{rejected}', stats.rejected)
                        .replace('{serviceBreakdown}', serviceBreakdown);

                    await bot.sendMessage(chatId, statsMessage);
                    return;
                }

                if (text === getTranslation('admin_search', userLang)) {
                    setAdminStep(chatId, 'search');
                    await bot.sendMessage(chatId, getTranslation('admin_search_prompt', userLang));
                    return;
                }

                if (text === getTranslation('admin_broadcast', userLang)) {
                    setAdminStep(chatId, 'broadcast');
                    await bot.sendMessage(chatId, getTranslation('admin_broadcast_prompt', userLang));
                    return;
                }

                if (text === getTranslation('admin_settings', userLang)) {
                    await bot.sendMessage(chatId, '⚙️ Settings - Coming Soon');
                    return;
                }

                if (text === getTranslation('admin_logout', userLang)) {
                    setAdminStatus(chatId, false);
                    clearAdminSession(chatId);
                    const keyboard = createMainMenuKeyboard(userLang);
                    return await bot.sendMessage(chatId, '👋 Logged out successfully!', { reply_markup: keyboard });
                }

                // Handle coordinator-specific dashboard options
                const adminData = getAdminData(chatId);
                if (adminData && adminData.role === 'coordinator') {
                    if (text === '📋 My Services Applications') {
                        const applications = await adminService.getCoordinatorApplications(adminData.email);
                        if (applications.length === 0) {
                            await bot.sendMessage(chatId, '📋 No applications found for your services.');
                        } else {
                            const appList = applications.slice(0, 15).map((app, index) =>
                                `${index + 1}. ${app.trackingNumber} - ${app.service} (${app.status})`
                            ).join('\n');
                            await bot.sendMessage(chatId, `📋 Your Services Applications:\n\n${appList}`);
                        }
                        return;
                    }

                    if (text === '📊 My Services Statistics') {
                        const stats = await adminService.getCoordinatorStatistics(adminData.email);
                        if (stats) {
                            const serviceList = stats.services.join(', ');
                            const breakdown = Object.entries(stats.serviceBreakdown)
                                .map(([service, count]) => `• ${service}: ${count}`)
                                .join('\n');

                            const statsMsg = `📊 ${stats.coordinator} Statistics\n\n` +
                                `🏛️ Services: ${serviceList}\n` +
                                `📋 Total Applications: ${stats.totalApplications}\n` +
                                `⏳ Pending: ${stats.pending}\n` +
                                `✅ Approved: ${stats.approved}\n` +
                                `❌ Rejected: ${stats.rejected}\n\n` +
                                `📈 Service Breakdown:\n${breakdown || 'No applications yet'}`;

                            await bot.sendMessage(chatId, statsMsg);
                        } else {
                            await bot.sendMessage(chatId, '❌ Could not load statistics.');
                        }
                        return;
                    }

                    if (text === '⏳ Pending Applications') {
                        const applications = await adminService.getCoordinatorApplications(adminData.email);
                        const pending = applications.filter(app => app.status === 'submitted');
                        if (pending.length === 0) {
                            await bot.sendMessage(chatId, '⏳ No pending applications for your services.');
                        } else {
                            const appList = pending.map((app, index) =>
                                `${index + 1}. ${app.trackingNumber} - ${app.service}\n   👤 ${app.formData?.fullName || 'Unknown'}`
                            ).join('\n\n');
                            await bot.sendMessage(chatId, `⏳ Pending Applications:\n\n${appList}`);
                        }
                        return;
                    }

                    if (text === '✅ Approved Applications') {
                        const applications = await adminService.getCoordinatorApplications(adminData.email);
                        const approved = applications.filter(app => app.status === 'approved');
                        if (approved.length === 0) {
                            await bot.sendMessage(chatId, '✅ No approved applications for your services.');
                        } else {
                            const appList = approved.slice(0, 10).map((app, index) =>
                                `${index + 1}. ${app.trackingNumber} - ${app.service}`
                            ).join('\n');
                            await bot.sendMessage(chatId, `✅ Approved Applications:\n\n${appList}`);
                        }
                        return;
                    }

                    if (text === '❌ Rejected Applications') {
                        const applications = await adminService.getCoordinatorApplications(adminData.email);
                        const rejected = applications.filter(app => app.status === 'rejected');
                        if (rejected.length === 0) {
                            await bot.sendMessage(chatId, '❌ No rejected applications for your services.');
                        } else {
                            const appList = rejected.slice(0, 10).map((app, index) =>
                                `${index + 1}. ${app.trackingNumber} - ${app.service}`
                            ).join('\n');
                            await bot.sendMessage(chatId, `❌ Rejected Applications:\n\n${appList}`);
                        }
                        return;
                    }

                    if (text === '📞 Contact Support') {
                        const adminData = getAdminData(chatId);
                        const admin = adminService.admins.get(adminData.email);

                        const supportMsg = `📞 MESOB Support Information\n\n` +
                            `👤 Your Role: ${admin.name}\n` +
                            `🏛️ Your Services: ${admin.services.join(', ')}\n\n` +
                            `🚨 Emergency Support:\n` +
                            `📱 Phone: +251 913 116898\n` +
                            `📧 Email: support@mesob.gov.et\n\n` +
                            `👨‍💼 Management Contacts:\n` +
                            `🎖️ Director: director@mesob.gov.et\n` +
                            `📊 Operations Manager: manager@mesob.gov.et\n` +
                            `👮 Supervisor: supervisor@mesob.gov.et\n\n` +
                            `🔧 Technical Support:\n` +
                            `💻 IT Helpdesk: tech@mesob.gov.et\n` +
                            `🌐 Website: mesobshashe.gov.et\n\n` +
                            `⏰ Support Hours: Mon-Fri 8:00-17:00`;

                        await bot.sendMessage(chatId, supportMsg);
                        return;
                    }

                    if (text === '📈 Performance Report') {
                        const stats = await adminService.getCoordinatorStatistics(adminData.email);
                        if (stats) {
                            const approvalRate = stats.totalApplications > 0
                                ? ((stats.approved / stats.totalApplications) * 100).toFixed(1)
                                : '0';
                            const rejectionRate = stats.totalApplications > 0
                                ? ((stats.rejected / stats.totalApplications) * 100).toFixed(1)
                                : '0';

                            const reportMsg = `📈 Performance Report\n` +
                                `👤 Coordinator: ${stats.coordinator}\n\n` +
                                `📊 Overall Performance:\n` +
                                `• Total Applications: ${stats.totalApplications}\n` +
                                `• Approval Rate: ${approvalRate}%\n` +
                                `• Rejection Rate: ${rejectionRate}%\n` +
                                `• Pending Applications: ${stats.pending}\n\n` +
                                `🎯 Services Managed: ${stats.services.length}\n` +
                                `📋 Service List: ${stats.services.join(', ')}`;

                            await bot.sendMessage(chatId, reportMsg);
                        } else {
                            await bot.sendMessage(chatId, '❌ Could not generate performance report.');
                        }
                        return;
                    }
                }
            }

            if (adminStep === 'applications') {
                if (text === getTranslation('admin_view_pending', userLang)) {
                    const applications = await adminService.getApplicationsByStatus('submitted');
                    if (applications.length === 0) {
                        await bot.sendMessage(chatId, '⏳ No pending applications.');
                    } else {
                        const appList = applications.map((app, index) =>
                            `${index + 1}. ${app.trackingNumber} - ${app.service}`
                        ).join('\n');
                        await bot.sendMessage(chatId, `⏳ Pending Applications:\n\n${appList}`);
                    }
                    return;
                }

                if (text === getTranslation('admin_view_approved', userLang)) {
                    const applications = await adminService.getApplicationsByStatus('approved');
                    if (applications.length === 0) {
                        await bot.sendMessage(chatId, '✅ No approved applications.');
                    } else {
                        const appList = applications.map((app, index) =>
                            `${index + 1}. ${app.trackingNumber} - ${app.service}`
                        ).join('\n');
                        await bot.sendMessage(chatId, `✅ Approved Applications:\n\n${appList}`);
                    }
                    return;
                }

                if (text === getTranslation('admin_view_rejected', userLang)) {
                    const applications = await adminService.getApplicationsByStatus('rejected');
                    if (applications.length === 0) {
                        await bot.sendMessage(chatId, '❌ No rejected applications.');
                    } else {
                        const appList = applications.map((app, index) =>
                            `${index + 1}. ${app.trackingNumber} - ${app.service}`
                        ).join('\n');
                        await bot.sendMessage(chatId, `❌ Rejected Applications:\n\n${appList}`);
                    }
                    return;
                }

                if (text === getTranslation('admin_search', userLang)) {
                    setAdminStep(chatId, 'search');
                    await bot.sendMessage(chatId, getTranslation('admin_search_prompt', userLang));
                    return;
                }

                if (text === getTranslation('admin_back', userLang)) {
                    setAdminStep(chatId, 'dashboard');
                    const keyboard = createAdminDashboardKeyboard(userLang);
                    await bot.sendMessage(chatId, getTranslation('admin_dashboard', userLang), { reply_markup: keyboard });
                    return;
                }

                // Handle tracking number input for application details
                if (text.length >= 6 && /^[a-z0-9]+$/i.test(text)) {
                    const application = await adminService.getApplication(text.toUpperCase());
                    if (application) {
                        setAdminStep(chatId, 'application_details');
                        setAdminData(chatId, { trackingNumber: application.trackingNumber });

                        const appDetails = getTranslation('admin_application_details', userLang)
                            .replace('{trackingNumber}', application.trackingNumber)
                            .replace('{service}', application.service)
                            .replace('{status}', application.status)
                            .replace('{fullName}', application.formData?.fullName || 'N/A')
                            .replace('{phone}', application.formData?.phone || 'N/A')
                            .replace('{email}', application.formData?.email || 'N/A')
                            .replace('{idNumber}', application.formData?.idNumber || 'N/A')
                            .replace('{address}', application.formData?.address || 'N/A')
                            .replace('{documentCount}', application.documents?.length || 0)
                            .replace('{notes}', application.notes || 'No notes');

                        const keyboard = createAdminActionsKeyboard(userLang);
                        await bot.sendMessage(chatId, appDetails, { reply_markup: keyboard });
                    } else {
                        await bot.sendMessage(chatId, '❌ Application not found.');
                    }
                    return;
                }
            }

            if (adminStep === 'application_details') {
                const adminData = getAdminData(chatId);

                if (text === '✅ Approve') {
                    const result = await adminService.updateApplicationStatus(adminData.trackingNumber, 'approved');
                    if (result.success) {
                        await bot.sendMessage(chatId, getTranslation('admin_approve_application', userLang).replace('{trackingNumber}', adminData.trackingNumber));
                    } else {
                        await bot.sendMessage(chatId, '❌ Failed to approve application.');
                    }
                    setAdminStep(chatId, 'applications');
                    const keyboard = createAdminApplicationsKeyboard(userLang);
                    await bot.sendMessage(chatId, '📋 Applications', { reply_markup: keyboard });
                    return;
                }

                if (text === '❌ Reject') {
                    const result = await adminService.updateApplicationStatus(adminData.trackingNumber, 'rejected');
                    if (result.success) {
                        await bot.sendMessage(chatId, getTranslation('admin_reject_application', userLang).replace('{trackingNumber}', adminData.trackingNumber));
                    } else {
                        await bot.sendMessage(chatId, '❌ Failed to reject application.');
                    }
                    setAdminStep(chatId, 'applications');
                    const keyboard = createAdminApplicationsKeyboard(userLang);
                    await bot.sendMessage(chatId, '📋 Applications', { reply_markup: keyboard });
                    return;
                }

                if (text === '📝 Add Note') {
                    setAdminStep(chatId, 'add_note');
                    await bot.sendMessage(chatId, getTranslation('admin_add_note', userLang).replace('{trackingNumber}', adminData.trackingNumber));
                    return;
                }

                if (text === getTranslation('admin_back', userLang)) {
                    setAdminStep(chatId, 'applications');
                    const keyboard = createAdminApplicationsKeyboard(userLang);
                    await bot.sendMessage(chatId, '📋 Applications', { reply_markup: keyboard });
                    return;
                }
            }

            if (adminStep === 'add_note') {
                const adminData = getAdminData(chatId);
                const result = await adminService.updateApplicationStatus(adminData.trackingNumber, null, text);
                if (result.success) {
                    await bot.sendMessage(chatId, getTranslation('admin_note_added', userLang));
                } else {
                    await bot.sendMessage(chatId, '❌ Failed to add note.');
                }
                setAdminStep(chatId, 'application_details');
                const keyboard = createAdminActionsKeyboard(userLang);
                await bot.sendMessage(chatId, getTranslation('admin_application_details', userLang).replace('{trackingNumber}', adminData.trackingNumber), { reply_markup: keyboard });
                return;
            }

            if (adminStep === 'search') {
                const applications = await adminService.searchApplications(text);
                if (applications.length === 0) {
                    await bot.sendMessage(chatId, '❌ No applications found.');
                } else {
                    const appList = applications.map((app, index) =>
                        `${index + 1}. ${app.trackingNumber} - ${app.service} (${app.status})`
                    ).join('\n');
                    await bot.sendMessage(chatId, `🔍 Search Results:\n\n${appList}`);
                }
                setAdminStep(chatId, 'dashboard');
                const keyboard = createAdminDashboardKeyboard(userLang);
                await bot.sendMessage(chatId, getTranslation('admin_dashboard', userLang), { reply_markup: keyboard });
                return;
            }

            if (adminStep === 'broadcast') {
                const users = await adminService.getAllUsers();
                let sentCount = 0;

                for (const user of users) {
                    try {
                        await bot.sendMessage(user.chatId, `📢 ${text}`);
                        sentCount++;
                    } catch (error) {
                        console.error(`Failed to send to user ${user.chatId}:`, error);
                    }
                }

                await bot.sendMessage(chatId, getTranslation('admin_broadcast_sent', userLang).replace('{count}', sentCount));
                setAdminStep(chatId, 'dashboard');
                const keyboard = createAdminDashboardKeyboard(userLang);
                await bot.sendMessage(chatId, getTranslation('admin_dashboard', userLang), { reply_markup: keyboard });
                return;
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
    console.log('✅ Bot is running! Send /start to your bot to test it.');
}).catch((error) => {
    console.error('❌ Failed to start bot:', error.message);
    process.exit(1);
});