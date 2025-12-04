// Type declarations for Supabase CDN
declare global {
  interface Window {
    supabase: {
      createClient: (url: string, key: string) => SupabaseClient;
    };
  }
}

export interface SupabaseClient {
  from: (table: string) => SupabaseQueryBuilder;
  channel: (name: string) => SupabaseChannel;
  removeChannel: (channel: SupabaseChannel) => void;
}

export interface SupabaseQueryBuilder {
  select: (columns?: string) => SupabaseQueryBuilder;
  insert: (values: any) => SupabaseQueryBuilder;
  update: (values: any) => SupabaseQueryBuilder;
  delete: () => SupabaseQueryBuilder;
  eq: (column: string, value: any) => SupabaseQueryBuilder;
  then: (onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) => Promise<any>;
}

export interface SupabaseChannel {
  on: (event: string, config: any, callback: (payload: any) => void) => SupabaseChannel;
  subscribe: () => SupabaseChannel;
}

export {};


