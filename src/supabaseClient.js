import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ybvessbqodzbsvevzglc.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlidmVzc2Jxb2R6YnN2ZXZ6Z2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzODE2NzIsImV4cCI6MjA1ODk1NzY3Mn0.gbvCnLUJJkTbNXZCJsdqhQfPJtL1m7fwuZwHP0bg_cw"; // ⚠️ Reemplaza con tu clave

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function ensureBucket() {
    const { data, error } = await supabase.storage.createBucket('habitaciones', {
      public: true,       // para que las imágenes sean accesibles públicamente
      // opcional: you could add options like fileSizeLimit, etc.
    })
    if (error && error.message !== 'The resource already exists') {
      console.error('Error creando bucket:', error)
    } else {
      console.log('Bucket “habitaciones” listo:', data)
    }
  }
  
  ensureBucket()
