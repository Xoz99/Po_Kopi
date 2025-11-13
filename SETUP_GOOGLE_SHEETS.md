# Setup Google Sheets Integration untuk SIP DEH Pre-Order

## 📋 Step-by-Step Setup

### Step 1: Buat Google Spreadsheet
1. Buka https://sheets.google.com
2. Klik **"+ New Spreadsheet"**
3. Rename ke **"SIP DEH Pre-Orders"**
4. Lihat di URL bar, ambil ID Spreadsheet:
   ```
   https://docs.google.com/spreadsheets/d/[ID_INI]/edit
   ```
   Simpan ID ini untuk nanti

### Step 2: Setup Sheets (Tabs)
Di spreadsheet yang sudah dibuat:
1. **Sheet 1:** Rename menjadi `QRIS`
   - Row 1 (Headers): Timestamp | Nama | WhatsApp | Alamat | Paket | Items | Total Harga | Bukti Pembayaran Link | Status

2. **Buat Sheet 2:** Klik `+` dan rename menjadi `Bank Transfer`
   - Row 1 (Headers): Sama seperti QRIS

### Step 3: Setup Google Apps Script
1. Di spreadsheet, klik **Tools → Script Editor**
2. Clear semua default code
3. Copy-paste seluruh kode dari file `google-apps-script.js`
4. Ganti `YOUR_SPREADSHEET_ID` dengan ID dari Step 1
   ```javascript
   const SPREADSHEET_ID = 'abc123xyz...'; // Ganti ini
   ```

### Step 4: Deploy Apps Script
1. Klik **Deploy → New Deployment**
2. Pilih type: **Web app**
3. Execute as: **Your Account**
4. Who has access: **Anyone** (penting untuk public access)
5. Klik **Deploy**
6. Akan keluar dialog dengan URL:
   ```
   https://script.google.com/macros/d/[SCRIPT_ID]/usercopy
   ```
7. Copy **SCRIPT_ID** ini

### Step 5: Update HTML File
Di `index.html`, cari baris ~1289:
```javascript
const response = await fetch('https://script.google.com/macros/d/YOUR_SCRIPT_ID/usercopy', {
```

Ganti `YOUR_SCRIPT_ID` dengan ID dari Step 4

## 📊 Fitur yang Tersedia

### ✅ Automatic Filter by Payment Method
- QRIS orders → Tab "QRIS"
- Bank Transfer orders → Tab "Bank Transfer"

### ✅ Image Upload to Google Drive
- Bukti pembayaran otomatis disimpan di Google Drive
- Folder structure:
  ```
  SIP DEH - Bukti Pembayaran/
  ├── QRIS/
  │   ├── Customer1_1234567.jpg
  │   └── Customer2_1234568.jpg
  └── Bank Transfer/
      ├── Customer3_1234569.jpg
      └── Customer4_1234570.jpg
  ```

### ✅ Automatic Timestamps & Data
Setiap order akan catat:
- Waktu pemesanan (Timestamp)
- Nama & WhatsApp customer
- Alamat lengkap
- Paket + Items yang dipesan
- Total harga
- Link bukti pembayaran (di Drive)
- Status (default: "Pending")

## 🔧 Customize Lebih Lanjut

### Menambah WhatsApp Notification (Optional)
Buka file `google-apps-script.js`, cari function `sendWhatsAppNotification`.
Uncomment dan setup Twilio untuk kirim notif otomatis ke customer.

### Mengubah Folder Drive
Di `google-apps-script.js`, line ~105:
```javascript
const folder = DriveApp.getFoldersByName('SIP DEH - Bukti Pembayaran')
```
Ganti nama folder sesuai keinginan

## 🐛 Troubleshooting

### Error: "Apps Script exceeded maximum execution time"
- Solusi: Kurangi size base64 image, atau optimize code

### Error: "Spreadsheet not found"
- Pastikan SPREADSHEET_ID benar
- Pastikan Google Account punya akses ke spreadsheet

### Images tidak tersimpan
- Check permissions Google Drive
- Pastikan account punya storage space cukup

### WhatsApp tidak terkirim
- Fitur ini optional dan butuh setup Twilio terpisah
- Bisa skip kalo hanya perlu ke Sheets saja

## 📝 Testing

Sebelum launch, test dengan:
1. Klik button "Run" di Apps Script editor
2. Pilih function `testDoPost()`
3. Cek apakah data berhasil masuk ke sheet

## 🚀 Go Live!
Setelah semua setup:
1. Test form dengan QRIS payment
2. Test form dengan Bank Transfer payment
3. Cek data masuk ke sheet yang benar
4. Cek bukti pembayaran tersimpan di Drive
5. **Live!** ✨

## 📞 Need Help?
- Kalo ada error: Check browser console (F12) untuk lihat detail error
- Screenshot error dan cek Apps Script Logs (View → Logs)
