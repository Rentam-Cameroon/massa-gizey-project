import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../lib/auth';
import { adminQueryWords, createDictionaryEntry } from '../../../../../../lib/store';

function langFrom(params) {
  return (params.dictionary || 'massa').toLowerCase();
}

export async function GET(request, { params }) {
  const { error } = requireAdmin(request);
  if (error) return error;
  const dictionary = langFrom(await params);
  if (!['massa', 'gizey'].includes(dictionary)) {
    return NextResponse.json({ success: false, error: 'Invalid dictionary' }, { status: 400 });
  }
  const { searchParams } = new URL(request.url);
  try {
    const result = await adminQueryWords(dictionary, {
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
  if (!['massa', 'gizey'].includes(dictionary)) {
    return NextResponse.json({ success: false, error: 'Invalid dictionary' }, { status: 400 });
  }
  try {
    const body = await request.json();
    if (!body.wordForm || !body.partOfSpeech) {
      return NextResponse.json({ success: false, error: 'wordForm and partOfSpeech are required.' }, { status: 422 });
    }
    const entry = await createDictionaryEntry(dictionary, body);
    return NextResponse.json({ success: true, word: entry }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
