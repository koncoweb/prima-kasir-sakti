
# Deployment Guide untuk Netlify

## Langkah-langkah Deploy ke Netlify:

### 1. Persiapan
- Pastikan kode sudah di-push ke GitHub repository
- Install Netlify CLI (opsional): `npm i -g netlify-cli`

### 2. Deploy via Netlify Dashboard
1. Kunjungi [netlify.com](https://netlify.com)
2. Login dengan akun GitHub/GitLab/Bitbucket
3. Klik "New site from Git"
4. Pilih repository GitHub Anda
5. Konfigurasi build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 18 (akan otomatis terdeteksi dari netlify.toml)

### 3. Environment Variables
Setelah deploy, tambahkan environment variables di Netlify dashboard:
1. Buka site settings → Environment variables
2. Tambahkan:
   - `VITE_SUPABASE_URL`: `https://rukblwwidsndgcrxxcvi.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1a2Jsd3dpZHNuZGdjcnh4Y3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDg1MzYsImV4cCI6MjA2NTgyNDUzNn0.kmn7VRi-gW-9YMElMXpannQ7t3Ot7Rw7uN9f45ImQHQ`

### 4. Deploy via CLI (alternatif)
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login ke Netlify
netlify login

# Deploy
netlify deploy

# Deploy production
netlify deploy --prod
```

### 5. Custom Domain (opsional)
- Di Netlify dashboard, buka site settings
- Pergi ke "Domain management"
- Tambahkan custom domain Anda

## Keunggulan Netlify:
- ✅ Deploy otomatis dari Git commits
- ✅ Branch deploys untuk testing
- ✅ Form handling built-in
- ✅ Serverless functions support
- ✅ CDN global yang cepat
- ✅ HTTPS otomatis
- ✅ Continuous deployment

## Fitur yang Dikonfigurasi:
- ✅ SPA routing (semua route diarahkan ke index.html)
- ✅ Environment variables untuk Supabase
- ✅ Build optimization dengan caching headers
- ✅ Static file serving dengan CDN

## Perbandingan Netlify vs Vercel:

### Netlify:
- Lebih fokus pada static sites dan JAMstack
- Form handling built-in tanpa coding
- Split testing A/B built-in
- Analytics built-in
- Serverless functions dengan sintaks yang sederhana

### Vercel:
- Lebih fokus pada Next.js dan React
- Edge functions yang lebih powerful
- Image optimization built-in
- Better integration dengan frameworks modern

## Troubleshooting:
- Jika ada error 404 saat navigasi, pastikan netlify.toml dan _redirects sudah ter-commit
- Jika Supabase tidak connect, cek environment variables di Netlify dashboard
- Untuk debugging, cek deploy logs di Netlify dashboard
- Jika build gagal, cek Node.js version compatibility

## Alternative Hosting Lainnya:

### 1. GitHub Pages
- Gratis untuk public repositories
- Cocok untuk static sites sederhana
- Perlu GitHub Actions untuk build

### 2. Firebase Hosting
- Terintegrasi dengan Firebase services
- CDN global yang cepat
- CLI yang powerful

### 3. Surge.sh
- Deploy sangat mudah dengan CLI
- Gratis untuk basic usage
- Cocok untuk prototyping cepat

### 4. Railway
- Support full-stack applications
- Database hosting built-in
- Pay-per-usage model
