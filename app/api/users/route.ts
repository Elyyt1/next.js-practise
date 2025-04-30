// app/api/users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
export async function POST(req: NextRequest) {
    try {
      const body = await req.json();
      const { email, name } = body;
  
      if (!email) {
        return NextResponse.json({ message: 'Email is required' }, { status: 400 });
      }
  
      const newUser = await prisma.user.create({
        data: {
          email,
          name,
        },
      });
  
      return NextResponse.json(newUser, { status: 201 });
    } catch (error: any) {
      console.error('Error creating user:', error);
  
      // Проверка на уникальность email
      if (error.code === 'P2002') {
        return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
      }
  
      return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
  }
  