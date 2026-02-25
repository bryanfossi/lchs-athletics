import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

const SETTINGS_PATH = path.join(process.cwd(), 'data', 'settings.json');
const SPORTS_PATH = path.join(process.cwd(), 'data', 'sportsData.json');

// ─── Sport detection ──────────────────────────────────────────────────────────
// Each entry: [slug, keywords to match in the SUMMARY (case-insensitive)]
const SPORT_KEYWORDS: [string, string[]][] = [
  ['football',         ['football']],
  ['boys-basketball',  ['boys basketball', "boys' basketball", 'boys bball']],
  ['girls-basketball', ['girls basketball', "girls' basketball", 'girls bball']],
  ['boys-soccer',      ['boys soccer', "boys' soccer"]],
  ['girls-soccer',     ['girls soccer', "girls' soccer"]],
  ['field-hockey',     ['field hockey']],
  ['baseball',         ['baseball']],
  ['softball',         ['softball']],
  ['volleyball',       ['volleyball']],
  ['track-field',      ['track & field', 'track and field', 'track/field', 'indoor track', 'outdoor track']],
  ['boys-wrestling',   ['boys wrestling', "boys' wrestling"]],
  ['girls-wrestling',  ['girls wrestling', "girls' wrestling"]],
  ['lacrosse',         ['lacrosse']],
  ['cross-country',    ['cross country', 'cross-country', ' xc ']],
  ['swimming',         ['swimming', ' swim ']],
];

function detectSport(summary: string): string | null {
  const lower = summary.toLowerCase();
  for (const [slug, keywords] of SPORT_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) return slug;
  }
  // Generic fallbacks for words that appear without a gendered prefix
  if (lower.includes('wrestling'))    return 'boys-wrestling';
  if (lower.includes('swimming'))     return 'swimming';
  if (lower.includes('lacrosse'))     return 'lacrosse';
  if (lower.includes('cross country') || lower.includes('cross-country')) return 'cross-country';
  if (lower.includes('track'))        return 'track-field';
  return null;
}

// ─── Level detection (Varsity / JV / Freshman) ────────────────────────────────
function detectLevel(summary: string): string {
  const lower = summary.toLowerCase();
  if (/\(jv\)|jv\s|jv$|\bjunior varsity\b/.test(lower)) return 'JV';
  if (/\(fr\)|\bfrosh\b|\bfreshman\b/.test(lower))       return 'Freshman';
  if (/\(v\)|\bvarsity\b/.test(lower))                    return 'Varsity';
  return '';
}

// ─── Opponent + Home/Away from SUMMARY ───────────────────────────────────────
function parseOpponentAndHomeAway(summary: string): { opponent: string; homeAway: string } {
  // Strip level tags like "(V)", "(JV)", "(FR)", "-JV", "- Varsity"
  const cleaned = summary
    .replace(/\s*-\s*(?:varsity|jv|junior varsity|freshman|frosh|fr)\s*/gi, ' ')
    .replace(/\s*\([VJFRvjfr]{1,3}\)\s*/gi, ' ')
    .trim();

  // Away: "@ Opponent" or "at Opponent"
  const awayMatch = cleaned.match(/\s+(?:@|at)\s+(.+)$/i);
  if (awayMatch) {
    const opp = awayMatch[1].trim();
    if (opp.toLowerCase() !== 'home') return { opponent: opp, homeAway: 'Away' };
  }

  // Home: "vs. Opponent" or "vs Opponent"
  const homeMatch = cleaned.match(/\s+vs\.?\s+(.+)$/i);
  if (homeMatch) return { opponent: homeMatch[1].trim(), homeAway: 'Home' };

  return { opponent: cleaned, homeAway: 'Home' };
}

// ─── Event type from SUMMARY + DESCRIPTION ───────────────────────────────────
function detectEventType(summary: string, description: string): string {
  const text = `${summary} ${description}`.toLowerCase();
  if (/playoff|post.?season/.test(text))               return 'Playoff';
  if (/tournament|tourney/.test(text))                  return 'Tournament';
  if (/scrimmage/.test(text))                           return 'Scrimmage';
  if (/non.league/.test(text))                          return 'Non-League';
  if (/league/.test(text))                              return 'League';
  return '';
}

// ─── DTSTART parsing ──────────────────────────────────────────────────────────
function parseDateTime(
  value: string,      // The raw DTSTART value (without property name)
  tzid: string | null, // TZID= parameter if present
  timezone: string,   // Configured school timezone (for UTC→local conversion)
): { date: string; time: string } {
  const isUtc     = value.endsWith('Z');
  const cleaned   = value.replace(/Z$/, '');
  const m         = cleaned.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?/);
  if (!m) return { date: '', time: 'TBD' };

  const [, yr, mo, dy, hh, mm] = m;
  const hasTime = !!hh;

  if (isUtc) {
    // UTC → school timezone using Intl
    const jsDate = new Date(`${yr}-${mo}-${dy}T${hh ?? '00'}:${mm ?? '00'}:00Z`);
    const dateStr = jsDate.toLocaleDateString('en-US', {
      timeZone: timezone, month: 'short', day: 'numeric', year: 'numeric',
    });
    const timeStr = hasTime
      ? jsDate.toLocaleTimeString('en-US', {
          timeZone: timezone, hour: 'numeric', minute: '2-digit', hour12: true,
        })
      : 'TBD';
    return { date: dateStr, time: timeStr };
  }

  // TZID-specified or floating: time is already in the correct local zone — use as-is
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dateStr = `${MONTHS[parseInt(mo) - 1]} ${parseInt(dy)}, ${yr}`;
  if (!hasTime) return { date: dateStr, time: 'TBD' };
  const h = parseInt(hh);
  const h12 = h % 12 || 12;
  const period = h >= 12 ? 'PM' : 'AM';
  return { date: dateStr, time: `${h12}:${mm} ${period}` };
}

