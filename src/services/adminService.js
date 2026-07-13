/**
 * Admin Service for MESOB Bot
 * Handles admin authentication and dashboard operations
 */

const database = require('../database/db');

class AdminService {
    constructor() {
        // Admin credentials (in production, store in database with proper encryption)
        this.admins = new Map();
        
        // Add default admin (you can modify these credentials)
        this.admins.set('admin@mesob.gov.et', {
            email: 'admin@mesob.gov.et',
            password: 'admin123', // Change this in production!
            name: 'Super Admin',
            role: 'super_admin'
        });
    }

    /**
     * Authenticate admin
     */
    authenticate(email, password) {
        const admin = this.admins.get(email);
        if (admin && admin.password === password) {
            return {
                success: true,
                admin: {
                    email: admin.email,
                    name: admin.name,
                    role: admin.role
                }
            };
        }
        return { success: false, message: 'Invalid credentials' };
    }

    /**
     * Add new admin
     */
    addAdmin(email, password, name, role = 'admin') {
        if (this.admins.has(email)) {
            return { success: false, message: 'Admin already exists' };
        }

        this.admins.set(email, {
            email,
            password,
            name,
            role
        });

        return { success: true, message: 'Admin added successfully' };
    }

    /**
     * Get all applications
     */
    async getAllApplications() {
        try {
            // Get applications from database
            const stats = await database.getStats();
            
            if (stats.storage === 'MongoDB') {
                const applications = await database.collections.applications.find({}).toArray();
                return applications;
            } else {
                // Return from memory storage
                return Array.from(database.memoryStorage.applications.values());
            }
        } catch (error) {
            console.error('Error getting applications:', error);
            return [];
        }
    }

    /**
     * Get applications by status
     */
    async getApplicationsByStatus(status) {
        try {
            const allApplications = await this.getAllApplications();
            return allApplications.filter(app => app.status === status);
        } catch (error) {
            console.error('Error getting applications by status:', error);
            return [];
        }
    }

    /**
     * Get application by tracking number
     */
    async getApplication(trackingNumber) {
        return await database.getApplication(trackingNumber);
    }

    /**
     * Update application status
     */
    async updateApplicationStatus(trackingNumber, status, notes = '') {
        // If status is null, only update notes
        if (status === null) {
            try {
                const application = await database.getApplication(trackingNumber);
                if (application) {
                    const stats = await database.getStats();
                    
                    if (stats.storage === 'MongoDB') {
                        await database.collections.applications.updateOne(
                            { trackingNumber },
                            { 
                                $set: { 
                                    notes: notes,
                                    updatedAt: new Date()
                                }
                            }
                        );
                    } else {
                        // Update in memory storage
                        const app = database.memoryStorage.applications.get(trackingNumber);
                        if (app) {
                            app.notes = notes;
                            app.updatedAt = new Date();
                        }
                    }
                    return { success: true };
                }
                return { success: false, error: 'Application not found' };
            } catch (error) {
                console.error('Error updating application notes:', error);
                return { success: false, error: error.message };
            }
        }
        
        return await database.updateApplicationStatus(trackingNumber, status, notes);
    }

    /**
     * Get all users
     */
    async getAllUsers() {
        try {
            const stats = await database.getStats();
            
            if (stats.storage === 'MongoDB') {
                const users = await database.collections.users.find({}).toArray();
                return users;
            } else {
                // Return from memory storage
                return Array.from(database.memoryStorage.users.values());
            }
        } catch (error) {
            console.error('Error getting users:', error);
            return [];
        }
    }

    /**
     * Get statistics
     */
    async getStatistics() {
        try {
            const applications = await this.getAllApplications();
            const users = await this.getAllUsers();

            const stats = {
                totalUsers: users.length,
                totalApplications: applications.length,
                pending: applications.filter(app => app.status === 'submitted').length,
                approved: applications.filter(app => app.status === 'approved').length,
                rejected: applications.filter(app => app.status === 'rejected').length,
                serviceBreakdown: {}
            };

            // Calculate service breakdown
            applications.forEach(app => {
                const service = app.service || 'unknown';
                stats.serviceBreakdown[service] = (stats.serviceBreakdown[service] || 0) + 1;
            });

            return stats;
        } catch (error) {
            console.error('Error getting statistics:', error);
            return {
                totalUsers: 0,
                totalApplications: 0,
                pending: 0,
                approved: 0,
                rejected: 0,
                serviceBreakdown: {}
            };
        }
    }

    /**
     * Search applications
     */
    async searchApplications(query) {
        try {
            const applications = await this.getAllApplications();
            const lowerQuery = query.toLowerCase();

            return applications.filter(app => 
                app.trackingNumber.toLowerCase().includes(lowerQuery) ||
                (app.service && app.service.toLowerCase().includes(lowerQuery)) ||
                (app.status && app.status.toLowerCase().includes(lowerQuery)) ||
                (app.formData && app.formData.fullName && app.formData.fullName.toLowerCase().includes(lowerQuery))
            );
        } catch (error) {
            console.error('Error searching applications:', error);
            return [];
        }
    }

    /**
     * Get recent applications
     */
    async getRecentApplications(limit = 10) {
        try {
            const applications = await this.getAllApplications();
            
            // Sort by creation date (newest first)
            return applications
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, limit);
        } catch (error) {
            console.error('Error getting recent applications:', error);
            return [];
        }
    }
}

module.exports = new AdminService();