"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Script from "next/script";
import { SiteHeader, XIcon, InstagramIcon, allSports, type Settings } from "./components/SiteHeader";

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
      year: "numeric", month: "long", day: "numeric",
    });
  } catch { return dateStr; }
}

function sportLabel(slug: string): string {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function toTwitterTimelineUrl(url: string): string {
  return url.replace("https://x.com/", "https://twitter.com/").replace("http://x.com/", "https://twitter.com/");
}

/** Parse "Aug 22, 2025" or "8/22/2026" into a Date, or null if unrecognised. */
function parseGameDate(dateStr: string): Date | null {
  const mLong = dateStr.match(/^(\w+)\s+(\d+),\s+(\d{4})$/);
  if (mLong) {
    const d = new Date(`${mLong[1]} ${mLong[2]}, ${mLong[3]}`);
    return isNaN(d.getTime()) ? null : d;
  }
  const mShort = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mShort) {
    const d = new Date(parseInt(mShort[3]), parseInt(mShort[1]) - 1, parseInt(mShort[2]));
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

const DEFAULT_SETTINGS: Settings = {
  schoolName: "School Athletics",
  mascot: "Team",
  primaryColor: "#581C87",
  secondaryColor: "#FBBF24",
  logo: "",
  twitterUrl: "",
  instagramUrl: "",
};

// ── Stat card helpers ──────────────────────────────────────────────────────

function StatIcon({ icon, className }: { icon?: string; className?: string }) {
  if (icon === 'star') return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
  if (icon === 'medal') return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm0 6a2 2 0 110-4 2 2 0 010 4zM9.5 1H5l2.5 5h4L9.5 1zm5 0l-2 5h4l2.5-5H14.5z" />
    </svg>
  );
  if (icon === 'user') return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  );
  // Default: trophy
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
    </svg>
  );
}

interface StatCardProps {
  title: string; value: string; icon?: string;
  visible: boolean; delay: number;
  primaryColor: string; secondaryColor: string;
}

function StatCardComp({ title, value, icon, visible, delay, primaryColor }: StatCardProps) {
  const numMatch = value.match(/^(\d+)/);
  const numTarget = numMatch ? parseInt(numMatch[1]) : null;
  const suffix = numTarget !== null ? value.slice(String(numTarget).length) : '';
  const [displayNum, setDisplayNum] = useState(0);
  const [numPop, setNumPop] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!visible || started.current || numTarget === null) return;
    started.current = true;
    const duration = 2000;
    let frameId: number;
    const timer = setTimeout(() => {
      const startTs = performance.now();
      const animate = (now: number) => {
        const progress = Math.min((now - startTs) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayNum(Math.round(eased * numTarget));
        if (progress < 1) {
          frameId = requestAnimationFrame(animate);
        } else {
          setNumPop(true);
          setTimeout(() => setNumPop(false), 350);
        }
      };
      frameId = requestAnimationFrame(animate);
    }, delay);
    return () => { clearTimeout(timer); if (frameId) cancelAnimationFrame(frameId); };
  }, [visible, numTarget, delay]);

  const displayValue = numTarget !== null ? String(displayNum) + suffix : value;

  return (
    <div
      className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 border-t-4"
      style={{
        borderColor: primaryColor,
        animation: visible ? `statCardIn 0.55s ease-out ${delay}ms both` : 'none',
        opacity: visible ? undefined : 0,
      }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}
      >
        <StatIcon icon={icon} className="w-8 h-8" />
      </div>
      <div
        className="text-5xl font-black mb-3 tabular-nums transition-transform duration-200"
        style={{ color: primaryColor, transform: numPop ? 'scale(1.15)' : 'scale(1)' }}
      >
        {displayValue}
      </div>
      <div className="text-gray-600 font-semibold text-base leading-tight">{title}</div>
    </div>
  );
}

