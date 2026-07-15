/**
 * Keyboard Utilities for MESOB Telegram Bot
 * Professional, modern keyboards with inline support
 */

const { getTranslation } = require('../config/languages');

/**
 * Create main menu keyboard - Professional design with translations
 */
function createMainMenuKeyboard(userLang) {
    return {
        keyboard: [
            [
                { text: getTranslation('menu_services', userLang) },
                { text: getTranslation('menu_track', userLang) }
            ],
            [
                { text: getTranslation('menu_my_applications', userLang) },
                { text: getTranslation('menu_register', userLang) }
            ],
            [
                { text: getTranslation('menu_faq', userLang) },
                { text: getTranslation('menu_contact', userLang) }
            ],
            [
                { text: getTranslation('menu_language', userLang) }
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
    const { getTranslation } = require('../config/languages');

    return {
        keyboard: [
            [
                { text: `🆔 ${getTranslation('pod1_name', userLang)}` },
                { text: `🏢 ${getTranslation('pod2_name', userLang)}` }
            ],
            [
                { text: `💼 ${getTranslation('pod3_name', userLang)}` },
                { text: `🏦 ${getTranslation('pod4_name', userLang)}` }
            ],
            [
                { text: `🏠 ${getTranslation('pod5_name', userLang)}` },
                { text: `📈 ${getTranslation('pod6_name', userLang)}` }
            ],
            [
                { text: `📄 ${getTranslation('pod7_name', userLang)}` },
                { text: `📋 ${getTranslation('pod8_name', userLang)}` }
            ],
            [
                { text: `📝 ${getTranslation('pod9_name', userLang)}` },
                { text: `✅ ${getTranslation('pod10_name', userLang)}` }
            ],
            [
                { text: `🏗️ ${getTranslation('pod11_name', userLang)}` },
                { text: `⭐ ${getTranslation('pod12_name', userLang)}` }
            ],
            [
                { text: getTranslation('back_to_menu', userLang) }
            ]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
    };
}

/**
 * Create inline keyboard for service pods
 */
function createInlineServiceKeyboard(podServices, userLang = 'en') {
    const { getTranslation } = require('../config/languages');

    const buttons = podServices.map(service => {
        // Try to find translation key based on service name
        let translationKey = null;
        const serviceKeys = {
            'National ID': 'service_national_id',
            'Passport': 'service_passport',
            'Business License': 'service_business_license',
            'Cooperatives': 'service_cooperatives',
            'Investment': 'service_investment',
            'Revenue Services': 'service_revenue',
            'Vital Registration': 'service_vital_registration',
            'Civil Status': 'service_civil_status',
            'Land Services': 'service_land',
            'Document Auth': 'service_document_auth',
            'Transport': 'service_transport',
            'Construction': 'service_construction',
            'Sanitation': 'service_sanitation',
            'Social Services': 'service_social',
            'Urban Planning': 'service_urban_planning',
            'Elections': 'service_elections',
            'Bank Services': 'service_bank_services',
            'Microfinance': 'service_microfinance',
            'Investment Permit': 'service_investment_permit',
            'Investment License': 'service_investment_license',
            'Professional License': 'service_professional_license',
            'Driving License': 'service_driving_license',
            'Certification': 'service_certification',
            'Inspection': 'service_inspection',
            'Special Cases': 'service_special_cases'
        };

        translationKey = serviceKeys[service.name];
        const serviceName = translationKey ? getTranslation(translationKey, userLang) : service.name;

        return {
            text: `${service.emoji} ${serviceName}`,
            callback_data: `service_${service.name.toLowerCase().replace(/\s+/g, '_')}`
        };
    });

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
    rows.push([{ text: getTranslation('back_to_menu', userLang), callback_data: 'back_to_menu' }]);

    return {
        inline_keyboard: rows
    };
}

/**
 * Create services menu keyboard - Using translations like MESOB website
 */
function createServicesKeyboard(userLang) {
    return {
        keyboard: [
            [
                { text: getTranslation('service_national_id', userLang) },
                { text: getTranslation('service_passport', userLang) }
            ],
            [
                { text: getTranslation('service_vital_registration', userLang) },
                { text: getTranslation('service_civil_status', userLang) }
            ],
            [
                { text: getTranslation('service_business_licensing', userLang) },
                { text: getTranslation('service_cooperatives', userLang) }
            ],
            [
                { text: getTranslation('service_revenue', userLang) },
                { text: getTranslation('service_land', userLang) }
            ],
            [
                { text: getTranslation('service_investment', userLang) },
                { text: getTranslation('service_document_auth', userLang) }
            ],
            [
                { text: getTranslation('service_transport', userLang) },
                { text: getTranslation('service_construction', userLang) }
            ],
            [
                { text: getTranslation('service_sanitation', userLang) },
                { text: getTranslation('service_social', userLang) }
            ],
            [
                { text: getTranslation('service_urban_planning', userLang) },
                { text: getTranslation('service_elections', userLang) }
            ],
            [
                { text: getTranslation('back_to_menu', userLang) }
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
    const { getTranslation } = require('../config/languages');

    return {
        keyboard: [
            [
                { text: getTranslation('admin_view_applications', userLang) },
                { text: getTranslation('admin_view_users', userLang) }
            ],
            [
                { text: getTranslation('admin_statistics', userLang) },
                { text: getTranslation('admin_search', userLang) }
            ],
            [
                { text: getTranslation('admin_broadcast', userLang) },
                { text: getTranslation('admin_settings', userLang) }
            ],
            [
                { text: getTranslation('admin_logout', userLang) }
            ]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
    };
}

/**
 * Create admin applications keyboard
 */
function createAdminApplicationsKeyboard(userLang) {
    const { getTranslation } = require('../config/languages');

    return {
        keyboard: [
            [
                { text: getTranslation('admin_view_pending', userLang) },
                { text: getTranslation('admin_view_approved', userLang) }
            ],
            [
                { text: getTranslation('admin_view_rejected', userLang) },
                { text: getTranslation('admin_search', userLang) }
            ],
            [
                { text: getTranslation('admin_back', userLang) }
            ]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
    };
}

/**
 * Create admin actions keyboard
 */
function createAdminActionsKeyboard(userLang) {
    const { getTranslation } = require('../config/languages');

    return {
        keyboard: [
            [
                { text: '✅ Approve' },
                { text: '❌ Reject' }
            ],
            [
                { text: '📝 Add Note' },
                { text: getTranslation('admin_back', userLang) }
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
    createInlineLanguageKeyboard,
    createAdminApplicationsKeyboard,
    createAdminActionsKeyboard
};