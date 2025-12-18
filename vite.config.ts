
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Use (process as any).cwd() to resolve the TypeScript error where 'cwd' is not found on the Process type.
  // This ensures the current working directory is correctly identified for environment variable loading.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    // Removed manual process.env.API_KEY definition in the define block.
    // The API_KEY is automatically injected into the environment as per the GenAI coding guidelines.
  };
});
