import { NextRequest, NextResponse } from 'next/server';
import { incrementBlogPostViews } from '@/lib/blogService';

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json();
    
    if (!postId || typeof postId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid post ID' },
        { status: 400 }
      );
    }

    await incrementBlogPostViews(postId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error incrementing view:', error);
    return NextResponse.json(
      { error: 'Failed to increment view' },
      { status: 500 }
    );
  }
}
