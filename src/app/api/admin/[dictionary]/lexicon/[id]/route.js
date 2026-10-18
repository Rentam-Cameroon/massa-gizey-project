import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../../lib/auth';
import { updateLexiconEntry, deleteLexiconEntry } from '../../../../../../../lib/store';

function langFrom(params) {
  return (params.dictionary || 'massa').toLowerCase();
}

export async function PUT(request, { params }) {
  const { error } = requireAdmin(request);
  if (error) return error;
  const resolved = await params;
  const dictionary = langFrom(resolved);
  try {
    const body = await request.json();
    const item = await updateLexiconEntry(dictionary, resolved.id, body);
    if (!item) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, item });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { error } = requireAdmin(request);
  if (error) return error;
  const resolved = await params;
  await deleteLexiconEntry(langFrom(resolved), resolved.id);
  return NextResponse.json({ success: true });
}
