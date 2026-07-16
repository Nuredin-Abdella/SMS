/**
 * Admin Service for MESOB Bot
 * Handles admin authentication and dashboard operations
 */

const database = require('../database/db');

class AdminService {
    constructor() {
        // Admin credentials (in production, store in database with proper encryption)
        this.admins = new Map();

        // Add default admins
        this.admins.set('admin@mesob.gov.et', {
            email: 'admin@mesob.gov.et',
            password: 'admin123', // Change this in production!
            name: 'Super Admin',
            role: 'super_admin'
        });

        // Add department heads
        this.admins.set('director@mesob.gov.et', {
            email: 'director@mesob.gov.et',
            password: 'director2024',
            name: 'MESOB Director',
            role: 'director'
        });

        this.admins.set('manager@mesob.gov.et', {
            email: 'manager@mesob.gov.et',
            password: 'manager2024',
            name: 'Operations Manager',
            role: 'manager'
        });

        this.admins.set('supervisor@mesob.gov.et', {
            email: 'supervisor@mesob.gov.et',
            password: 'super2024',
            name: 'Application Supervisor',
            role: 'supervisor'
        });

        // Add service coordinators for all 12 pods
        this.admins.set('passport@mesob.gov.et', {
            email: 'passport@mesob.gov.et',
            password: 'passport2024',
            name: 'Passport Services Coordinator',
            role: 'coordinator',
            services: ['national_id', 'passport']
        });

        this.admins.set('business@mesob.gov.et', {
            email: 'business@mesob.gov.et',
            password: 'business2024',
            name: 'Business Services Coordinator',
            role: 'coordinator',
            services: ['business_license', 'cooperatives']
        });

        this.admins.set('investment@mesob.gov.et', {
            email: 'investment@mesob.gov.et',
            password: 'invest2024',
            name: 'Investment & Revenue Coordinator',
            role: 'coordinator',
            services: ['investment', 'revenue']
        });

        this.admins.set('banking@mesob.gov.et', {
            email: 'banking@mesob.gov.et',
            password: 'banking2024',
            name: 'Banking & Finance Coordinator',
            role: 'coordinator',
            services: ['bank_services', 'microfinance']
        });

        this.admins.set('land@mesob.gov.et', {
            email: 'land@mesob.gov.et',
            password: 'land2024',
            name: 'Land & Urban Planning Coordinator',
            role: 'coordinator',
            services: ['land', 'urban_planning']
        });

        this.admins.set('permits@mesob.gov.et', {
            email: 'permits@mesob.gov.et',
            password: 'permits2024',
            name: 'Investment Permits Coordinator',
            role: 'coordinator',
            services: ['investment_permit', 'investment_license']
        });

        this.admins.set('documents@mesob.gov.et', {
            email: 'documents@mesob.gov.et',
            password: 'docs2024',
            name: 'Documents & Vital Records Coordinator',
            role: 'coordinator',
            services: ['document_auth', 'vital_registration']
        });

        this.admins.set('licensing@mesob.gov.et', {
            email: 'licensing@mesob.gov.et',
            password: 'license2024',
            name: 'Professional Licensing Coordinator',
            role: 'coordinator',
            services: ['driving_license', 'professional_license']
        });

        this.admins.set('social@mesob.gov.et', {
            email: 'social@mesob.gov.et',
            password: 'social2024',
            name: 'Civil & Social Services Coordinator',
            role: 'coordinator',
            services: ['civil_status', 'social']
        });

        this.admins.set('quality@mesob.gov.et', {
            email: 'quality@mesob.gov.et',
            password: 'quality2024',
            name: 'Quality & Certification Coordinator',
            role: 'coordinator',
            services: ['certification', 'inspection']
        });

        this.admins.set('construction@mesob.gov.et', {
            email: 'construction@mesob.gov.et',
            password: 'construct2024',
            name: 'Construction & Environment Coordinator',
            role: 'coordinator',
            services: ['construction', 'sanitation']
        });

        this.admins.set('elections@mesob.gov.et', {
            email: 'elections@mesob.gov.et',
            password: 'election2024',
            name: 'Elections & Special Cases Coordinator',
            role: 'coordinator',
            services: ['elections', 'special_cases']
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
     * Get applications for specific coordinator's services
     */
    async getCoordinatorApplications(email) {
        try {
            const admin = this.admins.get(email);
            if (!admin || admin.role !== 'coordinator') {
                return [];
            }

            const allApplications = await this.getAllApplications();
            return allApplications.filter(app =>
                admin.services && admin.services.includes(app.service)
            );
        } catch (error) {
            console.error('Error getting coordinator applications:', error);
            return [];
        }
    }

    /**
     * Get coordinator statistics
     */
    async getCoordinatorStatistics(email) {
        try {
            const admin = this.admins.get(email);
            if (!admin || admin.role !== 'coordinator') {
                return null;
            }

            const applications = await this.getCoordinatorApplications(email);

            const stats = {
                coordinator: admin.name,
                services: admin.services,
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
            console.error('Error getting coordinator statistics:', error);
            return null;
        }
    }

    /**
     * Get all coordinators with their service assignments
     */
    getAllCoordinators() {
        const coordinators = [];
        for (const [email, admin] of this.admins) {
            if (admin.role === 'coordinator') {
                coordinators.push({
                    email,
                    name: admin.name,
                    services: admin.services || [],
                    serviceCount: admin.services ? admin.services.length : 0
                });
            }
        }
        return coordinators;
    }
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