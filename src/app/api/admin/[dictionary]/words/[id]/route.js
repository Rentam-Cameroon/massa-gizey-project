import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../../lib/auth';
import { queryWordById, updateDictionaryEntry, deleteDictionaryEntry } from '../../../../../../../lib/store';

function langFrom(params) {
  return (params.dictionary || 'massa').toLowerCase();
}

export async function GET(request, { params }) {
  const { error } = requireAdmin(request);
  if (error) return error;
  const resolved = await params;
  const dictionary = langFrom(resolved);
  const word = await queryWordById(dictionary, resolved.id);
  if (!word) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, word });
}

export async function PUT(request, { params }) {
  const { error } = requireAdmin(request);
  if (error) return error;
  const resolved = await params;
  const dictionary = langFrom(resolved);
  try {
    const body = await request.json();
    const word = await updateDictionaryEntry(dictionary, resolved.id, body);
    if (!word) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, word });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { error } = requireAdmin(request);
  if (error) return error;
  const resolved = await params;
  const dictionary = langFrom(resolved);
  await deleteDictionaryEntry(dictionary, resolved.id);
  return NextResponse.json({ success: true });
}
