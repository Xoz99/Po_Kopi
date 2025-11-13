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
var SPREADSHEET_ID = '1vo-s2biXePgPsMdbwzhI8cmyd1AihH_Embz8kRWYtzw' // Hardcode Spreadsheet ID
var PARENT_FOLDER_ID = '1VvoTKpCD8kiLID413cchQc7ljkpiDnAWzmaz1-duHDbvD3XVcAoyqALzkxYcbDoYC_s3mX0z' // Parent folder di Google Drive

function intialSetup() {
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  Logger.log('Current Spreadsheet ID: ' + activeSpreadsheet.getId())
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
    Logger.log('Spreadsheet ID: ' + SPREADSHEET_ID)

    // Get spreadsheet dan sheet
    var doc = SpreadsheetApp.openById(SPREADSHEET_ID)
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

    // Save image ke Drive jika ada
    var imageLink = ''
    if (data.imageBase64 && data.imageBase64.length > 100) { // Minimal panjang base64
      try {
        Logger.log('Processing image, size: ' + data.imageBase64.length)
        imageLink = saveImageToDrive(data.imageBase64, data.nama, paymentMethod)
        Logger.log('Image saved: ' + imageLink)
      } catch(imgError) {
        Logger.log('Image save error: ' + imgError.toString())
        imageLink = 'Error: ' + imgError.toString()
      }
    } else {
      Logger.log('No valid image data received')
      imageLink = 'No image'
    }

    // Map data ke kolom berdasarkan header
    var newRow = headers.map(function(header) {
      if (header === 'timestamp') {
        return new Date()
      } else if (header === 'status') {
        return 'Pending'
      } else if (header === 'imageBase64' || header === 'bukti_pembayaran' || header === 'bukti' || header === 'image') {
        // Ganti imageBase64 dengan link
        return imageLink
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

/**
 * Save image dari base64 ke Google Drive
 */
function saveImageToDrive(base64String, customerName, paymentMethod) {
  try {
    if (!base64String || base64String.length < 100) {
      throw new Error('Invalid base64 string')
    }

    Logger.log('Starting image save...')
    Logger.log('Customer: ' + customerName)
    Logger.log('Payment Method: ' + paymentMethod)

    // Get parent folder
    var parentFolder = DriveApp.getFolderById(PARENT_FOLDER_ID)
    Logger.log('Parent folder: ' + parentFolder.getName())

    // Create atau get folder "SIP DEH - Bukti Pembayaran" di dalam parent folder
    var folderName = 'SIP DEH - Bukti Pembayaran'
    var existingFolders = parentFolder.getFoldersByName(folderName)
    var folder
    if (existingFolders.hasNext()) {
      folder = existingFolders.next()
      Logger.log('Folder exists in parent')
    } else {
      folder = parentFolder.createFolder(folderName)
      Logger.log('Folder created in parent')
    }

    // Create atau get subfolder per payment method
    var subFolderName = paymentMethod === 'bank' ? 'Bank Transfer' : 'QRIS'
    var subFolders = folder.getFoldersByName(subFolderName)
    var subFolder
    if (subFolders.hasNext()) {
      subFolder = subFolders.next()
      Logger.log('SubFolder exists: ' + subFolderName)
    } else {
      subFolder = folder.createFolder(subFolderName)
      Logger.log('SubFolder created: ' + subFolderName)
    }

    // Decode base64
    var base64Data = base64String
    if (base64String.indexOf(',') > 0) {
      base64Data = base64String.split(',')[1]
    }

    Logger.log('Base64 data length: ' + base64Data.length)

    var decodedData = Utilities.base64Decode(base64Data)
    var blob = Utilities.newBlob(decodedData, 'image/jpeg')

    Logger.log('Blob created, size: ' + blob.getBytes().length)

    // Create filename
    var timestamp = new Date().getTime()
    var sanitizedName = customerName.replace(/[^a-zA-Z0-9]/g, '_')
    var filename = sanitizedName + '_' + timestamp + '.jpg'

    Logger.log('Filename: ' + filename)

    // Save to folder
    var file = subFolder.createFile(blob)
    file.setName(filename)

    Logger.log('File created: ' + file.getId())

    // Make file shareable dan get link
    file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW)
    var fileUrl = file.getUrl()

    Logger.log('Image file created successfully: ' + fileUrl)
    return fileUrl

  } catch (error) {
    Logger.log('Error saving image: ' + error.toString())
    Logger.log('Stack: ' + error.stack)
    throw error
  }
}
