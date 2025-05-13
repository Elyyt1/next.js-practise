import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST — Создать скидку
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { percentage, description, startDate, endDate, productIds } = body;

    if (!percentage || !startDate || !endDate) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    
    const discount = await prisma.discount.create({
      data: {
        percentage,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        products: {
          connect: productIds?.map((id: number) => ({ id })),
        },
      },
    });

    return NextResponse.json(discount, { status: 201 });
  } catch (error) {
    console.error('Error creating discount:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
