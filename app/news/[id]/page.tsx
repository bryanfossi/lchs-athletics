"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SiteHeader, type Settings, type SportData } from "../../components/SiteHeader";

const DEFAULT_SETTINGS: Settings = {
  schoolName: "School Athletics",
  primaryColor: "#581C87",
  secondaryColor: "#FBBF24",
  logo: "",
  twitterUrl: "",
  instagramUrl: "",
};

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

function formatDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function sportLabel(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function ArticlePage() {
  const params = useParams();
  const id = params?.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [sportsData, setSportsData] = useState<Record<string, SportData>>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/news").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/sports").then((r) => r.json()),
    ])
      .then(([newsResult, settingsResult, sportsResult]) => {
        if (settingsResult.success && settingsResult.data) {
          setSettings({ ...DEFAULT_SETTINGS, ...settingsResult.data });
        }
        if (sportsResult.success) setSportsData(sportsResult.data || {});
        if (newsResult.success) {
          const found = (newsResult.data as Article[]).find((a) => a.id === id);
          if (found) {
            setArticle(found);
          } else {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 themed-page">
        <SiteHeader settings={settings} sportsData={sportsData} />
        <div className="container mx-auto px-4 py-20 text-center text-gray-500">
          Loading article…
        </div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-screen bg-gray-50 themed-page">
        <SiteHeader settings={settings} sportsData={sportsData} />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Article Not Found</h1>
          <Link href="/news" className="font-semibold hover:opacity-80" style={{ color: settings.primaryColor }}>
            ← Back to News
          </Link>
        </div>
      </div>
    );
  }

  // Split body into paragraphs on blank lines, then handle single \n within paragraphs
  const paragraphs = article.body.split(/\n\n+/).filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 themed-page">
      <SiteHeader settings={settings} sportsData={sportsData} />

      {/* Article hero image */}
      {article.image && (
        <div className="w-full" style={{ maxHeight: "480px", overflow: "hidden" }}>
          <img
            src={article.image}
            alt={article.title}
            className="w-full object-cover"
            style={{ maxHeight: "480px" }}
          />
        </div>
      )}

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto">

          {/* Back link */}
          <Link
            href="/news"
            className="inline-flex items-center gap-1 text-sm font-semibold mb-6 hover:opacity-70 transition"
            style={{ color: settings.primaryColor }}
          >
            ← Back to News
          </Link>

          {/* Article card */}
          <article className="bg-white rounded-lg shadow-lg overflow-hidden border-t-4"
            style={{ borderColor: settings.primaryColor }}>
            <div className="p-6 md:p-10">

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-2 text-sm mb-4">
                {article.sport && (
                  <span
                    className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide text-white"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    {sportLabel(article.sport)}
                  </span>
                )}
                <span className="text-gray-400">{formatDate(article.date)}</span>
                <span className="text-gray-300">·</span>
                <span className="text-gray-500">By {article.author}</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight">
                {article.title}
              </h1>

              {/* Body */}
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-5">
                {paragraphs.map((para, i) => {
                  // A line that ends with no period / looks like a heading (short, no spaces at start)
                  const isHeading = para.length < 80 && !para.startsWith(' ') && !para.includes('\n') && /[A-Z]/.test(para[0]);
                  if (isHeading && i > 0) {
                    return (
                      <h2
                        key={i}
                        className="text-xl font-bold mt-8 mb-2"
                        style={{ color: settings.primaryColor }}
                      >
                        {para}
                      </h2>
                    );
                  }
                  return (
                    <p key={i} className="text-gray-700 text-lg leading-relaxed">
                      {para.split("\n").map((line, j) => (
                        <span key={j}>
                          {line}
                          {j < para.split("\n").length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  );
                })}
              </div>

            </div>

            {/* Article footer */}
            <div
              className="px-6 md:px-10 py-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3"
            >
              <span className="text-sm text-gray-400">
                Published {formatDate(article.date)} · By {article.author}
              </span>
              <Link
                href="/news"
                className="text-sm font-semibold hover:opacity-70 transition"
                style={{ color: settings.primaryColor }}
              >
                ← All News
              </Link>
            </div>
          </article>

        </div>
      </div>

      {/* Footer */}
      <footer className="text-white py-8 mt-8" style={{ backgroundColor: settings.primaryColor }}>
        <div className="container mx-auto px-4 text-center">
          <p>
            &copy; {new Date().getFullYear()} {settings.schoolName} Athletics. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
