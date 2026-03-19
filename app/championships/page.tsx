"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { SiteHeader, type Settings } from "../components/SiteHeader";
import { StatCard } from "../components/StatCard";

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
        if (Array.isArray(settingsResult.data.heroImages)) {
          setHeroImages(settingsResult.data.heroImages);
        }
      }
      if (champsResult.success && champsResult.data) {
        setData(champsResult.data);
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
              <StatCard
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
