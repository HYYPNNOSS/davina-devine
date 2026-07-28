import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary config is automatically picked up from CLOUDINARY_URL in .env
// Format: CLOUDINARY_URL=cloudinary://my_key:my_secret@my_cloud_name

export async function POST(request: Request) {
  try {
    const { image } = await request.json(); // base64 string

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: 'davinia_devine',
    });

    return NextResponse.json({ url: uploadResponse.secure_url });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
