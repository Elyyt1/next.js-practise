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
    
    // Создаем скидку
    const discount = await prisma.discount.create({
      data: {
        percentage,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });
    
    // Если есть productIds, обновляем продукты, чтобы связать их со скидкой
    if (productIds && productIds.length > 0) {
      await prisma.$transaction(
        productIds.map((id: number) =>
          prisma.product.update({
            where: { id },
            data: { discountId: discount.id }
          })
        )
      );
    }

    // Возвращаем созданную скидку вместе с привязанными продуктами
    const discountWithProducts = await prisma.discount.findUnique({
      where: { id: discount.id },
      include: { products: true }
    });

    return NextResponse.json(discountWithProducts, { status: 201 });
  } catch (error) {
    console.error('Error creating discount:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}
// GET — Получить скидку или все скидки
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const discount = await prisma.discount.findUnique({
        where: { id: Number(id) },
        include: { products: true }
      });

      if (!discount) {
        return NextResponse.json({ message: 'Discount not found' }, { status: 404 });
      }

      return NextResponse.json(discount);
    }

    const discounts = await prisma.discount.findMany({
      include: { products: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(discounts);
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}
// PUT — Обновить скидку
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, percentage, description, startDate, endDate, productIds } = body;

    if (!id) {
      return NextResponse.json({ message: 'Missing discount id' }, { status: 400 });
    }

    const updatedDiscount = await prisma.discount.update({
      where: { id },
      data: {
        percentage,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    // Отвязываем предыдущие продукты
    await prisma.product.updateMany({
      where: { discountId: id },
      data: { discountId: null },
    });

    // Привязываем новые
    if (productIds && productIds.length > 0) {
      await prisma.$transaction(
        productIds.map((productId: number) =>
          prisma.product.update({
            where: { id: productId },
            data: { discountId: id }
          })
        )
      );
    }

    const result = await prisma.discount.findUnique({
      where: { id },
      include: { products: true }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating discount:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}
// DELETE — Удалить скидку
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing discount id' }, { status: 400 });
    }

    const discountId = Number(id);

    // Отвязываем все продукты
    await prisma.product.updateMany({
      where: { discountId },
      data: { discountId: null },
    });

    // Удаляем скидку
    await prisma.discount.delete({
      where: { id: discountId }
    });

    return NextResponse.json({ message: 'Discount deleted successfully' });
  } catch (error) {
    console.error('Error deleting discount:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}
