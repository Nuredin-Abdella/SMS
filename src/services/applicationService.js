/**
 * Application Submission Service - Simplified
 * Handles service-specific application forms
 */

const database = require('../database/db');

class ApplicationService {
    constructor() {
        this.userStates = new Map();
        
        // Service-specific requirements
        this.serviceRequirements = {
            'national_id': {
                fields: ['full_name', 'id_number', 'address', 'birth_date'],
                prompts: {
                    'full_name': '📝 Please enter your full name:',
                    'id_number': '🆔 Please enter your ID number:',
                    'address': '📍 Please enter your address:',
                    'birth_date': '📅 Please enter your date of birth (DD/MM/YYYY):'
                }
            },
            'passport': {
                fields: ['full_name', 'id_number', 'address', 'birth_date', 'place_of_birth'],
                prompts: {
                    'full_name': '📝 Please enter your full name:',
                    'id_number': '🆔 Please enter your ID number:',
                    'address': '📍 Please enter your address:',
                    'birth_date': '📅 Please enter your date of birth (DD/MM/YYYY):',
                    'place_of_birth': '🏥 Please enter your place of birth:'
                }
            },
            'vital_registration': {
                fields: ['full_name', 'id_number', 'address', 'vital_event_type'],
                prompts: {
                    'full_name': '📝 Please enter your full name:',
                    'id_number': '🆔 Please enter your ID number:',
                    'address': '📍 Please enter your address:',
                    'vital_event_type': '📋 Please select vital event type:\n1. Birth\n2. Death\n3. Marriage\n4. Divorce'
                }
            },
            'civil_status': {
                fields: ['full_name', 'id_number', 'address', 'civil_status_type'],
                prompts: {
                    'full_name': '📝 Please enter your full name:',
                    'id_number': '🆔 Please enter your ID number:',
                    'address': '📍 Please enter your address:',
                    'civil_status_type': '📋 Please select civil status type:\n1. Single\n2. Married\n3. Divorced\n4. Widowed'
                }
            },
            'business_license': {
                fields: ['full_name', 'business_name', 'business_type', 'address', 'capital'],
                prompts: {
                    'full_name': '📝 Please enter your full name:',
                    'business_name': '🏢 Please enter your business name:',
                    'business_type': '🏢 Please enter your business type:',
                    'address': '📍 Please enter your business address:',
                    'capital': '💰 Please enter your business capital (ETB):'
                }
            },
            'cooperatives': {
                fields: ['full_name', 'cooperative_name', 'cooperative_type', 'address', 'member_count'],
                prompts: {
                    'full_name': '📝 Please enter your full name:',
                    'cooperative_name': '🏢 Please enter your cooperative name:',
                    'cooperative_type': '🏢 Please enter your cooperative type:',
                    'address': '📍 Please enter your address:',
                    'member_count': '👥 Please enter the number of members:'
                }
            },
            'revenue': {
                fields: ['full_name', 'id_number', 'address', 'tax_id'],
                prompts: {
                    'full_name': '📝 Please enter your full name:',
                    'id_number': '🆔 Please enter your ID number:',
                    'address': '📍 Please enter your address:',
                    'tax_id': '💳 Please enter your tax ID number:'
                }
            },
            'land': {
                fields: ['full_name', 'id_number', 'address', 'land_location', 'land_size'],
                prompts: {
                    'full_name': '📝 Please enter your full name:',
                    'id_number': '🆔 Please enter your ID number:',
                    'address': '📍 Please enter your address:',
                    'land_location': '🗺️ Please enter the land location:',
                    'land_size': '📏 Please enter the land size (square meters):'
                }
            },
            'investment': {
                fields: ['full_name', 'business_name', 'investment_type', 'address', 'investment_amount'],
                prompts: {
                    'full_name': '📝 Please enter your full name:',
                    'business_name': '🏢 Please enter your business name:',
                    'investment_type': '💼 Please enter your investment type:',
                    'address': '📍 Please enter your address:',
                    'investment_amount': '💰 Please enter your investment amount (ETB):'
                }
            },
            'document_auth': {
                fields: ['full_name', 'id_number', 'document_type', 'document_number'],
                prompts: {
                    'full_name': '📝 Please enter your full name:',
                    'id_number': '🆔 Please enter your ID number:',
                    'document_type': '📄 Please enter the document type to authenticate:',
                    'document_number': '🔢 Please enter the document number:'
                }
            },
            'transport': {
                fields: ['full_name', 'id_number', 'address', 'vehicle_type', 'plate_number'],
                prompts: {
                    'full_name': '📝 Please enter your full name:',
                    'id_number': '🆔 Please enter your ID number:',
                    'address': '📍 Please enter your address:',
                    'vehicle_type': '🚗 Please enter your vehicle type:',
                    'plate_number': '🔢 Please enter your vehicle plate number:'
                }
            },
            'construction': {
                fields: ['full_name', 'business_name', 'address', 'building_type', 'building_size'],
                prompts: {
                    'full_name': '📝 Please enter your full name:',
                    'business_name': '🏢 Please enter your business name:',
                    'address': '📍 Please enter your address:',
                    'building_type': '🏗️ Please enter your building type:',
                    'building_size': '📏 Please enter your building size (square meters):'
                }
            },
            'sanitation': {
                fields: ['full_name', 'id_number', 'address', 'property_type'],
                prompts: {
                    'full_name': '📝 Please enter your full name:',
                    'id_number': '🆔 Please enter your ID number:',
                    'address': '📍 Please enter your address:',
                    'property_type': '🏠 Please enter your property type:'
                }
            },
            'social': {
                fields: ['full_name', 'id_number', 'address', 'service_type'],
                prompts: {
                    'full_name': '📝 Please enter your full name:',
                    'id_number': '🆔 Please enter your ID number:',
                    'address': '📍 Please enter your address:',
                    'service_type': '🛎️ Please enter the social service type you need:'
                }
            },
            'urban_planning': {
                fields: ['full_name', 'id_number', 'address', 'plot_number', 'zone'],
                prompts: {
                    'full_name': '📝 Please enter your full name:',
                    'id_number': '🆔 Please enter your ID number:',
                    'address': '📍 Please enter your address:',
                    'plot_number': '🔢 Please enter your plot number:',
                    'zone': '🗺️ Please enter your zone:'
                }
            },
            'elections': {
                fields: ['full_name', 'id_number', 'address', 'voter_type'],
                prompts: {
                    'full_name': '📝 Please enter your full name:',
                    'id_number': '🆔 Please enter your ID number:',
                    'address': '📍 Please enter your address:',
                    'voter_type': '🗳️ Please enter your voter type (new/renewal):'
                }
            }
        };
    }

