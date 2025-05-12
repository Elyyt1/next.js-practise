import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET — Получить все категории
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        products: true, // Включаем связанные товары
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST — Создать новую категорию 
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: { name },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    
    // Проверка на дубликат категории
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'Category with this name already exists' }, { status: 400 });
    }
    
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT — Обновить категорию
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name } = body;

    if (!id) {
      return NextResponse.json({ message: 'Category ID is required' }, { status: 400 });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(updatedCategory);
  } catch (error: any) {
    console.error('Error updating category:', error);
    
    // Проверка на несуществующую категорию
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE — Удалить категорию
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ message: 'Category ID is required' }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    
    // Проверка на несуществующую категорию
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Category not found' }, { status: 404 });
    }
    
    // Проверка на удаление категории, связанной с товарами
    if (error.code === 'P2003') {
      return NextResponse.json(
        { message: 'Cannot delete category with associated products' }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}