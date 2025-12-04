// Supabase Configuration
const SUPABASE_URL = 'https://cqecoufqidbaxpfotsmg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_tCAZXcRwjcGmcJ1_eNqMyQ_BcZAUbop';

// יצירת מופע Supabase Client
declare const window: Window & {
  supabase: {
    createClient: (url: string, key: string) => any;
  };
};

const supabaseClient = (window as any).supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabaseClient;

