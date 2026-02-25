"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";
import { SiteHeader, XIcon, InstagramIcon, type Settings } from "../../components/SiteHeader";

const DEFAULT_SETTINGS: Settings = {
  schoolName: "School Athletics",
  primaryColor: "#581C87",
  secondaryColor: "#FBBF24",
  logo: "",
  twitterUrl: "",
  instagramUrl: "",
};

// Static sport metadata (season + placeholder hero image)
const sportsInfo: Record<string, { name: string; season: string; image: string }> = {
  football:           { name: "Football",        season: "Fall",   image: "/Football.jpg" },
  "boys-basketball":  { name: "Boys Basketball",  season: "Winter", image: "/Football.jpg" },
  "girls-basketball": { name: "Girls Basketball", season: "Winter", image: "/Football.jpg" },
  "boys-soccer":      { name: "Boys Soccer",      season: "Fall",   image: "/Football.jpg" },
  "girls-soccer":     { name: "Girls Soccer",     season: "Fall",   image: "/Football.jpg" },
  "field-hockey":     { name: "Field Hockey",     season: "Fall",   image: "/Football.jpg" },
  baseball:           { name: "Baseball",          season: "Spring", image: "/Football.jpg" },
  softball:           { name: "Softball",          season: "Spring", image: "/Football.jpg" },
  volleyball:         { name: "Volleyball",        season: "Fall",   image: "/Football.jpg" },
  "track-field":      { name: "Track & Field",    season: "Spring", image: "/Football.jpg" },
  "boys-wrestling":   { name: "Boys Wrestling",   season: "Winter", image: "/Football.jpg" },
  "girls-wrestling":  { name: "Girls Wrestling",  season: "Winter", image: "/Football.jpg" },
  lacrosse:           { name: "Lacrosse",          season: "Spring", image: "/Football.jpg" },
  "cross-country":    { name: "Cross Country",    season: "Fall",   image: "/Football.jpg" },
  swimming:           { name: "Swimming",          season: "Winter", image: "/Football.jpg" },
};

// ─── Season helpers ────────────────────────────────────────────────────────────

/** Parse "Jan 5, 2026" or "1/5/2026" → { month, day, year } */
function parseDateStr(dateStr: string): { month: number; day: number; year: number } | null {
  const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  // "Aug 22, 2025" format
  const mLong = dateStr.match(/^(\w+)\s+(\d+),\s+(\d{4})$/);
  if (mLong) {
    const month = MONTHS.indexOf(mLong[1].toLowerCase()) + 1;
    if (month === 0) return null;
    return { month, day: parseInt(mLong[2]), year: parseInt(mLong[3]) };
  }
  // "8/22/2026" or "08/22/2026" format
  const mShort = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mShort) {
    return { month: parseInt(mShort[1]), day: parseInt(mShort[2]), year: parseInt(mShort[3]) };
  }
  return null;
}

/**
 * Determine season key from a date.
 * Fall:   Aug 1 – Nov 19     → "Fall 2025"
 * Winter: Nov 20 – Feb 28/29 → "Winter 2025-26"
 * Spring: Mar 1 – Jul 31     → "Spring 2026"
 */
function getSeasonKey(month: number, day: number, year: number): string {
  if ((month >= 8 && month <= 10) || (month === 11 && day <= 19)) {
    return `Fall ${year}`;
  }
  if ((month === 11 && day >= 20) || month === 12) {
    return `Winter ${year}-${String(year + 1).slice(2)}`;
  }
  if (month === 1 || month === 2) {
    return `Winter ${year - 1}-${String(year).slice(2)}`;
  }
  // March – July
  return `Spring ${year}`;
}

function currentSeasonKey(): string {
  const now = new Date();
  return getSeasonKey(now.getMonth() + 1, now.getDate(), now.getFullYear());
}

/** Numeric sort value so seasons sort chronologically: Spring < Fall < Winter */
function seasonSortValue(key: string): number {
  const m = key.match(/^(Fall|Winter|Spring)\s+(\d{4})/);
  if (!m) return 0;
  return parseInt(m[2]) * 10 + (m[1] === 'Spring' ? 0 : m[1] === 'Fall' ? 1 : 2);
}

