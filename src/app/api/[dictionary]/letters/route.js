import { NextResponse } from 'next/server';
import { getDictionaryLetters } from '../../../../../lib/db';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const dictionary = (resolvedParams.dictionary || 'massa').toLowerCase();
    
    if (dictionary !== 'massa' && dictionary !== 'gizey') {
      return NextResponse.json({ success: false, error: 'Invalid dictionary' }, { status: 400 });
    }

    const data = await getDictionaryLetters(dictionary);
    return NextResponse.json({
      success: true,
      dictionary: data.dictionary,
      letters: data.letters,
      counts: data.counts
    });
  } catch (error) {
    console.error('Error fetching dictionary letters:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
