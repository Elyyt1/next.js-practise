import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/discount/:id
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ message: 'Invalid discount id' }, { status: 400 });
    }

    const discount = await prisma.discount.findUnique({
      where: { id },
      include: { products: true }
    });

    if (!discount) {
      return NextResponse.json({ message: 'Discount not found' }, { status: 404 });
    }

    return NextResponse.json(discount);
  } catch (error) {
    console.error('Error fetching discount by id:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}
