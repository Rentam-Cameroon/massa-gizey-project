import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../lib/auth';
import { adminQueryLexicon, createLexiconEntry } from '../../../../../../lib/store';

function langFrom(params) {
  return (params.dictionary || 'massa').toLowerCase();
}

export async function GET(request, { params }) {
  const { error } = requireAdmin(request);
  if (error) return error;
  const dictionary = langFrom(await params);
  if (!['massa', 'gizey'].includes(dictionary)) {
    return NextResponse.json({ success: false, error: 'Invalid lexicon' }, { status: 400 });
  }
  const { searchParams } = new URL(request.url);
  try {
    const result = await adminQueryLexicon(dictionary, {
      search: searchParams.get('search') || '',
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '20', 10),
      letter: searchParams.get('letter') || ''
    });
    return NextResponse.json({ success: true, dictionary, ...result });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { error } = requireAdmin(request);
  if (error) return error;
  const dictionary = langFrom(await params);
  try {
    const body = await request.json();
    if (!body.french || !(body.massa || body.gizey)) {
      return NextResponse.json({ success: false, error: 'French and target-language terms are required.' }, { status: 422 });
    }
    const item = await createLexiconEntry(dictionary, body);
    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
