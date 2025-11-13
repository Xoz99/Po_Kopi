/**
 * Google Apps Script untuk Pre-Order SIP DEH
 *
 * SETUP INSTRUCTIONS:
 * 1. Buka Google Sheets Anda
 * 2. Pastikan ada 2 sheet: "QRIS" dan "Bank Transfer"
 * 3. Di sheet QRIS, buat header di row 1: timestamp | nama | whatsapp | alamat | bundle | items | total | paymentMethod | imageBase64 | status
 * 4. Buka Tools > Script Editor
 * 5. Paste kode ini
 * 6. Jalankan fungsi intialSetup() untuk auto-detect Spreadsheet ID
 * 7. Deploy sebagai Web app (Deploy > New > Web app)
 * 8. Execute as: Your Account
 * 9. Who has access: Anyone
 * 10. Copy URL deployment ke HTML
 */

var sheetName = 'QRIS' // Default sheet
var scriptProp = PropertiesService.getScriptProperties()

function intialSetup() {
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  scriptProp.setProperty('key', activeSpreadsheet.getId())
  Logger.log('Spreadsheet ID saved: ' + activeSpreadsheet.getId())
}

function doPost(e) {
  var lock = LockService.getScriptLock()
  lock.tryLock(10000)

  try {
    // Parse data dari request (form-encoded atau JSON)
    var data = {}

    if (e.postData && e.postData.contents) {
      try {
        // Coba parse sebagai JSON
        data = JSON.parse(e.postData.contents)
      } catch(err) {
        // Fallback ke parameter
        data = e.parameter
      }
    } else {
      data = e.parameter
    }

    Logger.log('Received data: ' + JSON.stringify(data))

    // Determine sheet name based on payment method
    var paymentMethod = data.paymentMethod || 'qris'
    var currentSheetName = paymentMethod === 'bank' ? 'Bank Transfer' : 'QRIS'

    Logger.log('Using sheet: ' + currentSheetName)

    // Get spreadsheet dan sheet
    var doc = SpreadsheetApp.openById(scriptProp.getProperty('key'))
    var sheet = doc.getSheetByName(currentSheetName)

    // Jika sheet tidak ada, buat baru
    if (!sheet) {
      sheet = doc.insertSheet(currentSheetName)
      // Add headers otomatis
      sheet.appendRow(['timestamp', 'nama', 'whatsapp', 'alamat', 'bundle', 'items', 'total', 'paymentMethod', 'imageBase64', 'status'])
    }

    // Get headers
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    var nextRow = sheet.getLastRow() + 1

    Logger.log('Headers: ' + JSON.stringify(headers))
    Logger.log('Next row: ' + nextRow)

    // Map data ke kolom berdasarkan header
    var newRow = headers.map(function(header) {
      if (header === 'timestamp') {
        return new Date()
      } else if (header === 'status') {
        return 'Pending'
      } else if (header === 'items') {
        // Format items jika ada
        try {
          var items = typeof data.items === 'string' ? JSON.parse(data.items) : data.items
          if (Array.isArray(items) && items.length > 0) {
            return items.map(function(item) {
              return item.item + ' x' + item.quantity
            }).join(', ')
          }
          return '-'
        } catch(e) {
          Logger.log('Items parse error: ' + e)
          return data[header] || '-'
        }
      } else {
        return data[header] || ''
      }
    })

    Logger.log('New row data: ' + JSON.stringify(newRow))

    // Append row ke sheet
    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow])

    Logger.log('Data saved to sheet: ' + currentSheetName + ' at row ' + nextRow)

    return ContentService
      .createTextOutput(JSON.stringify({
        'result': 'success',
        'row': nextRow,
        'message': 'Pesanan berhasil disimpan',
        'status': 'success'
      }))
      .setMimeType(ContentService.MimeType.JSON)

  } catch (error) {
    Logger.log('Error: ' + error)
    Logger.log('Stack: ' + error.stack)
    return ContentService
      .createTextOutput(JSON.stringify({
        'result': 'error',
        'error': error.toString(),
        'status': 'error',
        'message': error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON)
  }
  finally {
    lock.releaseLock()
  }
}