    startApplication(chatId, userLang, service) {
        const requirements = this.serviceRequirements[service] || this.serviceRequirements['national_id'];
        
        this.userStates.set(chatId, {
            step: 0,
            service: service,
            fields: requirements.fields,
            prompts: requirements.prompts,
            formData: {},
            createdAt: new Date()
        });

        return {
            success: true,
            firstPrompt: requirements.prompts[requirements.fields[0]]
        };
    }

    processApplicationStep(chatId, userInput, bot, getTranslation, userLang) {
        const state = this.userStates.get(chatId);
        if (!state) {
            return { success: false, error: 'No active application' };
        }

        const { step, fields, prompts, formData } = state;

        if (step < fields.length) {
            const currentField = fields[step];
            formData[currentField] = userInput;
            state.step++;
            
            if (step < fields.length - 1) {
                const nextField = fields[step + 1];
                return {
                    success: true,
                    nextPrompt: prompts[nextField]
                };
            } else {
                return {
                    success: true,
                    nextPrompt: '✅ Information collected successfully! Type "submit" to complete your application.'
                };
            }
        } else {
            if (userInput.toLowerCase() === 'submit') {
                return this.submitApplication(chatId, bot, getTranslation, userLang);
            }
            return {
                success: true,
                nextPrompt: 'Type "submit" to complete your application or "cancel" to abort.'
            };
        }
    }

    hasActiveApplication(chatId) {
        return this.userStates.has(chatId);
    }

    async submitApplication(chatId, bot, getTranslation, userLang) {
        const state = this.userStates.get(chatId);
        if (!state) {
            return { success: false, error: 'No active application' };
        }

        try {
            const trackingNumber = await database.createApplication({
                chatId,
                service: state.service,
                formData: {
                    ...state.formData,
                    submittedAt: new Date().toISOString(),
                    status: 'pending'
                },
                documents: [],
                status: 'submitted'
            });

            this.userStates.delete(chatId);

            return {
                success: true,
                completed: true,
                message: `✅ Application submitted successfully!\n\n📋 Tracking Number: ${trackingNumber}\n🏛️ Service: ${state.service}\n\nYour application has been received and is being processed.\n\n📞 For inquiries: +251 913 116898\n🌐 Visit: mesobshashe.gov.et`,
                trackingNumber,
                service: state.service
            };

        } catch (error) {
            console.error('Application submission failed:', error);
            return { success: false, error: error.message };
        }
    }

    cancelApplication(chatId) {
        this.userStates.delete(chatId);
        return { success: true };
    }
}

module.exports = new ApplicationService();
