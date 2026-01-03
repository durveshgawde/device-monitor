import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DEVICE_ID: process.env.DEVICE_ID || 'device-' + Math.random().toString(36).slice(2, 9),

  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',

  // OpenRouter
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',

  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000'
};

// Validate required env vars
if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}
