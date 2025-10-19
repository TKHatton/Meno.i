/**
 * Supabase server client for the API (service role key).
 * Future use: persist conversations, messages, and safety events.
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabase = createClient(url, serviceKey);

