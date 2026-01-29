import Link from "next/link";

export default function Home() {
const sports = [
  { name: "Football", season: "Fall", icon: "🏈" },
  { name: "Boys Basketball", season: "Winter", icon: "🏀" },
  { name: "Girls Basketball", season: "Winter", icon: "🏀" },
  { name: "Boys Soccer", season: "Fall", icon: "⚽" },
  { name: "Girls Soccer", season: "Fall", icon: "⚽" },
  { name: "Field Hockey", season: "Fall", icon: "🏑" },
  { name: "Baseball", season: "Spring", icon: "⚾" },
  { name: "Softball", season: "Spring", icon: "🥎" },
  { name: "Volleyball", season: "Fall", icon: "🏐" },
  { name: "Track & Field", season: "Spring", icon: "🏃" },
  { name: "Boys Wrestling", season: "Winter", icon: "🤼" },
  { name: "Girls Wrestling", season: "Winter", icon: "🤼" },
  { name: "Lacrosse", season: "Spring", icon: "🥍" },
  { name: "Cross Country", season: "Fall", icon: "🏃‍♂️" },
  { name: "Swimming", season: "Winter", icon: "🏊" },
];

  const upcomingGames = [
    { sport: "Football", opponent: "Central High", date: "Feb 1, 2026", time: "7:00 PM", location: "Home" },
    { sport: "Basketball", opponent: "North Valley", date: "Feb 3, 2026", time: "6:30 PM", location: "Away" },
    { sport: "Wrestling", opponent: "East Side", date: "Feb 5, 2026", time: "5:00 PM", location: "Home" },
  ];

  const news = [
    {
      title: "Girls Basketball Team Advances to State Championship",
      date: "January 25, 2026",
      excerpt: "Our Lady Crusaders defeated their rivals 65-58 in an exciting semi-final match...",
    },
    {
      title: "New Athletic Director Appointed",
      date: "January 20, 2026",
      excerpt: "We're pleased to announce Coach Johnson as our new Athletic Director...",
    },
    {
      title: "Winter Sports Schedule Released",
      date: "January 15, 2026",
      excerpt: "Check out the complete schedule for all winter sports including basketball, wrestling, and swimming...",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <header className="bg-purple-900 text-white shadow-lg">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
  <img src="/lchs-banner-logo.png" alt="LCHS Logo" className="h-12" />
  <span className="text-2xl font-bold">Lancaster Catholic Athletics</span>
</Link>
            <ul className="flex space-x-6">
              <li><Link href="/" className="hover:text-purple-300 transition">Home</Link></li>
              <li><Link href="/sports" className="hover:text-purple-300 transition">Sports</Link></li>
              <li><Link href="/schedule" className="hover:text-purple-300 transition">Schedule</Link></li>
              <li><Link href="/news" className="hover:text-purple-300 transition">News</Link></li>
              <li><Link href="/contact" className="hover:text-purple-300 transition">Contact</Link></li>
            </ul>
          </div>
        </nav>
      </header>

{/* Hero Section */}
<section className="relative text-white overflow-hidden" style={{minHeight: '500px', paddingTop: '80px', paddingBottom: '80px'}}>
  <img 
    src="/Football.jpg" 
    alt="Football background" 
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      zIndex: 0
    }}
  />
  <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(88, 28, 135, 0.7)', zIndex: 1}}></div>
  <div style={{position: 'relative', zIndex: 2}} className="container mx-auto px-4 text-center">
    <h1 className="text-5xl font-bold mb-4">Welcome to Lancaster Catholic High School Athletics</h1>
    <p className="text-xl mb-8">Pride. Tradition. Excellence.</p>
    <div className="flex justify-center gap-4">
      <Link href="/schedule" className="bg-white text-purple-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
        View Schedule
      </Link>
      <Link href="/sports" className="bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-800 transition border-2 border-white">
        Our Sports
      </Link>
    </div>
  </div>
</section>

      {/* Sports Section */}
<section className="py-16 container mx-auto px-4">
  <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Our Sports Programs</h2>
  
  {/* Fall Sports */}
  <div className="mb-12">
    <div className="flex items-center mb-6">
      <div className="flex-grow border-t-2 border-purple-600"></div>
      <h3 className="text-3xl font-bold text-purple-900 mx-4">Fall Sports</h3>
      <div className="flex-grow border-t-2 border-purple-600"></div>
    </div>
    <div className="grid md:grid-cols-3 gap-8">
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
        <div className="text-5xl mb-4 text-center">🏈</div>
        <h4 className="text-2xl font-bold text-center mb-2 text-gray-800">Football</h4>
        <p className="text-center text-gray-600">Fall Season</p>
        <div className="mt-4 text-center">
          <Link href="/sports/football" className="text-purple-600 hover:text-purple-800 font-semibold">
            Learn More →
          </Link>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
        <div className="text-5xl mb-4 text-center">⚽</div>
        <h4 className="text-2xl font-bold text-center mb-2 text-gray-800">Boys Soccer</h4>
        <p className="text-center text-gray-600">Fall Season</p>
        <div className="mt-4 text-center">
          <Link href="/sports/boys-soccer" className="text-purple-600 hover:text-purple-800 font-semibold">
            Learn More →
          </Link>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
        <div className="text-5xl mb-4 text-center">⚽</div>
        <h4 className="text-2xl font-bold text-center mb-2 text-gray-800">Girls Soccer</h4>
        <p className="text-center text-gray-600">Fall Season</p>
        <div className="mt-4 text-center">
          <Link href="/sports/girls-soccer" className="text-purple-600 hover:text-purple-800 font-semibold">
            Learn More →
          </Link>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
        <div className="text-5xl mb-4 text-center">🏑</div>
        <h4 className="text-2xl font-bold text-center mb-2 text-gray-800">Field Hockey</h4>
        <p className="text-center text-gray-600">Fall Season</p>
        <div className="mt-4 text-center">
          <Link href="/sports/field-hockey" className="text-purple-600 hover:text-purple-800 font-semibold">
            Learn More →
          </Link>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
        <div className="text-5xl mb-4 text-center">🏐</div>
        <h4 className="text-2xl font-bold text-center mb-2 text-gray-800">Volleyball</h4>
        <p className="text-center text-gray-600">Fall Season</p>
        <div className="mt-4 text-center">
          <Link href="/sports/volleyball" className="text-purple-600 hover:text-purple-800 font-semibold">
            Learn More →
          </Link>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
        <div className="text-5xl mb-4 text-center">🏃‍♂️</div>
        <h4 className="text-2xl font-bold text-center mb-2 text-gray-800">Cross Country</h4>
        <p className="text-center text-gray-600">Fall Season</p>
        <div className="mt-4 text-center">
          <Link href="/sports/cross-country" className="text-purple-600 hover:text-purple-800 font-semibold">
            Learn More →
          </Link>
        </div>
      </div>
    </div>
  </div>

  {/* Winter Sports */}
  <div className="mb-12">
    <div className="flex items-center mb-6">
      <div className="flex-grow border-t-2 border-purple-600"></div>
      <h3 className="text-3xl font-bold text-purple-900 mx-4">Winter Sports</h3>
      <div className="flex-grow border-t-2 border-purple-600"></div>
    </div>
    <div className="grid md:grid-cols-3 gap-8">
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
        <div className="text-5xl mb-4 text-center">🏀</div>
        <h4 className="text-2xl font-bold text-center mb-2 text-gray-800">Boys Basketball</h4>
        <p className="text-center text-gray-600">Winter Season</p>
        <div className="mt-4 text-center">
          <Link href="/sports/boys-basketball" className="text-purple-600 hover:text-purple-800 font-semibold">
            Learn More →
          </Link>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
        <div className="text-5xl mb-4 text-center">🏀</div>
        <h4 className="text-2xl font-bold text-center mb-2 text-gray-800">Girls Basketball</h4>
        <p className="text-center text-gray-600">Winter Season</p>
        <div className="mt-4 text-center">
          <Link href="/sports/girls-basketball" className="text-purple-600 hover:text-purple-800 font-semibold">
            Learn More →
          </Link>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
        <div className="text-5xl mb-4 text-center">🤼</div>
        <h4 className="text-2xl font-bold text-center mb-2 text-gray-800">Boys Wrestling</h4>
        <p className="text-center text-gray-600">Winter Season</p>
        <div className="mt-4 text-center">
          <Link href="/sports/boys-wrestling" className="text-purple-600 hover:text-purple-800 font-semibold">
            Learn More →
          </Link>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
        <div className="text-5xl mb-4 text-center">🤼</div>
        <h4 className="text-2xl font-bold text-center mb-2 text-gray-800">Girls Wrestling</h4>
        <p className="text-center text-gray-600">Winter Season</p>
        <div className="mt-4 text-center">
          <Link href="/sports/girls-wrestling" className="text-purple-600 hover:text-purple-800 font-semibold">
            Learn More →
          </Link>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
        <div className="text-5xl mb-4 text-center">🏊</div>
        <h4 className="text-2xl font-bold text-center mb-2 text-gray-800">Swimming</h4>
        <p className="text-center text-gray-600">Winter Season</p>
        <div className="mt-4 text-center">
          <Link href="/sports/swimming" className="text-purple-600 hover:text-purple-800 font-semibold">
            Learn More →
          </Link>
        </div>
      </div>
    </div>
  </div>

  {/* Spring Sports */}
  <div className="mb-12">
    <div className="flex items-center mb-6">
      <div className="flex-grow border-t-2 border-purple-600"></div>
      <h3 className="text-3xl font-bold text-purple-900 mx-4">Spring Sports</h3>
      <div className="flex-grow border-t-2 border-purple-600"></div>
    </div>
    <div className="grid md:grid-cols-3 gap-8">
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
        <div className="text-5xl mb-4 text-center">⚾</div>
        <h4 className="text-2xl font-bold text-center mb-2 text-gray-800">Baseball</h4>
        <p className="text-center text-gray-600">Spring Season</p>
        <div className="mt-4 text-center">
          <Link href="/sports/baseball" className="text-purple-600 hover:text-purple-800 font-semibold">
            Learn More →
          </Link>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
        <div className="text-5xl mb-4 text-center">🥎</div>
        <h4 className="text-2xl font-bold text-center mb-2 text-gray-800">Softball</h4>
        <p className="text-center text-gray-600">Spring Season</p>
        <div className="mt-4 text-center">
          <Link href="/sports/softball" className="text-purple-600 hover:text-purple-800 font-semibold">
            Learn More →
          </Link>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
        <div className="text-5xl mb-4 text-center">🥍</div>
        <h4 className="text-2xl font-bold text-center mb-2 text-gray-800">Lacrosse</h4>
        <p className="text-center text-gray-600">Spring Season</p>
        <div className="mt-4 text-center">
          <Link href="/sports/lacrosse" className="text-purple-600 hover:text-purple-800 font-semibold">
            Learn More →
          </Link>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
        <div className="text-5xl mb-4 text-center">🏃</div>
        <h4 className="text-2xl font-bold text-center mb-2 text-gray-800">Track & Field</h4>
        <p className="text-center text-gray-600">Spring Season</p>
        <div className="mt-4 text-center">
          <Link href="/sports/track-field" className="text-purple-600 hover:text-purple-800 font-semibold">
            Learn More →
          </Link>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* Upcoming Games */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Upcoming Games</h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {upcomingGames.map((game, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 shadow hover:shadow-md transition border-l-4 border-blue-600">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{game.sport}</h3>
                    <p className="text-gray-600">vs. {game.opponent}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-800 font-semibold">{game.date}</p>
                    <p className="text-gray-600">{game.time}</p>
                  </div>
                  <div className="bg-yellow-400 text-purple-900 px-4 py-2 rounded-full font-semibold">
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/schedule" className="text-purple-600 hover:text-purple-800 font-semibold text-lg">
              View Full Schedule →
            </Link>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Latest News</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {news.map((article, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                <p className="text-blue-600 text-sm font-semibold mb-2">{article.date}</p>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{article.title}</h3>
                <p className="text-gray-600 mb-4">{article.excerpt}</p>
                <Link href="/news" className="text-blue-600 hover:text-purple-800 font-semibold">
                  Read More →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-purple-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Lancaster Catholic High School Athletics</h3>
              <p className="text-gray-300">Building character through competition</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/sports" className="hover:text-white">Sports Programs</Link></li>
                <li><Link href="/schedule" className="hover:text-white">Game Schedule</Link></li>
                <li><Link href="/news" className="hover:text-white">News & Updates</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <p className="text-gray-300">123 School Street</p>
              <p className="text-gray-300">City, State 12345</p>
              <p className="text-gray-300">Phone: (555) 123-4567</p>
            </div>
          </div>
          <div className="border-t border-blue-800 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2026 Lancaster Catholic High School Athletics. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
