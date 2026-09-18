import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],

  preview: {
    host: '0.0.0.0',
    port: 4112,
    allowedHosts: [
      'crmnext.nexthikes.com',
      'crmnextstaging.nexthikes.com',
      'www.crmnextstaging.nexthikes.com',
      '35.209.138.230',
    ],
  },
})

