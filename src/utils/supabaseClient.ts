import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tjmolhxvxujpkdwqstjk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqbW9saHh2eHVqcGtkd3FzdGprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyOTU1NjQsImV4cCI6MjA2NDg3MTU2NH0.FXCjfviDpPgE6_NZ1oe-CHZlbMypEVW85pZqgi15YZw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 