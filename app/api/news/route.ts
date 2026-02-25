import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'news.json');

interface Article {
  id: string;
  title: string;
  image: string;
  author: string;
  date: string;
  body: string;
  sport: string;
  createdAt: number;
}

async function readArticles(): Promise<Article[]> {
  try {
    const content = await readFile(DATA_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function writeArticles(articles: Article[]) {
  await mkdir(path.dirname(DATA_PATH), { recursive: true });
  await writeFile(DATA_PATH, JSON.stringify(articles, null, 2), 'utf-8');
}

// GET — all articles sorted newest first
export async function GET() {
  const articles = await readArticles();
  const sorted = [...articles].sort((a, b) => b.createdAt - a.createdAt);
  return NextResponse.json({ success: true, data: sorted });
}

// POST — create a new article
export async function POST(request: NextRequest) {
  try {
    const { title, image, author, date, body, sport } = await request.json();

    if (!title || !author || !date || !body) {
      return NextResponse.json(
        { success: false, message: 'Title, author, date, and body are required.' },
        { status: 400 }
      );
    }

    const articles = await readArticles();
    const id = Date.now().toString();
    articles.unshift({
      id,
      title,
      image: image || '',
      author,
      date,
      body,
      sport: sport || '',
      createdAt: Date.now(),
    });
    await writeArticles(articles);

    return NextResponse.json({ success: true, message: 'Article published.', id });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error saving article.' },
      { status: 500 }
    );
  }
}

// DELETE — remove an article by id
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Article ID is required.' },
        { status: 400 }
      );
    }

    const articles = await readArticles();
    const filtered = articles.filter((a) => a.id !== id);
    await writeArticles(filtered);

    return NextResponse.json({ success: true, message: 'Article deleted.' });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error deleting article.' },
      { status: 500 }
    );
  }
}
