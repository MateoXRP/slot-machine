import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
  getLocalLeaderboard,
  updateLocalLeaderboard,
  resetPlayerStats,
  resetAllPlayers,
} from "./leaderboard";
import {
  submitGlobalScore,
  fetchGlobalLeaderboard,
} from "./firebase";

const symbols = ["🍒", "🍋", "🔔", "💎", "🐯", "💰"];

export default function SlotMachine({ playerName, logout }) {
  const [reels, setReels] = useState(["❓", "❓", "❓"]);
  const [spins, setSpins] = useState(0);
  const [coins, setCoins] = useState(100);
  const [message, setMessage] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [leaderboard, setLeaderboard] = useState({});
  const [globalBoard, setGlobalBoard] = useState([]);

  useEffect(() => {
    const saved = getLocalLeaderboard();
    if (saved[playerName]) {
      setCoins(saved[playerName].coins);
      setSpins(saved[playerName].spins);
    }
    setLeaderboard(saved);

    fetchGlobalLeaderboard().then(setGlobalBoard);
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
      }, 200);
    };

    [0, 1, 2].forEach((i) => {
      intervals[i] = setInterval(() => {
        currentReels[i] = symbols[Math.floor(Math.random() * symbols.length)];
        setReels([...currentReels]);
      }, 100);
    });

    const stopDelay = [1000, 1600, 2400];
    stopDelay.forEach((delay, i) => {
      setTimeout(() => {
        clearInterval(intervals[i]);
        slowSpin(i, newFinals[i]);
      }, delay);
    });
  };

  const finalizeSpin = async (finalReels) => {
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

    await submitGlobalScore(playerName, newCoins, newSpins);
    const updatedGlobal = await fetchGlobalLeaderboard();
    setGlobalBoard(updatedGlobal);
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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4 py-6">
      <h1 className="text-4xl font-bold mb-2 text-center">🎰 Slot Machine</h1>

      <p className="text-lg mb-1 text-center">
        Welcome, <span className="font-semibold text-yellow-400">{playerName}</span>
      </p>

      <div className="text-md text-gray-300 space-y-1 text-center mb-4">
        <p>🪙 Coins: <span className="text-white font-medium">{coins}</span></p>
        <p>🔄 Spins: <span className="text-white font-medium">{spins}</span></p>
      </div>

      <div className="text-7xl flex justify-center space-x-6 mb-6 transition-transform duration-300">
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
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-yellow-400 hover:bg-yellow-500"
        } text-black font-semibold px-8 py-3 rounded text-lg mb-4`}
      >
        {isSpinning ? "Spinning..." : "Spin"}
      </button>

      <p className="text-lg font-semibold text-center min-h-[1.5rem]">{message}</p>

      <button
        onClick={handleResetPlayer}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-6 text-sm"
      >
        Reset My Stats
      </button>

      <h2 className="text-2xl font-bold mt-8 mb-2 text-center">🏅 Local Leaderboard</h2>

      <ul className="mb-6 text-sm text-center w-full max-w-md divide-y divide-gray-800 border border-gray-800 rounded-md overflow-hidden">
        {Object.entries(leaderboard)
          .sort(([, a], [, b]) => b.coins - a.coins)
          .map(([name, data]) => (
            <li
              key={name}
              className="flex justify-center gap-x-6 items-center px-4 py-2 bg-gray-800 hover:bg-gray-700"
            >
              <span className="text-yellow-300 font-medium">{name}</span>
              <span className="text-gray-200">{data.coins} coins / {data.spins} spins</span>
            </li>
          ))}
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-2 text-center">🌍 Global Leaderboard</h2>

      <ul className="mb-6 text-sm text-center w-full max-w-md divide-y divide-gray-800 border border-gray-800 rounded-md overflow-hidden">
        {globalBoard.map((player) => (
          <li
            key={player.name}
            className="flex justify-center gap-x-6 items-center px-4 py-2 bg-gray-800 hover:bg-gray-700"
          >
            <span className="text-yellow-300 font-medium">{player.name}</span>
            <span className="text-gray-200">{player.coins} coins / {player.spins} spins</span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleResetAll}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm mb-6"
      >
        Reset Leaderboard
      </button>

      <div className="text-center mt-2">
        <button
          onClick={logout}
          className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded"
        >
          Switch Player
        </button>
      </div>
    </div>
  );
}

