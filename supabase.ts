// Supabase Configuration
const SUPABASE_URL = 'https://fdzrjqcbitwkpfayjmed.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Xasx1l43rgzy_JvhWvvFLQ_RKhrxVrz';

// #region agent log
fetch('http://127.0.0.1:7242/ingest/5f148aac-62cd-4068-86fe-977686300d59',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase.ts:3',message:'Supabase URL loaded',data:{url:SUPABASE_URL,keyPrefix:SUPABASE_ANON_KEY.substring(0,20)+'...'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion

// יצירת מופע Supabase Client
declare const window: Window & {
  supabase: {
    createClient: (url: string, key: string) => any;
  };
};

// #region agent log
fetch('http://127.0.0.1:7242/ingest/5f148aac-62cd-4068-86fe-977686300d59',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase.ts:13',message:'Creating Supabase client',data:{url:SUPABASE_URL,hasWindowSupabase:!!(window as any).supabase},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
// #endregion

const supabaseClient = (window as any).supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// #region agent log
fetch('http://127.0.0.1:7242/ingest/5f148aac-62cd-4068-86fe-977686300d59',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase.ts:20',message:'Supabase client created',data:{clientType:typeof supabaseClient,hasFrom:!!supabaseClient?.from,hasChannel:!!supabaseClient?.channel},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
// #endregion

export default supabaseClient;

