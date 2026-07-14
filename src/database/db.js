/**
 * Database Service for MESOB Bot
 * Now using Supabase instead of MongoDB
 */

const supabaseDb = require('./supabase');

// Export the Supabase database instance
module.exports = supabaseDb;