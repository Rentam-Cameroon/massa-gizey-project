import { NextResponse } from 'next/server';
import { listStories } from '../../../../lib/store';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  try {
    const stories = await listStories({
      search: searchParams.get('search') || '',
      topic: searchParams.get('topic') || ''
    });
    return NextResponse.json({ success: true, stories });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
