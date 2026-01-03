import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY
);

export async function checkConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('metrics').select('count()', { count: 'exact' });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
}
