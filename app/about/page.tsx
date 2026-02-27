"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { SiteHeader, type Settings } from "../components/SiteHeader";

interface StaffMember {
  id: string;
  role: string;
  name: string;
  email: string;
  photo: string;
  photoPosition?: string;
}

interface Facility {
  id: string;
  name: string;
  address: string;
  description: string;
  photo: string;
  photoPosition?: string;
}

interface SportInfo {
  coach?: string;
  coachEmail?: string;
  coachPhoto?: string;
  coachPhotoPosition?: string;
}

const SEASONS: { label: string; sports: { value: string; label: string }[] }[] = [
  {
    label: "Fall",
    sports: [
      { value: "football", label: "Football" },
      { value: "boys-soccer", label: "Boys Soccer" },
      { value: "girls-soccer", label: "Girls Soccer" },
      { value: "field-hockey", label: "Field Hockey" },
      { value: "volleyball", label: "Volleyball" },
      { value: "cross-country", label: "Cross Country" },
    ],
  },
  {
    label: "Winter",
    sports: [
      { value: "boys-basketball", label: "Boys Basketball" },
      { value: "girls-basketball", label: "Girls Basketball" },
      { value: "boys-wrestling", label: "Boys Wrestling" },
      { value: "girls-wrestling", label: "Girls Wrestling" },
      { value: "swimming", label: "Swimming" },
    ],
  },
  {
    label: "Spring",
    sports: [
      { value: "baseball", label: "Baseball" },
      { value: "softball", label: "Softball" },
      { value: "track-field", label: "Track & Field" },
      { value: "lacrosse", label: "Lacrosse" },
    ],
  },
];

const DEFAULT_SETTINGS: Settings = {
  schoolName: "School Athletics",
  mascot: "Team",
  primaryColor: "#581C87",
  secondaryColor: "#FBBF24",
  logo: "",
};

