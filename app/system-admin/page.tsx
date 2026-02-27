"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { allSports } from "../components/SiteHeader";

export default function SystemAdminPage() {
  const router = useRouter();
  const [schoolName, setSchoolName] = useState("");
  const [mascot, setMascot] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#581C87");
  const [secondaryColor, setSecondaryColor] = useState("#FBBF24");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [currentLogo, setCurrentLogo] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [theme, setTheme] = useState<"light" | "dark" | "school">("light");
  const [stats, setStats] = useState<Array<{id: string; title: string; value: string; icon?: string}>>([
    { id: '1', title: 'Section Championships', value: '12', icon: 'trophy' },
    { id: '2', title: 'District Championships', value: '8', icon: 'trophy' },
    { id: '3', title: 'State Championships', value: '3', icon: 'trophy' },
    { id: '4', title: 'All-State Players', value: '47', icon: 'star' },
  ]);

  // Home hero images
  const [heroImages, setHeroImages] = useState<Array<{ path: string; position: string }>>([]);
  const [homeHeroFile, setHomeHeroFile] = useState<File | null>(null);
  const [homeHeroPreview, setHomeHeroPreview] = useState("");
  const [homeHeroPos, setHomeHeroPos] = useState({ x: 50, y: 30 });
  const [isDraggingHomeHero, setIsDraggingHomeHero] = useState(false);
  const [homeHeroLoading, setHomeHeroLoading] = useState(false);
  const [homeHeroMsg, setHomeHeroMsg] = useState("");
  const homeHeroPreviewRef = useRef<HTMLDivElement>(null);
  const homeHeroDragLast = useRef({ x: 0, y: 0 });

  // Championship hero images
  const [champHeroImages, setChampHeroImages] = useState<Array<{ path: string; position: string }>>([]);
  const [champHeroFile, setChampHeroFile] = useState<File | null>(null);
  const [champHeroPreview, setChampHeroPreview] = useState("");
  const [champHeroPos, setChampHeroPos] = useState({ x: 50, y: 30 });
  const [isDraggingChampHero, setIsDraggingChampHero] = useState(false);
  const [champHeroLoading, setChampHeroLoading] = useState(false);
  const [champHeroMsg, setChampHeroMsg] = useState("");
  const champHeroPreviewRef = useRef<HTMLDivElement>(null);
  const champHeroDragLast = useRef({ x: 0, y: 0 });

  // iCal Schedule Import state
  const [icalUrl, setIcalUrl] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [icalImporting, setIcalImporting] = useState(false);
  const [icalResult, setIcalResult] = useState<{
    success: boolean;
    message?: string;
    imported?: { sport: string; count: number }[];
    unrecognized?: number;
    total?: number;
  } | null>(null);

  // Page Owner Management state
  const [pageOwnerSport, setPageOwnerSport] = useState(allSports[0]?.slug || "football");
  const [pageOwnerPassword, setPageOwnerPassword] = useState("");
  const [sportsWithOwners, setSportsWithOwners] = useState<string[]>([]);
  const [pageOwnerMessage, setPageOwnerMessage] = useState("");
  const [pageOwnerLoading, setPageOwnerLoading] = useState(false);

  // Load existing settings and page owner list
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [settingsRes, ownersRes, champsRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/page-owners'),
          fetch('/api/championships'),
        ]);
        const [settingsResult, ownersResult, champsResult] = await Promise.all([
          settingsRes.json(),
          ownersRes.json(),
          champsRes.json(),
        ]);

        if (settingsResult.success && settingsResult.data) {
          setSchoolName(settingsResult.data.schoolName || "");
          setMascot(settingsResult.data.mascot || "");
          setPrimaryColor(settingsResult.data.primaryColor || "#581C87");
          setSecondaryColor(settingsResult.data.secondaryColor || "#FBBF24");
          setCurrentLogo(settingsResult.data.logo || "");
          setTwitterUrl(settingsResult.data.twitterUrl || "");
          setInstagramUrl(settingsResult.data.instagramUrl || "");
          setIcalUrl(settingsResult.data.icalUrl || "");
          setTimezone(settingsResult.data.timezone || "America/New_York");
          setTheme(settingsResult.data.theme || "light");
          if (Array.isArray(settingsResult.data.stats)) {
            setStats(settingsResult.data.stats);
          }
          if (Array.isArray(settingsResult.data.heroImages)) {
            setHeroImages(settingsResult.data.heroImages);
          }
        }

        if (ownersResult.success) {
          setSportsWithOwners(ownersResult.sports || []);
        }

        if (champsResult.success && Array.isArray(champsResult.data?.heroImages)) {
          setChampHeroImages(champsResult.data.heroImages);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/admin-auth', { method: 'DELETE' });
    router.push('/admin-login');
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      // Upload logo if changed
      let logoPath = currentLogo;
      if (logoFile) {
        const formData = new FormData();
        formData.append('file', logoFile);
        formData.append('type', 'logo');

        const uploadResponse = await fetch('/api/upload-logo', {
          method: 'POST',
          body: formData,
        });

        const uploadResult = await uploadResponse.json();
        if (uploadResult.success) {
          logoPath = uploadResult.filename;
        } else {
          setMessage(`❌ Error uploading logo: ${uploadResult.message}`);
          setIsLoading(false);
          return;
        }
      }

      // Save all settings
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolName,
          mascot,
          primaryColor,
          secondaryColor,
          logo: logoPath,
          twitterUrl,
          instagramUrl,
          icalUrl,
          timezone,
          theme,
          stats,
          heroImages,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage(`✅ Success! System settings updated. Refresh the homepage to see changes.`);
        setCurrentLogo(logoPath);
      } else {
        setMessage(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(`❌ Error updating settings.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPageOwner = async () => {
    setPageOwnerLoading(true);
    setPageOwnerMessage("");

    try {
      const response = await fetch('/api/page-owners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sport: pageOwnerSport, password: pageOwnerPassword }),
      });

      const result = await response.json();

      if (result.success) {
        setPageOwnerMessage(`✅ Page owner set for ${allSports.find((s) => s.slug === pageOwnerSport)?.name || pageOwnerSport}.`);
        setPageOwnerPassword("");
        setSportsWithOwners((prev) =>
          prev.includes(pageOwnerSport) ? prev : [...prev, pageOwnerSport]
        );
      } else {
        setPageOwnerMessage(`❌ ${result.message}`);
      }
    } catch {
      setPageOwnerMessage("❌ Error saving page owner.");
    } finally {
      setPageOwnerLoading(false);
    }
  };

  const handleRemovePageOwner = async () => {
    setPageOwnerLoading(true);
    setPageOwnerMessage("");

    try {
      const response = await fetch('/api/page-owners', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sport: pageOwnerSport }),
      });

      const result = await response.json();

      if (result.success) {
        setPageOwnerMessage(`✅ Page owner removed for ${allSports.find((s) => s.slug === pageOwnerSport)?.name || pageOwnerSport}.`);
        setSportsWithOwners((prev) => prev.filter((s) => s !== pageOwnerSport));
      } else {
        setPageOwnerMessage(`❌ ${result.message}`);
      }
    } catch {
      setPageOwnerMessage("❌ Error removing page owner.");
    } finally {
      setPageOwnerLoading(false);
    }
  };

  // ── Home hero image handlers ───────────────────────────────────────────────

  const handleHomeHeroSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHomeHeroFile(file);
    setHomeHeroPreview(URL.createObjectURL(file));
    setHomeHeroPos({ x: 50, y: 30 });
    setHomeHeroMsg("");
  };

  const startHomeHeroDrag = (clientX: number, clientY: number) => {
    setIsDraggingHomeHero(true);
    homeHeroDragLast.current = { x: clientX, y: clientY };
  };

  const moveHomeHeroDrag = (clientX: number, clientY: number) => {
    if (!homeHeroPreviewRef.current) return;
    const rect = homeHeroPreviewRef.current.getBoundingClientRect();
    const dx = clientX - homeHeroDragLast.current.x;
    const dy = clientY - homeHeroDragLast.current.y;
    homeHeroDragLast.current = { x: clientX, y: clientY };
    setHomeHeroPos(prev => ({
      x: Math.max(0, Math.min(100, prev.x - (dx / rect.width) * 100)),
      y: Math.max(0, Math.min(100, prev.y - (dy / rect.height) * 100)),
    }));
  };

  const handleHomeHeroUpload = async () => {
    if (!homeHeroFile) return;
    setHomeHeroLoading(true);
    setHomeHeroMsg("");
    try {
      const formData = new FormData();
      formData.append('file', homeHeroFile);
      formData.append('posX', String(Math.round(homeHeroPos.x)));
      formData.append('posY', String(Math.round(homeHeroPos.y)));
      const res = await fetch('/api/home-hero', { method: 'POST', body: formData });
      const result = await res.json();
      if (result.success) {
        setHeroImages(result.heroImages);
        setHomeHeroFile(null);
        setHomeHeroPreview("");
        setHomeHeroMsg("✅ Photo added to the home page hero carousel.");
      } else {
        setHomeHeroMsg(`❌ ${result.message}`);
      }
    } catch {
      setHomeHeroMsg("❌ Error uploading image.");
    } finally {
      setHomeHeroLoading(false);
    }
  };

  const handleRemoveHomeHero = async (imagePath: string) => {
    try {
      const res = await fetch('/api/home-hero', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagePath }),
      });
      const result = await res.json();
      if (result.success) {
        setHeroImages(result.heroImages);
      }
    } catch {
      // silently fail
    }
  };

  // ── Championship hero image handlers ──────────────────────────────────────

  const handleChampHeroSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setChampHeroFile(file);
    setChampHeroPreview(URL.createObjectURL(file));
    setChampHeroPos({ x: 50, y: 30 });
    setChampHeroMsg("");
  };

  const startChampHeroDrag = (clientX: number, clientY: number) => {
    setIsDraggingChampHero(true);
    champHeroDragLast.current = { x: clientX, y: clientY };
  };

  const moveChampHeroDrag = (clientX: number, clientY: number) => {
    if (!champHeroPreviewRef.current) return;
    const rect = champHeroPreviewRef.current.getBoundingClientRect();
    const dx = clientX - champHeroDragLast.current.x;
    const dy = clientY - champHeroDragLast.current.y;
    champHeroDragLast.current = { x: clientX, y: clientY };
    setChampHeroPos(prev => ({
      x: Math.max(0, Math.min(100, prev.x - (dx / rect.width) * 100)),
      y: Math.max(0, Math.min(100, prev.y - (dy / rect.height) * 100)),
    }));
  };

  const handleChampHeroUpload = async () => {
    if (!champHeroFile) return;
    setChampHeroLoading(true);
    setChampHeroMsg("");
    try {
      const formData = new FormData();
      formData.append('file', champHeroFile);
      formData.append('posX', String(Math.round(champHeroPos.x)));
      formData.append('posY', String(Math.round(champHeroPos.y)));
      const res = await fetch('/api/championship-hero', { method: 'POST', body: formData });
      const result = await res.json();
      if (result.success) {
        setChampHeroImages(result.heroImages);
        setChampHeroFile(null);
        setChampHeroPreview("");
        setChampHeroMsg("✅ Photo added to the championships hero carousel.");
      } else {
        setChampHeroMsg(`❌ ${result.message}`);
      }
    } catch {
      setChampHeroMsg("❌ Error uploading image.");
    } finally {
      setChampHeroLoading(false);
    }
  };

  const handleRemoveChampHero = async (imagePath: string) => {
    try {
      const res = await fetch('/api/championship-hero', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagePath }),
      });
      const result = await res.json();
      if (result.success) {
        setChampHeroImages(result.heroImages);
      }
    } catch {
      // silently fail
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  const handleImportIcal = async () => {
    if (!icalUrl.trim()) {
      setIcalResult({ success: false, message: 'Please enter an iCal URL before importing.' });
      return;
    }
    setIcalImporting(true);
    setIcalResult(null);
    try {
      // Pass URL + timezone directly so no pre-save is needed
      const res = await fetch('/api/import-ical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icalUrl: icalUrl.trim(), timezone }),
      });
      const result = await res.json();
      setIcalResult(result);
    } catch {
      setIcalResult({ success: false, message: 'Network error. Could not reach the import API.' });
    } finally {
      setIcalImporting(false);
    }
  };

  const selectedSportHasOwner = sportsWithOwners.includes(pageOwnerSport);
  const selectedSportName = allSports.find((s) => s.slug === pageOwnerSport)?.name || pageOwnerSport;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="text-white shadow-lg" style={{ backgroundColor: primaryColor }}>
        <nav className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              {currentLogo && (
                <img src={currentLogo} alt="School Logo" className="h-12" />
              )}
              <span className="text-2xl font-bold">System Admin</span>
            </Link>
            <div className="flex gap-3">
              <Link
                href="/admin"
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded transition"
              >
                Sports Admin
              </Link>
              <Link
                href="/"
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded transition"
              >
                Back to Home
              </Link>
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded transition"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* System Settings Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">System Settings</h1>
            <p className="text-gray-600 mb-8">Configure school-wide branding and information</p>

            <div className="space-y-6">
              {/* School Name */}
              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700">School Name</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g., Lincoln High School"
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
                />
                <p className="text-sm text-gray-500 mt-1">This will appear in headers and page titles</p>
              </div>

              {/* Mascot */}
              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700">Mascot / Team Name</label>
                <input
                  type="text"
                  value={mascot}
                  onChange={(e) => setMascot(e.target.value)}
                  placeholder="e.g., Eagles"
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
                />
                <p className="text-sm text-gray-500 mt-1">Your school&apos;s mascot or team name</p>
              </div>

              {/* Colors */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold mb-2 text-gray-700">Primary Color</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      disabled={isLoading}
                      className="w-20 h-12 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-800 font-mono"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Main brand color (e.g., school primary color)</p>
                </div>

                <div>
                  <label className="block text-lg font-semibold mb-2 text-gray-700">Secondary Color</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      disabled={isLoading}
                      className="w-20 h-12 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-800 font-mono"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Accent color (e.g., school secondary color)</p>
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700">School Logo</label>

                {currentLogo && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Current Logo:</p>
                    <img src={currentLogo} alt="Current Logo" className="h-20 object-contain" />
                  </div>
                )}

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                  onChange={handleLogoChange}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Recommended: PNG with transparent background, 500x500px or larger
                </p>
              </div>

              {/* School Social Media */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">School Social Media</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-lg font-semibold mb-2 text-gray-700">X (Twitter) URL</label>
                    <input
                      type="url"
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.target.value)}
                      placeholder="https://x.com/yourschool"
                      disabled={isLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
                    />
                    <p className="text-sm text-gray-500 mt-1">Shown in the site footer and homepage</p>
                  </div>
                  <div>
                    <label className="block text-lg font-semibold mb-2 text-gray-700">Instagram URL</label>
                    <input
                      type="url"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="https://www.instagram.com/yourschool"
                      disabled={isLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
                    />
                    <p className="text-sm text-gray-500 mt-1">Shown in the site footer and homepage</p>
                  </div>
                </div>
              </div>

              {/* Theme Picker */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-1 text-gray-700">Website Theme</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Controls how the public-facing site looks to visitors.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {(
                    [
                      {
                        id: "light" as const,
                        label: "Light",
                        desc: "White & gray backgrounds",
                        preview: (
                          <div className="h-full flex flex-col bg-gray-50">
                            <div className="h-4 shrink-0" style={{ backgroundColor: primaryColor }} />
                            <div className="flex-1 bg-white m-1.5 rounded" />
                            <div className="h-3 bg-gray-100 mx-1.5 mb-1.5 rounded" />
                          </div>
                        ),
                      },
                      {
                        id: "dark" as const,
                        label: "Dark",
                        desc: "Dark backgrounds, school color accents",
                        preview: (
                          <div className="h-full flex flex-col" style={{ backgroundColor: "#0F172A" }}>
                            <div className="h-4 shrink-0" style={{ backgroundColor: primaryColor }} />
                            <div className="flex-1 m-1.5 rounded" style={{ backgroundColor: "#1E293B" }} />
                            <div className="h-3 mx-1.5 mb-1.5 rounded" style={{ backgroundColor: "#162032" }} />
                          </div>
                        ),
                      },
                      {
                        id: "school" as const,
                        label: "School Colors",
                        desc: "School palette throughout",
                        preview: (
                          <div
                            className="h-full flex flex-col"
                            style={{ backgroundColor: `color-mix(in srgb, ${primaryColor} 10%, white)` }}
                          >
                            <div className="h-4 shrink-0" style={{ backgroundColor: primaryColor }} />
                            <div
                              className="flex-1 bg-white m-1.5 rounded border-l-4"
                              style={{ borderColor: primaryColor }}
                            />
                            <div
                              className="h-3 mx-1.5 mb-1.5 rounded"
                              style={{ backgroundColor: `color-mix(in srgb, ${primaryColor} 14%, white)` }}
                            />
                          </div>
                        ),
                      },
                    ] as const
                  ).map(({ id, label, desc, preview }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTheme(id)}
                      className="rounded-lg border-2 overflow-hidden text-left transition focus:outline-none"
                      style={{
                        borderColor: theme === id ? primaryColor : "#D1D5DB",
                        boxShadow: theme === id ? `0 0 0 3px ${primaryColor}33` : undefined,
                      }}
                    >
                      <div className="h-20">{preview}</div>
                      <div className="p-2 bg-white border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-800 flex items-center gap-1">
                          {theme === id && (
                            <span
                              className="inline-block w-2 h-2 rounded-full"
                              style={{ backgroundColor: primaryColor }}
                            />
                          )}
                          {label}
                        </p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Preview</h3>
                <div
                  className="p-6 rounded-lg text-white flex items-center gap-4"
                  style={{ backgroundColor: primaryColor }}
                >
                  {(logoFile || currentLogo) && (
                    <img
                      src={logoFile ? URL.createObjectURL(logoFile) : currentLogo}
                      alt="Logo Preview"
                      className="h-16 object-contain bg-white bg-opacity-10 p-2 rounded"
                    />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">{schoolName || "School Name"}</h2>
                    <p className="text-lg" style={{ color: secondaryColor }}>
                      {mascot || "Mascot"} Athletics
                    </p>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-6">
                <button
                  onClick={handleSaveSettings}
                  disabled={isLoading}
                  className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition text-white ${
                    isLoading ? "bg-gray-400 cursor-not-allowed" : "hover:opacity-90"
                  }`}
                  style={!isLoading ? { backgroundColor: primaryColor } : undefined}
                >
                  {isLoading ? "Saving..." : "Save System Settings"}
                </button>
              </div>

              {/* Loading Indicator */}
              {isLoading && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 flex items-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-blue-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving settings...
                </div>
              )}

              {/* Success/Error Message */}
              {message && !isLoading && (
                <div className={`p-4 rounded-lg ${
                  message.startsWith("✅")
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}>
                  {message}
                </div>
              )}

              {/* Info Box */}
              <div className="mt-8 p-4 bg-gray-50 border-l-4 rounded" style={{ borderColor: primaryColor }}>
                <h3 className="font-semibold mb-2" style={{ color: primaryColor }}>Important Notes:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Changes will apply site-wide to all pages</li>
                  <li>After saving, refresh any open pages to see updates</li>
                  <li>Logo will be used in headers throughout the site</li>
                  <li>Color changes may require a full page reload</li>
                </ul>
              </div>
            </div>
          </div>

          {/* iCal Schedule Import Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Schedule Sync (iCal)</h2>
            <p className="text-gray-600 mb-8">
              Connect an iCal feed (e.g., ArbiterSports) to automatically import game schedules for all sports.
            </p>

            <div className="space-y-5">
              {/* iCal URL */}
              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700">iCal Feed URL</label>
                <input
                  type="text"
                  value={icalUrl}
                  onChange={(e) => setIcalUrl(e.target.value)}
                  placeholder="https://www2.arbitersports.com/ICal/School/schedule.ics?id=..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 font-mono text-sm"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Paste the .ics link from ArbiterSports or your scheduling platform.
                  The URL is also saved when you click <em>Save System Settings</em> above.
                </p>
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700">School Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="America/Anchorage">Alaska Time (AKT)</option>
                  <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Used to convert UTC event times to your local time zone. Required if your iCal feed uses UTC.
                </p>
              </div>

              {/* Import button */}
              <button
                onClick={handleImportIcal}
                disabled={icalImporting || !icalUrl}
                className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition text-white flex items-center justify-center gap-3 ${
                  icalImporting || !icalUrl ? "bg-gray-300 cursor-not-allowed" : "hover:opacity-90"
                }`}
                style={!icalImporting && icalUrl ? { backgroundColor: primaryColor } : undefined}
              >
                {icalImporting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Importing…
                  </>
                ) : (
                  "Import All Sports from iCal"
                )}
              </button>

              {/* Import results */}
              {icalResult && (
                <div className={`p-4 rounded-lg ${
                  icalResult.success
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}>
                  {icalResult.success ? (
                    <>
                      <p className="font-bold mb-2">✅ Import complete — {icalResult.total} events processed</p>
                      {icalResult.imported && icalResult.imported.length > 0 ? (
                        <ul className="text-sm space-y-1 mb-2">
                          {icalResult.imported.map((s) => (
                            <li key={s.sport}>
                              • {s.sport.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}: {s.count} game{s.count !== 1 ? 's' : ''} imported
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm mb-2">No events matched a recognized sport.</p>
                      )}
                      {(icalResult.unrecognized ?? 0) > 0 && (
                        <p className="text-sm text-amber-700">
                          ⚠️ {icalResult.unrecognized} event{(icalResult.unrecognized ?? 0) !== 1 ? 's' : ''} could not be matched to a sport and were skipped.
                        </p>
                      )}
                    </>
                  ) : (
                    <p>❌ {icalResult.message}</p>
                  )}
                </div>
              )}

              {/* Notes */}
              <div className="p-4 bg-gray-50 border-l-4 rounded" style={{ borderColor: primaryColor }}>
                <h3 className="font-semibold mb-2" style={{ color: primaryColor }}>How it works:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Fetches the live iCal feed and parses all events</li>
                  <li>Automatically detects sport from event name (Football, Basketball, etc.)</li>
                  <li>Detects Home vs. Away from "vs." / "at" in the event title</li>
                  <li>Only replaces schedules for sports that have events in the feed</li>
                  <li>Cancelled events are automatically skipped</li>
                  <li>Run this import any time the schedule changes</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Page Owner Management Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Page Owner Management</h2>
            <p className="text-gray-600 mb-8">
              Assign a password to a sport so its coach or manager can log in and update only that sport.
            </p>

            <div className="space-y-6">
              {/* Sport Selector */}
              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700">Sport</label>
                <select
                  value={pageOwnerSport}
                  onChange={(e) => { setPageOwnerSport(e.target.value); setPageOwnerMessage(""); }}
                  disabled={pageOwnerLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
                >
                  {allSports.map((s) => (
                    <option key={s.slug} value={s.slug}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Status indicator */}
              <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold ${
                selectedSportHasOwner
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-gray-50 border border-gray-200 text-gray-600"
              }`}>
                <span>{selectedSportHasOwner ? "✓" : "○"}</span>
                <span>
                  {selectedSportHasOwner
                    ? `${selectedSportName} has a page owner assigned`
                    : `${selectedSportName} has no page owner`}
                </span>
              </div>

              {/* Password input */}
              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700">
                  {selectedSportHasOwner ? "New Password (leave blank to keep current)" : "Set Password"}
                </label>
                <input
                  type="password"
                  value={pageOwnerPassword}
                  onChange={(e) => setPageOwnerPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  disabled={pageOwnerLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This password lets the page owner log in at /admin-login and manage only {selectedSportName}.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSetPageOwner}
                  disabled={pageOwnerLoading || !pageOwnerPassword}
                  className={`flex-1 py-3 px-6 rounded-lg font-bold text-white transition ${
                    pageOwnerLoading || !pageOwnerPassword
                      ? "bg-gray-300 cursor-not-allowed"
                      : "hover:opacity-90"
                  }`}
                  style={!pageOwnerLoading && pageOwnerPassword ? { backgroundColor: primaryColor } : undefined}
                >
                  {pageOwnerLoading ? "Saving..." : selectedSportHasOwner ? "Update Password" : "Set Password"}
                </button>

                {selectedSportHasOwner && (
                  <button
                    onClick={handleRemovePageOwner}
                    disabled={pageOwnerLoading}
                    className={`px-6 py-3 rounded-lg font-bold transition border-2 ${
                      pageOwnerLoading
                        ? "border-gray-300 text-gray-300 cursor-not-allowed"
                        : "border-red-300 text-red-600 hover:bg-red-50"
                    }`}
                  >
                    Remove Access
                  </button>
                )}
              </div>

              {/* Page Owner Message */}
              {pageOwnerMessage && (
                <div className={`p-4 rounded-lg ${
                  pageOwnerMessage.startsWith("✅")
                    ? "bg-green-50 border border-green-200 text-green-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}>
                  {pageOwnerMessage}
                </div>
              )}

              {/* Summary of all page owners */}
              {sportsWithOwners.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Sports with Page Owners ({sportsWithOwners.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sportsWithOwners.map((slug) => {
                      const sportName = allSports.find((s) => s.slug === slug)?.name || slug;
                      return (
                        <span
                          key={slug}
                          className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {sportName}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Achievement Statistics Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Achievement Statistics</h2>
            <p className="text-gray-600 mb-6">
              These cards appear on the home page with an animated count-up effect. Edit titles and values, then click <strong>Save System Settings</strong> above.
            </p>

            <div className="space-y-3">
              {stats.map((stat, i) => (
                <div key={stat.id} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  {/* Icon selector */}
                  <select
                    value={stat.icon || 'trophy'}
                    onChange={(e) => {
                      const updated = [...stats];
                      updated[i] = { ...updated[i], icon: e.target.value };
                      setStats(updated);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-800 bg-white"
                    title="Icon"
                  >
                    <option value="trophy">🏆 Trophy</option>
                    <option value="star">⭐ Star</option>
                    <option value="medal">🏅 Medal</option>
                    <option value="user">👤 Player</option>
                  </select>

                  {/* Value */}
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => {
                      const updated = [...stats];
                      updated[i] = { ...updated[i], value: e.target.value };
                      setStats(updated);
                    }}
                    placeholder="e.g., 12"
                    className="w-24 px-3 py-2 border border-gray-300 rounded text-gray-800 text-center font-bold text-lg bg-white"
                    title="Value (number shown on card)"
                  />

                  {/* Title */}
                  <input
                    type="text"
                    value={stat.title}
                    onChange={(e) => {
                      const updated = [...stats];
                      updated[i] = { ...updated[i], title: e.target.value };
                      setStats(updated);
                    }}
                    placeholder="e.g., Section Championships"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-gray-800 bg-white"
                    title="Label shown below the number"
                  />

                  {/* Remove */}
                  <button
                    onClick={() => setStats(stats.filter((_, j) => j !== i))}
                    className="text-red-400 hover:text-red-600 transition p-2 rounded hover:bg-red-50"
                    title="Remove this stat"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              <button
                onClick={() => setStats([...stats, { id: Date.now().toString(), title: 'New Achievement', value: '0', icon: 'trophy' }])}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-700 transition font-semibold text-sm"
              >
                + Add Stat Card
              </button>
            </div>

            <p className="text-sm text-gray-400 mt-4">
              Tip: values like <code className="bg-gray-100 px-1 rounded">47+</code> or <code className="bg-gray-100 px-1 rounded">3×</code> work — the number counts up and the suffix stays fixed.
            </p>
          </div>

          {/* Home Hero Images Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Home Page Hero Images</h2>
            <p className="text-gray-600 mb-6">
              Upload photos that rotate in the full-width banner at the top of the home page. Drag the preview to set the crop position before uploading.
            </p>

            {/* Existing images */}
            {heroImages.length > 0 && (
              <div className="mb-6 space-y-3">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Current Hero Photos ({heroImages.length})
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {heroImages.map((img) => (
                    <div key={img.path} className="relative rounded-lg overflow-hidden border border-gray-200 group" style={{ height: '120px' }}>
                      <img
                        src={img.path}
                        alt=""
                        className="w-full h-full object-cover"
                        style={{ objectPosition: img.position }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <button
                          onClick={() => handleRemoveHomeHero(img.path)}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded transition"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="absolute bottom-1 left-2 text-white text-xs bg-black/50 px-1.5 py-0.5 rounded pointer-events-none">
                        {img.position}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload new */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Select Image</label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleHomeHeroSelect}
                  disabled={homeHeroLoading}
                  className={`w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition ${homeHeroLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <p className="text-xs text-gray-500 mt-1">Recommended: 1920×600 px or wider · JPG, PNG, or WEBP · max 5 MB</p>
              </div>

              {/* Drag-to-position preview */}
              {homeHeroPreview && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Drag to adjust the crop position:</p>
                  <div
                    ref={homeHeroPreviewRef}
                    className="relative overflow-hidden rounded-lg select-none"
                    style={{ height: '200px', cursor: isDraggingHomeHero ? 'grabbing' : 'grab' }}
                    onMouseDown={(e) => { startHomeHeroDrag(e.clientX, e.clientY); e.preventDefault(); }}
                    onMouseMove={(e) => { if (isDraggingHomeHero) moveHomeHeroDrag(e.clientX, e.clientY); }}
                    onMouseUp={() => setIsDraggingHomeHero(false)}
                    onMouseLeave={() => setIsDraggingHomeHero(false)}
                    onTouchStart={(e) => { const t = e.touches[0]; startHomeHeroDrag(t.clientX, t.clientY); }}
                    onTouchMove={(e) => { const t = e.touches[0]; moveHomeHeroDrag(t.clientX, t.clientY); }}
                    onTouchEnd={() => setIsDraggingHomeHero(false)}
                  >
                    <img
                      src={homeHeroPreview}
                      alt="Hero preview"
                      draggable={false}
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      style={{ objectFit: 'cover', objectPosition: `${homeHeroPos.x}% ${homeHeroPos.y}%` }}
                    />
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                      style={{ backgroundColor: `${primaryColor}70` }}
                    >
                      <p className="text-white text-xl font-bold drop-shadow">Home Page Hero Preview</p>
                      <p className="text-white/70 text-sm mt-1">Pride. Tradition. Excellence.</p>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded pointer-events-none">
                      ⤡ Drag to reposition
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Crop position: {Math.round(homeHeroPos.x)}% horizontal · {Math.round(homeHeroPos.y)}% vertical
                  </p>
                </div>
              )}

              <button
                onClick={handleHomeHeroUpload}
                disabled={homeHeroLoading || !homeHeroFile}
                className={`w-full py-3 px-6 rounded-lg font-bold text-white transition ${homeHeroLoading || !homeHeroFile ? 'bg-gray-300 cursor-not-allowed' : 'hover:opacity-90'}`}
                style={!homeHeroLoading && homeHeroFile ? { backgroundColor: primaryColor } : undefined}
              >
                {homeHeroLoading ? 'Uploading…' : homeHeroFile ? 'Add to Hero Carousel' : 'Select an image first'}
              </button>

              {homeHeroMsg && (
                <div className={`p-4 rounded-lg text-sm ${homeHeroMsg.startsWith('✅') ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                  {homeHeroMsg}
                </div>
              )}
            </div>
          </div>

          {/* Championship Hero Images Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Championships Page Hero Images</h2>
            <p className="text-gray-600 mb-6">
              Upload photos that rotate in the banner at the top of the Championships page. Drag the preview to set the crop position before uploading.
            </p>

            {/* Existing images */}
            {champHeroImages.length > 0 && (
              <div className="mb-6 space-y-3">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Current Championship Photos ({champHeroImages.length})
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {champHeroImages.map((img) => (
                    <div key={img.path} className="relative rounded-lg overflow-hidden border border-gray-200 group" style={{ height: '120px' }}>
                      <img
                        src={img.path}
                        alt=""
                        className="w-full h-full object-cover"
                        style={{ objectPosition: img.position }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <button
                          onClick={() => handleRemoveChampHero(img.path)}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded transition"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="absolute bottom-1 left-2 text-white text-xs bg-black/50 px-1.5 py-0.5 rounded pointer-events-none">
                        {img.position}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload new */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Select Image</label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleChampHeroSelect}
                  disabled={champHeroLoading}
                  className={`w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition ${champHeroLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <p className="text-xs text-gray-500 mt-1">Best: 1920×600 px or wider · JPG, PNG, or WEBP · max 5 MB</p>
              </div>

              {/* Drag-to-position preview */}
              {champHeroPreview && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Drag to adjust the crop position:</p>
                  <div
                    ref={champHeroPreviewRef}
                    className="relative overflow-hidden rounded-lg select-none"
                    style={{ height: '200px', cursor: isDraggingChampHero ? 'grabbing' : 'grab' }}
                    onMouseDown={(e) => { startChampHeroDrag(e.clientX, e.clientY); e.preventDefault(); }}
                    onMouseMove={(e) => { if (isDraggingChampHero) moveChampHeroDrag(e.clientX, e.clientY); }}
                    onMouseUp={() => setIsDraggingChampHero(false)}
                    onMouseLeave={() => setIsDraggingChampHero(false)}
                    onTouchStart={(e) => { const t = e.touches[0]; startChampHeroDrag(t.clientX, t.clientY); }}
                    onTouchMove={(e) => { const t = e.touches[0]; moveChampHeroDrag(t.clientX, t.clientY); }}
                    onTouchEnd={() => setIsDraggingChampHero(false)}
                  >
                    <img
                      src={champHeroPreview}
                      alt="Championship hero preview"
                      draggable={false}
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      style={{ objectFit: 'cover', objectPosition: `${champHeroPos.x}% ${champHeroPos.y}%` }}
                    />
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                      style={{ backgroundColor: `${primaryColor}70` }}
                    >
                      <p className="text-white text-xl font-bold drop-shadow">Championships Hero Preview</p>
                      <p className="text-white/70 text-sm mt-1">Team Accomplishments</p>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded pointer-events-none">
                      ⤡ Drag to reposition
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Crop position: {Math.round(champHeroPos.x)}% horizontal · {Math.round(champHeroPos.y)}% vertical
                  </p>
                </div>
              )}

              <button
                onClick={handleChampHeroUpload}
                disabled={champHeroLoading || !champHeroFile}
                className={`w-full py-3 px-6 rounded-lg font-bold text-white transition ${champHeroLoading || !champHeroFile ? 'bg-gray-300 cursor-not-allowed' : 'hover:opacity-90'}`}
                style={!champHeroLoading && champHeroFile ? { backgroundColor: primaryColor } : undefined}
              >
                {champHeroLoading ? 'Uploading…' : champHeroFile ? 'Add to Championships Carousel' : 'Select an image first'}
              </button>

              {champHeroMsg && (
                <div className={`p-4 rounded-lg text-sm ${champHeroMsg.startsWith('✅') ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                  {champHeroMsg}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="text-white py-8 mt-12" style={{ backgroundColor: primaryColor }}>
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} {schoolName || "School Athletics"}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
