/**
 * Application Submission Service
 * Handles the workflow for submitting service applications
 */

const database = require('../database/db');
const documentService = require('./documentService');

class ApplicationService {
    constructor() {
        // Track user application states
        this.userStates = new Map();
    }

    /**
     * Start new application for user
     */
    startApplication(chatId, userLang) {
        this.userStates.set(chatId, {
            step: 'collect_full_name',
            service: null,
            formData: {},
            documents: [],
            createdAt: new Date()
        });

        return {
            success: true,
            message: 'Application started. Please provide your information.'
        };
    }

    /**
     * Set selected service
     */
    setService(chatId, service) {
        const state = this.userStates.get(chatId);
        if (!state) {
            return { success: false, error: 'No active application' };
        }

        state.service = service;
        return { success: true, service };
    }

    /**
     * Update form data for current step
     */
    updateFormData(chatId, field, value) {
        const state = this.userStates.get(chatId);
        if (!state) {
            return { success: false, error: 'No active application' };
        }

        state.formData[field] = value;
        return { success: true };
    }

    /**
     * Move to next form step
     */
    nextStep(chatId) {
        const state = this.userStates.get(chatId);
        if (!state) {
            return { success: false, error: 'No active application' };
        }

        const stepFlow = {
            'collect_full_name': 'collect_phone',
            'collect_phone': 'collect_email',
            'collect_email': 'collect_id_number',
            'collect_id_number': 'collect_address',
            'collect_address': 'collect_business_license',
            'collect_business_license': 'collect_business_name',
            'collect_business_name': 'collect_insurance',
            'collect_insurance': 'agree_terms',
            'agree_terms': 'upload_documents',
            'upload_documents': 'ready_to_submit'
        };

        if (stepFlow[state.step]) {
            state.step = stepFlow[state.step];
            return { success: true, nextStep: state.step };
        }

        return { success: false, error: 'No next step' };
    }

    /**
     * Get current form step
     */
    getCurrentStep(chatId) {
        const state = this.userStates.get(chatId);
        return state ? state.step : null;
    }

    /**
     * Add document to application
     */
    addDocument(chatId, documentId, filename) {
        const state = this.userStates.get(chatId);
        if (!state) {
            return { success: false, error: 'No active application' };
        }

        if (state.documents.length >= 5) {
            return { success: false, error: 'Maximum 5 documents allowed' };
        }

        state.documents.push({ documentId, filename });
        return { success: true, count: state.documents.length };
    }

    /**
     * Submit application
     */
    async submitApplication(chatId, bot) {
        const state = this.userStates.get(chatId);
        if (!state) {
            return { success: false, error: 'No active application' };
        }

        if (!state.service) {
            return { success: false, error: 'No service selected' };
        }

        try {
            // Create application in database with form data (documents optional)
            const trackingNumber = await database.createApplication({
                chatId,
                service: state.service,
                formData: state.formData,
                documents: state.documents || [],
                status: 'submitted'
            });

            // Update documents with application ID
            for (const doc of state.documents) {
                const document = documentService.documents.get(doc.documentId);
                if (document) {
                    document.applicationId = trackingNumber;
                }
            }

            // Clear user state
            this.userStates.delete(chatId);

            return {
                success: true,
                trackingNumber,
                service: state.service,
                documentCount: state.documents.length,
                formData: state.formData
            };

        } catch (error) {
            console.error('Application submission failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Cancel application
     */
    cancelApplication(chatId) {
        this.userStates.delete(chatId);
        return { success: true };
    }

    /**
     * Get current application state
     */
    getApplicationState(chatId) {
        return this.userStates.get(chatId);
    }

    /**
     * Check if user has active application
     */
    hasActiveApplication(chatId) {
        return this.userStates.has(chatId);
    }
}

module.exports = new ApplicationService();
