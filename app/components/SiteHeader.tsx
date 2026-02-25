"use client";

import { useState, useRef } from "react";
import Link from "next/link";

export interface StatItem {
  id: string;
  title: string;
  value: string;
  icon?: string;
}

export interface Settings {
  schoolName: string;
  mascot?: string;
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  twitterUrl?: string;
  instagramUrl?: string;
  stats?: StatItem[];
}

export interface SportData {
  twitterUrl?: string;
  instagramUrl?: string;
  [key: string]: unknown;
}

interface Props {
  settings: Settings;
  sportsData?: Record<string, SportData>;
}

export const allSports = [
  { name: "Football", slug: "football", season: "Fall" },
  { name: "Boys Soccer", slug: "boys-soccer", season: "Fall" },
  { name: "Girls Soccer", slug: "girls-soccer", season: "Fall" },
  { name: "Field Hockey", slug: "field-hockey", season: "Fall" },
  { name: "Volleyball", slug: "volleyball", season: "Fall" },
  { name: "Cross Country", slug: "cross-country", season: "Fall" },
  { name: "Boys Basketball", slug: "boys-basketball", season: "Winter" },
  { name: "Girls Basketball", slug: "girls-basketball", season: "Winter" },
  { name: "Boys Wrestling", slug: "boys-wrestling", season: "Winter" },
  { name: "Girls Wrestling", slug: "girls-wrestling", season: "Winter" },
  { name: "Swimming", slug: "swimming", season: "Winter" },
  { name: "Baseball", slug: "baseball", season: "Spring" },
  { name: "Softball", slug: "softball", season: "Spring" },
  { name: "Lacrosse", slug: "lacrosse", season: "Spring" },
  { name: "Track & Field", slug: "track-field", season: "Spring" },
];

export function XIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-label="X (Twitter)">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

export function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-label="Instagram">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

export function SiteHeader({ settings, sportsData = {} }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openDropdown = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setDropdownOpen(true);
  };
  const closeDropdown = () => {
    closeTimer.current = setTimeout(() => setDropdownOpen(false), 80);
  };

  const fallSports = allSports.filter((s) => s.season === "Fall");
  const winterSports = allSports.filter((s) => s.season === "Winter");
  const springSports = allSports.filter((s) => s.season === "Spring");

  const renderSportEntry = (sport: { name: string; slug: string }) => {
    const data = sportsData[sport.slug];
    return (
      <li key={sport.slug}>
        <div className="flex items-center gap-1 pr-2">
          <Link
            href={`/sports/${sport.slug}`}
            className="flex-1 block hover:bg-gray-50 px-3 py-2 rounded transition font-semibold"
            style={{ color: settings.primaryColor }}
            onClick={() => setDropdownOpen(false)}
          >
            {sport.name}
          </Link>
          {data?.twitterUrl && (
            <a
              href={data.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded hover:bg-gray-100 transition"
              style={{ color: settings.primaryColor }}
              title={`${sport.name} on X`}
            >
              <XIcon />
            </a>
          )}
          {data?.instagramUrl && (
            <a
              href={data.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded hover:bg-gray-100 transition"
              style={{ color: settings.primaryColor }}
              title={`${sport.name} on Instagram`}
            >
              <InstagramIcon />
            </a>
          )}
        </div>
        {/* Quick-jump anchor links */}
        <div className="flex gap-3 px-3 pb-1">
          <Link
            href={`/sports/${sport.slug}#schedule`}
            className="text-xs text-gray-500 hover:text-gray-700 transition"
            onClick={() => setDropdownOpen(false)}
          >
            Schedule
          </Link>
          <Link
            href={`/sports/${sport.slug}#roster`}
            className="text-xs text-gray-500 hover:text-gray-700 transition"
            onClick={() => setDropdownOpen(false)}
          >
            Roster
          </Link>
        </div>
      </li>
    );
  };

  return (
    <header
      className="sticky top-0 z-50 text-white shadow-lg"
      style={{ backgroundColor: settings.primaryColor }}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            {settings.logo && (
              <img src={settings.logo} alt="School Logo" className="h-12" />
            )}
            <span className="text-2xl font-bold">{settings.schoolName} Athletics</span>
          </Link>

          <ul className="flex space-x-6 items-center">
            <li>
              <Link href="/" className="hover:opacity-80 transition">
                Home
              </Link>
            </li>

            <li onMouseEnter={openDropdown} onMouseLeave={closeDropdown}>
              <button className="hover:opacity-80 transition flex items-center gap-1">
                Sports
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </li>

            <li>
              <Link href="/schedule" className="hover:opacity-80 transition">
                Schedule
              </Link>
            </li>
            <li>
              <Link href="/news" className="hover:opacity-80 transition">
                News
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:opacity-80 transition">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Full-width mega menu */}
      {dropdownOpen && (
        <div
          className="absolute left-0 right-0 top-full bg-white text-gray-800 shadow-2xl border-t border-gray-100 z-50"
          onMouseEnter={openDropdown}
          onMouseLeave={closeDropdown}
        >
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-3 gap-8">
              <div>
                <h3
                  className="text-lg font-bold mb-3 pb-2"
                  style={{
                    color: settings.primaryColor,
                    borderBottom: `2px solid ${settings.secondaryColor}`,
                  }}
                >
                  Fall Sports
                </h3>
                <ul className="space-y-1">{fallSports.map(renderSportEntry)}</ul>
              </div>

              <div>
                <h3
                  className="text-lg font-bold mb-3 pb-2"
                  style={{
                    color: settings.primaryColor,
                    borderBottom: `2px solid ${settings.secondaryColor}`,
                  }}
                >
                  Winter Sports
                </h3>
                <ul className="space-y-1">{winterSports.map(renderSportEntry)}</ul>
              </div>

              <div>
                <h3
                  className="text-lg font-bold mb-3 pb-2"
                  style={{
                    color: settings.primaryColor,
                    borderBottom: `2px solid ${settings.secondaryColor}`,
                  }}
                >
                  Spring Sports
                </h3>
                <ul className="space-y-1">{springSports.map(renderSportEntry)}</ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
