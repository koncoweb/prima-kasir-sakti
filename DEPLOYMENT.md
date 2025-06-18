
# Deployment Guide untuk Vercel

## Langkah-langkah Deploy ke Vercel:

### 1. Persiapan
- Pastikan kode sudah di-push ke GitHub repository
- Install Vercel CLI (opsional): `npm i -g vercel`

### 2. Deploy via Vercel Dashboard
1. Kunjungi [vercel.com](https://vercel.com)
2. Login dengan akun GitHub
3. Klik "New Project"
4. Import repository GitHub Anda
5. Vercel akan otomatis mendeteksi project sebagai Vite app

### 3. Environment Variables
Setelah import, tambahkan environment variables di Vercel dashboard:
- `VITE_SUPABASE_URL`: https://rukblwwidsndgcrxxcvi.supabase.co
- `VITE_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1a2Jsd3dpZHNuZGdjcnh4Y3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDg1MzYsImV4cCI6MjA2NTgyNDUzNn0.kmn7VRi-gW-9YMElMXpannQ7t3Ot7Rw7uN9f45ImQHQ

### 4. Deploy via CLI (alternatif)
```bash
# Install Vercel CLI
npm i -g vercel

# Login ke Vercel
vercel login

# Deploy
vercel

# Deploy production
vercel --prod
```

### 5. Custom Domain (opsional)
- Di Vercel dashboard, buka project settings
- Pergi ke "Domains" tab
- Tambahkan custom domain Anda

## Fitur yang Dikonfigurasi:
- ✅ SPA routing (semua route diarahkan ke index.html)
- ✅ Environment variables untuk Supabase
- ✅ Build optimization
- ✅ Static file serving

## Troubleshooting:
- Jika ada error 404 saat navigasi, pastikan vercel.json sudah ter-commit
- Jika Supabase tidak connect, cek environment variables di Vercel dashboard
- Untuk debugging, cek build logs di Vercel dashboard
