import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../../lib/auth';
import { adminGetLexiconLetters } from '../../../../../../../lib/store';

export async function GET(request, { params }) {
  const { error } = requireAdmin(request);
  if (error) return error;
  const dictionary = ((await params).dictionary || '').toLowerCase();
  if (!['massa', 'gizey'].includes(dictionary)) {
    return NextResponse.json({ success: false, error: 'Invalid lexicon' }, { status: 400 });
  }
  try {
    const data = await adminGetLexiconLetters(dictionary);
    return NextResponse.json({ success: true, dictionary, ...data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
