import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
  getLocalLeaderboard,
  updateLocalLeaderboard,
  resetPlayerStats,
  resetAllPlayers,
} from "./leaderboard";

const symbols = ["🍒", "🍋", "🔔", "💎", "🐯", "💰"];

export default function SlotMachine({ playerName }) {
  const [reels, setReels] = useState(["❓", "❓", "❓"]);
  const [spins, setSpins] = useState(0);
  const [coins, setCoins] = useState(100);
  const [message, setMessage] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
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
    if (coins <= 0 || isSpinning) {
      setMessage("Out of coins! 💸");
      return;
    }

    setIsSpinning(true);
    setMessage("");

    const newFinals = [
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
    ];

    const currentReels = [...reels];
    const intervals = [];

    const slowSpin = (reelIndex, finalSymbol, slowCount = 5) => {
      let count = 0;
      const slowInterval = setInterval(() => {
        currentReels[reelIndex] = symbols[Math.floor(Math.random() * symbols.length)];
        setReels([...currentReels]);
        count++;
        if (count >= slowCount) {
          clearInterval(slowInterval);
          currentReels[reelIndex] = finalSymbol;
          setReels([...currentReels]);

          if (reelIndex === 2) {
            finalizeSpin(newFinals);
          }
        }
      }, 200); // slower speed for roll-down
    };

    // Spin each reel at high speed, then slow it down
    [0, 1, 2].forEach((i) => {
      intervals[i] = setInterval(() => {
        currentReels[i] = symbols[Math.floor(Math.random() * symbols.length)];
        setReels([...currentReels]);
      }, 100);
    });

    // Stop and slow-roll each reel with delay
    const stopDelay = [1000, 1600, 2400]; // increasing suspense
    stopDelay.forEach((delay, i) => {
      setTimeout(() => {
        clearInterval(intervals[i]); // stop fast spin
        slowSpin(i, newFinals[i]);   // start slow roll-down
      }, delay);
    });
  };

  const finalizeSpin = (finalReels) => {
    const [a, b, c] = finalReels;
    let coinChange = -1;
    let resultMessage = "😢 Try again!";
    if (a === b && b === c) {
      coinChange = 49;
      resultMessage = "🎉 Jackpot! +50 coins!";
    } else if (a === b || b === c || a === c) {
      coinChange = 9;
      resultMessage = "🥳 You win! +10 coins!";
    }

    const newCoins = coins + coinChange;
    const newSpins = spins + 1;

    setCoins(newCoins);
    setSpins(newSpins);
    setMessage(resultMessage);
    setIsSpinning(false);

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
      <p className="text-lg mb-2">
        Welcome, <span className="font-semibold">{playerName}</span>
      </p>

      <div className="text-6xl flex space-x-4 transition-transform duration-300">
        {reels.map((symbol, i) => (
          <span
            key={i}
            className={`transition-transform duration-150 ${
              isSpinning ? "animate-pulse" : ""
            }`}
          >
            {symbol}
          </span>
        ))}
      </div>

      <button
        onClick={spin}
        disabled={isSpinning || coins <= 0}
        className={`${
          isSpinning || coins <= 0
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-yellow-400 hover:bg-yellow-500"
        } text-black font-semibold px-6 py-3 rounded transition`}
      >
        {isSpinning ? "Spinning..." : "Spin"}
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

