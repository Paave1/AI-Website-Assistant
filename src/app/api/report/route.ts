import {NextRequest, NextResponse} from 'next/server';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({error: 'Missing id'}, {status: 400});
  const scan = await prisma.scan.findUnique({where: {id}});
  if (!scan) return NextResponse.json({error: 'Not found'}, {status: 404});
  return NextResponse.json(scan);
}



