import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/", // Asegura que las rutas sean relativas a la raíz
  build: {
    outDir: "dist", // Asegura que el directorio de salida sea correcto
  },
  server: {
    historyApiFallback: true, // Redirige todas las rutas al index.html en desarrollo
  }
})
