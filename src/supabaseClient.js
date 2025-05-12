// supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ybvessbqodzbsvevzglc.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlidmVzc2Jxb2Rlc2Jxb2R6YnN2ZXZ6Z2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzODE2NzIsImV4cCI6MjA1ODk1NzY3Mn0.gbvCnLUJJkTbNXZCJsdqhQfPJtL1m7fwuZwHP0bg_cw"; // ⚠️ Reemplaza con tu clave

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function ensureBuckets() {
  const buckets = [
    { name: "habitaciones", public: true },
    { name: "items_menu_bar", public: true },
    { name: "servicios", public: true },
    // puedes agregar más buckets aquí si los necesitas
  ];

  for (const { name, public: isPublic } of buckets) {
    const { data, error } = await supabase.storage.createBucket(name, {
      public: isPublic,
    });
    if (error && !error.message.includes("The resource already exists")) {
      console.error(`Error creando bucket "${name}":`, error);
    } else {
      console.log(`Bucket "${name}" listo.`, data ?? "(existente)");
    }
  }
}

ensureBuckets();
