import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import fs from 'fs/promises';
import path from 'path';

// Fallback data if DB fails or is unconfigured
const dataFilePath = path.join(process.cwd(), 'data', 'services.json');

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: 'asc' }
    });
    
    // If DB is empty, maybe fallback to json for testing (or just return empty array)
    if (services.length === 0) {
      try {
        const fileContents = await fs.readFile(dataFilePath, 'utf8');
        return NextResponse.json(JSON.parse(fileContents));
      } catch (e) {
        return NextResponse.json([]);
      }
    }
    
    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services from DB, falling back to JSON:', error);
    try {
      const fileContents = await fs.readFile(dataFilePath, 'utf8');
      return NextResponse.json(JSON.parse(fileContents));
    } catch (e) {
      return NextResponse.json({ error: 'Failed to read services' }, { status: 500 });
    }
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const service = await prisma.service.create({
      data: {
        name: data.name,
        duration: data.duration,
        price: data.price,
        imageUrl: data.imageUrl,
        category: data.category,
        description: data.description,
        waxArea: data.waxArea,
      }
    });
    return NextResponse.json(service);
  } catch (error) {
    console.error('Error saving service:', error);
    return NextResponse.json({ error: 'Failed to save service' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await prisma.service.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const service = await prisma.service.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json(service);
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}
