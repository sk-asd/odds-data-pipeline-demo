import { fracToDecimal, roundOdd } from "./util.js";

function row(base, bookmaker, market, selection, value, line = null) {
  return {
    matchId: base.matchId,
    sport: base.sport || "football",
    home: base.home,
    away: base.away,
    startsAt: base.startsAt,
    bookmaker,
    market,
    selection,
    line,
    value,
    fetchedAt: new Date().toISOString(),
  };
}

function parseA(data) {
  const rows = [];
  for (const ev of data.events || []) {
    const base = {
      matchId: ev.id,
      sport: ev.sport,
      home: ev.home,
      away: ev.away,
      startsAt: ev.startsAt,
    };

    for (const m of ev.markets || []) {
      if (m.type === "1x2") {
        for (const sel of ["home", "draw", "away"]) {
          rows.push(row(base, m.bookmaker, "1x2", sel, roundOdd(m.odds[sel])));
        }
      }
      if (m.type === "over_under") {
        rows.push(row(base, m.bookmaker, "total_goals", "over", roundOdd(m.odds.over), m.line));
        rows.push(row(base, m.bookmaker, "total_goals", "under", roundOdd(m.odds.under), m.line));
      }
    }
  }
  return rows;
}

function parseB(data) {
  const rows = [];
  for (const m of data.matches || []) {
    const base = {
      matchId: m.match_id,
      home: m.teams?.[0],
      away: m.teams?.[1],
      startsAt: new Date(m.kickoff).toISOString(),
    };

    for (const p of m.prices || []) {
      if (p.market === "match_winner") {
        rows.push(row(base, p.bm, "1x2", "home", roundOdd(p.home)));
        rows.push(row(base, p.bm, "1x2", "draw", roundOdd(p.draw)));
        rows.push(row(base, p.bm, "1x2", "away", roundOdd(p.away)));
      }
      if (p.market === "totals") {
        rows.push(row(base, p.bm, "total_goals", "over", fracToDecimal(p.over), Number(p.line)));
        rows.push(row(base, p.bm, "total_goals", "under", fracToDecimal(p.under), Number(p.line)));
      }
    }
  }
  return rows;
}

function parseC(data) {
  const rows = [];
  for (const g of data.payload?.games || []) {
    const base = {
      matchId: g.game,
      home: g.homeTeam,
      away: g.awayTeam,
      startsAt: g.time.replace(" ", "T") + "Z",
    };

    for (const [bm, offers] of Object.entries(g.offers || {})) {
      if (offers.hda) {
        rows.push(row(base, bm, "1x2", "home", roundOdd(offers.hda[0])));
        rows.push(row(base, bm, "1x2", "draw", roundOdd(offers.hda[1])));
        rows.push(row(base, bm, "1x2", "away", roundOdd(offers.hda[2])));
      }
      if (offers.ou_2_5) {
        rows.push(row(base, bm, "total_goals", "over", roundOdd(offers.ou_2_5[0]), 2.5));
        rows.push(row(base, bm, "total_goals", "under", roundOdd(offers.ou_2_5[1]), 2.5));
      }
    }
  }
  return rows;
}

export function normalize(feed) {
  if (feed.name === "mock-a") return parseA(feed.data);
  if (feed.name === "mock-b") return parseB(feed.data);
  if (feed.name === "mock-c") return parseC(feed.data);
  return [];
}
