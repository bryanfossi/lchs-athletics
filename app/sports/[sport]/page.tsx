"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Static sport info
const sportsInfo: Record<string, any> = {
  football: {
    name: "Football",
    season: "Fall",
    image: "/Football.jpg",
    description: "The Lancaster Catholic Crusaders football program has a rich tradition of excellence, competing at the highest level in District 3.",
    coach: "Head Coach TBD",
  },
  "boys-basketball": {
    name: "Boys Basketball",
    season: "Winter",
    image: "/Football.jpg",
    description: "The Crusaders basketball program has won multiple championships and continues to compete at the highest level.",
    coach: "Head Coach TBD",
  },
  "girls-basketball": {
    name: "Girls Basketball",
    season: "Winter",
    image: "/Football.jpg",
    description: "The Lady Crusaders basketball program has a tradition of excellence and championship success.",
    coach: "Head Coach TBD",
  },
  "boys-soccer": {
    name: "Boys Soccer",
    season: "Fall",
    image: "/Football.jpg",
    description: "The Crusaders soccer program competes in the competitive Lancaster-Lebanon League.",
    coach: "Head Coach TBD",
  },
  "girls-soccer": {
    name: "Girls Soccer",
    season: "Fall",
    image: "/Football.jpg",
    description: "The Lady Crusaders soccer program has built a tradition of skill and sportsmanship.",
    coach: "Head Coach TBD",
  },
  "field-hockey": {
    name: "Field Hockey",
    season: "Fall",
    image: "/Football.jpg",
    description: "The Crusaders field hockey program competes at the highest level in District 3.",
    coach: "Head Coach TBD",
  },
  baseball: {
    name: "Baseball",
    season: "Spring",
    image: "/Football.jpg",
    description: "The Crusaders baseball program has a rich history of success and championship play.",
    coach: "Head Coach TBD",
  },
  softball: {
    name: "Softball",
    season: "Spring",
    image: "/Football.jpg",
    description: "The Lady Crusaders softball program competes with pride and determination.",
    coach: "Head Coach TBD",
  },
  volleyball: {
    name: "Volleyball",
    season: "Fall",
    image: "/Football.jpg",
    description: "The Crusaders volleyball program has built a reputation for excellence.",
    coach: "Head Coach TBD",
  },
  "track-field": {
    name: "Track & Field",
    season: "Spring",
    image: "/Football.jpg",
    description: "The Crusaders track & field program has produced numerous district and state champions.",
    coach: "Head Coach TBD",
  },
  "boys-wrestling": {
    name: "Boys Wrestling",
    season: "Winter",
    image: "/Football.jpg",
    description: "The Crusaders wrestling program has a proud tradition of individual and team success.",
    coach: "Head Coach TBD",
  },
  "girls-wrestling": {
    name: "Girls Wrestling",
    season: "Winter",
    image: "/Football.jpg",
    description: "The Lady Crusaders wrestling program is building a strong foundation for future success.",
    coach: "Head Coach TBD",
  },
  lacrosse: {
    name: "Lacrosse",
    season: "Spring",
    image: "/Football.jpg",
    description: "The Crusaders lacrosse program continues to grow and compete at a high level.",
    coach: "Head Coach TBD",
  },
  "cross-country": {
    name: "Cross Country",
    season: "Fall",
    image: "/Football.jpg",
    description: "The Crusaders cross country program has a history of producing strong runners.",
    coach: "Head Coach TBD",
  },
  swimming: {
    name: "Swimming",
    season: "Winter",
    image: "/Football.jpg",
    description: "The Crusaders swimming program competes at Franklin & Marshall's Kunkel Aquatic Center.",
    coach: "Head Coach TBD",
  },
};

