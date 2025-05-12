import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { getLocalLeaderboard, updateLocalLeaderboard, resetPlayerStats, resetAllPlayers } from "./leaderboard";

const symbols = ["🍒", "🍋", "🔔", "💎", "🐯", "💰"];

export default function SlotMachine({ playerName }) {
  const [reels, setReels] = useState(["❓", "❓", "❓"]);
  const [spins, setSpins] = useState(0);
  const [coins, setCoins] = useState(100);
  const [message, setMessage] = useState("");
  const [leaderboard, setLeaderboard] = useState({});

  useEffect(() => {
    const saved = getLocalLeaderboard();
    if (saved[playerName]) {
      setCoins(saved[playerName].coins);
      setSpins(saved[playerName].spins);
    }
    setLeaderboard(saved);
  }, [playerName]);

  const spin = () => {
    if (coins <= 0) {
      setMessage("Out of coins! 💸");
      return;
    }

    const newReels = Array.from({ length: 3 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
    setReels(newReels);
    const [a, b, c] = newReels;

    let change = -1;
    let result = "😢 Try again!";
    if (a === b && b === c) {
      change = 49;
      result = "🎉 Jackpot! +50 coins!";
    } else if (a === b || b === c || a === c) {
      change = 9;
      result = "🥳 You win! +10 coins!";
    }

    const newCoins = coins + change;
    const newSpins = spins + 1;
    setCoins(newCoins);
    setSpins(newSpins);
    setMessage(result);

    const updated = updateLocalLeaderboard(playerName, newCoins, newSpins);
    setLeaderboard(updated);
  };

  const handleResetPlayer = () => {
    const updated = resetPlayerStats(playerName);
    setCoins(100);
    setSpins(0);
    setLeaderboard(updated);
    setMessage("");
  };

  const handleResetAll = () => {
    const cleared = resetAllPlayers();
    setLeaderboard(cleared);
    setMessage("");
  };

  return (
    <div className="text-center text-white p-6 bg-gray-900 min-h-screen flex flex-col items-center justify-center space-y-6">
      <h1 className="text-3xl font-bold">🎰 Slot Machine</h1>
      <p className="text-lg mb-2">Welcome, <span className="font-semibold">{playerName}</span></p>

      <div className="text-6xl flex space-x-4">
        {reels.map((symbol, i) => (
          <span key={i}>{symbol}</span>
        ))}
      </div>

      <button
        onClick={spin}
        className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded"
      >
        Spin
      </button>

      <p className="text-lg">{message}</p>

      <div className="text-sm text-gray-300 space-y-1">
        <p>🪙 Coins: {coins}</p>
        <p>🔄 Spins: {spins}</p>
      </div>

      <button
        onClick={handleResetPlayer}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-4"
      >
        Reset My Stats
      </button>

      <h2 className="text-xl font-bold mt-6 mb-2">🏅 Local Leaderboard</h2>
      <ul className="mb-4 text-sm">
        {Object.entries(leaderboard)
          .sort(([, a], [, b]) => b.coins - a.coins)
          .map(([name, data]) => (
            <li key={name}>
              {name}: {data.coins} coins / {data.spins} spins
            </li>
          ))}
      </ul>

      <button
        onClick={handleResetAll}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
      >
        Reset Leaderboard
      </button>
    </div>
  );
}

