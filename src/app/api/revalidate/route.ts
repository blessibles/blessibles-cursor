import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get('tag');

  if (!tag) {
    return NextResponse.json(
      { error: 'Tag parameter is required' },
      { status: 400 }
    );
  }

  try {
    revalidateTag(tag);
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error revalidating cache' },
      { status: 500 }
    );
  }
} 