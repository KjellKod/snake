import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

const isSingle = process.env.BUILD_SINGLE === '1';

export default defineConfig({
  plugins: [react(), ...(isSingle ? [viteSingleFile()] : [])],
  base: isSingle ? './' : '/snake/',
  build: {
    outDir: isSingle ? 'dist-single' : 'dist',
  },
});
