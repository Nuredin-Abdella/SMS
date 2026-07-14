/**
 * Database Manager for MESOB Bot
 * Handles MongoDB connection with in-memory fallback
 */

const { MongoClient } = require('mongodb');

class DatabaseManager {
    constructor() {
        this.mongoUrl = process.env.MONGODB_URI || null;
        this.client = null;
        this.db = null;
        this.collections = null;
        this.isConnected = false;

        // In-memory storage fallback
        this.memoryStorage = {
            users: new Map(),
            sessions: new Map(),
            applications: new Map(),
            auditLogs: [],
            analytics: new Map()
        };
    }

    /**
     * Initialize database connection
     */
    async initialize() {
        if (this.mongoUrl) {
            try {
                console.log('🔗 Connecting to MongoDB...');
                this.client = new MongoClient(this.mongoUrl);
                await this.client.connect();

                this.db = this.client.db('mesob_bot');
                this.collections = {
                    users: this.db.collection('users'),
                    sessions: this.db.collection('sessions'),
                    applications: this.db.collection('applications'),
                    auditLogs: this.db.collection('audit_logs'),
                    analytics: this.db.collection('analytics')
                };

                this.isConnected = true;
                console.log('✅ MongoDB connected successfully');
                return true;
            } catch (error) {
                console.error('❌ MongoDB connection failed:', error.message);
                console.log('📝 Using in-memory storage fallback');
                return false;
            }
        } else {
            console.log('📝 No MongoDB URL provided, using in-memory storage');
            return false;
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
     * User management
     */
    async saveUser(userData) {
        const encryptedData = {
            ...userData,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        if (this.isConnected) {
            try {
                await this.collections.users.replaceOne(
                    { chatId: userData.chatId },
                    encryptedData,
                    { upsert: true }
                );
                return true;
            } catch (error) {
                console.error('❌ Failed to save user to MongoDB:', error.message);
            }
        }

        // Fallback to memory storage
        this.memoryStorage.users.set(userData.chatId.toString(), encryptedData);
        return true;
    }

    async getUser(chatId) {
        if (this.isConnected) {
            try {
                const user = await this.collections.users.findOne({ chatId });
                return user;
            } catch (error) {
                console.error('❌ Failed to get user from MongoDB:', error.message);
            }
        }

        // Fallback to memory storage
        return this.memoryStorage.users.get(chatId.toString());
    }

    async getUserByPhoneNumber(phoneNumber) {
        if (this.isConnected) {
            try {
                const user = await this.collections.users.findOne({ 
                    'personalInfo.phoneNumber': phoneNumber 
                });
                return user;
            } catch (error) {
                console.error('❌ Failed to get user by phone from MongoDB:', error.message);
            }
        }

        // Fallback to memory storage
        for (const [chatId, userData] of this.memoryStorage.users.entries()) {
            if (userData.personalInfo && userData.personalInfo.phoneNumber === phoneNumber) {
                return userData;
            }
        }
        return null;
    }

    async updateUserPhoneVerification(chatId, phoneNumber, isVerified = false) {
        if (this.isConnected) {
            try {
                const user = await this.collections.users.findOne({ chatId });
                if (user) {
                    const personalInfo = user.personalInfo || {};
                    personalInfo.phoneNumber = phoneNumber;
                    personalInfo.phoneVerified = isVerified;
                    
                    await this.collections.users.updateOne(
                        { chatId },
                        { 
                            $set: { 
                                personalInfo: personalInfo,
                                updatedAt: new Date()
                            }
                        }
                    );
                    return true;
                }
            } catch (error) {
                console.error('❌ Failed to update user phone verification:', error.message);
            }
        }

        // Fallback to memory storage
        const user = this.memoryStorage.users.get(chatId.toString());
        if (user) {
            user.personalInfo = user.personalInfo || {};
            user.personalInfo.phoneNumber = phoneNumber;
            user.personalInfo.phoneVerified = isVerified;
            user.updatedAt = new Date();
            return true;
        }
        return false;
    }

    /**
     * Application management
     */
    async createApplication(applicationData) {
        const trackingNumber = this.generateTrackingNumber();
        const application = {
            trackingNumber,
            ...applicationData,
            status: 'submitted',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        if (this.isConnected) {
            try {
                await this.collections.applications.insertOne(application);
                return trackingNumber;
            } catch (error) {
                console.error('❌ Failed to create application in MongoDB:', error.message);
            }
        }

        // Fallback to memory storage
        this.memoryStorage.applications.set(trackingNumber, application);
        return trackingNumber;
    }

    async getApplication(trackingNumber) {
        if (this.isConnected) {
            try {
                const application = await this.collections.applications.findOne({ trackingNumber });
                return application;
            } catch (error) {
                console.error('❌ Failed to get application from MongoDB:', error.message);
            }
        }

        // Fallback to memory storage
        return this.memoryStorage.applications.get(trackingNumber);
    }

    async getApplicationsByChatId(chatId) {
        if (this.isConnected) {
            try {
                const applications = await this.collections.applications
                    .find({ chatId })
                    .sort({ createdAt: -1 })
                    .toArray();
                return applications;
            } catch (error) {
                console.error('❌ Failed to get applications from MongoDB:', error.message);
            }
        }

        // Fallback to memory storage
        const applications = [];
        for (const [trackingNumber, application] of this.memoryStorage.applications.entries()) {
            if (application.chatId === chatId) {
                applications.push(application);
            }
        }
        return applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    async updateApplicationStatus(trackingNumber, status, notes = '') {
        if (this.isConnected) {
            try {
                await this.collections.applications.updateOne(
                    { trackingNumber },
                    { 
                        $set: { 
                            status,
                            notes,
                            updatedAt: new Date()
                        }
                    }
                );
                return { success: true };
            } catch (error) {
                console.error('❌ Failed to update application status in MongoDB:', error.message);
                return { success: false, error: error.message };
            }
        }

        // Fallback to memory storage
        const application = this.memoryStorage.applications.get(trackingNumber);
        if (application) {
            application.status = status;
            application.notes = notes;
            application.updatedAt = new Date();
            return { success: true };
        }
        return { success: false, error: 'Application not found' };
    }

    /**
     * Statistics and analytics
     */
    async getStats() {
        if (this.isConnected) {
            try {
                const userCount = await this.collections.users.countDocuments();
                const applicationCount = await this.collections.applications.countDocuments();
                return {
                    storage: 'MongoDB',
                    totalUsers: userCount,
                    totalApplications: applicationCount,
                    isConnected: true
                };
            } catch (error) {
                console.error('❌ Failed to get stats from MongoDB:', error.message);
            }
        }

        // Fallback to memory storage
        return {
            storage: 'Memory',
            totalUsers: this.memoryStorage.users.size,
            totalApplications: this.memoryStorage.applications.size,
            isConnected: false
        };
    }

    /**
     * Cleanup and maintenance
     */
    async cleanup() {
        if (this.isConnected) {
            try {
                await this.client.close();
                console.log('✅ MongoDB connection closed');
            } catch (error) {
                console.error('❌ Failed to close MongoDB connection:', error.message);
            }
        }
    }
}

module.exports = new DatabaseManager();