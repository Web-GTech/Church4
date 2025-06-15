import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ixvnhnmqzsgisegpkjvw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4dm5obm1xenNnaXNlZ3BranZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5Mzc2NzgsImV4cCI6MjA2NTUxMzY3OH0.e80BdQxQteCOgx28RCDiCoP4HgFroYfjRiAC7baqTew';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);