// server/utils/supabaseClient.js
const { createClient } = require('@supabase/supabase-js');
const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = require('../config/env');
const log = require('./logger');

let supabase = null;

function getSupabaseClient() {
    if (supabase) {
        return supabase;
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
        log.warn('Supabase URL or Service Key missing. Interaction logging disabled.');
        return null;
    }

    try {
        supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
             auth: {
                 // Required for service key:
                 autoRefreshToken: false,
                 persistSession: false,
                 detectSessionInUrl: false
             }
        });
        log.info('Supabase client initialized successfully.');
        return supabase;
    } catch (error) {
        log.error('Failed to initialize Supabase client:', error);
        return null;
    }
}

module.exports = {
    getSupabaseClient,
};