export default function AboutPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [sportsData, setSportsData] = useState<Record<string, SportInfo>>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/staff").then((r) => r.json()),
      fetch("/api/facilities").then((r) => r.json()),
      fetch("/api/sports").then((r) => r.json()),
    ])
      .then(([settingsResult, staffResult, facilitiesResult, sportsResult]) => {
        if (settingsResult.success && settingsResult.data) {
          setSettings({ ...DEFAULT_SETTINGS, ...settingsResult.data });
        }
        if (staffResult.success && Array.isArray(staffResult.data)) {
          setStaffMembers(staffResult.data);
        }
        if (facilitiesResult.success && Array.isArray(facilitiesResult.data)) {
          setFacilities(facilitiesResult.data);
        }
        if (sportsResult.success && sportsResult.data) {
          setSportsData(sportsResult.data);
        }
      })
      .catch(() => {});
  }, []);

  const visibleStaff = staffMembers.filter((s) => s.name || s.email || s.photo);
  const visibleFacilities = facilities.filter((f) => f.name || f.address || f.description || f.photo);

  return (
    <div className="min-h-screen bg-gray-50 themed-page">
      <SiteHeader settings={settings} />

      <section
        className="text-white py-16 text-center"
        style={{ backgroundColor: settings.primaryColor }}
      >
        <div className="container mx-auto px-4">
          {settings.logo && (
            <img
              src={settings.logo}
              alt={`${settings.schoolName} logo`}
              className="mx-auto mb-6"
              style={{ height: "360px", objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }}
            />
          )}
          <h1 className="text-4xl font-bold mb-2">About {settings.schoolName} Athletics</h1>
          <p className="text-lg opacity-80">Pride. Tradition. Excellence.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-3">Athletic Department Staff</h2>
          <p className="text-center text-gray-600 mb-10">Contact the athletics office team.</p>

          {visibleStaff.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
              {visibleStaff.map((member) => (
                <article key={member.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                  <div className="relative h-56 bg-gray-200">
                    {member.photo ? (
                      <Image src={member.photo} alt={member.name || member.role} fill className="object-cover" style={{ objectPosition: member.photoPosition || 'center' }} sizes="(max-width: 768px) 100vw, 33vw" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No Photo</div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-sm font-semibold uppercase tracking-wide mb-1" style={{ color: settings.primaryColor }}>
                      {member.role}
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name || "Name Coming Soon"}</h3>
                    {member.email ? (
                      <a href={`mailto:${member.email}`} className="text-sm hover:underline" style={{ color: settings.primaryColor }}>
                        {member.email}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-400">Email Coming Soon</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center border-t-4" style={{ borderColor: settings.secondaryColor }}>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Staff Info Coming Soon</h3>
              <p className="text-gray-500">Athletics staff profiles will appear here once updated in Admin.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-3">Coaching Staff</h2>
          <p className="text-center text-gray-600 mb-12">Meet the coaches leading our programs.</p>

          {SEASONS.map((season) => {
            const seasonSports = season.sports.filter((s) => {
              const d = sportsData[s.value];
              return d && (d.coach || d.coachPhoto);
            });
            if (seasonSports.length === 0) return null;
            return (
              <div key={season.label} className="mb-12 max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                  <h3 className="text-2xl font-bold text-gray-700 whitespace-nowrap">{season.label} Sports</h3>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {seasonSports.map((s) => {
                    const d = sportsData[s.value] || {};
                    return (
                      <article key={s.value} className="bg-gray-50 rounded-xl shadow border border-gray-100 overflow-hidden">
                        <div className="relative h-44 bg-gray-200">
                          {d.coachPhoto ? (
                            <Image src={d.coachPhoto} alt={d.coach || s.label} fill className="object-cover" style={{ objectPosition: d.coachPhotoPosition || 'center' }} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Photo</div>
                          )}
                        </div>
                        <div className="p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: settings.primaryColor }}>
                            {s.label}
                          </p>
                          <h4 className="font-bold text-gray-900 text-base mb-1">{d.coach || "Coach TBA"}</h4>
                          {d.coachEmail ? (
                            <a href={`mailto:${d.coachEmail}`} className="text-xs hover:underline break-all" style={{ color: settings.primaryColor }}>
                              {d.coachEmail}
                            </a>
                          ) : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {SEASONS.every((season) =>
            season.sports.every((s) => {
              const d = sportsData[s.value];
              return !d || (!d.coach && !d.coachPhoto);
            })
          ) && (
            <div className="max-w-3xl mx-auto bg-gray-50 rounded-xl shadow-lg p-8 text-center border-t-4" style={{ borderColor: settings.secondaryColor }}>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Coaching Staff Coming Soon</h3>
              <p className="text-gray-500">Coach profiles will appear here once updated in Admin.</p>
            </div>
          )}
        </div>
      </section>

      <section className="pb-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-3">Facilities</h2>
          <p className="text-center text-gray-600 mb-10">Explore our venues, locations, and facility history.</p>

          {visibleFacilities.length > 0 ? (
            <div className="grid gap-6 max-w-6xl mx-auto">
              {visibleFacilities.map((facility) => (
                <article key={facility.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 md:grid md:grid-cols-[320px_1fr]">
                  <div className="relative h-56 md:h-full bg-gray-200">
                    {facility.photo ? (
                      <Image src={facility.photo} alt={facility.name || "Facility"} fill className="object-cover" style={{ objectPosition: facility.photoPosition || 'center' }} sizes="(max-width: 768px) 100vw, 320px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No Photo</div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{facility.name || "Facility Name Coming Soon"}</h3>
                    {facility.address && <p className="text-gray-600 mb-4">{facility.address}</p>}
                    {facility.description && <p className="text-gray-700 leading-relaxed whitespace-pre-line">{facility.description}</p>}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center border-t-4" style={{ borderColor: settings.secondaryColor }}>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Facilities Coming Soon</h3>
              <p className="text-gray-500">Facility photos and details will appear here once updated in Admin.</p>
            </div>
          )}

          <div className="flex justify-center gap-4 flex-wrap mt-12">
            <Link
              href="/"
              className="px-6 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition"
              style={{ backgroundColor: settings.primaryColor }}
            >
              Back to Home
            </Link>
            <Link
              href="/news"
              className="px-6 py-3 rounded-lg font-semibold border-2 hover:opacity-80 transition"
              style={{ borderColor: settings.primaryColor, color: settings.primaryColor }}
            >
              Latest News
            </Link>
          </div>
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
