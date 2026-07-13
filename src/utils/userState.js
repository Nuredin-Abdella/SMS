/**
 * User State Management for MESOB Telegram Bot
 * Manages user language preferences and session data
 */

// In-memory storage for user states (replace with database in production)
const userStates = new Map();

/**
 * User state structure
 * {
 *   language: 'en' | 'am' | 'om',
 *   lastActivity: Date,
 *   sessionData: {},
 *   registrationStep: 'phone' | 'code' | 'name' | 'email' | 'id' | 'address' | 'business' | 'complete',
 *   registrationData: {},
 *   isAdmin: boolean,
 *   adminStep: 'dashboard' | 'view_applications' | 'view_users' | 'statistics' | 'settings',
 *   selectedApplication: string (tracking number)
 * }
 */

/**
 * Get user's preferred language
 * @param {number|string} userId - User ID or Chat ID
 * @returns {string} Language code (en, am, om) or null
 */
function getUserLanguage(userId) {
    const userState = userStates.get(userId.toString());
    return userState?.language || null;
}

/**
 * Set user's preferred language
 * @param {number|string} userId - User ID or Chat ID
 * @param {string} language - Language code (en, am, om)
 */
function setUserLanguage(userId, language) {
    const userIdStr = userId.toString();
    const existingState = userStates.get(userIdStr) || {};

    userStates.set(userIdStr, {
        ...existingState,
        language,
        lastActivity: new Date()
    });

    console.log(`User ${userId} language set to: ${language}`);
}

/**
 * Get user's complete state
 * @param {number|string} userId - User ID or Chat ID
 * @returns {Object|null} User state object or null
 */
function getUserState(userId) {
    return userStates.get(userId.toString()) || null;
}

/**
 * Update user's session data
 * @param {number|string} userId - User ID or Chat ID
 * @param {Object} sessionData - Session data to merge
 */
function updateUserSession(userId, sessionData) {
    const userIdStr = userId.toString();
    const existingState = userStates.get(userIdStr) || {};

    userStates.set(userIdStr, {
        ...existingState,
        sessionData: {
            ...existingState.sessionData,
            ...sessionData
        },
        lastActivity: new Date()
    });
}

/**
 * Clear user's session data
 * @param {number|string} userId - User ID or Chat ID
 */
function clearUserSession(userId) {
    const userIdStr = userId.toString();
    const existingState = userStates.get(userIdStr);

    if (existingState) {
        userStates.set(userIdStr, {
            ...existingState,
            sessionData: {},
            lastActivity: new Date()
        });
    }
}

/**
 * Remove inactive users (cleanup function)
 * @param {number} hoursInactive - Hours of inactivity before removal
 */
function cleanupInactiveUsers(hoursInactive = 24) {
    const cutoffTime = new Date(Date.now() - (hoursInactive * 60 * 60 * 1000));
    let removedCount = 0;

    for (const [userId, state] of userStates.entries()) {
        if (state.lastActivity < cutoffTime) {
            userStates.delete(userId);
            removedCount++;
        }
    }

    if (removedCount > 0) {
        console.log(`Cleaned up ${removedCount} inactive users`);
    }
}

/**
 * Get statistics about active users
 * @returns {Object} User statistics
 */
function getUserStats() {
    const stats = {
        totalUsers: userStates.size,
        languageBreakdown: {
            en: 0,
            am: 0,
            om: 0,
            undefined: 0
        },
        activeInLastHour: 0,
        activeInLastDay: 0
    };

    const oneHourAgo = new Date(Date.now() - (60 * 60 * 1000));
    const oneDayAgo = new Date(Date.now() - (24 * 60 * 60 * 1000));

    for (const state of userStates.values()) {
        // Language breakdown
        const lang = state.language || 'undefined';
        stats.languageBreakdown[lang]++;

        // Activity breakdown
        if (state.lastActivity > oneHourAgo) {
            stats.activeInLastHour++;
        }
        if (state.lastActivity > oneDayAgo) {
            stats.activeInLastDay++;
        }
    }

    return stats;
}

/**
 * Set user registration step
 * @param {number|string} userId - User ID or Chat ID
 * @param {string} step - Registration step
 */
function setRegistrationStep(userId, step) {
    const userIdStr = userId.toString();
    const existingState = userStates.get(userIdStr) || {};

    userStates.set(userIdStr, {
        ...existingState,
        registrationStep: step,
        lastActivity: new Date()
    });
}

/**
 * Get user registration step
 * @param {number|string} userId - User ID or Chat ID
 * @returns {string|null} Current registration step
 */
