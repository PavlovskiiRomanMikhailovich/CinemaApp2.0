import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = 'https://front-school-strapi.ktsdev.ru/api';
const PAGE_SIZE = 5;

function toAbsUrl(raw: string): string {
  if (!raw) return '';
  return raw.startsWith('http') ? raw : `https://front-school-strapi.ktsdev.ru${raw}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Math.max(1, Number(searchParams.get('page') || '1'));

  const params = new URLSearchParams({
    'pagination[page]': String(page),
    'pagination[pageSize]': String(PAGE_SIZE),
    'populate[poster]': 'true',
    'populate[gallery]': 'true',
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
        const posterUrl = toAbsUrl(
          film.poster?.formats?.large?.url ?? film.poster?.url ?? '',
        );

        const gallery: string[] = ((film.gallery as any[]) ?? [])
          .map((img: any) =>
            toAbsUrl(
              img.formats?.large?.url ??
              img.formats?.medium?.url ??
              img.url ??
              '',
            ),
          )
          .filter(Boolean);

        return {
          id: film.id as number,
          documentId: film.documentId as string,
          title: film.title as string,
          shortDescription: (film.shortDescription ?? '') as string,
          trailerUrl: film.trailerUrl as string,
          posterUrl,
          gallery,
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
