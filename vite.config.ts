
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Use (process as any).cwd() to resolve the TypeScript error where 'cwd' is not found on the Process type.
  // This ensures the current working directory is correctly identified for environment variable loading.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      host: true, // Exposes the server on the local network
      port: 5173,
      strictPort: true, // Ensures the port doesn't change if 5173 is busy
    },
    // The API_KEY is automatically injected into the environment as per the GenAI coding guidelines.
  };
});