export default function SportPage() {
  const pathname = usePathname();
  const sportSlug = pathname?.split("/").pop() || "";
  const sport = sportsInfo[sportSlug];
  
  const [schedule, setSchedule] = useState<any[]>([]);
  const [roster, setRoster] = useState<any[]>([]);
  const [sportImage, setSportImage] = useState<string>("");
  const [coachName, setCoachName] = useState<string>("");        // ADD THIS
const [coachEmail, setCoachEmail] = useState<string>("");      // ADD THIS
const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dynamic data from API
    const fetchData = async () => {
      try {
        const response = await fetch('/api/sports');
        const result = await response.json();
        
        if (result.success && result.data[sportSlug]) {
          setSchedule(result.data[sportSlug].schedule || []);
          setRoster(result.data[sportSlug].roster || []);
          setSportImage(result.data[sportSlug].image || sport.image);
          setCoachName(result.data[sportSlug].coach || sport.coach);           // ADD THIS
        setCoachEmail(result.data[sportSlug].coachEmail || "");              // ADD THIS
        setDescription(result.data[sportSlug].description || sport.description); // ADD THIS
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sportSlug]);

  if (!sport) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Sport Not Found</h1>
          <Link href="/" className="text-purple-600 hover:text-purple-800">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-purple-900 text-white shadow-lg">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <img src="/lchs-banner-logo.png" alt="LCHS Logo" className="h-12" />
              <span className="text-2xl font-bold">Lancaster Catholic Athletics</span>
            </Link>
            <ul className="flex space-x-6">
              <li><Link href="/" className="hover:text-purple-300 transition">Home</Link></li>
              <li><Link href="/#sports" className="hover:text-purple-300 transition">Sports</Link></li>
              <li><Link href="/schedule" className="hover:text-purple-300 transition">Schedule</Link></li>
            </ul>
          </div>
        </nav>
      </header>

      {/* Sport Hero */}
      <section className="relative text-white overflow-hidden" style={{minHeight: '400px', paddingTop: '60px', paddingBottom: '60px'}}>
        <img 
          src={sportImage || sport.image || "/Football.jpg"}
          alt={`${sport.name} background`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 20%',
            zIndex: 0
          }}
        />
        <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(88, 28, 135, 0.4)', zIndex: 1}}></div>
        <div style={{position: 'relative', zIndex: 2}} className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">{sport.name}</h1>
<p className="text-xl mb-2">{sport.season} Sport</p>
<p className="text-lg">{coachName || sport.coach}</p>
{coachEmail && (
  <p className="text-md">
    <a href={`mailto:${coachEmail}`} className="hover:text-yellow-400 transition">
      📧 {coachEmail}
    </a>
  </p>
)}
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">About the Program</h2>
          <p className="text-lg text-gray-700 leading-relaxed">{description || sport.description}</p>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Schedule</h2>
          {loading ? (
  <div className="bg-white p-8 rounded-lg text-center text-gray-600">
    Loading schedule...
  </div>
) : schedule.length > 0 ? (
  <div className="space-y-4">
    {schedule.map((game: any, index: number) => (
      <div 
        key={index} 
        className={`rounded-lg p-6 shadow-lg transition transform hover:-translate-y-1 border-4 ${
          game.homeAway === "Home" 
            ? "bg-purple-900 text-white border-yellow-400" 
            : "bg-white text-purple-900 border-yellow-400"
        }`}
        style={{
  textShadow: game.homeAway === "Home" 
    ? "1px 1px 2px rgba(255, 215, 0, 0.5)" 
    : "1px 1px 0 #FBBF24, -1px -1px 0 #FBBF24, 1px -1px 0 #FBBF24, -1px 1px 0 #FBBF24"
}}
      >
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex-1">
            <div className="text-sm font-semibold mb-1 opacity-90">{game.date}</div>
            <div className="text-2xl font-bold mb-2">
  {game.homeAway === "Home" ? "vs. " : "@ "}{game.opponent}
</div>
            <div className="flex gap-3 items-center flex-wrap">
              <span className={`px-4 py-1 rounded-full text-sm font-bold ${
                game.homeAway === "Home" 
                  ? "bg-yellow-400 text-purple-900" 
                  : "bg-purple-900 text-white"
              }`}>
                {game.homeAway}
              </span>
              <span className={`px-4 py-1 rounded-full text-sm font-semibold border-2 ${
                game.homeAway === "Home"
                  ? "border-yellow-400 text-yellow-400"
                  : "border-purple-900 text-purple-900"
              }`}>
                {game.eventType}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{game.time}</div>
          </div>
        </div>
      </div>
    ))}
  </div>
) : (
  <p className="text-gray-600 bg-white p-8 rounded-lg">Schedule to be announced.</p>
)}
        </div>
      </section>

      {/* Roster Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Roster</h2>
          {loading ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-600">
              Loading roster...
            </div>
          ) : roster.length > 0 ? (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-purple-900 text-white">
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
                      <td className="px-6 py-4 font-bold text-purple-900">{player.number}</td>
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
      <footer className="bg-purple-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 Lancaster Catholic Athletics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}