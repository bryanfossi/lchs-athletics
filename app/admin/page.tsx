"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Settings {
  schoolName: string;
  primaryColor: string;
  secondaryColor: string;
  logo: string;
}

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

const DEFAULT_SETTINGS: Settings = {
  schoolName: "School Athletics",
  primaryColor: "#581C87",
  secondaryColor: "#FBBF24",
  logo: "",
};

const DEFAULT_STAFF: StaffMember[] = [
  { id: "ad", role: "Athletic Director", name: "", email: "", photo: "" },
  { id: "aad", role: "Assistant Athletic Director", name: "", email: "", photo: "" },
  { id: "atad", role: "Assistant to the Athletic Director", name: "", email: "", photo: "" },
];

export default function AdminPage() {
  const router = useRouter();
  const [selectedSport, setSelectedSport] = useState("football");
  const [uploadType, setUploadType] = useState<"schedule" | "roster" | "image" | "info" | "news" | "staff" | "facilities" | "championships" | "individual-awards">("schedule");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // Session role state
  const [sessionRole, setSessionRole] = useState<"admin" | "pageowner" | "none">("admin");
  const [sessionLoaded, setSessionLoaded] = useState(false);

  // iCal sync state
  const [hasIcalUrl, setHasIcalUrl] = useState(false);
  const [icalSyncing, setIcalSyncing] = useState(false);
  const [icalResult, setIcalResult] = useState<string>("");

  // Sport info form fields
  const [headCoach, setHeadCoach] = useState("");
  const [coachEmail, setCoachEmail] = useState("");
  const [coachPhoto, setCoachPhoto] = useState("");
  const [coachPhotoPreview, setCoachPhotoPreview] = useState("");
  const [programDescription, setProgramDescription] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");

  // News form fields
  const [newsTitle, setNewsTitle] = useState("");
  const [newsAuthor, setNewsAuthor] = useState("");
  const [newsDate, setNewsDate] = useState(new Date().toISOString().split('T')[0]);
  const [newsBody, setNewsBody] = useState("");
  const [newsSport, setNewsSport] = useState("");
  const [newsImageFile, setNewsImageFile] = useState<File | null>(null);
  const [newsImagePreview, setNewsImagePreview] = useState("");

  // About page content fields
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(DEFAULT_STAFF);
  const [facilities, setFacilities] = useState<Facility[]>([]);

  // Hero image upload with drag-to-position
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState("");
  const [heroImgPos, setHeroImgPos] = useState({ x: 50, y: 30 });
  const [isDraggingHero, setIsDraggingHero] = useState(false);
  const heroPreviewRef = useRef<HTMLDivElement>(null);
  const heroDragLast = useRef({ x: 0, y: 0 });

  // Shared drag-to-position for staff / facility / coach photos
  const [dragActive, setDragActive] = useState<string | null>(null);
  const dragLastRef = useRef({ x: 0, y: 0 });
  const previewRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [staffPositions, setStaffPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [facilityPositions, setFacilityPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [coachPos, setCoachPos] = useState({ x: 50, y: 50 });

  // Championships state
  const [sportAchievements, setSportAchievements] = useState<{ id: string; title: string; years: string }[]>([]);
  const [leagueEntries, setLeagueEntries] = useState("");
  const [districtEntries, setDistrictEntries] = useState("");
  const [stateEntries, setStateEntries] = useState("");

  const sports = [
    { value: "football", label: "Football" },
    { value: "boys-basketball", label: "Boys Basketball" },
    { value: "girls-basketball", label: "Girls Basketball" },
    { value: "boys-soccer", label: "Boys Soccer" },
    { value: "girls-soccer", label: "Girls Soccer" },
    { value: "field-hockey", label: "Field Hockey" },
    { value: "baseball", label: "Baseball" },
    { value: "softball", label: "Softball" },
    { value: "volleyball", label: "Volleyball" },
    { value: "track-field", label: "Track & Field" },
    { value: "boys-wrestling", label: "Boys Wrestling" },
    { value: "girls-wrestling", label: "Girls Wrestling" },
    { value: "lacrosse", label: "Lacrosse" },
    { value: "cross-country", label: "Cross Country" },
    { value: "swimming", label: "Swimming" },
  ];

  // Load session info and system settings
  useEffect(() => {
    Promise.all([
      fetch('/api/session-info').then((r) => r.json()),
      fetch('/api/settings').then((r) => r.json()),
    ]).then(([sessionResult, settingsResult]) => {
      if (sessionResult.role) {
        setSessionRole(sessionResult.role);
        if (sessionResult.role === 'pageowner' && sessionResult.sport) {
          setSelectedSport(sessionResult.sport);
          setNewsSport(sessionResult.sport);
        }
      }
      setSessionLoaded(true);
      if (settingsResult.success && settingsResult.data) {
        setSettings({ ...DEFAULT_SETTINGS, ...settingsResult.data });
        setHasIcalUrl(!!settingsResult.data.icalUrl);
      }
    }).catch(() => setSessionLoaded(true));
  }, []);

  // Load existing sport info when sport or tab changes
  useEffect(() => {
    if (uploadType !== "info") return;

    fetch('/api/sports')
      .then((r) => r.json())
      .then((result) => {
        if (result.success && result.data[selectedSport]) {
          const d = result.data[selectedSport];
          setHeadCoach(d.coach || "");
          setCoachEmail(d.coachEmail || "");
          setCoachPhoto(d.coachPhoto || "");
          setCoachPhotoPreview(d.coachPhoto || "");
          if (d.coachPhotoPosition) {
            const parts = d.coachPhotoPosition.split(' ');
            setCoachPos({ x: parseFloat(parts[0]) || 50, y: parseFloat(parts[1]) || 50 });
          } else {
            setCoachPos({ x: 50, y: 50 });
          }
          setProgramDescription(d.description || "");
          setTwitterUrl(d.twitterUrl || "");
          setInstagramUrl(d.instagramUrl || "");
        } else {
          setHeadCoach("");
          setCoachEmail("");
          setCoachPhoto("");
          setCoachPhotoPreview("");
          setCoachPos({ x: 50, y: 50 });
          setProgramDescription("");
          setTwitterUrl("");
          setInstagramUrl("");
        }
      })
      .catch((error) => console.error('Error loading sport info:', error));
  }, [selectedSport, uploadType]);

  useEffect(() => {
    if (uploadType !== "staff") return;
    fetch('/api/staff')
      .then((r) => r.json())
      .then((result) => {
        const data = (result.success && Array.isArray(result.data) && result.data.length > 0)
          ? result.data : DEFAULT_STAFF;
        setStaffMembers(data);
        const posMap: Record<string, { x: number; y: number }> = {};
        for (const m of data) {
          if (m.photoPosition) {
            const parts = m.photoPosition.split(' ');
            posMap[m.id] = { x: parseFloat(parts[0]) || 50, y: parseFloat(parts[1]) || 50 };
          } else {
            posMap[m.id] = { x: 50, y: 50 };
          }
        }
        setStaffPositions(posMap);
      })
      .catch((error) => {
        console.error('Error loading staff:', error);
        setStaffMembers(DEFAULT_STAFF);
      });
  }, [uploadType]);

  useEffect(() => {
    if (uploadType !== "facilities") return;
    fetch('/api/facilities')
      .then((r) => r.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data)) {
          setFacilities(result.data);
          const posMap: Record<string, { x: number; y: number }> = {};
          for (const f of result.data) {
            if (f.photoPosition) {
              const parts = f.photoPosition.split(' ');
              posMap[f.id] = { x: parseFloat(parts[0]) || 50, y: parseFloat(parts[1]) || 50 };
            } else {
              posMap[f.id] = { x: 50, y: 50 };
            }
          }
          setFacilityPositions(posMap);
        }
      })
      .catch((error) => console.error('Error loading facilities:', error));
  }, [uploadType]);

  useEffect(() => {
    if (uploadType !== "championships") return;
    fetch('/api/championships')
      .then((r) => r.json())
      .then((result) => {
        if (result.success) {
          const sport = result.data?.sports?.find((s: { slug: string }) => s.slug === selectedSport);
          setSportAchievements(sport?.achievements || []);
        }
      })
      .catch(() => {});
  }, [selectedSport, uploadType]);

  useEffect(() => {
    if (uploadType !== "individual-awards") return;
    fetch('/api/championships')
      .then((r) => r.json())
      .then((result) => {
        if (result.success) {
          const ind = result.data?.individual || {};
          setLeagueEntries((ind.league || []).join('\n'));
          setDistrictEntries((ind.district || []).join('\n'));
          setStateEntries((ind.state || []).join('\n'));
        }
      })
      .catch(() => {});
  }, [uploadType]);

  const handleLogout = async () => {
    if (sessionRole === 'pageowner') {
      await fetch('/api/page-owner-auth', { method: 'DELETE' });
    } else {
      await fetch('/api/admin-auth', { method: 'DELETE' });
    }
    router.push('/admin-login');
  };

  const handleSaveChampionships = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const res = await fetch('/api/championships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sport',
          slug: selectedSport,
          label: sports.find((s) => s.value === selectedSport)?.label || selectedSport,
          achievements: sportAchievements,
        }),
      });
      const result = await res.json();
      setMessage(result.success ? '✅ Championships saved.' : `❌ ${result.message}`);
    } catch {
      setMessage('❌ Error saving championships.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveIndividualSection = async (section: 'league' | 'district' | 'state', text: string) => {
    setIsLoading(true);
    setMessage("");
    try {
      const entries = text.split('\n').map((l) => l.trim()).filter(Boolean);
      const res = await fetch('/api/championships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'individual', section, entries }),
      });
      const result = await res.json();
      setMessage(result.success ? '✅ Individual awards saved.' : `❌ ${result.message}`);
    } catch {
      setMessage('❌ Error saving individual awards.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStaffFieldChange = (id: string, field: "name" | "email", value: string) => {
    setStaffMembers((prev) => prev.map((member) => (
      member.id === id ? { ...member, [field]: value } : member
    )));
  };

  const handleStaffPhotoUpload = async (id: string, file: File) => {
    setIsLoading(true);
    setMessage("");
    const sizeWarning = await checkImageSize(file);
    if (sizeWarning) { setMessage(sizeWarning); setIsLoading(false); return; }
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('staffId', id);
      const response = await fetch('/api/upload-staff-photo', { method: 'POST', body: formData });
      const result = await response.json();
      if (!result.success) {
        setMessage(`Error uploading staff photo: ${result.message}`);
        return;
      }
      setStaffMembers((prev) => prev.map((member) => (
        member.id === id ? { ...member, photo: result.path || "" } : member
      )));
      setMessage("Staff photo uploaded. Click Save Staff to publish.");
    } catch {
      setMessage("Error uploading staff photo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveStaff = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const staffWithPos = staffMembers.map((m) => ({
        ...m,
        photoPosition: `${Math.round(staffPositions[m.id]?.x ?? 50)}% ${Math.round(staffPositions[m.id]?.y ?? 50)}%`,
      }));
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff: staffWithPos }),
      });
      const result = await response.json();
      setMessage(result.success ? "Staff section saved successfully." : `Error: ${result.message}`);
    } catch {
      setMessage("Error saving staff section.");
    } finally {
      setIsLoading(false);
    }
  };

  const addFacility = () => {
    const id = `facility-${Date.now()}`;
    setFacilities((prev) => [...prev, { id, name: "", address: "", description: "", photo: "" }]);
  };

  const handleFacilityFieldChange = (id: string, field: "name" | "address" | "description", value: string) => {
    setFacilities((prev) => prev.map((facility) => (
      facility.id === id ? { ...facility, [field]: value } : facility
    )));
  };

  const handleFacilityPhotoUpload = async (id: string, file: File) => {
    setIsLoading(true);
    setMessage("");
    const sizeWarning = await checkImageSize(file);
    if (sizeWarning) { setMessage(sizeWarning); setIsLoading(false); return; }
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload-facility-photo', { method: 'POST', body: formData });
      const result = await response.json();
      if (!result.success) {
        setMessage(`Error uploading facility photo: ${result.message}`);
        return;
      }
      setFacilities((prev) => prev.map((facility) => (
        facility.id === id ? { ...facility, photo: result.path || "" } : facility
      )));
      setMessage("Facility photo uploaded. Click Save Facility to publish.");
    } catch {
      setMessage("Error uploading facility photo.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveFacility = async (facility: Facility) => {
    setIsLoading(true);
    setMessage("");
    try {
      const withPos = {
        ...facility,
        photoPosition: `${Math.round(facilityPositions[facility.id]?.x ?? 50)}% ${Math.round(facilityPositions[facility.id]?.y ?? 50)}%`,
      };
      const response = await fetch('/api/facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upsert', facility: withPos }),
      });
      const result = await response.json();
      setMessage(result.success ? "Facility saved successfully." : `Error: ${result.message}`);
    } catch {
      setMessage("Error saving facility.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFacility = async (facility: Facility) => {
    if (!facility.id) return;
    setIsLoading(true);
    setMessage("");
    try {
      const response = await fetch('/api/facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', facility: { id: facility.id } }),
      });
      const result = await response.json();
      if (result.success) {
        setFacilities((prev) => prev.filter((f) => f.id !== facility.id));
        setMessage("Facility deleted.");
      } else {
        setMessage(`Error: ${result.message}`);
      }
    } catch {
      setMessage("Error deleting facility.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Hero image handlers ──────────────────────────────────────────────────

  const handleHeroImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeroImageFile(file);
    setHeroImagePreview(URL.createObjectURL(file));
    setHeroImgPos({ x: 50, y: 30 });
  };

  const handleHeroUpload = async () => {
    if (!heroImageFile) return;
    setIsLoading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append('file', heroImageFile);
      formData.append('sport', selectedSport);
      const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
      const result = await res.json();
      if (result.success) {
        await fetch('/api/sports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sport: selectedSport,
            type: 'imagePosition',
            data: `${Math.round(heroImgPos.x)}% ${Math.round(heroImgPos.y)}%`,
          }),
        });
        setMessage(`✅ Hero image uploaded for ${currentSportLabel}.`);
        setHeroImageFile(null);
        setHeroImagePreview("");
      } else {
        setMessage(`❌ Error: ${result.message}`);
      }
    } catch {
      setMessage(`❌ Error uploading image.`);
    } finally {
      setIsLoading(false);
    }
  };

  const startHeroDrag = (clientX: number, clientY: number) => {
    setIsDraggingHero(true);
    heroDragLast.current = { x: clientX, y: clientY };
  };

  const moveHeroDrag = (clientX: number, clientY: number) => {
    if (!heroPreviewRef.current) return;
    const rect = heroPreviewRef.current.getBoundingClientRect();
    const dx = clientX - heroDragLast.current.x;
    const dy = clientY - heroDragLast.current.y;
    heroDragLast.current = { x: clientX, y: clientY };
    setHeroImgPos(prev => ({
      x: Math.max(0, Math.min(100, prev.x - (dx / rect.width) * 100)),
      y: Math.max(0, Math.min(100, prev.y - (dy / rect.height) * 100)),
    }));
  };

  // ── Image dimension check ────────────────────────────────────────────────

  const checkImageSize = (file: File, minPx = 300): Promise<string | null> =>
    new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        if (img.naturalWidth < minPx || img.naturalHeight < minPx) {
          resolve(`⚠️ This image is only ${img.naturalWidth}×${img.naturalHeight}px. Photos smaller than ${minPx}px will appear blurry. Please upload a higher-resolution photo.`);
        } else {
          resolve(null);
        }
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });

  // ── Shared photo drag handlers (staff / facility / coach) ────────────────

  const startPhotoDrag = (clientX: number, clientY: number, id: string) => {
    setDragActive(id);
    dragLastRef.current = { x: clientX, y: clientY };
  };

  const movePhotoDrag = (
    clientX: number,
    clientY: number,
    id: string,
    setter: (fn: (prev: { x: number; y: number }) => { x: number; y: number }) => void
  ) => {
    if (dragActive !== id) return;
    const el = previewRefs.current[id];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = clientX - dragLastRef.current.x;
    const dy = clientY - dragLastRef.current.y;
    dragLastRef.current = { x: clientX, y: clientY };
    setter((prev) => ({
      x: Math.max(0, Math.min(100, prev.x - (dx / rect.width) * 100)),
      y: Math.max(0, Math.min(100, prev.y - (dy / rect.height) * 100)),
    }));
  };

  // ─────────────────────────────────────────────────────────────────────────

  const handleSportInfoSubmit = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch('/api/sports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sport: selectedSport,
          type: 'info',
          data: {
            coach: headCoach,
            coachEmail,
            coachPhoto,
            coachPhotoPosition: `${Math.round(coachPos.x)}% ${Math.round(coachPos.y)}%`,
            description: programDescription,
            twitterUrl,
            instagramUrl,
          },
        }),
      });

      const result = await response.json();
      setMessage(result.success
        ? `✅ Success! Sport information updated for ${selectedSport}.`
        : `❌ Error: ${result.message}`
      );
    } catch {
      setMessage(`❌ Error updating sport information.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoachPhotoUpload = async (file: File) => {
    setIsLoading(true);
    setMessage("");
    const sizeWarning = await checkImageSize(file);
    if (sizeWarning) { setMessage(sizeWarning); setIsLoading(false); return; }
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sport', selectedSport);
      const response = await fetch('/api/upload-coach-photo', { method: 'POST', body: formData });
      const result = await response.json();
      if (!result.success) {
        setMessage(`Error uploading coach photo: ${result.message}`);
        return;
      }
      setCoachPhoto(result.path || "");
      setCoachPhotoPreview(result.path || "");
      setMessage("Coach photo uploaded. Click Save Sport Information to publish.");
    } catch {
      setMessage("Error uploading coach photo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewsImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewsImageFile(file);
      setNewsImagePreview(URL.createObjectURL(file));
    }
  };

  const handleNewsSubmit = async () => {
    if (!newsTitle.trim() || !newsAuthor.trim() || !newsDate || !newsBody.trim()) {
      setMessage("❌ Please fill in all required fields (title, author, date, body).");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      let imagePath = "";
      if (newsImageFile) {
        const formData = new FormData();
        formData.append('file', newsImageFile);
        const uploadRes = await fetch('/api/upload-news-image', { method: 'POST', body: formData });
        const uploadResult = await uploadRes.json();
        if (uploadResult.success) {
          imagePath = uploadResult.filename;
        } else {
          setMessage(`❌ Error uploading image: ${uploadResult.message}`);
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newsTitle,
          image: imagePath,
          author: newsAuthor,
          date: newsDate,
          body: newsBody,
          sport: newsSport,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage("✅ Article published successfully!");
        setNewsTitle("");
        setNewsBody("");
        setNewsImageFile(null);
        setNewsImagePreview("");
        setNewsDate(new Date().toISOString().split('T')[0]);
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch {
      setMessage("❌ Error publishing article.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIcalSync = async () => {
    setIcalSyncing(true);
    setIcalResult("");
    try {
      const body = isPageOwner ? { sport: selectedSport } : { sport: selectedSport };
      const res = await fetch('/api/import-ical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (result.success) {
        const match = result.imported?.find((s: { sport: string; count: number }) => s.sport === selectedSport);
        if (match) {
          setIcalResult(`✅ Synced ${match.count} game${match.count !== 1 ? 's' : ''} for ${currentSportLabel}.`);
        } else {
          setIcalResult(`✅ Sync complete — no events found for ${currentSportLabel} in the feed.`);
        }
      } else {
        setIcalResult(`❌ ${result.message}`);
      }
    } catch {
      setIcalResult("❌ Network error. Could not reach the import API.");
    } finally {
      setIcalSyncing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setMessage("");

    if (uploadType === "image") {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sport', selectedSport);

      try {
        const response = await fetch('/api/upload-image', { method: 'POST', body: formData });
        const result = await response.json();
        setMessage(result.success
          ? `✅ Success! Image uploaded for ${selectedSport}.`
          : `❌ Error: ${result.message}`
        );
      } catch {
        setMessage(`❌ Error uploading image. Please try again.`);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Handle CSV upload (schedule/roster)
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const rows = text.split("\n").map(row => row.split(","));
        const data = rows.slice(1).filter(row => row.length > 1 && row[0].trim() !== "");

        const parsedData = uploadType === "schedule"
          ? data.map(row => ({
              date: row[0]?.trim() || "",
              opponent: row[1]?.trim() || "",
              homeAway: row[2]?.trim() || "",
              eventType: row[3]?.trim() || "",
              time: row[4]?.trim() || "",
            }))
          : data.map(row => ({
              number: row[0]?.trim() || "",
              name: row[1]?.trim() || "",
              position: row[2]?.trim() || "",
              year: row[3]?.trim() || "",
            }));

        const response = await fetch('/api/sports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sport: selectedSport, type: uploadType, data: parsedData }),
        });

        const result = await response.json();
        setMessage(result.success
          ? `✅ Success! ${uploadType === "schedule" ? "Schedule" : "Roster"} saved with ${parsedData.length} entries.`
          : `❌ Error: ${result.message}`
        );
      } catch {
        setMessage(`❌ Error processing file. Please check the format and try again.`);
      } finally {
        setIsLoading(false);
      }
    };

    reader.readAsText(file);
  };

  const isPageOwner = sessionRole === 'pageowner';
  const currentSportLabel = sports.find((s) => s.value === selectedSport)?.label || selectedSport;

  const tabLabels: Record<string, string> = {
    schedule: "Schedule",
    roster: "Roster",
    image: "Image",
    info: "Info",
    championships: "Champ.",
    news: "News",
    staff: "Staff",
    facilities: "Facilities",
    "individual-awards": "Ind. Awards",
  };
  const availableUploadTypes = isPageOwner
    ? (["schedule", "roster", "image", "info", "championships", "news"] as const)
    : (["schedule", "roster", "image", "info", "championships", "news", "staff", "facilities", "individual-awards"] as const);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="text-white shadow-lg" style={{ backgroundColor: settings.primaryColor }}>
        <nav className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              {settings.logo && (
                <img src={settings.logo} alt="School Logo" className="h-12" />
              )}
              <span className="text-2xl font-bold">
                {isPageOwner ? `${currentSportLabel} Admin` : "Admin Panel"}
              </span>
            </Link>
            <div className="flex gap-3">
              {!isPageOwner && (
                <Link href="/system-admin" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded transition">
                  System Admin
                </Link>
              )}
              <Link href="/" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded transition">
                Back to Home
              </Link>
              <button onClick={handleLogout} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded transition">
                Logout
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-8 text-gray-800">Update Sports Information</h1>

          {/* Sport Selection - hidden for non-sport tabs */}
          {!["news", "staff", "facilities", "individual-awards"].includes(uploadType) && (
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-2 text-gray-700">Select Sport</label>
              {isPageOwner ? (
                <div className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-800 bg-gray-50 font-semibold">
                  {currentSportLabel}
                </div>
              ) : (
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
                  disabled={isLoading || !sessionLoaded}
                >
                  {sports.map(sport => (
                    <option key={sport.value} value={sport.value}>{sport.label}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Tab Selection */}
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-2 text-gray-700">Update Type</label>
            <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
              {availableUploadTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => { setUploadType(type); setMessage(""); }}
                  disabled={isLoading}
                  className={`py-3 px-2 rounded-lg font-semibold transition text-sm ${
                    uploadType === type
                      ? "text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  style={uploadType === type ? { backgroundColor: settings.primaryColor } : undefined}
                >
                  {tabLabels[type]}
                </button>
              ))}
            </div>
          </div>

          {/* ── News Article Form ─────────────────────────────────────── */}
          {uploadType === "news" && (
            <div className="space-y-5">
              <div className="p-4 bg-gray-50 border-l-4 rounded" style={{ borderColor: settings.primaryColor }}>
                <h3 className="font-semibold mb-1" style={{ color: settings.primaryColor }}>Write a News Article</h3>
                <p className="text-sm text-gray-600">
                  Articles appear on the public News page immediately after publishing.
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  placeholder="e.g., Football Team Advances to State Finals"
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
                />
              </div>

              {/* Author + Date row */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">
                    Author <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newsAuthor}
                    onChange={(e) => setNewsAuthor(e.target.value)}
                    placeholder="e.g., Coach Smith"
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newsDate}
                    onChange={(e) => setNewsDate(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
                  />
                </div>
              </div>

              {/* Sport Tag */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">Sport Tag</label>
                {isPageOwner ? (
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-800 bg-gray-50 font-semibold">
                    {currentSportLabel}
                  </div>
                ) : (
                  <select
                    value={newsSport}
                    onChange={(e) => setNewsSport(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
                  >
                    <option value="">General Athletics (no sport tag)</option>
                    {sports.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-gray-500 mt-1">Displayed as a colored label on the article</p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Article Image <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleNewsImageChange}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
                <p className="text-xs text-gray-500 mt-1">Best: 1200×675 px (16:9 landscape) · JPG, PNG, or WEBP · max 5 MB</p>
                {newsImagePreview && (
                  <div className="mt-3 relative inline-block">
                    <img
                      src={newsImagePreview}
                      alt="Preview"
                      className="h-36 rounded-lg object-cover border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => { setNewsImageFile(null); setNewsImagePreview(""); }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Article Body <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newsBody}
                  onChange={(e) => setNewsBody(e.target.value)}
                  placeholder="Write your article here..."
                  rows={10}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 resize-y"
                />
              </div>

              {/* Publish Button */}
              <button
                onClick={handleNewsSubmit}
                disabled={isLoading}
                className={`w-full py-4 px-6 rounded-lg font-bold text-lg text-white transition ${
                  isLoading ? "bg-gray-400 cursor-not-allowed" : "hover:opacity-90"
                }`}
                style={!isLoading ? { backgroundColor: settings.primaryColor } : undefined}
              >
                {isLoading ? "Publishing..." : "Publish Article"}
              </button>
            </div>
          )}

          {/* ── Sport Info Form ───────────────────────────────────────── */}
          {uploadType === "info" && (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 border-l-4 rounded mb-6" style={{ borderColor: settings.primaryColor }}>
                <h3 className="font-semibold mb-2" style={{ color: settings.primaryColor }}>Update Sport Information:</h3>
                <p className="text-sm text-gray-700">
                  Update the head coach name, contact email, and program description for this sport.
                </p>
              </div>

              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700">Head Coach Name</label>
                <input
                  type="text"
                  value={headCoach}
                  onChange={(e) => setHeadCoach(e.target.value)}
                  placeholder="e.g., John Smith"
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700">Coach Email</label>
                <input
                  type="email"
                  value={coachEmail}
                  onChange={(e) => setCoachEmail(e.target.value)}
                  placeholder="e.g., coach@school.org"
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700">Coach Photo</label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  disabled={isLoading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCoachPhotoUpload(file);
                  }}
                  className={`w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
                <p className="text-xs text-gray-500 mt-1">Best: 800×800 px (square or portrait) · JPG, PNG, or WEBP · max 5 MB</p>
                {coachPhotoPreview && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Drag to adjust crop position:</p>
                    <div
                      ref={(el) => { previewRefs.current['__coach__'] = el; }}
                      className="relative overflow-hidden rounded-lg select-none"
                      style={{ aspectRatio: '3/2', cursor: dragActive === '__coach__' ? 'grabbing' : 'grab', transform: 'translateZ(0)' }}
                      onMouseDown={(e) => { startPhotoDrag(e.clientX, e.clientY, '__coach__'); e.preventDefault(); }}
                      onMouseMove={(e) => {
                        if (dragActive === '__coach__') {
                          movePhotoDrag(e.clientX, e.clientY, '__coach__', (fn) => setCoachPos(fn));
                        }
                      }}
                      onMouseUp={() => setDragActive(null)}
                      onMouseLeave={() => setDragActive(null)}
                      onTouchStart={(e) => { const t = e.touches[0]; startPhotoDrag(t.clientX, t.clientY, '__coach__'); }}
                      onTouchMove={(e) => {
                        const t = e.touches[0];
                        movePhotoDrag(t.clientX, t.clientY, '__coach__', (fn) => setCoachPos(fn));
                      }}
                      onTouchEnd={() => setDragActive(null)}
                    >
                      <img
                        src={coachPhotoPreview}
                        alt="Coach"
                        draggable={false}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        style={{ objectFit: 'cover', objectPosition: `${coachPos.x}% ${coachPos.y}%` }}
                      />
                      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded pointer-events-none">
                        ⤡ Drag to reposition
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Position: {Math.round(coachPos.x)}% h · {Math.round(coachPos.y)}% v
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700">About the Program</label>
                <textarea
                  value={programDescription}
                  onChange={(e) => setProgramDescription(e.target.value)}
                  placeholder="Describe the program, achievements, traditions, etc."
                  rows={6}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
                />
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Social Media</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-lg font-semibold mb-2 text-gray-700">X (Twitter) URL</label>
                    <input
                      type="url"
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.target.value)}
                      placeholder="https://x.com/yourteam"
                      disabled={isLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-semibold mb-2 text-gray-700">Instagram URL</label>
                    <input
                      type="url"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="https://www.instagram.com/yourteam"
                      disabled={isLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSportInfoSubmit}
                disabled={isLoading}
                className={`w-full py-4 px-6 rounded-lg font-bold text-lg text-white transition ${
                  isLoading ? "bg-gray-400 cursor-not-allowed" : "hover:opacity-90"
                }`}
                style={!isLoading ? { backgroundColor: settings.primaryColor } : undefined}
              >
                {isLoading ? "Saving..." : "Save Sport Information"}
              </button>
            </div>
          )}

          {/* ── CSV Upload (schedule / roster) ───────────────────────── */}
          {(uploadType === "schedule" || uploadType === "roster") && (
            <>
              {/* iCal sync — schedule tab only */}
              {uploadType === "schedule" && hasIcalUrl && (
                <div className="mb-6 p-5 border-2 rounded-lg" style={{ borderColor: settings.secondaryColor }}>
                  <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                    <div>
                      <p className="font-bold text-gray-800">Sync from iCal Feed</p>
                      <p className="text-sm text-gray-500">
                        Pull the latest schedule for {currentSportLabel} directly from the connected iCal feed.
                      </p>
                    </div>
                    <button
                      onClick={handleIcalSync}
                      disabled={icalSyncing}
                      className={`px-5 py-2 rounded-lg font-bold text-white transition flex items-center gap-2 ${
                        icalSyncing ? "bg-gray-300 cursor-not-allowed" : "hover:opacity-90"
                      }`}
                      style={!icalSyncing ? { backgroundColor: settings.primaryColor } : undefined}
                    >
                      {icalSyncing ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Syncing…
                        </>
                      ) : "Sync Now"}
                    </button>
                  </div>
                  {icalResult && (
                    <p className={`text-sm rounded px-3 py-2 ${
                      icalResult.startsWith("✅")
                        ? "bg-green-50 border border-green-200 text-green-800"
                        : "bg-red-50 border border-red-200 text-red-800"
                    }`}>
                      {icalResult}
                    </p>
                  )}
                </div>
              )}

              <div className="mb-6 p-4 bg-gray-50 border-l-4 rounded" style={{ borderColor: settings.primaryColor }}>
                <h3 className="font-semibold mb-2" style={{ color: settings.primaryColor }}>CSV Format Required:</h3>
                {uploadType === "schedule" ? (
                  <div className="text-sm text-gray-700">
                    <p className="mb-2">Your CSV should have these columns (with header row):</p>
                    <code className="block bg-white p-2 rounded text-xs border">
                      Date,Opponent,HomeAway,EventType,Time<br/>
                      Sep 5 2026,Central High,Home,League,7:00 PM<br/>
                      Sep 12 2026,North Valley,Away,Non-League,7:00 PM
                    </code>
                  </div>
                ) : (
                  <div className="text-sm text-gray-700">
                    <p className="mb-2">Your CSV should have these columns (with header row):</p>
                    <code className="block bg-white p-2 rounded text-xs border">
                      Number,Name,Position,Year<br/>
                      12,John Doe,QB,Senior<br/>
                      24,Mike Smith,RB,Junior
                    </code>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-lg font-semibold mb-2 text-gray-700">Upload CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </>
          )}

          {/* ── Hero Image Upload with drag-to-position ───────────────── */}
          {uploadType === "image" && (
            <div className="space-y-5">
              <div className="p-4 bg-gray-50 border-l-4 rounded" style={{ borderColor: settings.primaryColor }}>
                <h3 className="font-semibold mb-2" style={{ color: settings.primaryColor }}>Hero Image Upload</h3>
                <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                  <li>Recommended: 1920×600 px or wider · JPG, PNG, or WEBP · max 5 MB</li>
                  <li>Select a file, then drag the preview to set the crop position</li>
                  <li>Click <strong>Upload Hero Image</strong> when the framing looks right</li>
                </ul>
              </div>

              {/* File selector */}
              <div>
                <label className="block text-lg font-semibold mb-2 text-gray-700">Select Image</label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleHeroImageSelect}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              {/* Drag-to-position preview */}
              {heroImagePreview && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">
                    Drag the preview to adjust the crop position:
                  </p>
                  <div
                    ref={heroPreviewRef}
                    className="relative overflow-hidden rounded-lg select-none"
                    style={{ height: '220px', cursor: isDraggingHero ? 'grabbing' : 'grab' }}
                    onMouseDown={(e) => { startHeroDrag(e.clientX, e.clientY); e.preventDefault(); }}
                    onMouseMove={(e) => { if (isDraggingHero) moveHeroDrag(e.clientX, e.clientY); }}
                    onMouseUp={() => setIsDraggingHero(false)}
                    onMouseLeave={() => setIsDraggingHero(false)}
                    onTouchStart={(e) => { const t = e.touches[0]; startHeroDrag(t.clientX, t.clientY); }}
                    onTouchMove={(e) => { const t = e.touches[0]; moveHeroDrag(t.clientX, t.clientY); }}
                    onTouchEnd={() => setIsDraggingHero(false)}
                  >
                    {/* The image — dragging pans it */}
                    <img
                      src={heroImagePreview}
                      alt="Hero preview"
                      draggable={false}
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      style={{ objectFit: 'cover', objectPosition: `${heroImgPos.x}% ${heroImgPos.y}%` }}
                    />
                    {/* Overlay: simulates the primary-color tint shown on sport hero pages */}
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                      style={{ backgroundColor: `${settings.primaryColor}75` }}
                    >
                      <p className="text-white text-2xl font-bold drop-shadow">
                        {sports.find(s => s.value === selectedSport)?.label}
                      </p>
                      <p className="text-white/70 text-sm mt-1">Hero image preview</p>
                    </div>
                    {/* Drag hint badge */}
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded pointer-events-none">
                      ⤡ Drag to reposition
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Crop position: {Math.round(heroImgPos.x)}% horizontal · {Math.round(heroImgPos.y)}% vertical
                  </p>
                </div>
              )}

              {/* Upload button */}
              <button
                onClick={handleHeroUpload}
                disabled={isLoading || !heroImageFile}
                className={`w-full py-4 px-6 rounded-lg font-bold text-lg text-white transition ${
                  isLoading || !heroImageFile ? "bg-gray-300 cursor-not-allowed" : "hover:opacity-90"
                }`}
                style={!isLoading && heroImageFile ? { backgroundColor: settings.primaryColor } : undefined}
              >
                {isLoading ? "Uploading…" : heroImageFile ? "Upload Hero Image" : "Select an image first"}
              </button>
            </div>
          )}

          {/* Staff section editor */}
          {uploadType === "staff" && (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 border-l-4 rounded" style={{ borderColor: settings.primaryColor }}>
                <h3 className="font-semibold mb-2" style={{ color: settings.primaryColor }}>Athletics Staff</h3>
                <p className="text-sm text-gray-700">
                  Update names, emails, and photos for the About page leadership cards.
                </p>
              </div>

              {staffMembers.map((member) => (
                <div key={member.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <p className="font-semibold text-gray-800">{member.role}</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700">Name</label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => handleStaffFieldChange(member.id, "name", e.target.value)}
                        disabled={isLoading}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700">Email</label>
                      <input
                        type="email"
                        value={member.email}
                        onChange={(e) => handleStaffFieldChange(member.id, "email", e.target.value)}
                        disabled={isLoading}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Photo</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      disabled={isLoading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleStaffPhotoUpload(member.id, file);
                      }}
                      className={`w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition ${
                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">Best: 800×800 px (square or portrait) · JPG, PNG, or WEBP · max 5 MB</p>
                    {member.photo && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">Drag to adjust crop position:</p>
                        <div
                          ref={(el) => { previewRefs.current[member.id] = el; }}
                          className="relative overflow-hidden rounded-lg select-none"
                          style={{ aspectRatio: '16/10', cursor: dragActive === member.id ? 'grabbing' : 'grab', transform: 'translateZ(0)' }}
                          onMouseDown={(e) => { startPhotoDrag(e.clientX, e.clientY, member.id); e.preventDefault(); }}
                          onMouseMove={(e) => {
                            if (dragActive === member.id) {
                              movePhotoDrag(e.clientX, e.clientY, member.id, (fn) =>
                                setStaffPositions((prev) => ({ ...prev, [member.id]: fn(prev[member.id] ?? { x: 50, y: 50 }) }))
                              );
                            }
                          }}
                          onMouseUp={() => setDragActive(null)}
                          onMouseLeave={() => setDragActive(null)}
                          onTouchStart={(e) => { const t = e.touches[0]; startPhotoDrag(t.clientX, t.clientY, member.id); }}
                          onTouchMove={(e) => {
                            const t = e.touches[0];
                            movePhotoDrag(t.clientX, t.clientY, member.id, (fn) =>
                              setStaffPositions((prev) => ({ ...prev, [member.id]: fn(prev[member.id] ?? { x: 50, y: 50 }) }))
                            );
                          }}
                          onTouchEnd={() => setDragActive(null)}
                        >
                          <img
                            src={member.photo}
                            alt={member.name || member.role}
                            draggable={false}
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            style={{ objectFit: 'cover', objectPosition: `${staffPositions[member.id]?.x ?? 50}% ${staffPositions[member.id]?.y ?? 50}%` }}
                          />
                          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded pointer-events-none">
                            ⤡ Drag to reposition
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Position: {Math.round(staffPositions[member.id]?.x ?? 50)}% h · {Math.round(staffPositions[member.id]?.y ?? 50)}% v
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <button
                onClick={handleSaveStaff}
                disabled={isLoading}
                className={`w-full py-4 px-6 rounded-lg font-bold text-lg text-white transition ${
                  isLoading ? "bg-gray-400 cursor-not-allowed" : "hover:opacity-90"
                }`}
                style={!isLoading ? { backgroundColor: settings.primaryColor } : undefined}
              >
                {isLoading ? "Saving..." : "Save Staff"}
              </button>
            </div>
          )}

          {/* Facilities section editor */}
          {uploadType === "facilities" && (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 border-l-4 rounded" style={{ borderColor: settings.primaryColor }}>
                <h3 className="font-semibold mb-2" style={{ color: settings.primaryColor }}>Facilities</h3>
                <p className="text-sm text-gray-700">
                  Add or edit facility name, address, photo, and description/history shown on About page.
                </p>
              </div>

              <button
                onClick={addFacility}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-semibold border-2 transition ${
                  isLoading ? "opacity-50 cursor-not-allowed border-gray-300 text-gray-400" : "hover:opacity-80"
                }`}
                style={!isLoading ? { borderColor: settings.primaryColor, color: settings.primaryColor } : undefined}
              >
                Add Facility
              </button>

              {facilities.map((facility) => (
                <div key={facility.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Facility Name</label>
                    <input
                      type="text"
                      value={facility.name}
                      onChange={(e) => handleFacilityFieldChange(facility.id, "name", e.target.value)}
                      disabled={isLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Address</label>
                    <input
                      type="text"
                      value={facility.address}
                      onChange={(e) => handleFacilityFieldChange(facility.id, "address", e.target.value)}
                      disabled={isLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Description / History</label>
                    <textarea
                      value={facility.description}
                      onChange={(e) => handleFacilityFieldChange(facility.id, "description", e.target.value)}
                      rows={5}
                      disabled={isLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700">Photo</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      disabled={isLoading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFacilityPhotoUpload(facility.id, file);
                      }}
                      className={`w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition ${
                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">Best: 1200×900 px (landscape) · JPG, PNG, or WEBP · max 5 MB</p>
                    {facility.photo && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">Drag to adjust crop position:</p>
                        <div
                          ref={(el) => { previewRefs.current[facility.id] = el; }}
                          className="relative overflow-hidden rounded-lg select-none"
                          style={{ aspectRatio: '4/3', cursor: dragActive === facility.id ? 'grabbing' : 'grab', transform: 'translateZ(0)' }}
                          onMouseDown={(e) => { startPhotoDrag(e.clientX, e.clientY, facility.id); e.preventDefault(); }}
                          onMouseMove={(e) => {
                            if (dragActive === facility.id) {
                              movePhotoDrag(e.clientX, e.clientY, facility.id, (fn) =>
                                setFacilityPositions((prev) => ({ ...prev, [facility.id]: fn(prev[facility.id] ?? { x: 50, y: 50 }) }))
                              );
                            }
                          }}
                          onMouseUp={() => setDragActive(null)}
                          onMouseLeave={() => setDragActive(null)}
                          onTouchStart={(e) => { const t = e.touches[0]; startPhotoDrag(t.clientX, t.clientY, facility.id); }}
                          onTouchMove={(e) => {
                            const t = e.touches[0];
                            movePhotoDrag(t.clientX, t.clientY, facility.id, (fn) =>
                              setFacilityPositions((prev) => ({ ...prev, [facility.id]: fn(prev[facility.id] ?? { x: 50, y: 50 }) }))
                            );
                          }}
                          onTouchEnd={() => setDragActive(null)}
                        >
                          <img
                            src={facility.photo}
                            alt={facility.name || "Facility"}
                            draggable={false}
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            style={{ objectFit: 'cover', objectPosition: `${facilityPositions[facility.id]?.x ?? 50}% ${facilityPositions[facility.id]?.y ?? 50}%` }}
                          />
                          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded pointer-events-none">
                            ⤡ Drag to reposition
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Position: {Math.round(facilityPositions[facility.id]?.x ?? 50)}% h · {Math.round(facilityPositions[facility.id]?.y ?? 50)}% v
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => saveFacility(facility)}
                      disabled={isLoading}
                      className={`py-3 px-4 rounded-lg font-semibold text-white transition ${
                        isLoading ? "bg-gray-400 cursor-not-allowed" : "hover:opacity-90"
                      }`}
                      style={!isLoading ? { backgroundColor: settings.primaryColor } : undefined}
                    >
                      Save Facility
                    </button>
                    <button
                      onClick={() => deleteFacility(facility)}
                      disabled={isLoading}
                      className={`py-3 px-4 rounded-lg font-semibold border-2 transition ${
                        isLoading ? "opacity-50 cursor-not-allowed border-gray-300 text-gray-400" : "border-red-500 text-red-600 hover:bg-red-50"
                      }`}
                    >
                      Delete Facility
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Championships Tab ─────────────────────────────────────── */}
          {uploadType === "championships" && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 border-l-4 rounded" style={{ borderColor: settings.primaryColor }}>
                <h3 className="font-semibold mb-1" style={{ color: settings.primaryColor }}>
                  Team Championships — {sports.find((s) => s.value === selectedSport)?.label || selectedSport}
                </h3>
                <p className="text-sm text-gray-600">Add or edit championship titles and the years won. Each row is one category.</p>
              </div>

              {sportAchievements.map((ach, idx) => (
                <div key={ach.id} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={ach.title}
                      onChange={(e) => setSportAchievements((prev) => prev.map((a, i) => i === idx ? { ...a, title: e.target.value } : a))}
                      placeholder="e.g. Section Champions"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 mb-1"
                    />
                    <input
                      type="text"
                      value={ach.years}
                      onChange={(e) => setSportAchievements((prev) => prev.map((a, i) => i === idx ? { ...a, years: e.target.value } : a))}
                      placeholder="e.g. 2018, 2019, 2022"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800"
                    />
                  </div>
                  <button
                    onClick={() => setSportAchievements((prev) => prev.filter((_, i) => i !== idx))}
                    className="mt-1 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition"
                    title="Remove"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              <button
                onClick={() => setSportAchievements((prev) => [...prev, { id: String(Date.now()), title: "", years: "" }])}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition text-sm"
              >
                + Add Achievement
              </button>

              <button
                onClick={handleSaveChampionships}
                disabled={isLoading}
                className={`w-full py-3 rounded-lg font-semibold text-white transition ${isLoading ? "bg-gray-400 cursor-not-allowed" : "hover:opacity-90"}`}
                style={!isLoading ? { backgroundColor: settings.primaryColor } : undefined}
              >
                Save Championships
              </button>
            </div>
          )}

          {/* ── Individual Awards Tab ──────────────────────────────────── */}
          {uploadType === "individual-awards" && (
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 border-l-4 rounded" style={{ borderColor: settings.primaryColor }}>
                <h3 className="font-semibold mb-1" style={{ color: settings.primaryColor }}>Individual Accomplishments</h3>
                <p className="text-sm text-gray-600">One entry per line. Each section saves independently.</p>
              </div>

              {([
                { key: "league" as const, label: "League Champions", value: leagueEntries, setter: setLeagueEntries },
                { key: "district" as const, label: "District Champions", value: districtEntries, setter: setDistrictEntries },
                { key: "state" as const, label: "PIAA State Champions", value: stateEntries, setter: setStateEntries },
              ]).map(({ key, label, value, setter }) => (
                <div key={key}>
                  <label className="block font-semibold text-gray-700 mb-2">{label}</label>
                  <textarea
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 font-mono resize-y"
                    placeholder={"e.g. 2024 - Swimming - Jane Doe - 100 Butterfly"}
                  />
                  <button
                    onClick={() => handleSaveIndividualSection(key, value)}
                    disabled={isLoading}
                    className={`mt-2 w-full py-2 rounded-lg font-semibold text-white transition text-sm ${isLoading ? "bg-gray-400 cursor-not-allowed" : "hover:opacity-90"}`}
                    style={!isLoading ? { backgroundColor: settings.primaryColor } : undefined}
                  >
                    Save {label}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-blue-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {uploadType === "news"
                ? "Publishing article..."
                : uploadType === "image"
                  ? "Uploading image..."
                  : uploadType === "info"
                    ? "Saving information..."
                    : uploadType === "staff"
                      ? "Saving staff..."
                      : uploadType === "facilities"
                        ? "Saving facilities..."
                        : uploadType === "championships"
                          ? "Saving championships..."
                          : uploadType === "individual-awards"
                            ? "Saving individual awards..."
                            : "Processing and saving..."}
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

          {/* How-to instructions (CSV tabs only) */}
          {(uploadType === "schedule" || uploadType === "roster") && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">How to Use:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Select the sport you want to update</li>
                <li>Choose what you want to upload (Schedule or Roster)</li>
                <li>Export your data as CSV (make sure format matches above)</li>
                <li>Click &quot;Choose File&quot; and select your CSV</li>
                <li>Wait for the success message, then visit the sport page to see your updates!</li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-white py-8 mt-12" style={{ backgroundColor: settings.primaryColor }}>
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} {settings.schoolName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
