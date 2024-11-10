// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({//change /.astro to /astro
  outDir:"./docs",
  build:{
    format:"file",
    assets:"astro"
  },
  server:{
    port:5173
  },
  vite:{
    ssr:{
      noExternal:['p5']
    }
  }
});
