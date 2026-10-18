import { NextResponse } from 'next/server';
import { getStoryById } from '../../../../../lib/store';

export async function GET(request, { params }) {
  const { id } = await params;
  try {
    const story = await getStoryById(id, { bumpViews: true });
    if (!story) {
      return NextResponse.json({ success: false, error: 'Story not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, story });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
