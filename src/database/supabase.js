/**
 * Supabase Database Service for MESOB Bot
 * Replaces MongoDB with cloud-based Supabase PostgreSQL
 */

const { createClient } = require('@supabase/supabase-js');

class SupabaseDatabase {
    constructor() {
        this.supabase = null;
        this.connected = false;
        this.memoryStorage = {
            users: new Map(),
            applications: new Map(),
            documents: new Map()
        };
    }

    /**
     * Initialize Supabase connection
     */
    async initialize() {
        try {
            const supabaseUrl = process.env.SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_ANON_KEY;

            if (!supabaseUrl || !supabaseKey) {
                console.log('📝 No Supabase credentials provided, using in-memory storage');
                return;
            }

            this.supabase = createClient(supabaseUrl, supabaseKey);

            // Test connection
            const { data, error } = await this.supabase
                .from('users')
                .select('count')
                .limit(1);

            if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist (expected for first run)
                throw error;
            }

            this.connected = true;
            console.log('✅ Supabase connected successfully');

            // Create tables if they don't exist
            await this.createTables();

        } catch (error) {
            console.error('❌ Supabase connection failed:', error.message);
            console.log('📝 Using in-memory storage fallback');
            this.connected = false;
        }
    }

    /**
     * Create database tables
     */
    async createTables() {
        if (!this.connected) return;

        try {
            // Note: In Supabase, tables are usually created through the dashboard or SQL editor
            // This is just for reference of the expected schema
            console.log('📋 Database tables ready (create via Supabase dashboard if needed)');
        } catch (error) {
            console.error('Error with table setup:', error);
        }
    }

    /**
     * Save user to database
     */
    async saveUser(userData) {
        try {
            if (this.connected) {
                const { data, error } = await this.supabase
                    .from('users')
                    .upsert({
                        chat_id: userData.chatId.toString(),
                        personal_info: userData.personalInfo,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'chat_id' });

                if (error) throw error;
                console.log('💾 User saved to Supabase:', userData.chatId);
                return data;
            } else {
                // Fallback to memory storage
                this.memoryStorage.users.set(userData.chatId, {
                    ...userData,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                console.log('💾 User saved to memory:', userData.chatId);
                return userData;
            }
        } catch (error) {
            console.error('Error saving user:', error);
            // Fallback to memory
            this.memoryStorage.users.set(userData.chatId, userData);
            return userData;
        }
    }

    /**
     * Get user by chat ID
     */
    async getUser(chatId) {
        try {
            if (this.connected) {
                const { data, error } = await this.supabase
                    .from('users')
                    .select('*')
                    .eq('chat_id', chatId.toString())
                    .single();

                if (error && error.code !== 'PGRST116') {
                    console.log('User not found in Supabase:', chatId);
                    return null;
                }

                if (data) {
                    return {
                        chatId: parseInt(data.chat_id),
                        personalInfo: data.personal_info,
                        createdAt: new Date(data.created_at),
                        updatedAt: new Date(data.updated_at)
                    };
                }
                return null;
            } else {
                // Fallback to memory storage
                return this.memoryStorage.users.get(chatId) || null;
            }
        } catch (error) {
            console.error('Error getting user:', error);
            return this.memoryStorage.users.get(chatId) || null;
        }
    }

    /**
     * Get user by phone number
     */
    async getUserByPhoneNumber(phoneNumber) {
        try {
            if (this.connected) {
                const { data, error } = await this.supabase
                    .from('users')
                    .select('*')
                    .eq('personal_info->phoneNumber', phoneNumber)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    return null;
                }

                if (data) {
                    return {
                        chatId: parseInt(data.chat_id),
                        personalInfo: data.personal_info,
                        createdAt: new Date(data.created_at),
                        updatedAt: new Date(data.updated_at)
                    };
                }
                return null;
            } else {
                // Fallback to memory storage
                for (const [chatId, user] of this.memoryStorage.users) {
                    if (user.personalInfo && user.personalInfo.phoneNumber === phoneNumber) {
                        return user;
                    }
                }
                return null;
            }
        } catch (error) {
            console.error('Error getting user by phone:', error);
            return null;
        }
    }

    /**
     * Update user phone verification
     */
    async updateUserPhoneVerification(chatId, phoneNumber, verified) {
        try {
            const user = await this.getUser(chatId);
            if (user) {
                user.personalInfo = user.personalInfo || {};
                user.personalInfo.phoneNumber = phoneNumber;
                user.personalInfo.phoneVerified = verified;
                return await this.saveUser(user);
            }
            return null;
        } catch (error) {
            console.error('Error updating phone verification:', error);
            return null;
        }
    }

    /**
     * Generate tracking number
     */
    generateTrackingNumber() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Create application with auto-generated tracking number
     */
    async createApplication(applicationData) {
        try {
            const trackingNumber = this.generateTrackingNumber();
            const applicationWithTracking = {
                ...applicationData,
                trackingNumber: trackingNumber
            };

            await this.saveApplication(applicationWithTracking);
            return trackingNumber;
        } catch (error) {
            console.error('Error creating application:', error);
            throw error;
        }
    }

    /**
     * Save application
     */
    async saveApplication(applicationData) {
        try {
            if (this.connected) {
                const { data, error } = await this.supabase
                    .from('applications')
                    .insert({
                        tracking_number: applicationData.trackingNumber,
                        chat_id: applicationData.chatId.toString(),
                        service: applicationData.service,
                        status: applicationData.status || 'submitted',
                        form_data: applicationData.formData,
                        documents: applicationData.documents || [],
                        notes: applicationData.notes || '',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });

                if (error) throw error;
                console.log('📋 Application saved to Supabase:', applicationData.trackingNumber);
                return data;
            } else {
                // Fallback to memory storage
                this.memoryStorage.applications.set(applicationData.trackingNumber, {
                    ...applicationData,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                console.log('📋 Application saved to memory:', applicationData.trackingNumber);
                return applicationData;
            }
        } catch (error) {
            console.error('Error saving application:', error);
            // Fallback to memory
            this.memoryStorage.applications.set(applicationData.trackingNumber, applicationData);
            return applicationData;
        }
    }

    /**
     * Get application by tracking number
     */
    async getApplication(trackingNumber) {
        try {
            if (this.connected) {
                const { data, error } = await this.supabase
                    .from('applications')
                    .select('*')
                    .eq('tracking_number', trackingNumber)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    return null;
                }

                if (data) {
                    return {
                        trackingNumber: data.tracking_number,
                        chatId: parseInt(data.chat_id),
                        service: data.service,
                        status: data.status,
                        formData: data.form_data,
                        documents: data.documents || [],
                        notes: data.notes,
                        createdAt: new Date(data.created_at),
                        updatedAt: new Date(data.updated_at)
                    };
                }
                return null;
            } else {
                // Fallback to memory storage
                return this.memoryStorage.applications.get(trackingNumber) || null;
            }
        } catch (error) {
            console.error('Error getting application:', error);
            return this.memoryStorage.applications.get(trackingNumber) || null;
        }
    }

    /**
     * Get applications by chat ID
     */
    async getApplicationsByChatId(chatId) {
        try {
            if (this.connected) {
                const { data, error } = await this.supabase
                    .from('applications')
                    .select('*')
                    .eq('chat_id', chatId.toString())
                    .order('created_at', { ascending: false });

                if (error) throw error;

                return data.map(app => ({
                    trackingNumber: app.tracking_number,
                    chatId: parseInt(app.chat_id),
                    service: app.service,
                    status: app.status,
                    formData: app.form_data,
                    documents: app.documents || [],
                    notes: app.notes,
                    createdAt: new Date(app.created_at),
                    updatedAt: new Date(app.updated_at)
                }));
            } else {
                // Fallback to memory storage
                const applications = [];
                for (const [trackingNumber, app] of this.memoryStorage.applications) {
                    if (app.chatId === chatId) {
                        applications.push(app);
                    }
                }
                return applications.sort((a, b) => b.createdAt - a.createdAt);
            }
        } catch (error) {
            console.error('Error getting applications by chat ID:', error);
            return [];
        }
    }

    /**
     * Update application status
     */
    async updateApplicationStatus(trackingNumber, status, notes = '') {
        try {
            if (this.connected) {
                const updateData = {
                    updated_at: new Date().toISOString()
                };

                if (status) updateData.status = status;
                if (notes) updateData.notes = notes;

                const { data, error } = await this.supabase
                    .from('applications')
                    .update(updateData)
                    .eq('tracking_number', trackingNumber);

                if (error) throw error;
                return { success: true };
            } else {
                // Fallback to memory storage
                const app = this.memoryStorage.applications.get(trackingNumber);
                if (app) {
                    if (status) app.status = status;
                    if (notes) app.notes = notes;
                    app.updatedAt = new Date();
                    return { success: true };
                }
                return { success: false, error: 'Application not found' };
            }
        } catch (error) {
            console.error('Error updating application status:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get database statistics
     */
    async getStats() {
        return {
            storage: this.connected ? 'Supabase' : 'Memory',
            connected: this.connected,
            users: this.connected ? 'N/A' : this.memoryStorage.users.size,
            applications: this.connected ? 'N/A' : this.memoryStorage.applications.size
        };
    }
}

module.exports = new SupabaseDatabase();