// Supabase client configuration for Por Elas
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = 'https://mmgaqfddxoliltgjpfzk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tZ2FxZmRkeG9saWx0Z2pwZnprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxOTM1MTgsImV4cCI6MjA4Mjc2OTUxOH0.lF2elnUw_xI_ZBrYcvNpFH89wETZzyI1vpP-W1L6AxE';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});