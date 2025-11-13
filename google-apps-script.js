/**
 * Google Apps Script untuk Pre-Order SIP DEH
 *
 * SETUP INSTRUCTIONS:
 * 1. Buka Google Sheets: https://sheets.google.com
 * 2. Buat spreadsheet baru dengan nama "SIP DEH Pre-Orders"
 * 3. Rename sheet 1 menjadi "QRIS" dan buat sheet baru "Bank Transfer"
 * 4. Buka Tools > Script Editor
 * 5. Copy paste semua kode di bawah ini
 * 6. Jalankan fungsi doPost() sekali
 * 7. Klik Deploy > New Deployment > Web app
 * 8. Execute as: Your Account
 * 9. Who has access: Anyone
 * 10. Copy URL dan replace YOUR_SCRIPT_ID di HTML
 */

// ID Spreadsheet (ganti dengan ID Sheets Anda)
const SPREADSHEET_ID = '1vo-s2biXePgPsMdbwzhI8cmyd1AihH_Embz8kRWYtzw';

// Nama sheet untuk setiap payment method
const SHEET_NAMES = {
  'qris': 'QRIS',
  'bank': 'Bank Transfer'
};

// Columns definition
const COLUMNS = {
  'qris': [
    'Timestamp',
    'Nama',
    'WhatsApp',
    'Alamat',
    'Paket',
    'Items',
    'Total Harga',
    'Bukti Pembayaran Link',
    'Status'
  ],
  'bank': [
    'Timestamp',
    'Nama',
    'WhatsApp',
    'Alamat',
    'Paket',
    'Items',
    'Total Harga',
    'Bukti Pembayaran Link',
    'Status'
  ]
};

function doPost(e) {
  try {
    // Parse JSON dari request
    const data = JSON.parse(e.postData.contents);

    // Get payment method
    const paymentMethod = data.paymentMethod || 'qris';
    const sheetName = SHEET_NAMES[paymentMethod];

    // Get spreadsheet dan sheet
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(sheetName);

    // Create sheet jika belum ada
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      // Add headers
      sheet.appendRow(COLUMNS[paymentMethod]);
    }

    // Process image dan save to Drive
    let receiptLink = '';
    if (data.imageBase64) {
      receiptLink = saveImageToDrive(data.imageBase64, data.nama, paymentMethod);
    }

    // Format items
    const itemsList = data.items.map(item => {
      return `${formatItemName(item.item)} x${item.quantity} (Rp ${item.price.toLocaleString('id-ID')})`;
    }).join(', ');

    // Format bundle
    const bundleText = data.bundle && data.bundle !== 'none'
      ? (data.bundle === 'nongki' ? 'Paket Nongki (18K)' : 'Paket Millo Ceria (23K)')
      : 'Tanpa Paket';

    // Add row to sheet
    const newRow = [
      data.timestamp,
      data.nama,
      data.whatsapp,
      data.alamat,
      bundleText,
      itemsList || '-',
      `Rp ${data.total.toLocaleString('id-ID')}`,
      receiptLink,
      'Pending'
    ];

    sheet.appendRow(newRow);

    // Send WhatsApp notification (optional - bisa diisi di config)
    // sendWhatsAppNotification(data);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Pesanan berhasil disimpan',
      paymentMethod: paymentMethod
    }))
    .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Save image dari base64 ke Google Drive
 */
function saveImageToDrive(base64String, customerName, paymentMethod) {
  try {
    // Create folder jika belum ada
    let folder = DriveApp.getFoldersByName('SIP DEH - Bukti Pembayaran').hasNext()
      ? DriveApp.getFoldersByName('SIP DEH - Bukti Pembayaran').next()
      : DriveApp.createFolder('SIP DEH - Bukti Pembayaran');

    // Create subfolder per payment method
    let subFolder = folder.getFoldersByName(paymentMethod.toUpperCase()).hasNext()
      ? folder.getFoldersByName(paymentMethod.toUpperCase()).next()
      : folder.createFolder(paymentMethod.toUpperCase());

    // Convert base64 ke blob
    const base64Data = base64String.split(',')[1];
    const mimeType = 'image/jpeg';
    const imageBlob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType);

    // Create filename dengan timestamp
    const filename = `${customerName}_${new Date().getTime()}.jpg`;

    // Save file to folder
    const file = subFolder.createFile(imageBlob);
    file.setName(filename);

    return file.getUrl();

  } catch (error) {
    Logger.log('Image save error: ' + error);
    return '';
  }
}

/**
 * Format item name dari ID
 */
function formatItemName(itemId) {
  const itemNames = {
    'iced-cappuccino': 'Iced Cappuccino',
    'iced-latte': 'Iced Latte',
    'millo-dino': 'Millo Dino',
    'millo-oreo': 'Millo Oreo'
  };
  return itemNames[itemId] || itemId;
}

/**
 * OPTIONAL: Send notification ke WhatsApp
 * Butuh: Twilio account atau WhatsApp Business API
 */
function sendWhatsAppNotification(data) {
  // Contoh konfigurasi Twilio
  /*
  const twilioAccountSid = 'YOUR_ACCOUNT_SID';
  const twilioAuthToken = 'YOUR_AUTH_TOKEN';
  const fromNumber = 'whatsapp:+1234567890'; // Twilio sandbox number
  const toNumber = `whatsapp:+${data.whatsapp}`;

  const message = `Halo ${data.nama}!\n\nPesanan pre-order Anda telah diterima.\nTotal: Rp ${data.total.toLocaleString('id-ID')}\n\nTerima kasih!`;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages`;

  const payload = {
    From: fromNumber,
    To: toNumber,
    Body: message
  };

  const options = {
    method: 'post',
    headers: {
      Authorization: 'Basic ' + Utilities.base64Encode(twilioAccountSid + ':' + twilioAuthToken)
    },
    payload: payload,
    muteHttpExceptions: true
  };

  UrlFetchApp.fetch(url, options);
  */
}

/**
 * Test function - jalankan ini untuk test
 */
function testDoPost() {
  const testData = {
    "nama": "John Doe",
    "whatsapp": "6281234567890",
    "alamat": "Jl. Test No. 123",
    "bundle": "none",
    "items": [
      {"item": "iced-cappuccino", "quantity": 2, "price": 10000},
      {"item": "millo-dino", "quantity": 1, "price": 12000}
    ],
    "timestamp": new Date().toLocaleString('id-ID'),
    "paymentMethod": "qris",
    "total": 32000,
    "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  };

  const e = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };

  const result = doPost(e);
  Logger.log(result.getContent());
}
