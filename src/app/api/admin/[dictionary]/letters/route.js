import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../lib/auth';
import { adminGetDictionaryLetters } from '../../../../../../lib/store';

export async function GET(request, { params }) {
  const { error } = requireAdmin(request);
  if (error) return error;
  const dictionary = ((await params).dictionary || '').toLowerCase();
  if (!['massa', 'gizey'].includes(dictionary)) {
    return NextResponse.json({ success: false, error: 'Invalid dictionary' }, { status: 400 });
  }
  try {
    const data = await adminGetDictionaryLetters(dictionary);
    return NextResponse.json({ success: true, dictionary, letters: data.letters, counts: data.counts });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
