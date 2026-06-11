import { NextResponse } from 'next/server';
import { getProvider, type ListFilters } from '../../lib/propertyProvider';

export const maxDuration = 60;

// Idea #7 — list-pull marketplace. Returns an estimated market size for a set
// of filters (action: 'estimate') or the actual pulled records (action: 'pull').
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    const filters: ListFilters = {
      state: (body.state || '').trim(),
      city: (body.city || '').trim(),
      zip: (body.zip || '').trim(),
      minEquityPct: Math.min(100, Math.max(0, Number(body.minEquityPct) || 0)),
      ownerType: body.ownerType || 'any',
      propertyType: body.propertyType || 'any',
      limit: Math.min(5000, Math.max(1, Number(body.limit) || 100)),
    };

    if (!filters.state && !filters.city && !filters.zip) {
      return NextResponse.json({ error: 'Enter at least a state, city, or ZIP to build a list.' }, { status: 400 });
    }

    const provider = getProvider();

    if (action === 'estimate') {
      const estimate = await provider.estimateCount(filters);
      return NextResponse.json({ estimate, provider: provider.name });
    }

    const records = await provider.search(filters);
    return NextResponse.json({ records, count: records.length, provider: provider.name });
  } catch (error: any) {
    console.error('Property list error:', error);
    return NextResponse.json({ error: 'Could not build list' }, { status: 500 });
  }
}
