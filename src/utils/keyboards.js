/**
 * Keyboard Utilities for MESOB Telegram Bot
 * Professional, modern keyboards with inline support
 */

const { getTranslation } = require('../config/languages');

/**
 * Create main menu keyboard - Professional design
 */
function createMainMenuKeyboard(userLang) {
    return {
        keyboard: [
            [
                { text: '🏛️ Services' },
                { text: '🔍 Track Application' }
            ],
            [
                { text: '📋 My Applications' },
                { text: '📱 Register' }
            ],
            [
                { text: '❓ Help' },
                { text: '🌐 Language' }
            ]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
    };
}

/**
 * Create service pods keyboard - 12 Foddaalee structure
 */
function createServicePodsKeyboard(userLang) {
    return {
        keyboard: [
            [
                { text: '🆔 Identity Documents' },
                { text: '🏢 Commercial Registration' }
            ],
            [
                { text: '💼 Business Services' },
                { text: '🏦 Banking Services' }
            ],
            [
                { text: '🏠 Land Services' },
                { text: '📈 Investment Services' }
            ],
            [
                { text: '📄 Document Services' },
                { text: '📋 License Services' }
            ],
            [
                { text: '📝 Administrative Services' },
                { text: '✅ Quality Assurance' }
            ],
            [
                { text: '🏗️ Construction Services' },
                { text: '⭐ Special Services' }
            ],
            [
                { text: '🔙 Back to Menu' }
            ]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
    };
}

/**
 * Create inline keyboard for service pods
 */
function createInlineServiceKeyboard(podServices) {
    const buttons = podServices.map(service => ({
        text: `${service.emoji} ${service.name}`,
        callback_data: `service_${service.name.toLowerCase().replace(/\s+/g, '_')}`
    }));

    // Group buttons in rows of 2
    const rows = [];
    for (let i = 0; i < buttons.length; i += 2) {
        if (i + 1 < buttons.length) {
            rows.push([buttons[i], buttons[i + 1]]);
        } else {
            rows.push([buttons[i]]);
        }
    }

    // Add back button
    rows.push([{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]);

    return {
        inline_keyboard: rows
    };
}

/**
 * Create services menu keyboard - Organized like MESOB website categories
 */
function createServicesKeyboard(userLang) {
    return {
        keyboard: [
            [
                { text: '🆔 National ID' },
                { text: '🛂 Passport' }
            ],
            [
                { text: '📋 Vital Registration' },
                { text: '👤 Civil Status' }
            ],
            [
                { text: '🏢 Business License' },
                { text: '🤝 Cooperatives' }
            ],
            [
                { text: '💰 Revenue Services' },
                { text: '🏠 Land Services' }
            ],
            [
                { text: '💼 Investment' },
                { text: '📄 Document Auth' }
            ],
            [
                { text: '🚗 Transport' },
                { text: '🏗️ Construction' }
            ],
            [
                { text: '🧹 Sanitation' },
                { text: '🛎️ Social Services' }
            ],
            [
                { text: '🗺️ Urban Planning' },
                { text: '🗳️ Elections' }
            ],
            [
                { text: '🔙 Back to Menu' }
            ]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
    };
}

/**
 * Create language selection keyboard with inline buttons
 */
function createLanguageKeyboard() {
    return {
        keyboard: [
            [{ text: '🇺🇸 English' }],
            [{ text: '🇪🇹 አማርኛ' }],
            [{ text: '🇪🇹 Afaan Oromo' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
    };
}

/**
 * Create inline language selection keyboard
 */
function createInlineLanguageKeyboard() {
    return {
        inline_keyboard: [
            [
                { text: '🇺🇸 English', callback_data: 'lang_en' },
                { text: '🇪ᇹ አማርኛ', callback_data: 'lang_am' }
            ],
            [
                { text: '🇪🇹 Afaan Oromo', callback_data: 'lang_om' }
            ]
        ]
    };
}

/**
 * Create admin dashboard keyboard
 */
function createAdminDashboardKeyboard(userLang) {
    return {
        keyboard: [
            [
                { text: '📋 Applications' },
                { text: '👥 Users' }
            ],
            [
                { text: '📊 Statistics' },
                { text: '⚙️ Settings' }
            ],
            [
                { text: '🚪 Logout' }
            ]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
    };
}

module.exports = {
    createMainMenuKeyboard,
    createServicesKeyboard,
    createLanguageKeyboard,
    createAdminDashboardKeyboard,
    createServicePodsKeyboard,
    createInlineServiceKeyboard,
    createInlineLanguageKeyboard
};