import { NextResponse } from 'next/server';
import { queryLexicon } from '../../../../../lib/db';

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const dictionary = (resolvedParams.dictionary || 'massa').toLowerCase();

  if (!['massa', 'gizey'].includes(dictionary)) {
    return NextResponse.json({
      success: false,
      message: 'Invalid dictionary specified.'
    }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  try {
    const result = await queryLexicon(dictionary, { search, page, limit });
    return NextResponse.json({
      success: true,
      dictionary,
      ...result
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
