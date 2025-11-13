# 🚀 Quick Cheat Sheet - Google Sheets Integration

## ⚡ Super Cepat (5 Menit)

### 1️⃣ Buat Google Sheets
https://sheets.google.com → Create → Rename ke "SIP DEH Pre-Orders"

### 2️⃣ Setup Tabs
- Tab 1: Rename ke `QRIS`
- Tab 2: Buat baru `Bank Transfer`
- Kedua tab: Header row ini:
```
Timestamp | Nama | WhatsApp | Alamat | Paket | Items | Total Harga | Bukti Pembayaran Link | Status
```

### 3️⃣ Get Spreadsheet ID
Lihat URL: `https://docs.google.com/spreadsheets/d/[ID_INI]/edit`
Copy **[ID_INI]**

### 4️⃣ Setup Apps Script
1. Di Sheets → Tools → Script Editor
2. Clear semua, copy-paste dari `google-apps-script.js`
3. Replace `YOUR_SPREADSHEET_ID = 'abc...'` dengan ID dari step 3
4. Save

### 5️⃣ Deploy & Get Script ID
1. Deploy → New Deployment → Web app
2. Execute as: Your Account
3. Access: Anyone
4. Copy **Script ID** dari URL: `https://script.google.com/macros/d/[SCRIPT_ID]/usercopy`

### 6️⃣ Update HTML
Di `index.html` line ~1289:
Ganti `YOUR_SCRIPT_ID` dengan Script ID dari step 5

### 7️⃣ Test!
Buka HTML → Isi form → Submit → Check Sheets

---

## 📊 Data Flow

```
User Submit Form (HTML)
    ↓
JavaScript kirim data + image base64
    ↓
Google Apps Script menerima
    ↓
Script cek payment method (QRIS atau Bank)
    ↓
Save image ke Google Drive folder yang sesuai
    ↓
Masukkan data ke Sheet yang sesuai
    ↓
Return success response ke browser
```

---

## 🎯 Mapping

### Payment Method ke Sheet
- `paymentMethod: "qris"` → Sheet "QRIS"
- `paymentMethod: "bank"` → Sheet "Bank Transfer"

### Image Location di Drive
- QRIS orders → Folder `SIP DEH - Bukti Pembayaran/QRIS/`
- Bank orders → Folder `SIP DEH - Bukti Pembayaran/Bank Transfer/`

---

## 🔍 Column Explanation

| Column | From | Example |
|--------|------|---------|
| Timestamp | JavaScript | 13/11/2024 15:30:45 |
| Nama | Form input | Budi Santoso |
| WhatsApp | Form input | 6281234567890 |
| Alamat | Form input atau geolocation | Jl. Merdeka No. 123 |
| Paket | Radio selection | Paket Nongki (18K) |
| Items | Checkbox + quantity | Iced Cappuccino x2, Millo Oreo x1 |
| Total Harga | Calculate automatic | Rp 42.000 |
| Bukti Pembayaran Link | Auto saved to Drive | https://drive.google.com/... |
| Status | Manual update | Pending/Verified |

---

## ❌ Common Mistakes

### ❌ Lupa format base64 di response
Script otomatis encode base64 image → Drive

### ❌ Payment method tidak ada
Default ke QRIS

### ❌ Script ID salah di HTML
Copy dari deployment URL, bukan spreadsheet URL

### ❌ Sheet name typo
QRIS vs Qris vs qris → Case sensitive!

---

## ✅ Testing Checklist

- [ ] Sheets dibuat dengan tab QRIS & Bank Transfer
- [ ] Header row ada di kedua tab
- [ ] Apps Script dikopy dengan benar
- [ ] SPREADSHEET_ID diganti
- [ ] Apps Script sudah di-deploy
- [ ] Script ID diganti di HTML
- [ ] Test form submit → data muncul di QRIS sheet
- [ ] Test form dengan Bank payment → data muncul di Bank Transfer sheet
- [ ] Image tersimpan di Google Drive

---

## 🆘 Debug Tips

### Lihat error di Apps Script:
1. Di Apps Script editor: View → Logs
2. Atau: Execution → Run logs

### Lihat error di HTML:
1. Browser: F12 → Console
2. Submit form → lihat error message

### Test manual di Apps Script:
1. Function: `testDoPost()`
2. Click "Run"
3. Cek Logs & cek Sheets

---

## 📱 Payment Method Flow

### User pilih QRIS:
```
├─ Form shows: QRIS QR code image
├─ User scan QR
├─ User upload bukti → submit
└─ Data → "QRIS" sheet
```

### User pilih Bank Transfer:
```
├─ Form shows: Bank account info (1460018369293)
├─ User transfer ke rekening
├─ User upload bukti → submit
└─ Data → "Bank Transfer" sheet
```

---

## 🎁 Bonus: Auto Filter Tips

Di Google Sheets, untuk filter data per payment method:
1. Select header row
2. Data → Create a filter
3. Filter → select "QRIS" atau "Bank Transfer" di Paket column

---

**Created:** Nov 13, 2024
**For:** SIP DEH Pre-Order System
**Version:** 1.0
