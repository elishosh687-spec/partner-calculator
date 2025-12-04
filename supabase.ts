// Supabase Configuration
const SUPABASE_URL = 'https://fdzrjqcbitwkpfayjmed.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Xasx1l43rgzy_JvhWvvFLQ_RKhrxVrz';

// יצירת מופע Supabase Client
declare const window: Window & {
  supabase: {
    createClient: (url: string, key: string) => any;
  };
};

const supabaseClient = (window as any).supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabaseClient;