export default function Home() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [sportsData, setSportsData] = useState<Record<string, any>>({});
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<Array<{id: string; title: string; value: string; icon?: string}>>([]);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [settingsRes, sportsRes, newsRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/sports'),
          fetch('/api/news'),
        ]);
        const [settingsResult, sportsResult, newsResult] = await Promise.all([
          settingsRes.json(),
          sportsRes.json(),
          newsRes.json(),
        ]);
        if (settingsResult.success && settingsResult.data) {
          setSettings({ ...DEFAULT_SETTINGS, ...settingsResult.data });
          setStats(settingsResult.data.stats || []);
        }
        if (sportsResult.success) {
          setSportsData(sportsResult.data || {});
        }
        if (newsResult.success) {
          setArticles(newsResult.data || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  // Re-process Twitter widgets when settings arrive
  useEffect(() => {
    if (settings.twitterUrl && typeof (window as { twttr?: { widgets: { load: () => void } } }).twttr !== "undefined") {
      (window as { twttr?: { widgets: { load: () => void } } }).twttr?.widgets.load();
    }
  }, [settings.twitterUrl]);

  // Trigger stat card animations when the section scrolls into view
  useEffect(() => {
    const el = statsRef.current;
    if (!el || stats.length === 0) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [stats.length]);

  // Collect all games across every sport that fall within the next 14 days.
  const upcomingGames = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() + 14);

    const games: Array<{
      sport: string; slug: string; date: Date;
      dateStr: string; time: string; opponent: string; homeAway: string; eventType: string; location: string;
    }> = [];

    for (const [slug, data] of Object.entries(sportsData)) {
      if (!Array.isArray(data?.schedule)) continue;
      const sportInfo = allSports.find((s) => s.slug === slug);
      if (!sportInfo) continue;
      for (const game of data.schedule) {
        const gameDate = parseGameDate(game.date);
        if (!gameDate) continue;
        if (gameDate >= today && gameDate <= cutoff) {
          games.push({
            sport: sportInfo.name,
            slug,
            date: gameDate,
            dateStr: game.date,
            time: game.time,
            opponent: game.opponent,
            homeAway: game.homeAway,
            eventType: game.eventType || '',
            location: game.location || '',
          });
        }
      }
    }

    games.sort((a, b) => a.date.getTime() - b.date.getTime());
    return games;
  }, [sportsData]);

  // Collect all uploaded sport hero images for the home hero carousel
  const heroImages = useMemo(() => {
    const seen = new Set<string>();
    const imgs: string[] = [];
    for (const data of Object.values(sportsData)) {
      const img = (data as any).image;
      if (img && !seen.has(img)) { seen.add(img); imgs.push(img); }
    }
    if (imgs.length === 0) imgs.push('/Football.jpg');
    return imgs;
  }, [sportsData]);

  const [heroIndex, setHeroIndex] = useState(0);
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const id = setInterval(() => setHeroIndex(i => (i + 1) % heroImages.length), 6000);
    return () => clearInterval(id);
  }, [heroImages.length]);

  const featured = articles[0];
  const restArticles = articles.slice(1);
  const hasSocial = !!(settings.twitterUrl || settings.instagramUrl);

  return (
    <div className="min-h-screen bg-gray-50 themed-page">
      {/* Upcoming-games scrolling marquee ticker */}
      {upcomingGames.length > 0 && (
        <div style={{ backgroundColor: settings.secondaryColor, color: settings.primaryColor, overflow: 'hidden' }}>
          <div className="flex items-center" style={{ height: '36px' }}>

            {/* Fixed "Upcoming" label */}
            <div
              className="shrink-0 px-4 h-full flex items-center text-xs font-bold uppercase tracking-widest"
              style={{ borderRight: `2px solid ${settings.primaryColor}35` }}
            >
              Upcoming
            </div>

            {/* Scrolling strip — all games rendered twice for seamless loop */}
            <div className="overflow-hidden flex-1 h-full relative">
              <div
                className="flex items-center h-full absolute whitespace-nowrap"
                style={{ animation: `marquee ${Math.max(25, upcomingGames.length * 8)}s linear infinite` }}
              >
                {[...upcomingGames, ...upcomingGames].map((game, i) => {
                  const dateLabel = game.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  return (
                    <Link
                      key={i}
                      href={`/sports/${game.slug}#schedule`}
                      className="inline-flex items-center gap-1.5 px-5 text-sm font-semibold hover:opacity-70 transition shrink-0"
                    >
                      <span className="font-bold">{game.sport}</span>
                      {game.eventType && (
                        <span className="font-normal opacity-60"> ({game.eventType})</span>
                      )}
                      <span className="opacity-30 mx-1">·</span>
                      <span>{game.homeAway === 'Home' ? 'vs.' : '@'} {game.opponent}</span>
                      <span className="opacity-30 mx-1">·</span>
                      <span className="font-normal">{dateLabel}{game.time ? ` · ${game.time}` : ''}</span>
                      <span className="mx-6 opacity-20">|</span>
                    </Link>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      <SiteHeader settings={settings} sportsData={sportsData} />

      {/* Hero Section */}
      <section
        className="relative text-white overflow-hidden"
        style={{ minHeight: "500px", paddingTop: "80px", paddingBottom: "80px" }}
      >
        {heroImages.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            style={{
              position: "absolute", top: 0, left: 0,
              width: "100%", height: "100%", objectFit: "cover",
              objectPosition: (sportsData as any)[
                Object.keys(sportsData).find(k => (sportsData as any)[k]?.image === src) || ''
              ]?.imagePosition || "center 30%",
              zIndex: 0,
              opacity: i === heroIndex ? 1 : 0,
              transition: "opacity 1.5s ease",
            }}
          />
        ))}
        <div
          style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: `${settings.primaryColor}B3`, zIndex: 1,
          }}
        />
        <div style={{ position: "relative", zIndex: 2 }} className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Welcome to {settings.schoolName} Athletics
          </h1>
          <p className="text-xl mb-8">Pride. Tradition. Excellence.</p>
          <div className="flex justify-center gap-4">
            <Link
              href="/schedule"
              className="px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition"
              style={{ backgroundColor: "white", color: settings.primaryColor }}
            >
              View Schedule
            </Link>
            <Link
              href="/news"
              className="px-8 py-3 rounded-lg font-semibold transition border-2"
              style={{
                backgroundColor: settings.primaryColor,
                borderColor: settings.secondaryColor,
                color: "white",
              }}
            >
              Latest News
            </Link>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-grow h-0.5" style={{ backgroundColor: settings.primaryColor }} />
            <h2 className="text-3xl font-bold text-gray-800">Latest News</h2>
            <div className="flex-grow h-0.5" style={{ backgroundColor: settings.primaryColor }} />
          </div>

          <div className={`flex gap-8 items-start ${hasSocial ? "lg:flex-row flex-col" : ""}`}>

            {/* Articles */}
            <main className="flex-1 min-w-0">
              {articles.length === 0 ? (
                <div className="py-12 text-center bg-white rounded-lg shadow text-gray-500">
                  No articles published yet. Check back soon!
                </div>
              ) : (
                <>
                  {featured && (
                    <Link
                      href={`/news/${featured.id}`}
                      className="block bg-white rounded-lg shadow-lg overflow-hidden mb-6 border-t-4 hover:shadow-xl transition group"
                      style={{ borderColor: settings.primaryColor }}
                    >
                      {featured.image && (
                        <img src={featured.image} alt={featured.title}
                          className="w-full object-cover group-hover:opacity-95 transition"
                          style={{ maxHeight: "360px" }} />
                      )}
                      <div className="p-6">
                        <div className="flex flex-wrap items-center gap-2 text-sm mb-2">
                          {featured.sport && (
                            <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide text-white"
                              style={{ backgroundColor: settings.primaryColor }}>
                              {sportLabel(featured.sport)}
                            </span>
                          )}
                          <span className="text-gray-400">{formatDate(featured.date)}</span>
                          <span className="text-gray-400">·</span>
                          <span className="text-gray-500">By {featured.author}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight group-hover:underline">
                          {featured.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {featured.body.length > 300 ? featured.body.substring(0, 300) + "…" : featured.body}
                        </p>
                        <p className="mt-3 font-semibold text-sm" style={{ color: settings.primaryColor }}>
                          Read full article →
                        </p>
                      </div>
                    </Link>
                  )}

                  {restArticles.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-5">
                      {restArticles.map((article) => (
                        <Link key={article.id} href={`/news/${article.id}`}
                          className="bg-white rounded-lg shadow overflow-hidden flex flex-col hover:shadow-md transition group">
                          {article.image && (
                            <img src={article.image} alt={article.title}
                              className="w-full object-cover group-hover:opacity-95 transition"
                              style={{ height: "160px" }} />
                          )}
                          <div className="p-4 flex-1 flex flex-col">
                            <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                              {article.sport && (
                                <span className="px-2 py-0.5 rounded-full font-bold uppercase tracking-wide"
                                  style={{ backgroundColor: settings.secondaryColor, color: settings.primaryColor }}>
                                  {sportLabel(article.sport)}
                                </span>
                              )}
                              <span className="text-gray-400">{formatDate(article.date)}</span>
                            </div>
                            <h4 className="text-base font-bold text-gray-900 mb-1 leading-snug flex-1 group-hover:underline">
                              {article.title}
                            </h4>
                            <p className="text-xs mt-2 font-semibold" style={{ color: settings.primaryColor }}>
                              Read more →
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="text-center mt-8">
                    <Link href="/news" className="font-semibold text-lg hover:opacity-80"
                      style={{ color: settings.primaryColor }}>
                      View All News →
                    </Link>
                  </div>
                </>
              )}
            </main>

            {/* Social Sidebar */}
            {hasSocial && (
              <aside className="w-full lg:w-72 shrink-0 space-y-5">
                {settings.twitterUrl && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-4 py-3 flex items-center gap-2 text-white font-bold"
                      style={{ backgroundColor: settings.primaryColor }}>
                      <XIcon className="w-4 h-4" />
                      <span>Follow on X</span>
                    </div>
                    <div className="p-2">
                      <a className="twitter-timeline" data-height="420" data-theme="light"
                        data-chrome="noheader nofooter noborders"
                        href={toTwitterTimelineUrl(settings.twitterUrl)}>
                        Loading timeline…
                      </a>
                    </div>
                  </div>
                )}
                {settings.instagramUrl && (
                  <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer"
                    className="bg-white rounded-lg shadow overflow-hidden flex items-center gap-4 p-5 hover:shadow-md transition group">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)" }}>
                      <InstagramIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 group-hover:underline">{settings.schoolName}</p>
                      <p className="text-sm text-gray-500">Follow us on Instagram →</p>
                    </div>
                  </a>
                )}
              </aside>
            )}
          </div>
        </div>
      </section>

      {settings.twitterUrl && (
        <Script src="https://platform.twitter.com/widgets.js" strategy="afterInteractive"
          onLoad={() => {
            const w = window as { twttr?: { widgets: { load: () => void } } };
            w.twttr?.widgets.load();
          }} />
      )}

      {/* Achievement Stats Section */}
      {stats.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-10">
              <div className="flex-grow h-0.5" style={{ backgroundColor: settings.primaryColor }} />
              <h2 className="text-3xl font-bold text-gray-800">Our Achievements</h2>
              <div className="flex-grow h-0.5" style={{ backgroundColor: settings.primaryColor }} />
            </div>
            <div ref={statsRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {stats.map((stat, i) => (
                <StatCardComp
                  key={stat.id}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  visible={statsVisible}
                  delay={i * 160}
                  primaryColor={settings.primaryColor}
                  secondaryColor={settings.secondaryColor}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Games */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Upcoming Games</h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {upcomingGames.length === 0 ? (
              <p className="text-center text-gray-500">No games scheduled in the next two weeks.</p>
            ) : upcomingGames.map((game, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-6 shadow hover:shadow-md transition border-l-4"
                style={{ borderColor: settings.primaryColor }}
              >
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <Link
                      href={`/sports/${game.slug}#schedule`}
                      className="hover:opacity-80 transition"
                    >
                      <h3 className="text-xl font-bold text-gray-800 hover:underline">{game.sport}</h3>
                    </Link>
                    <p className="text-gray-600">
                      {game.homeAway === 'Home' ? 'vs.' : '@'} {game.opponent}
                    </p>
                    {game.eventType && (
                      <p className="text-gray-500 text-sm">{game.eventType}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-gray-800 font-semibold">
                      {game.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-gray-600">{game.time}</p>
                  </div>
                  <div
                    className="px-4 py-2 rounded-full font-semibold"
                    style={{ backgroundColor: settings.secondaryColor, color: settings.primaryColor }}
                  >
                    {game.homeAway}
                  </div>
                </div>

                {/* Location + action links */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap items-center gap-3">
                  {game.location && (
                    <span className="flex items-center gap-1.5 text-sm text-gray-500">
                      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      {game.location}
                    </span>
                  )}
                  <div className="flex gap-2 ml-auto">
                    <a
                      href="https://www.piaa.org/sports/tickets.aspx"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded text-xs font-bold border-2 transition hover:opacity-80"
                      style={{ borderColor: settings.primaryColor, color: settings.primaryColor }}
                    >
                      Tickets
                    </a>
                    <a
                      href="https://fan.hudl.com/usa/pa/lancaster/organization/8610/lancaster-catholic-high-school"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded text-xs font-bold transition hover:opacity-80"
                      style={{ backgroundColor: settings.primaryColor, color: 'white' }}
                    >
                      Stream Live
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/schedule"
              className="font-semibold text-lg hover:opacity-80"
              style={{ color: settings.primaryColor }}
            >
              View Full Schedule →
            </Link>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="text-white py-8" style={{ backgroundColor: settings.primaryColor }}>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">{settings.schoolName} Athletics</h3>
              <p className="text-gray-300">Building character through competition</p>
              {(settings.twitterUrl || settings.instagramUrl) && (
                <div className="flex gap-3 mt-4">
                  {settings.twitterUrl && (
                    <a
                      href={settings.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white transition"
                      title="Follow us on X"
                    >
                      <XIcon className="w-6 h-6" />
                    </a>
                  )}
                  {settings.instagramUrl && (
                    <a
                      href={settings.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white transition"
                      title="Follow us on Instagram"
                    >
                      <InstagramIcon className="w-6 h-6" />
                    </a>
                  )}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/news" className="hover:text-white">Latest News</Link></li>
                <li><Link href="/schedule" className="hover:text-white">Game Schedule</Link></li>
                <li><Link href="/news" className="hover:text-white">News &amp; Updates</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <p className="text-gray-300">650 Juliette Ave</p>
              <p className="text-gray-300">Lancaster, PA 17601</p>
              <p className="text-gray-300">Phone: (717) 509-0316</p>
            </div>
          </div>
          <div
            className="border-t mt-8 pt-8 text-center text-gray-300"
            style={{ borderColor: `${settings.secondaryColor}40` }}
          >
            <p>&copy; {new Date().getFullYear()} {settings.schoolName} Athletics. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