function getRegistrationStep(userId) {
    const userState = userStates.get(userId.toString());
    return userState?.registrationStep || null;
}

/**
 * Set user registration data
 * @param {number|string} userId - User ID or Chat ID
 * @param {Object} data - Registration data
 */
function setRegistrationData(userId, data) {
    const userIdStr = userId.toString();
    const existingState = userStates.get(userIdStr) || {};

    userStates.set(userIdStr, {
        ...existingState,
        registrationData: {
            ...existingState.registrationData,
            ...data
        },
        lastActivity: new Date()
    });
}

/**
 * Get user registration data
 * @param {number|string} userId - User ID or Chat ID
 * @returns {Object} Registration data
 */
function getRegistrationData(userId) {
    const userState = userStates.get(userId.toString());
    return userState?.registrationData || {};
}

/**
 * Clear user registration data
 * @param {number|string} userId - User ID or Chat ID
 */
function clearRegistrationData(userId) {
    const userIdStr = userId.toString();
    const existingState = userStates.get(userIdStr);

    if (existingState) {
        userStates.set(userIdStr, {
            ...existingState,
            registrationStep: null,
            registrationData: {},
            lastActivity: new Date()
        });
    }
}

/**
 * Set user as admin
 * @param {number|string} userId - User ID or Chat ID
 * @param {boolean} isAdmin - Admin status
 */
function setAdminStatus(userId, isAdmin) {
    const userIdStr = userId.toString();
    const existingState = userStates.get(userIdStr) || {};

    userStates.set(userIdStr, {
        ...existingState,
        isAdmin,
        lastActivity: new Date()
    });
}

/**
 * Check if user is admin
 * @param {number|string} userId - User ID or Chat ID
 * @returns {boolean} Admin status
 */
function isAdmin(userId) {
    const userState = userStates.get(userId.toString());
    return userState?.isAdmin || false;
}

/**
 * Set admin step
 * @param {number|string} userId - User ID or Chat ID
 * @param {string} step - Admin step
 */
function setAdminStep(userId, step) {
    const userIdStr = userId.toString();
    const existingState = userStates.get(userIdStr) || {};

    userStates.set(userIdStr, {
        ...existingState,
        adminStep: step,
        lastActivity: new Date()
    });
}

/**
 * Get admin step
 * @param {number|string} userId - User ID or Chat ID
 * @returns {string|null} Current admin step
 */
function getAdminStep(userId) {
    const userState = userStates.get(userId.toString());
    return userState?.adminStep || null;
}

/**
 * Set selected application for admin
 * @param {number|string} userId - User ID or Chat ID
 * @param {string} trackingNumber - Application tracking number
 */
function setSelectedApplication(userId, trackingNumber) {
    const userIdStr = userId.toString();
    const existingState = userStates.get(userIdStr) || {};

    userStates.set(userIdStr, {
        ...existingState,
        selectedApplication: trackingNumber,
        lastActivity: new Date()
    });
}

/**
 * Get selected application for admin
 * @param {number|string} userId - User ID or Chat ID
 * @returns {string|null} Selected application tracking number
 */
function getSelectedApplication(userId) {
    const userState = userStates.get(userId.toString());
    return userState?.selectedApplication || null;
}

/**
 * Clear admin session
 * @param {number|string} userId - User ID or Chat ID
 */
function clearAdminSession(userId) {
    const userIdStr = userId.toString();
    const existingState = userStates.get(userIdStr);

    if (existingState) {
        userStates.set(userIdStr, {
            ...existingState,
            isAdmin: false,
            adminStep: null,
            selectedApplication: null,
            lastActivity: new Date()
        });
    }
}

/**
 * Initialize user state management with periodic cleanup
 */
function initializeUserStateManager() {
    // Run cleanup every 6 hours
    setInterval(() => {
        cleanupInactiveUsers(24);
    }, 6 * 60 * 60 * 1000);

    console.log('User state manager initialized with automatic cleanup');
}

module.exports = {
    getUserLanguage,
    setUserLanguage,
    getUserState,
    updateUserSession,
    clearUserSession,
    cleanupInactiveUsers,
    getUserStats,
    initializeUserStateManager,
    setRegistrationStep,
    getRegistrationStep,
    setRegistrationData,
    getRegistrationData,
    clearRegistrationData,
    setAdminStatus,
    isAdmin,
    setAdminStep,
    getAdminStep,
    setSelectedApplication,
    getSelectedApplication,
    clearAdminSession
};