/**
 * Generate a window of season keys covering ~2 past seasons through ~3 future seasons,
 * so the dropdown always has past, present, and future options even when the schedule
 * has no data for those seasons.
 */
function generateSeasonWindow(): string[] {
  const now = new Date();
  const seasons: string[] = [];
  const seen = new Set<string>();

  // Walk from ~8 months ago to ~12 months from now (steps of 1 month catch all transitions)
  const d = new Date(now);
  d.setMonth(d.getMonth() - 8);
  const end = new Date(now);
  end.setMonth(end.getMonth() + 12);

  while (d <= end) {
    const key = getSeasonKey(d.getMonth() + 1, d.getDate(), d.getFullYear());
    if (!seen.has(key)) {
      seen.add(key);
      seasons.push(key);
    }
    d.setMonth(d.getMonth() + 1);
  }

  seasons.sort((a, b) => seasonSortValue(a) - seasonSortValue(b));
  return seasons;
}

/** Derive level from the eventType string set by the iCal importer */
function getGameLevel(eventType: string): 'Varsity' | 'JV' | 'Freshman' {
  const lower = (eventType || '').toLowerCase();
  if (lower.includes('jv') || lower.includes('junior varsity')) return 'JV';
  if (lower.includes('freshman') || lower.includes('frosh')) return 'Freshman';
  return 'Varsity';
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SportPage() {
  const pathname = usePathname();
  const sportSlug = pathname?.split("/").pop() || "";
  const sport = sportsInfo[sportSlug];

  const [schedule, setSchedule] = useState<any[]>([]);
  const [roster, setRoster] = useState<any[]>([]);
  const [sportImage, setSportImage] = useState("");
  const [coachName, setCoachName] = useState("");
  const [coachEmail, setCoachEmail] = useState("");
  const [description, setDescription] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [sportImagePosition, setSportImagePosition] = useState("center 20%");
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [sportsData, setSportsData] = useState<Record<string, any>>({});

  // Filter state — season starts at the current calendar season so the dropdown
  // always has a valid selection immediately; auto-selection refines it once data loads.
  const [levelFilter, setLevelFilter] = useState<string>('Varsity');
  const [seasonFilter, setSeasonFilter] = useState<string>(currentSeasonKey);
  // Prevents auto-selection from overriding a deliberate user pick
  const autoSelectionDone = useRef(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sportsRes, settingsRes] = await Promise.all([
          fetch('/api/sports'),
          fetch('/api/settings'),
        ]);
        const [sportsResult, settingsResult] = await Promise.all([
          sportsRes.json(),
          settingsRes.json(),
        ]);

        if (settingsResult.success && settingsResult.data) {
          setSettings({ ...DEFAULT_SETTINGS, ...settingsResult.data });
        }

        if (sportsResult.success) {
          setSportsData(sportsResult.data || {});
          const data = sportsResult.data[sportSlug];
          if (data) {
            setSchedule(data.schedule || []);
            setRoster(data.roster || []);
            setSportImage(data.image || "");
            setCoachName(data.coach || "");
            setCoachEmail(data.coachEmail || "");
            setDescription(data.description || "");
            setTwitterUrl(data.twitterUrl || "");
            setInstagramUrl(data.instagramUrl || "");
            setSportImagePosition(data.imagePosition || "center 20%");
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [sportSlug]);

  // Auto-select the most relevant season + Varsity once schedule data arrives.
  // Skips if the user already picked a season manually.
  useEffect(() => {
    if (schedule.length === 0 || autoSelectionDone.current) return;
    autoSelectionDone.current = true;

    const keys = Array.from(new Set(
      schedule
        .map((g: any) => {
          const d = parseDateStr(g.date);
          return d ? getSeasonKey(d.month, d.day, d.year) : '';
        })
        .filter(Boolean)
    )) as string[];
    keys.sort((a, b) => seasonSortValue(a) - seasonSortValue(b));

    const curSortVal = seasonSortValue(currentSeasonKey());
    // Prefer the current season or next upcoming one; fall back to last available
    const selected =
      keys.find((k) => seasonSortValue(k) >= curSortVal) ??
      keys[keys.length - 1] ??
      currentSeasonKey();

    setSeasonFilter(selected);
    setLevelFilter('Varsity');
  }, [schedule]);

  // Count of games per season (all levels) so the dropdown can show "(N games)"
  const seasonGameCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const g of schedule) {
      const d = parseDateStr(g.date);
      const key = d ? getSeasonKey(d.month, d.day, d.year) : '';
      if (key) counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, [schedule]);

  // Merge seasons from schedule data with a fixed past/present/future window so the
  // dropdown always offers past, present, and future options regardless of data.
  const availableSeasons = useMemo(() => {
    const fromSchedule = schedule
      .map((g: any) => {
        const d = parseDateStr(g.date);
        return d ? getSeasonKey(d.month, d.day, d.year) : '';
      })
      .filter(Boolean) as string[];

    const allKeys = Array.from(new Set([...fromSchedule, ...generateSeasonWindow()]));
    allKeys.sort((a, b) => seasonSortValue(a) - seasonSortValue(b));
    return allKeys;
  }, [schedule]);

  // Apply both filters
  const filteredSchedule = useMemo(() => {
    return schedule.filter((g: any) => {
      // Season filter — if the date is unparseable, include the game rather than hide it
      if (seasonFilter) {
        const d = parseDateStr(g.date);
        const gameSeason = d ? getSeasonKey(d.month, d.day, d.year) : '';
        if (gameSeason && gameSeason !== seasonFilter) return false;
      }
      // Level filter
      if (levelFilter !== 'Both') {
        const level = getGameLevel(g.eventType);
        if (levelFilter === 'Varsity' && level !== 'Varsity') return false;
        if (levelFilter === 'JV' && level !== 'JV') return false;
      }
      return true;
    });
  }, [schedule, seasonFilter, levelFilter]);

  if (!sport) {
    return (
      <div className="min-h-screen bg-gray-50 themed-page">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Sport Not Found</h1>
          <Link href="/" className="hover:opacity-80" style={{ color: settings.primaryColor }}>
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const heroImage = sportImage || sport.image;
  const displayCoach = coachName || "";
  const displayDescription =
    description ||
    `The ${sport.name} program competes with pride and dedication throughout the ${sport.season} season.`;

  return (
    <div className="min-h-screen bg-gray-50 themed-page">
      <SiteHeader settings={settings} sportsData={sportsData} />

      {/* Sport Hero */}
      <section
        className="relative text-white overflow-hidden"
        style={{ minHeight: "400px", paddingTop: "60px", paddingBottom: "60px" }}
      >
        <img
          src={heroImage}
          alt={`${sport.name} background`}
          style={{
            position: "absolute", top: 0, left: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: sportImagePosition, zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: `${settings.primaryColor}99`, zIndex: 1,
          }}
        />
        <div style={{ position: "relative", zIndex: 2 }} className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-2">{sport.name}</h1>
          <p className="text-xl mb-1">{sport.season} Sport</p>
          {displayCoach && <p className="text-lg mb-1">{displayCoach}</p>}
          {coachEmail && (
            <p className="text-md mb-2">
              <a href={`mailto:${coachEmail}`} className="hover:opacity-80 transition">
                {coachEmail}
              </a>
            </p>
          )}
          {(twitterUrl || instagramUrl) && (
            <div className="flex gap-3 mt-3">
              {twitterUrl && (
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition"
                  title="Follow on X"
                >
                  <XIcon className="w-5 h-5" />
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition"
                  title="Follow on Instagram"
                >
                  <InstagramIcon className="w-5 h-5" />
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">About the Program</h2>
          <p className="text-lg text-gray-700 leading-relaxed">{displayDescription}</p>
        </div>
      </section>

      {/* Schedule Section */}
      <section id="schedule" className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">

          {/* Header + filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <h2 className="text-3xl font-bold text-gray-800 flex-1">Schedule</h2>

            {availableSeasons.length > 0 && (
              <>
                {/* Season filter */}
                <select
                  value={seasonFilter}
                  onChange={(e) => {
                    autoSelectionDone.current = true; // user made an explicit pick — don't override
                    setSeasonFilter(e.target.value);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
                  style={{ outlineColor: settings.primaryColor }}
                >
                  {availableSeasons.map((s) => {
                    const count = seasonGameCounts[s];
                    return (
                      <option key={s} value={s}>
                        {s}{count ? ` (${count})` : ''}
                      </option>
                    );
                  })}
                </select>

                {/* Level filter */}
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
                  style={{ outlineColor: settings.primaryColor }}
                >
                  <option value="Varsity">Varsity</option>
                  <option value="JV">JV</option>
                  <option value="Both">Both</option>
                </select>
              </>
            )}
          </div>

          {loading ? (
            <div className="bg-white p-8 rounded-lg text-center text-gray-600">Loading schedule...</div>
          ) : filteredSchedule.length > 0 ? (
            <div className="space-y-4">
              {filteredSchedule.map((game: any, index: number) => {
                const isHome = game.homeAway === "Home";
                return (
                  <div
                    key={index}
                    className="rounded-lg p-6 shadow-lg transition transform hover:-translate-y-1 border-4"
                    style={{
                      backgroundColor: isHome ? settings.primaryColor : "white",
                      color: isHome ? "white" : settings.primaryColor,
                      borderColor: settings.secondaryColor,
                    }}
                  >
                    <div className="flex justify-between items-center flex-wrap gap-4">
                      <div className="flex-1">
                        <div className="text-sm font-semibold mb-1 opacity-90">{game.date}</div>
                        <div className="text-2xl font-bold mb-2">
                          {isHome ? "vs. " : "@ "}{game.opponent}
                        </div>
                        <div className="flex gap-3 items-center flex-wrap">
                          <span
                            className="px-4 py-1 rounded-full text-sm font-bold"
                            style={{
                              backgroundColor: isHome ? settings.secondaryColor : settings.primaryColor,
                              color: isHome ? settings.primaryColor : "white",
                            }}
                          >
                            {game.homeAway}
                          </span>
                          {game.eventType && (
                            <span
                              className="px-4 py-1 rounded-full text-sm font-semibold border-2"
                              style={{
                                borderColor: isHome ? settings.secondaryColor : settings.primaryColor,
                                color: isHome ? settings.secondaryColor : settings.primaryColor,
                              }}
                            >
                              {game.eventType}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">{game.time}</div>
                      </div>
                    </div>

                    {/* Location + action links */}
                    <div
                      className="mt-4 pt-4 flex flex-wrap items-center gap-3"
                      style={{ borderTop: `1px solid ${isHome ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}` }}
                    >
                      {game.location && (
                        <span className="flex items-center gap-1.5 text-sm opacity-80">
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
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 rounded text-xs font-bold border-2 transition hover:opacity-80"
                          style={{
                            borderColor: isHome ? settings.secondaryColor : settings.primaryColor,
                            color: isHome ? settings.secondaryColor : settings.primaryColor,
                          }}
                        >
                          Tickets
                        </a>
                        <a
                          href="https://fan.hudl.com/usa/pa/lancaster/organization/8610/lancaster-catholic-high-school"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 rounded text-xs font-bold transition hover:opacity-80"
                          style={{
                            backgroundColor: isHome ? settings.secondaryColor : settings.primaryColor,
                            color: isHome ? settings.primaryColor : 'white',
                          }}
                        >
                          Stream Live
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : schedule.length > 0 ? (
            <p className="text-gray-600 bg-white p-8 rounded-lg">
              No games found for the selected filters.
            </p>
          ) : (
            <p className="text-gray-600 bg-white p-8 rounded-lg">Schedule to be announced.</p>
          )}
        </div>
      </section>

      {/* Roster Section */}
      <section id="roster" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Roster</h2>
          {loading ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-600">Loading roster...</div>
          ) : roster.length > 0 ? (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="text-white" style={{ backgroundColor: settings.primaryColor }}>
                  <tr>
                    <th className="px-6 py-4 text-left">#</th>
                    <th className="px-6 py-4 text-left">Name</th>
                    <th className="px-6 py-4 text-left">Position</th>
                    <th className="px-6 py-4 text-left">Year</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((player: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold" style={{ color: settings.primaryColor }}>
                        {player.number}
                      </td>
                      <td className="px-6 py-4 font-semibold">{player.name}</td>
                      <td className="px-6 py-4">{player.position}</td>
                      <td className="px-6 py-4">{player.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 bg-gray-50 p-8 rounded-lg">Roster to be announced.</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white py-8" style={{ backgroundColor: settings.primaryColor }}>
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} {settings.schoolName} Athletics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
