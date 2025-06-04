import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';
import vike from 'vike/plugin'
import { UserConfig } from 'vite'

const config: UserConfig = {
  plugins: [
    react(),
    vike({
      prerender: true
    }),
    svgr({include: '**/*.svg'}),
  ],
  resolve: {
    alias: {
      "#root": __dirname,
    }
  }
}

export default config
