var sheetName = 'QRIS'
var SPREADSHEET_ID = '1vo-s2biXePgPsMdbwzhI8cmyd1AihH_Embz8kRWYtzw'
var PARENT_FOLDER_ID = '1VvoTKpCD8kiLID413cchQc7ljkpiDnAWzmaz1-duHDbvD3XVcAoyqALzkxYcbDoYC_s3mX0z'

function doPost(e) {
  var lock = LockService.getScriptLock()
  lock.tryLock(10000)

  try {
    Logger.log('doPost called')

    var data = {}

    // Try to parse JSON from postData
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents)
        Logger.log('Parsed JSON from postData successfully')
      } catch(parseErr) {
        Logger.log('Parse error: ' + parseErr.toString())
        data = (e && e.parameter) ? e.parameter : {}
      }
    } else {
      data = (e && e.parameter) ? e.parameter : {}
    }

    Logger.log('=== DEBUG ===')
    Logger.log('Data type: ' + typeof data)
    Logger.log('Data keys: ' + Object.keys(data).join(', '))
    Logger.log('nama: ' + (data.nama || 'EMPTY'))
    Logger.log('imageBase64 type: ' + typeof data.imageBase64)
    Logger.log('imageBase64 length: ' + (data.imageBase64 ? data.imageBase64.length : 0))
    Logger.log('REQUEST: imageBase64 exists: ' + (data.imageBase64 ? 'YES' : 'NO'))
    if (data.imageBase64 && data.imageBase64.length > 0) {
      Logger.log('imageBase64 first 100 chars: ' + data.imageBase64.substring(0, 100))
    }

    var paymentMethod = data.paymentMethod || 'qris'
    var currentSheetName = paymentMethod === 'bank' ? 'Bank Transfer' : 'QRIS'

    var doc = SpreadsheetApp.openById(SPREADSHEET_ID)
    var sheet = doc.getSheetByName(currentSheetName)

    if (!sheet) {
      sheet = doc.insertSheet(currentSheetName)
      sheet.appendRow(['timestamp', 'nama', 'whatsapp', 'alamat', 'bundle', 'items', 'total', 'paymentMethod', 'imageBase64', 'status'])
    }

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    var nextRow = sheet.getLastRow() + 1

    var imageLink = ''
    var imageStatus = 'no_image'

    // Process base64 image
    if (data.imageBase64 && data.imageBase64.length > 100) {
      try {
        Logger.log('Converting base64 to file')
        imageLink = saveBase64ImageToDrive(data.imageBase64, data.nama, paymentMethod)
        imageStatus = 'embedded'
        Logger.log('File saved: ' + imageLink)
      } catch(err) {
        Logger.log('ERROR: ' + err.toString())
        imageLink = 'Error: ' + err.toString()
        imageStatus = 'error'
      }
    } else {
      Logger.log('No base64 image')
      imageLink = 'No image'
      imageStatus = 'no_file'
    }

    var newRow = headers.map(function(header) {
      if (header === 'timestamp') {
        return new Date()
      } else if (header === 'status') {
        return 'Pending'
      } else if (header === 'imageBase64' || header === 'bukti_pembayaran' || header === 'bukti' || header === 'image') {
        return imageLink
      } else if (header === 'items') {
        try {
          var items = typeof data.items === 'string' ? JSON.parse(data.items) : data.items
          if (Array.isArray(items) && items.length > 0) {
            return items.map(function(item) {
              return item.item + ' x' + item.quantity
            }).join(', ')
          }
          return '-'
        } catch(e) {
          return data[header] || '-'
        }
      } else {
        return data[header] || ''
      }
    })

    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow])

    if (imageLink && imageLink.includes('http')) {
      try {
        var imageColumnIndex = headers.indexOf('imageBase64') + 1
        if (imageColumnIndex > 0) {
          var imageCell = sheet.getRange(nextRow, imageColumnIndex)
          imageCell.setFormula('=IMAGE("' + imageLink + '", 4, 100, 100)')
          imageStatus = 'embedded'
        }
      } catch(err) {
        Logger.log('Formula error: ' + err.toString())
      }
    }

    Logger.log('Image Status: ' + imageStatus)
    Logger.log('Image Link: ' + imageLink)

    return ContentService
      .createTextOutput(JSON.stringify({
        'result': 'success',
        'status': 'success',
        'row': nextRow,
        'message': 'Pesanan berhasil disimpan',
        'imageStatus': imageStatus,
        'imageLink': imageLink
      }))
      .setMimeType(ContentService.MimeType.JSON)

  } catch (error) {
    Logger.log('FATAL ERROR: ' + error.toString())
    return ContentService
      .createTextOutput(JSON.stringify({
        'result': 'error',
        'status': 'error',
        'message': error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON)
  }
  finally {
    lock.releaseLock()
  }
}

function saveBase64ImageToDrive(base64String, customerName, paymentMethod) {
  try {
    // Remove data URL prefix if exists
    var base64Data = base64String
    if (base64String.indexOf(',') > 0) {
      base64Data = base64String.split(',')[1]
    }

    // Decode base64
    var decodedData = Utilities.base64Decode(base64Data)
    var blob = Utilities.newBlob(decodedData, 'image/jpeg')

    var parentFolder = DriveApp.getFolderById(PARENT_FOLDER_ID)

    var folderName = 'SIP DEH - Bukti Pembayaran'
    var existingFolders = parentFolder.getFoldersByName(folderName)
    var folder = existingFolders.hasNext() ? existingFolders.next() : parentFolder.createFolder(folderName)

    var subFolderName = paymentMethod === 'bank' ? 'Bank Transfer' : 'QRIS'
    var subFolders = folder.getFoldersByName(subFolderName)
    var subFolder = subFolders.hasNext() ? subFolders.next() : folder.createFolder(subFolderName)

    var timestamp = new Date().getTime()
    var sanitizedName = customerName.replace(/[^a-zA-Z0-9]/g, '_')
    var filename = sanitizedName + '_' + timestamp + '.jpg'

    var file = subFolder.createFile(blob)
    file.setName(filename)
    file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW)

    return file.getUrl()

  } catch (error) {
    Logger.log('Error in saveBase64ImageToDrive: ' + error.toString())
    throw error
  }
}

function doOptions(e) {
  return HtmlService.createHtmlOutput()
}
