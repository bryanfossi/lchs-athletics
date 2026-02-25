"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import { SiteHeader, type Settings, type SportData } from "../components/SiteHeader";

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

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.26 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function formatDate(dateStr: string): string {
  try {
    // Parse YYYY-MM-DD as local date (avoid timezone shift)
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function sportLabel(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function toTwitterTimelineUrl(url: string): string {
  return url.replace('https://x.com/', 'https://twitter.com/').replace('http://x.com/', 'https://twitter.com/');
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [sportsData, setSportsData] = useState<Record<string, SportData>>({});
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState<string>("all");

  useEffect(() => {
    Promise.all([
      fetch('/api/news').then((r) => r.json()),
      fetch('/api/settings').then((r) => r.json()),
      fetch('/api/sports').then((r) => r.json()),
    ]).then(([newsResult, settingsResult, sportsResult]) => {
      if (newsResult.success) setArticles(newsResult.data || []);
      if (settingsResult.success && settingsResult.data) {
        setSettings({ ...DEFAULT_SETTINGS, ...settingsResult.data });
      }
      if (sportsResult.success) setSportsData(sportsResult.data || {});
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Re-process Twitter widgets when settings arrive
  useEffect(() => {
    if (settings.twitterUrl && typeof (window as { twttr?: { widgets: { load: () => void } } }).twttr !== 'undefined') {
      (window as { twttr?: { widgets: { load: () => void } } }).twttr?.widgets.load();
    }
  }, [settings.twitterUrl]);

  // Sports that appear in at least one article, for the filter sidebar
  const availableSports = Array.from(
    new Set(articles.map((a) => a.sport).filter(Boolean))
  ).sort();

  const filteredArticles =
    sportFilter === "all" ? articles : articles.filter((a) => a.sport === sportFilter);

  const featured = filteredArticles[0];
  const rest = filteredArticles.slice(1);

  const hasSocial = !!(settings.twitterUrl || settings.instagramUrl);

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader settings={settings} sportsData={sportsData} />

      {/* Page Header */}
      <section className="text-white py-10" style={{ backgroundColor: settings.primaryColor }}>
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">Latest News</h1>
          <p className="mt-1 text-lg" style={{ color: settings.secondaryColor }}>
            {settings.schoolName} Athletics
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="flex gap-6 items-start flex-col lg:flex-row">

          {/* ── Sport filter sidebar ───────────────────────────────────── */}
          {availableSports.length > 0 && (
            <aside className="w-full lg:w-44 shrink-0">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-4 py-3 font-bold text-white text-sm uppercase tracking-wide"
                  style={{ backgroundColor: settings.primaryColor }}>
                  Filter by Sport
                </div>
                <ul className="divide-y divide-gray-100">
                  <li>
                    <button
                      onClick={() => setSportFilter("all")}
                      className="w-full text-left px-4 py-2.5 text-sm font-semibold transition hover:bg-gray-50"
                      style={sportFilter === "all" ? { color: settings.primaryColor, backgroundColor: `${settings.primaryColor}10` } : { color: "#374151" }}
                    >
                      All Sports
                      <span className="ml-1 text-xs font-normal text-gray-400">({articles.length})</span>
                    </button>
                  </li>
                  {availableSports.map((slug) => {
                    const count = articles.filter((a) => a.sport === slug).length;
                    return (
                      <li key={slug}>
                        <button
                          onClick={() => setSportFilter(slug)}
                          className="w-full text-left px-4 py-2.5 text-sm transition hover:bg-gray-50"
                          style={sportFilter === slug ? { color: settings.primaryColor, backgroundColor: `${settings.primaryColor}10`, fontWeight: 600 } : { color: "#374151" }}
                        >
                          {sportLabel(slug)}
                          <span className="ml-1 text-xs font-normal text-gray-400">({count})</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>
          )}

          {/* ── Articles + social wrapper ──────────────────────────────── */}
          <div className={`flex-1 min-w-0 flex gap-8 items-start ${hasSocial ? 'lg:flex-row flex-col' : ''}`}>

          {/* ── Articles ──────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="py-20 text-center text-gray-500">Loading news...</div>
            ) : filteredArticles.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-lg shadow text-gray-500">
                {sportFilter === "all"
                  ? "No articles published yet. Check back soon!"
                  : `No articles for ${sportLabel(sportFilter)} yet.`}
              </div>
            ) : (
              <>
                {/* ── Featured article ── */}
                {featured && (
                  <Link
                    href={`/news/${featured.id}`}
                    className="block bg-white rounded-lg shadow-lg overflow-hidden mb-8 border-t-4 hover:shadow-xl transition group"
                    style={{ borderColor: settings.primaryColor }}
                  >
                    {featured.image && (
                      <img
                        src={featured.image}
                        alt={featured.title}
                        className="w-full object-cover group-hover:opacity-95 transition"
                        style={{ maxHeight: '440px' }}
                      />
                    )}
                    <div className="p-6 md:p-8">
                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-2 text-sm mb-3">
                        {featured.sport && (
                          <span
                            className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide text-white"
                            style={{ backgroundColor: settings.primaryColor }}
                          >
                            {sportLabel(featured.sport)}
                          </span>
                        )}
                        <span className="text-gray-400">{formatDate(featured.date)}</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-500">By {featured.author}</span>
                      </div>

                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight group-hover:underline">
                        {featured.title}
                      </h2>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        {featured.body.length > 400
                          ? featured.body.substring(0, 400) + '…'
                          : featured.body}
                      </p>
                      <p className="mt-4 font-semibold text-sm" style={{ color: settings.primaryColor }}>
                        Read full article →
                      </p>
                    </div>
                  </Link>
                )}

                {/* ── More Stories grid ── */}
                {rest.length > 0 && (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex-grow h-0.5" style={{ backgroundColor: settings.primaryColor }} />
                      <h3 className="text-base font-bold uppercase tracking-widest" style={{ color: settings.primaryColor }}>
                        More Stories
                      </h3>
                      <div className="flex-grow h-0.5" style={{ backgroundColor: settings.primaryColor }} />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      {rest.map((article) => (
                        <Link
                          key={article.id}
                          href={`/news/${article.id}`}
                          className="bg-white rounded-lg shadow overflow-hidden flex flex-col hover:shadow-md transition group"
                        >
                          {article.image && (
                            <img
                              src={article.image}
                              alt={article.title}
                              className="w-full object-cover group-hover:opacity-95 transition"
                              style={{ height: '190px' }}
                            />
                          )}
                          <div className="p-4 flex-1 flex flex-col">
                            {/* Meta */}
                            <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                              {article.sport && (
                                <span
                                  className="px-2 py-0.5 rounded-full font-bold uppercase tracking-wide"
                                  style={{ backgroundColor: settings.secondaryColor, color: settings.primaryColor }}
                                >
                                  {sportLabel(article.sport)}
                                </span>
                              )}
                              <span className="text-gray-400">{formatDate(article.date)}</span>
                            </div>

                            <h4 className="text-lg font-bold text-gray-900 mb-2 leading-snug flex-1 group-hover:underline">
                              {article.title}
                            </h4>
                            <p className="text-gray-600 text-sm line-clamp-3">
                              {article.body.length > 180
                                ? article.body.substring(0, 180) + '…'
                                : article.body}
                            </p>
                            <p className="text-xs mt-3 font-semibold" style={{ color: settings.primaryColor }}>
                              Read more →
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </main>

          {/* ── Social Sidebar ────────────────────────────────────────── */}
          {hasSocial && (
            <aside className="w-full lg:w-72 shrink-0 space-y-5">

              {/* Twitter / X Timeline */}
              {settings.twitterUrl && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div
                    className="px-4 py-3 flex items-center gap-2 text-white font-bold"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    <XIcon className="w-4 h-4" />
                    <span>Follow on X</span>
                  </div>
                  <div className="p-2">
                    <a
                      className="twitter-timeline"
                      data-height="520"
                      data-theme="light"
                      data-chrome="noheader nofooter noborders"
                      href={toTwitterTimelineUrl(settings.twitterUrl)}
                    >
                      Loading timeline…
                    </a>
                  </div>
                </div>
              )}

              {/* Instagram — link card (public embed not available without API) */}
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-lg shadow overflow-hidden flex items-center gap-4 p-5 hover:shadow-md transition group"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}
                  >
                    <InstagramIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 group-hover:underline">
                      {settings.schoolName}
                    </p>
                    <p className="text-sm text-gray-500">Follow us on Instagram →</p>
                  </div>
                </a>
              )}
            </aside>
          )}
          </div>{/* end articles + social wrapper */}
        </div>
      </div>

      {/* Twitter widget script — loaded only when a Twitter URL is configured */}
      {settings.twitterUrl && (
        <Script
          src="https://platform.twitter.com/widgets.js"
          strategy="afterInteractive"
          onLoad={() => {
            const w = window as { twttr?: { widgets: { load: () => void } } };
            w.twttr?.widgets.load();
          }}
        />
      )}

      {/* Footer */}
      <footer className="text-white py-8 mt-8" style={{ backgroundColor: settings.primaryColor }}>
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} {settings.schoolName} Athletics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
