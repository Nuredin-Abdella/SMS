/**
 * User State Management for MESOB Telegram Bot
 * Simplified state management
 */

const userStates = new Map();

function getUserLanguage(userId) {
    const userState = userStates.get(userId.toString());
    return userState?.language || null;
}

function setUserLanguage(userId, language) {
    const userIdStr = userId.toString();
    const existingState = userStates.get(userIdStr) || {};
    userStates.set(userIdStr, { ...existingState, language, lastActivity: new Date() });
}

function setRegistrationStep(userId, step) {
    const userIdStr = userId.toString();
    const existingState = userStates.get(userIdStr) || {};
    userStates.set(userIdStr, { ...existingState, registrationStep: step, lastActivity: new Date() });
}

function getRegistrationStep(userId) {
    const userState = userStates.get(userId.toString());
    return userState?.registrationStep || null;
}

function setRegistrationData(userId, data) {
    const userIdStr = userId.toString();
    const existingState = userStates.get(userIdStr) || {};
    userStates.set(userIdStr, { 
        ...existingState, 
        registrationData: { ...existingState.registrationData, ...data },
        lastActivity: new Date() 
    });
}

function getRegistrationData(userId) {
    const userState = userStates.get(userId.toString());
    return userState?.registrationData || {};
}

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

function setAdminStatus(userId, isAdmin) {
    const userIdStr = userId.toString();
    const existingState = userStates.get(userIdStr) || {};
    userStates.set(userIdStr, { ...existingState, isAdmin, lastActivity: new Date() });
}

function isAdmin(userId) {
    const userState = userStates.get(userId.toString());
    return userState?.isAdmin || false;
}

function setAdminStep(userId, step) {
    const userIdStr = userId.toString();
    const existingState = userStates.get(userIdStr) || {};
    userStates.set(userIdStr, { ...existingState, adminStep: step, lastActivity: new Date() });
}

function getAdminStep(userId) {
    const userState = userStates.get(userId.toString());
    return userState?.adminStep || null;
}

function clearAdminSession(userId) {
    const userIdStr = userId.toString();
    const existingState = userStates.get(userIdStr);
    if (existingState) {
        userStates.set(userIdStr, { 
            ...existingState, 
            isAdmin: false, 
            adminStep: null,
            adminData: null,
            lastActivity: new Date() 
        });
    }
}

function setAdminData(userId, data) {
    const userIdStr = userId.toString();
    const existingState = userStates.get(userIdStr) || {};
    userStates.set(userIdStr, { 
        ...existingState, 
        adminData: { ...existingState.adminData, ...data },
        lastActivity: new Date() 
    });
}

function getAdminData(userId) {
    const userState = userStates.get(userId.toString());
    return userState?.adminData || {};
}

function initializeUserStateManager() {
    setInterval(() => {
        const cutoffTime = new Date(Date.now() - (24 * 60 * 60 * 1000));
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
    }, 6 * 60 * 60 * 1000);
    console.log('User state manager initialized');
}

module.exports = {
    getUserLanguage,
    setUserLanguage,
    setRegistrationStep,
    getRegistrationStep,
    setRegistrationData,
    getRegistrationData,
    clearRegistrationData,
    setAdminStatus,
    isAdmin,
    setAdminStep,
    getAdminStep,
    clearAdminSession,
    setAdminData,
    getAdminData,
    initializeUserStateManager
};