// ─── iCal parsing ─────────────────────────────────────────────────────────────
function unfold(text: string): string {
  return text.replace(/\r\n[ \t]/g, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function parseVEvents(icalText: string): Array<Record<string, string>> {
  const events: Array<Record<string, string>> = [];
  const re = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(unfold(icalText))) !== null) {
    const props: Record<string, string> = {};
    for (const line of m[1].split('\n')) {
      const ci = line.indexOf(':');
      if (ci === -1) continue;
      const nameFull = line.substring(0, ci).trim().toUpperCase();
      const val      = line.substring(ci + 1).trim();
      const baseName = nameFull.split(';')[0];
      props[baseName] = val;
      const tzMatch  = nameFull.match(/TZID=([^;:]+)/);
      if (tzMatch) props[`${baseName}_TZID`] = tzMatch[1];
    }
    events.push(props);
  }
  return events;
}

// ─── API handler ──────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as {
      sport?: string;
      icalUrl?: string;
      timezone?: string;
    };
    const limitToSport = body.sport ?? null;

    // URL and timezone can come from the request body (system-admin passes them directly)
    // or fall back to what was last saved in settings.json
    let icalUrl  = body.icalUrl?.trim() ?? '';
    let timezone = body.timezone?.trim() ?? '';

    if (!icalUrl || !timezone) {
      // Fall back to settings file
      try {
        const settings: Record<string, string> = JSON.parse(await readFile(SETTINGS_PATH, 'utf-8'));
        if (!icalUrl)  icalUrl  = settings.icalUrl  ?? '';
        if (!timezone) timezone = settings.timezone ?? '';
      } catch { /* settings file may not exist yet */ }
    }

    timezone = timezone || 'America/New_York';

    if (!icalUrl) {
      return NextResponse.json(
        { success: false, message: 'No iCal URL configured. Set it in System Admin → Schedule Settings.' },
        { status: 400 }
      );
    }

    // Fetch the iCal feed
    let icalText: string;
    try {
      const res = await fetch(icalUrl, { cache: 'no-store' });
      if (!res.ok) {
        return NextResponse.json(
          { success: false, message: `Failed to fetch iCal feed (HTTP ${res.status}).` },
          { status: 502 }
        );
      }
      icalText = await res.text();
    } catch (err) {
      return NextResponse.json(
        { success: false, message: `Could not reach the iCal URL: ${String(err)}` },
        { status: 502 }
      );
    }

    // Parse all VEVENTs
    const vevents = parseVEvents(icalText);

    // Read existing sports data
    let sportsData: Record<string, Record<string, unknown>> = {};
    try {
      sportsData = JSON.parse(await readFile(SPORTS_PATH, 'utf-8'));
    } catch { /* first run */ }

    // Group parsed events by sport slug
    type GameEntry = { date: string; opponent: string; homeAway: string; eventType: string; time: string };
    const grouped: Record<string, GameEntry[]> = {};
    let unrecognized = 0;
    let skipped = 0;

    for (const ev of vevents) {
      const summary     = ev['SUMMARY']     ?? '';
      const dtstart     = ev['DTSTART']     ?? '';
      const tzid        = ev['DTSTART_TZID'] ?? null;
      const description = ev['DESCRIPTION'] ?? '';
      const location    = ev['LOCATION']    ?? '';
      const status      = (ev['STATUS']     ?? '').toUpperCase();

      // Skip cancelled events
      if (status === 'CANCELLED') { skipped++; continue; }
      if (!summary || !dtstart)   { skipped++; continue; }

      const sport = detectSport(summary);
      if (!sport) { unrecognized++; continue; }

      // If caller limited to one sport, skip others
      if (limitToSport && sport !== limitToSport) continue;

      const { date, time } = parseDateTime(dtstart, tzid, timezone);
      if (!date) { skipped++; continue; }

      let { opponent, homeAway } = parseOpponentAndHomeAway(summary);

      // Explicit home/away in LOCATION overrides the vs./at heuristic
      const loc = location.toLowerCase();
      if (loc === 'home' || loc.startsWith('home -') || loc.startsWith('home–')) homeAway = 'Home';
      else if (loc === 'away' || loc.startsWith('away -') || loc.startsWith('away–')) homeAway = 'Away';

      const level   = detectLevel(summary);
      const type    = detectEventType(summary, description);
      const eventType = [level, type].filter(Boolean).join(' ');

      grouped[sport] ??= [];
      grouped[sport].push({ date, opponent, homeAway, eventType, time });
    }

    // Sort each sport's schedule chronologically
    for (const slug of Object.keys(grouped)) {
      grouped[slug].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    // Write updated sports data (only replaces schedules for sports that had events)
    for (const [slug, schedule] of Object.entries(grouped)) {
      sportsData[slug] ??= {};
      sportsData[slug].schedule = schedule;
    }

    await mkdir(path.dirname(SPORTS_PATH), { recursive: true });
    await writeFile(SPORTS_PATH, JSON.stringify(sportsData, null, 2), 'utf-8');

    const imported = Object.entries(grouped).map(([sport, events]) => ({
      sport,
      count: events.length,
    }));

    return NextResponse.json({
      success: true,
      imported,
      unrecognized,
      skipped,
      total: vevents.length,
    });
  } catch (err) {
    console.error('iCal import error:', err);
    return NextResponse.json(
      { success: false, message: `Import failed: ${String(err)}` },
      { status: 500 }
    );
  }
}
