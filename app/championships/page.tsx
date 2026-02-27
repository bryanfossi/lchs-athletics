"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { SiteHeader, type Settings } from "../components/SiteHeader";

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

interface Achievement {
  id: string;
  title: string;
  years: string;
}

interface SportChampionships {
  slug: string;
  label: string;
  achievements: Achievement[];
}

interface IndividualAccomplishments {
  league: string[];
  district: string[];
  state: string[];
}

interface ChampionshipsData {
  sports: SportChampionships[];
  individual: IndividualAccomplishments;
}

const DEFAULT_SETTINGS: Settings = {
  schoolName: "School Athletics",
  mascot: "Team",
  primaryColor: "#581C87",
  secondaryColor: "#FBBF24",
  logo: "",
};

export default function ChampionshipsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [data, setData] = useState<ChampionshipsData>({ sports: [], individual: { league: [], district: [], state: [] } });
  const [stats, setStats] = useState<Array<{id: string; title: string; value: string; icon?: string}>>([]);
  const [heroImages, setHeroImages] = useState<Array<{ path: string; position: string }>>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/championships").then((r) => r.json()),
    ]).then(([settingsResult, champsResult]) => {
      if (settingsResult.success && settingsResult.data) {
        setSettings({ ...DEFAULT_SETTINGS, ...settingsResult.data });
        setStats(settingsResult.data.stats || []);
      }
      if (champsResult.success && champsResult.data) {
        setData(champsResult.data);
        if (Array.isArray(champsResult.data.heroImages)) {
          setHeroImages(champsResult.data.heroImages);
        }
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (heroImages.length < 2) return;
    const interval = setInterval(() => setHeroIndex((i) => (i + 1) % heroImages.length), 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  useEffect(() => {
    if (!statsRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.2 }
    );
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [stats]);

  const visibleSports = data.sports.filter((s) => s.achievements && s.achievements.length > 0);
  const { league, district, state } = data.individual;

  return (
    <div className="min-h-screen bg-gray-50 themed-page">
      <SiteHeader settings={settings} />

      {/* Hero Banner */}
      <section
        className="relative text-white overflow-hidden"
        style={{ minHeight: "420px", paddingTop: "60px", paddingBottom: "60px" }}
      >
        {/* Carousel background images */}
        {heroImages.map(({ path, position }, i) => (
          <Image
            key={path}
            src={path}
            alt=""
            fill
            className="object-cover"
            style={{ objectPosition: position, zIndex: 0, opacity: i === heroIndex ? 1 : 0, transition: "opacity 1.5s ease" }}
            sizes="100vw"
            priority={i === 0}
          />
        ))}
        {/* Color overlay — solid when no images, semi-transparent over images */}
        <div
          style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: heroImages.length > 0 ? `${settings.primaryColor}B3` : settings.primaryColor,
            zIndex: 1,
          }}
        />
        <div className="container mx-auto px-4 text-center" style={{ position: "relative", zIndex: 2 }}>
          {settings.logo && (
            <img
              src={settings.logo}
              alt={`${settings.schoolName} logo`}
              className="mx-auto mb-6"
              style={{ height: "360px", objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }}
            />
          )}
          <h1 className="text-4xl font-bold mb-2">{settings.schoolName} Athletics</h1>
          <p className="text-2xl font-semibold opacity-90">Team Accomplishments</p>
        </div>
      </section>

      {/* Stats Section */}
      {stats.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div ref={statsRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto px-4">
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
        </section>
      )}

      {/* Team Accomplishments */}
      <section className="py-14">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center gap-4 mb-10">
            <div className="flex-grow h-0.5" style={{ backgroundColor: settings.primaryColor }} />
            <h2 className="text-3xl font-bold text-gray-800 whitespace-nowrap">Team Accomplishments</h2>
            <div className="flex-grow h-0.5" style={{ backgroundColor: settings.primaryColor }} />
          </div>

          {visibleSports.length === 0 ? (
            <div
              className="bg-white rounded-xl shadow-lg p-8 text-center border-t-4"
              style={{ borderColor: settings.secondaryColor }}
            >
              <p className="text-gray-500">No team championships have been recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {visibleSports.map((sport) => (
                <div key={sport.slug} className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                  <div
                    className="px-6 py-4"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    <h3 className="text-xl font-bold text-white">{sport.label}</h3>
                  </div>
                  <table className="w-full">
                    <tbody>
                      {sport.achievements.map((achievement, idx) => (
                        <tr
                          key={achievement.id}
                          className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td
                            className="px-6 py-3 font-semibold text-sm w-56"
                            style={{ color: settings.primaryColor }}
                          >
                            {achievement.title}
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex flex-wrap gap-1.5">
                              {achievement.years.split(',').map((year) => (
                                <span
                                  key={year.trim()}
                                  className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                                  style={{ backgroundColor: settings.primaryColor }}
                                >
                                  {year.trim()}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Individual Accomplishments */}
      {(league.length > 0 || district.length > 0 || state.length > 0) && (
        <section className="py-14 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex items-center gap-4 mb-10">
              <div className="flex-grow h-0.5" style={{ backgroundColor: settings.primaryColor }} />
              <h2 className="text-3xl font-bold text-gray-800 whitespace-nowrap">Individual Accomplishments</h2>
              <div className="flex-grow h-0.5" style={{ backgroundColor: settings.primaryColor }} />
            </div>

            <div className="space-y-10">
              {[
                { key: "league", label: "League Champions", entries: league },
                { key: "district", label: "District Champions", entries: district },
                { key: "state", label: "PIAA State Champions", entries: state },
              ].filter(({ entries }) => entries.length > 0).map(({ key, label, entries }) => (
                <div key={key}>
                  <div
                    className="inline-block px-5 py-2 rounded-full text-white font-bold text-sm mb-4"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    {label}
                  </div>
                  <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                    {entries.map((entry, idx) => (
                      <div
                        key={idx}
                        className={`px-6 py-2.5 text-sm text-gray-700 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} ${idx < entries.length - 1 ? "border-b border-gray-100" : ""}`}
                      >
                        {entry}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Navigation links */}
      <section className="pb-14 pt-8">
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href="/"
            className="px-6 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition"
            style={{ backgroundColor: settings.primaryColor }}
          >
            Back to Home
          </Link>
          <Link
            href="/about"
            className="px-6 py-3 rounded-lg font-semibold border-2 hover:opacity-80 transition"
            style={{ borderColor: settings.primaryColor, color: settings.primaryColor }}
          >
            About Us
          </Link>
        </div>
      </section>

      <footer className="text-white py-8 mt-8" style={{ backgroundColor: settings.primaryColor }}>
        <div className="container mx-auto px-4 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} {settings.schoolName} Athletics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
