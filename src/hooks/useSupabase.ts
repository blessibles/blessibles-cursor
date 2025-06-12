import { createClient } from '@supabase/supabase-js';
import { useMemo } from 'react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export function useSupabase() {
  const supabase = useMemo(
    () => createClient(supabaseUrl as string, supabaseAnonKey as string),
    []
  );

  return { supabase };
} 