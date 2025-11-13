# ☕ Pre-Order Menu

Aplikasi web pre-order menu yang simple, modern, dan gratis! Data otomatis masuk ke Google Sheets.

## ✨ Features

- 📱 **Responsive Design** - Berfungsi di semua perangkat
- 🎁 **Paket Bundling** - Nongki dan Millo Ceria
- 🛒 **Pesanan Satuan** - Dengan quantity control
- 📍 **Geolocation** - Auto-fill alamat dari lokasi saat ini
- 💳 **Upload Bukti** - Screenshot transfer langsung
- 📊 **Google Sheets** - Data otomatis tersimpan
- 🚀 **Vercel Ready** - Deploy dalam hitungan menit

## 🚀 Quick Start

### 1. Setup Google Sheets & Apps Script
Follow panduan lengkap di **[SETUP.md](./SETUP.md)**

### 2. Update Script ID
Edit `index.html` dan ganti `YOUR_SCRIPT_ID` dengan Apps Script ID Anda:
```html
const response = await fetch('https://script.google.com/macros/s/YOUR_SCRIPT_ID/usercopy', {
```

### 3. Deploy ke Vercel
```bash
# Via CLI
npm i -g vercel
vercel

# Atau via GitHub ke Vercel.com
```

## 📋 Menu

### Paket Bundling
- **Nongki** - Iced Cappuccino & Iced Latte → 18K
- **Millo Ceria** - Millo Dino & Millo Oreo → 23K

### Pesanan Satuan
- 🥤 Iced Cappuccino → 10K
- ☕ Iced Latte → 10K
- 🍫 Millo Dino → 12K
- 🍪 Millo Oreo → 13K

### Pembayaran
- **Bank MANDIRI:** 1460018369293
- **a.n.:** Cristensen Betralian

## 📁 File Structure

```
poBewok/
├── index.html        # Main application
├── vercel.json       # Vercel config
├── SETUP.md         # Setup guide
└── README.md        # This file
```

## 🛠️ Customization

### Ubah Logo/Emoji
Edit title di `<h1>☕ Pre-Order Menu</h1>`

### Ubah Warna
Edit CSS gradient di `body`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Ubah Menu Items
Edit bagian "PESANAN SATUAN" di HTML dan update `menuPrices` di JavaScript

### Ubah Nama Bank
Edit bagian "PEMBAYARAN" di HTML

## 📞 Support

### Untuk Bantuan Setup
- Baca **SETUP.md** dengan teliti
- Check troubleshooting section

### Links Berguna
- [Google Sheets Help](https://support.google.com/sheets)
- [Apps Script Docs](https://developers.google.com/apps-script)
- [Vercel Docs](https://vercel.com/docs)

## 💡 Tips

1. **Auto-close form** setelah submit untuk langsung bisa order lagi
2. **WhatsApp integration** - tambahkan tombol "Chat Admin" di form
3. **Email notification** - gunakan Google Sheet add-on "Email Notifications"
4. **Dashboard** - gunakan Google Data Studio untuk analytics

## ⚖️ License

Free to use for personal & business use

---

Made with ❤️ for your business
