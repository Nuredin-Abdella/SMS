/**
 * SMS Service - Simplified
 * Handles phone number validation and formatting
 */

class SMSService {
    /**
     * Format phone number to Ethiopian format
     */
    formatPhoneNumber(phoneNumber) {
        let cleaned = phoneNumber.replace(/\D/g, '');
        if (cleaned.startsWith('0')) {
            cleaned = '251' + cleaned.substring(1);
        }
        if (!cleaned.startsWith('251')) {
            cleaned = '251' + cleaned;
        }
        return '+' + cleaned;
    }

    /**
     * Validate phone number
     */
    validatePhoneNumber(phoneNumber) {
        const cleaned = phoneNumber.replace(/\D/g, '');
        const ethiopianPhoneRegex = /^251[9]\d{8}$/;
        return ethiopianPhoneRegex.test(cleaned);
    }
}

module.exports = new SMSService();
