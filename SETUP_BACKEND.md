# Setup Backend - MongoDB + Cloudinary + Vercel

Berikut langkah-langkah untuk setup backend sistem pre-order SIP DEH.

## Prerequisites
- Akun Vercel (https://vercel.com)
- Akun MongoDB Atlas (https://www.mongodb.com/cloud/atlas)
- Akun Cloudinary (https://cloudinary.com)

---

## STEP 1: Setup MongoDB Atlas

### 1. Buat akun dan cluster
- Buka https://www.mongodb.com/cloud/atlas
- Sign up atau login
- Buat project baru
- Buat cluster (free tier sudah cukup)

### 2. Setup database user
- Di cluster, klik "Security" → "Database Access"
- Klik "Add New Database User"
- Username: `sipdeh`
- Password: (generate password yang kuat)
- Click "Create Database User"

### 3. Whitelist IP & dapatkan connection string
- Klik "Security" → "Network Access"
- Klik "Add IP Address"
- Pilih "Allow access from anywhere" (untuk development/Vercel)
- Click "Confirm"

### 4. Dapatkan connection string
- Di cluster overview, klik "Connect"
- Pilih "Connect your application"
- Copy connection string, contohnya:
```
mongodb+srv://sipdeh:PASSWORD@cluster0.xxxxx.mongodb.net/sipdeh?retryWrites=true&w=majority
```
- Ganti `PASSWORD` dengan password yang sudah dibuat

---

## STEP 2: Setup Cloudinary

### 1. Buat akun
- Buka https://cloudinary.com
- Sign up dengan email
- Verify email

### 2. Dapatkan credentials
- Di dashboard, lihat "Account Details"
- Copy:
  - **Cloud Name** (misal: `dvxxxxxxxxx`)
  - **API Key** (misal: `123456789`)
  - **API Secret** (jangan share ke orang lain)

### 3. Setup folder untuk upload
- Di dashboard Cloudinary
- Settings → Upload → "Add upload preset"
- Name: `sipdeh-preset`
- Unsigned: Yes
- Folder: `sipdeh-bukti-pembayaran`
- Save

---

## STEP 3: Deploy ke Vercel

### 1. Push kode ke GitHub
```bash
cd ~/Documents/poBewok
git add .
git commit -m "Setup backend: MongoDB + Cloudinary"
git push origin main
```

### 2. Deploy ke Vercel
- Buka https://vercel.com
- Import project dari GitHub
- Pilih repository `poBewok`
- Klik "Import"

### 3. Setup Environment Variables
Di Vercel, di section "Environment Variables", tambahkan:

```
MONGODB_URI = mongodb+srv://sipdeh:PASSWORD@cluster0.xxxxx.mongodb.net/sipdeh?retryWrites=true&w=majority
CLOUDINARY_NAME = dvxxxxxxxxx
CLOUDINARY_API_KEY = 123456789
CLOUDINARY_API_SECRET = your_api_secret
```

Klik "Deploy"

### 4. Setelah deploy selesai
- Vercel akan memberikan URL, contoh: `https://po-bewok.vercel.app`
- API endpoint: `https://po-bewok.vercel.app/api/orders`
- Dashboard: `https://po-bewok.vercel.app/dashboard.html`

---

## STEP 4: Update index.html (jika diperlukan)

Endpoint sudah otomatis menggunakan domain Vercel karena kode menggunakan:
```javascript
const apiUrl = process.env.REACT_APP_API_URL || window.location.origin;
```

Tapi kalau perlu manual update, ubah di `index.html` bagian fetch:
```javascript
const response = await fetch('https://po-bewok.vercel.app/api/orders', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
});
```

---

## Testing

### 1. Test form submission
- Buka: `https://po-bewok.vercel.app/index.html`
- Isi form dan submit
- Cek response di console browser (F12)

### 2. Test dashboard
- Buka: `https://po-bewok.vercel.app/dashboard.html`
- Refresh untuk lihat data yang baru masuk
- Search by nama pelanggan
- Klik untuk lihat detail

### 3. Test image upload
- Cek di Cloudinary dashboard
- Folder `/sipdeh-bukti-pembayaran`
- Gambar harus tersimpan di sana

---

## STEP 5: Troubleshooting

### Error: "Cannot find module 'mongodb'"
**Solusi:** Pastikan dependency sudah install di Vercel
- Di Vercel, re-run build dengan klik "Redeploy"
- Atau push kode baru ke trigger rebuild

### Error: "Connection timeout"
**Solusi:**
- Pastikan IP whitelist sudah diset di MongoDB Atlas
- Cek MONGODB_URI di environment variables
- Test connection string di MongoDB Compass

### Image tidak upload
**Solusi:**
- Cek Cloudinary credentials di environment variables
- Pastikan image size < 5MB
- Cek format (harus JPG/PNG)

### CORS error di form submission
**Solusi:** Sudah dihandle di API, tapi jika masih error:
- Cek di browser console untuk detail error
- Pastikan endpoint URL benar

---

## File Structure

```
poBewok/
├── api/
│   └── orders.js          ← API endpoint (Vercel Serverless)
├── index.html             ← Form pre-order
├── dashboard.html         ← Dashboard lihat data
├── package.json
├── vercel.json
├── .env.example
└── .gitignore
```

---

## API Endpoints

### POST /api/orders
Submit order baru
```json
{
  "nama": "John Doe",
  "whatsapp": "6281234567890",
  "alamat": "Jl. Sudirman No. 1",
  "bundle": "nongki",
  "items": "[{\"item\": \"iced-cappuccino\", \"quantity\": 2}]",
  "timestamp": "30/11/2024 22:10:30",
  "paymentMethod": "qris",
  "total": 40000,
  "imageBase64": "data:image/jpeg;base64,..."
}
```

### GET /api/orders
Get semua orders
```json
{
  "status": "success",
  "data": [
    {
      "_id": "xxx",
      "nama": "John Doe",
      "whatsapp": "6281234567890",
      "alamat": "...",
      "total": 40000,
      "imageUrl": "https://...",
      "createdAt": "2024-11-30T..."
    }
  ]
}
```

---

## Next Steps

1. Deploy ke Vercel sesuai step 3
2. Setup environment variables
3. Test form dan dashboard
4. Share URL ke customer

Semoga sukses! 🚀
