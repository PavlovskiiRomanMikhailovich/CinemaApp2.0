import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = 'https://front-school-strapi.ktsdev.ru/api';
const PAGE_SIZE = 5;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get('page') || '1'));

  const params = new URLSearchParams({
    'pagination[page]': String(page),
    'pagination[pageSize]': String(PAGE_SIZE),
    'populate[poster]': 'true',
  });

  try {
    const res = await fetch(`${STRAPI_URL}/films?${params}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
    }

    const data = await res.json();

    const items = (data.data as any[])
      .filter((film: any) => Boolean(film.trailerUrl))
      .map((film: any) => {
        const raw: string = film.poster?.url ?? '';
        const posterUrl = raw
          ? raw.startsWith('http')
            ? raw
            : `https://front-school-strapi.ktsdev.ru${raw}`
          : '';

        return {
          id: film.id as number,
          documentId: film.documentId as string,
          title: film.title as string,
          trailerUrl: film.trailerUrl as string,
          posterUrl,
        };
      });

    return NextResponse.json({
      items,
      hasMore: page < data.meta.pagination.pageCount,
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
