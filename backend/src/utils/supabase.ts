import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY
);

export async function checkConnection(): Promise<boolean> {
  try {
    // Simple select query instead of count() to avoid PGRST123 error
    const { error } = await supabase
      .from('metrics')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Supabase connection error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
}
