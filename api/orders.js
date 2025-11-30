import { MongoClient } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';

const MONGODB_URI = process.env.MONGODB_URI;
const CLOUDINARY_NAME = process.env.CLOUDINARY_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// MongoDB connection cache
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('sipdeh');
  cachedDb = db;
  return db;
}

// Upload image to Cloudinary
async function uploadImageToCloudinary(base64String) {
  try {
    const result = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${base64String}`,
      {
        folder: 'sipdeh-bukti-pembayaran',
        resource_type: 'auto',
      }
    );
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

// Parse items JSON
function parseItems(itemsData) {
  try {
    if (typeof itemsData === 'string') {
      return JSON.parse(itemsData);
    }
    return itemsData || [];
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const db = await connectToDatabase();
    const ordersCollection = db.collection('orders');

    if (req.method === 'POST') {
      // Parse body - handle both object and string
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {
          console.error('JSON parse error:', e);
          return res.status(400).json({
            status: 'error',
            message: 'Invalid JSON body',
          });
        }
      }

      console.log('Request body keys:', Object.keys(body));
      console.log('imageBase64 type:', typeof body.imageBase64);
      console.log('imageBase64 length:', body.imageBase64 ? body.imageBase64.length : 'undefined');

      // Create new order
      const {
        nama,
        whatsapp,
        alamat,
        bundle,
        items,
        timestamp,
        paymentMethod,
        imageBase64,
        total,
      } = body;

      let imageUrl = '';
      let imageStatus = 'no_image';

      // Upload image jika ada
      if (imageBase64 && typeof imageBase64 === 'string' && imageBase64.length > 100) {
        try {
          // Remove data URL prefix if exists
          let base64Data = imageBase64;
          if (base64Data && base64Data.includes(',')) {
            base64Data = base64Data.split(',')[1];
          }

          if (base64Data && base64Data.length > 50) {
            imageUrl = await uploadImageToCloudinary(base64Data);
            imageStatus = 'uploaded';
          }
        } catch (error) {
          console.error('Image upload error:', error);
          imageStatus = 'error';
          imageUrl = '';
        }
      } else {
        console.log('No image provided or invalid imageBase64');
      }

      // Parse items
      const parsedItems = parseItems(items);

      // Create order document
      const order = {
        nama,
        whatsapp,
        alamat,
        bundle: bundle === 'none' ? '' : bundle,
        items: parsedItems,
        total: parseInt(total) || 0,
        timestamp: new Date(timestamp) || new Date(),
        paymentMethod,
        imageUrl,
        imageStatus,
        status: 'pending',
        createdAt: new Date(),
      };

      const result = await ordersCollection.insertOne(order);

      return res.status(201).json({
        status: 'success',
        result: 'success',
        message: 'Pesanan berhasil disimpan',
        orderId: result.insertedId,
        imageStatus,
        imageUrl,
      });
    }

    if (req.method === 'GET') {
      // Get all orders
      const orders = await ordersCollection
        .find({})
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();

      return res.status(200).json({
        status: 'success',
        data: orders,
        count: orders.length,
      });
    }

    // Invalid method
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed',
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
}
