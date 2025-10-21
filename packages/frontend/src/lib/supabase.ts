/**
 * Supabase client for frontend
 * Uses anon key for client-side operations with RLS
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase credentials not configured.');
  console.warn('   Auth and database features will not work until configured.');
}

/**
 * Supabase client for frontend
 * Respects Row Level Security (RLS) policies
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
