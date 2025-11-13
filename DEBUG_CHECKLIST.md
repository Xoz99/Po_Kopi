# 🔍 Debug Checklist - Data Tidak Masuk ke Sheets

## ✅ Pastikan Setiap Step Benar

### 1️⃣ Cek Sheet Names (CRITICAL!)
Di Google Sheets Anda:
- [ ] Ada tab bernama **"QRIS"** (huruf besar, nama persis)
- [ ] Ada tab bernama **"Bank Transfer"** (huruf besar, nama persis)
- [ ] Kedua tab punya header di Row 1

**Jika belum:**
1. Rename tab lama atau buat tab baru
2. Pastikan nama **PERSIS** seperti di atas (case-sensitive)

---

### 2️⃣ Cek Apps Script Deploy
Di Google Apps Script Editor:

- [ ] Code sudah di-copy dari `google-apps-script.js`
- [ ] `SPREADSHEET_ID` sudah diganti dengan ID Anda
- [ ] Code sudah di-Save (Ctrl+S)
- [ ] Sudah klik **Deploy → New Deployment → Web app**
- [ ] Execution as: **Your Account** ✓
- [ ] Who has access: **Anyone** ✓
- [ ] Status: **Deployment successful** (ada di kanan atas)

**Jika belum deploy:**
1. Klik tombol **Deploy** (hijau, atas kanan)
2. Pilih **New Deployment**
3. Pilih tipe: Web app
4. Execute as: Your Account
5. Access: Anyone
6. **Deploy**

**Jika sudah ada deployment lama:**
- Bisa update dengan: Deploy → Update
- Atau buat deployment baru dengan "New Deployment"

---

### 3️⃣ Copy Script ID dengan Benar
Setelah deploy, akan ada dialog dengan URL:
```
https://script.google.com/macros/d/AKfycbWXxyz1234/usercopy
```

Copy bagian: **`AKfycbWXxyz1234`** (diantara `/d/` dan `/usercopy`)

---

### 4️⃣ Update HTML dengan Script ID
Di file `index.html`, cari baris ~1289:

**SEBELUM:**
```javascript
const response = await fetch('https://script.google.com/macros/d/YOUR_SCRIPT_ID/usercopy', {
```

**SESUDAH (replace YOUR_SCRIPT_ID):**
```javascript
const response = await fetch('https://script.google.com/macros/d/AKfycbWXxyz1234/usercopy', {
```

- [ ] Script ID sudah diganti
- [ ] Format URL benar
- [ ] File sudah di-save

---

### 5️⃣ Test di Browser Console
1. Buka file `index.html` di browser
2. Tekan **F12** → buka **Console** tab
3. Isi form dengan data test
4. Klik **Submit**

**Cek error:**
- Ada error merah di Console? Screenshot atau catat error message-nya
- Tidak ada error? Lanjut ke step 6

---

### 6️⃣ Cek di Apps Script Logs
1. Buka Google Apps Script Editor
2. Klik **Execution** di menu kiri
3. Lihat list recent executions
4. Klik execution yang paling baru
5. Buka **Logs** - apakah ada error?

---

### 7️⃣ Cek Network Request
Di browser Console:

1. Klik tab **Network**
2. Submit form
3. Cari request ke `script.google.com`
4. Klik request itu, lihat response:
   - **Status 200** = Berhasil
   - **Status 403** = Permission denied
   - **Status 404** = Script ID salah

---

## 🐛 Common Issues & Solutions

### ❌ Error: "Cannot read property 'getSheetByName' of undefined"
**Penyebab:** SPREADSHEET_ID salah atau tidak dapat akses

**Solusi:**
1. Pastikan SPREADSHEET_ID = `1kohZXUmVki0k0ZDUD-CozmzxmFNENcA7F8Sgt74DBVM`
2. Pastikan Anda punya akses ke spreadsheet itu
3. Re-deploy Apps Script

---

### ❌ Error: "Sheet not found: 'QRIS'"
**Penyebab:** Tab sheet belum dibuat atau nama salah

**Solusi:**
1. Buka Google Sheets
2. Pastikan ada tab bernama **"QRIS"** (persis huruf besar)
3. Pastikan ada tab bernama **"Bank Transfer"** (persis)
4. Jika belum ada, buat tab baru dan rename

---

### ❌ Data tidak masuk ke sheet, tapi tidak ada error
**Penyebab:** Request tidak sampai atau validation gagal

**Solusi:**
1. Cek Network tab di browser (step 7️⃣)
2. Pastikan Script ID di HTML benar
3. Cek Apps Script Logs
4. Pastikan image file dipilih saat submit

---

### ❌ Image tidak tersimpan di Drive
**Penyebab:** Permission atau error di `saveImageToDrive()`

**Solusi:**
1. Cek Apps Script Logs, lihat error detail
2. Pastikan Google Account punya akses ke Drive
3. Pastikan Drive punya storage cukup
4. Coba dengan image lebih kecil (<2MB)

---

### ❌ Form submit tapi langsung error "Terjadi kesalahan"
**Penyebab:** Script ID salah, endpoint offline, atau format request salah

**Solusi:**
1. Cek Console browser (F12 → Console)
2. Copy error message lengkap
3. Pastikan Script ID di HTML benar
4. Cek Apps Script deploy status (masih active?)

---

## 📋 Debug Commands (Di Apps Script Editor)

Test function manual:

```javascript
// Jalankan ini untuk test:
// 1. Copy function ini ke Apps Script
// 2. Klik "Run"
// 3. Lihat Logs

function testDeployment() {
  Logger.log("SPREADSHEET_ID: " + SPREADSHEET_ID);
  Logger.log("Sheet Names: " + Object.values(SHEET_NAMES));

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheets = ss.getSheets();
    Logger.log("Sheets found: " + sheets.length);
    sheets.forEach(sheet => {
      Logger.log("- " + sheet.getName());
    });
  } catch (e) {
    Logger.log("ERROR: " + e.toString());
  }
}
```

---

## ✅ Success Indicators

Semuanya bekerja dengan baik jika:
- [ ] Browser Console: Tidak ada error merah
- [ ] Google Sheets: Data muncul di tab QRIS atau Bank Transfer
- [ ] Google Drive: Folder "SIP DEH - Bukti Pembayaran" ada dengan image tersimpan
- [ ] Apps Script Logs: Execution successful, no errors

---

## 📞 Apa Masalahnya?

Reply dengan:
1. **Error message** (dari Console atau Logs)
2. **Screenshot** dari:
   - Browser Console error
   - Apps Script Logs
   - Google Sheets (apakah ada data?)
3. **Status deploy:** Apakah sudah Deploy?
4. **Script ID yang digunakan** di HTML

Nanti saya bisa bantu debug lebih spesifik! 🚀
