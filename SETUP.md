# 🚀 Panduan Setup Pre-Order Menu

Aplikasi ini adalah **pure frontend** yang dapat disimpan di Vercel tanpa perlu server mahal. Data otomatis masuk ke Google Sheets Anda yang gratis!

## ⚙️ Step 1: Buat Google Sheet untuk Menyimpan Data

1. Buka https://sheets.google.com
2. Buat spreadsheet baru dengan nama "Pre-Order Menu"
3. Sesuaikan kolom di sheet pertama (nama otomatis "Sheet1"):
   - **Kolom A:** Timestamp
   - **Kolom B:** Nama Pemesan
   - **Kolom C:** No WhatsApp
   - **Kolom D:** Alamat
   - **Kolom E:** Paket Bundle
   - **Kolom F:** Item Satuan
   - **Kolom G:** Total Harga
   - **Kolom H:** Bukti Transfer (Link)

4. Tambahkan header pada baris pertama (A1:H1)

## ⚙️ Step 2: Buat Google Apps Script

1. Buka Google Sheet Anda yang sudah dibuat
2. Klik **Tools → Script Editor**
3. Hapus semua kode yang ada
4. Salin dan paste kode di bawah ini:

```javascript
// Name: doPost
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSheet();

    // Format items
    let itemsText = '';
    if (data.items && data.items.length > 0) {
      itemsText = data.items.map(item => {
        const itemName = {
          'iced-cappuccino': '🥤 Iced Cappuccino',
          'iced-latte': '☕ Iced Latte',
          'millo-dino': '🍫 Millo Dino',
          'millo-oreo': '🍪 Millo Oreo'
        }[item.item] || item.item;
        return `${itemName} x${item.quantity}`;
      }).join(', ');
    }

    // Format bundle
    let bundleText = '';
    if (data.bundle && data.bundle !== 'none') {
      bundleText = data.bundle === 'nongki' ? 'Nongki (18K)' : 'Millo Ceria (23K)';
    }

    // Save image to Google Drive
    let imageUrl = '';
    if (data.imageBase64) {
      try {
        const imageData = Utilities.newBlob(
          Utilities.base64Decode(data.imageBase64.split(',')[1]),
          'image/jpeg',
          `bukti_${data.whatsapp}_${Date.now()}.jpg`
        );
        const folder = DriveApp.getRootFolder();
        const file = folder.createFile(imageData);
        imageUrl = file.getUrl();
      } catch (imgError) {
        console.log('Image save error:', imgError);
      }
    }

    // Add row to sheet
    sheet.appendRow([
      data.timestamp,
      data.nama,
      data.whatsapp,
      data.alamat,
      bundleText,
      itemsText,
      data.total,
      imageUrl
    ]);

    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Order received',
      imageUrl: imageUrl
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

5. Klik **Save** dan beri nama project: `PreOrder Menu`

## ⚙️ Step 3: Deploy Google Apps Script

1. Klik tombol **Deploy** (atas kanan)
2. Pilih **New deployment**
3. Di dropdown "Select type", pilih **Web app**
4. Isi:
   - **Execute as:** [Pilih akun Google Anda]
   - **Who has access:** Anyone
5. Klik **Deploy**
6. Copy URL deployment yang muncul (format: `https://script.google.com/macros/s/[SCRIPT_ID]/usercopy`)

## ⚙️ Step 4: Update File HTML

1. Buka file `index.html` dengan editor
2. Cari baris yang berisi:
   ```javascript
   const response = await fetch('https://script.google.com/macros/d/YOUR_SCRIPT_ID/usercopy', {
   ```
3. Ganti `YOUR_SCRIPT_ID` dengan SCRIPT_ID dari URL deployment Anda

   **Contoh:** Jika URL deployment adalah:
   ```
   https://script.google.com/macros/s/AKfycbxRGSomeRandomIDHere/usercopy
   ```

   Maka ganti menjadi:
   ```javascript
   const response = await fetch('https://script.google.com/macros/s/AKfycbxRGSomeRandomIDHere/usercopy', {
   ```

## 🚀 Step 5: Deploy ke Vercel

### Opsi A: Via GitHub (Recommended)

1. Push file ke GitHub repository
2. Buka https://vercel.com
3. Login dengan akun GitHub Anda
4. Klik **New Project**
5. Import repository Anda
6. Klik **Deploy**
7. Vercel otomatis akan mengupload file HTML Anda

### Opsi B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate ke folder project
cd /path/to/poBewok

# Deploy
vercel
```

### Opsi C: Drag & Drop

1. Buka https://vercel.com/new
2. Scroll ke bagian **Quickstart**
3. Drag & drop folder atau file HTML Anda
4. Vercel akan otomatis deploy

## 📝 Testing

1. Buka aplikasi Anda di URL Vercel
2. Isi form dengan data test
3. Klik "Ambil Lokasi Saat Ini" (opsional)
4. Pilih paket atau item
5. Upload screenshot test
6. Submit form
7. Cek Google Sheet Anda - data harus muncul di baris baru

## 🔧 Troubleshooting

### Error: "Failed to send request"
- Pastikan URL Apps Script sudah di-update di `index.html`
- Pastikan Apps Script sudah di-deploy sebagai "Web app"
- Pastikan permission di Apps Script adalah "Anyone"

### Gambar tidak tersimpan
- Google Drive perlu memiliki space kosong
- Coba refresh Google Drive atau bersihkan sampah
- Alternatif: simpan link base64 langsung (tapi ukurannya besar)

### WhatsApp link tidak berfungsi
- Untuk otomasi, tambahkan tombol "Hubungi via WhatsApp" di form
- Format: `https://wa.me/[nomor]?text=[pesan]`

## 💡 Tips Optimasi

### Tambah Tombol WhatsApp Otomatis
Edit HTML form, tambahkan sebelum `</form>`:
```html
<a href="https://wa.me/6281234567890?text=Pesanan%20saya%20sudah%20dikirim!"
   class="submit-btn" style="display: block; text-align: center; text-decoration: none;">
   📱 Hubungi Admin via WhatsApp
</a>
```

### Backup Data dari Google Sheets
1. Buka Google Sheet
2. File → Download → CSV atau Excel
3. Simpan di komputer Anda

### Hapus Data Lama
1. Pilih baris yang ingin dihapus di Google Sheet
2. Klik kanan → Delete rows
3. Tetap simpan header untuk sheet tetap terstruktur

## 📊 Analytics

Untuk tracking simple:
1. Buka Google Sheet Anda
2. Tools → Script Editor → Apps Script Analytics
3. Lihat jumlah request dan error

## 🎉 Selesai!

Website Anda sudah live dan siap menerima pre-order. Data otomatis masuk ke Google Sheets, dan Anda tidak perlu bayar hosting atau server!

---

**Need Help?**
- Permasalahan dengan Google Sheets? Check: https://support.google.com/sheets
- Permasalahan dengan Vercel? Check: https://vercel.com/docs
- Permasalahan dengan Apps Script? Check: https://developers.google.com/apps-script
