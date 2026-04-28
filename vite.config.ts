
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import vike from 'vike/plugin';

// Fix for __dirname in ESM environment where it is not globally available
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  plugins: [react(), vike()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.GEMINI_API_KEY),
    'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY),
    'process.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || 'https://godsuoxtwxnellluiowa.supabase.co'),
    'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvZHN1b3h0d3huZWxsbHVpb3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2ODkxNzIsImV4cCI6MjA4MTI2NTE3Mn0.bQe3EsPxCpqSivyrggj3X52a3io7PYoi-0PWB5LBCvo')
  },
  ssr: {
    noExternal: ['vike'] 
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.')
    }
  }
});
