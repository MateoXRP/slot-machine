import Cookies from "js-cookie";

const COOKIE_KEY = "slotLeaderboard";

export function getLocalLeaderboard() {
  const raw = Cookies.get(COOKIE_KEY);
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function updateLocalLeaderboard(name, coins, spins) {
  const current = getLocalLeaderboard();
  current[name] = { coins, spins };
  Cookies.set(COOKIE_KEY, JSON.stringify(current));
  return current;
}

export function resetPlayerStats(name) {
  const current = getLocalLeaderboard();
  delete current[name];
  Cookies.set(COOKIE_KEY, JSON.stringify(current));
  return current;
}

export function resetAllPlayers() {
  Cookies.remove(COOKIE_KEY);
  return {};
}

