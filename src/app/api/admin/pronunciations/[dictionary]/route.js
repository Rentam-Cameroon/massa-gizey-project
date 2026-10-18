import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../lib/auth';
import { listPronunciationSuggestions } from '../../../../../../lib/store';

export async function GET(request, { params }) {
  const { error } = requireAdmin(request);
  if (error) return error;
  const dictionary = ((await params).dictionary || 'massa').toLowerCase();
  const { searchParams } = new URL(request.url);
  try {
    const result = await listPronunciationSuggestions(dictionary, {
      search: searchParams.get('search') || '',
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '20', 10)
    });
    return NextResponse.json({ success: true, dictionary, ...result });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
