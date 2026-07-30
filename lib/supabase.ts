import { createClient } from '@supabase/supabase-js';

export interface Database {
  public: {
    Tables: {
      participants: {
        Row: {
          id: number;
          first_name: string;
          surname: string;
          telephone: string;
          email: string | null;
          association: string | null;
          device_info: any;
          registered_at: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          first_name: string;
          surname: string;
          telephone: string;
          email?: string | null;
          association?: string | null;
          device_info?: any;
          registered_at?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          first_name?: string;
          surname?: string;
          telephone?: string;
          email?: string | null;
          association?: string | null;
          device_info?: any;
          registered_at?: string;
          created_at?: string;
        };
      };
    };
  };
}

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

export const getSupabase = () => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
};
