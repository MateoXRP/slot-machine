import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { submitGlobalScore, fetchGlobalLeaderboard } from "./firebase";

const symbols = ["🍒", "🍋", "🔔", "💎", "🐯", "💰"];

export default function SlotMachine() {
  const [name, setName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [reels, setReels] = useState(["❓", "❓", "❓"]);
  const [coins, setCoins] = useState(null);
  const [spins, setSpins] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [message, setMessage] = useState("");
  const [globalBoard, setGlobalBoard] = useState([]);

  useEffect(() => {
    const saved = Cookies.get("slotPlayer");
    if (saved) setName(saved);
    fetchAndSetLeaderboard(saved);
  }, []);

  const fetchAndSetLeaderboard = async (userName) => {
    const entries = await fetchGlobalLeaderboard("slot_leaderboard");
    setGlobalBoard(entries);
    const user = entries.find((e) => e.name === userName);
    if (user) {
      setCoins(user.coins);
      setSpins(user.spins);
    }
  };

  const saveName = () => {
    if (!nameInput.trim()) return;
    const trimmed = nameInput.trim();
    setName(trimmed);
    Cookies.set("slotPlayer", trimmed);
    fetchAndSetLeaderboard(trimmed);
  };

  const logout = () => {
    Cookies.remove("slotPlayer");
    setName("");
    setCoins(null);
    setSpins(null);
    setMessage("");
    setReels(["❓", "❓", "❓"]);
  };

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

    const updated = { name, coins: newCoins, spins: newSpins };
    await submitGlobalScore("slot_leaderboard", name, updated);
    await fetchAndSetLeaderboard(name);
  };

  const restartWithCoins = async () => {
    const newCoins = 10;
    setCoins(newCoins);
    setMessage("🆕 Restarted with 10 coins!");
    const updated = { name, coins: newCoins, spins };
    await submitGlobalScore("slot_leaderboard", name, updated);
    await fetchAndSetLeaderboard(name);
  };

  if (!name) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <h1 className="text-3xl font-bold mb-2 text-center">Play Slot Machine</h1>
        <div className="text-4xl mb-4">🎰</div>
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Enter your name"
          className="px-4 py-2 rounded text-black mb-2"
        />
        <button onClick={saveName} className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
          Start Game
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">🎰 Slot Machine</h1>
      <p className="mb-2">Welcome, <span className="text-yellow-400 font-semibold">{name}</span></p>

      <div className="text-md text-gray-300 space-y-1 text-center mb-4">
        <p>🪙 Coins: <span className="text-white font-medium">{coins}</span></p>
        <p>🔄 Spins: <span className="text-white font-medium">{spins}</span></p>
      </div>

      <div className="text-7xl flex justify-center space-x-6 mb-6 transition-transform duration-300">
        {reels.map((symbol, i) => (
          <span key={i}>{symbol}</span>
        ))}
      </div>

      <button
        onClick={spin}
        disabled={isSpinning || coins <= 0}
        className={`${
          isSpinning || coins <= 0
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-yellow-400 hover:bg-yellow-500"
        } text-black font-semibold px-8 py-3 rounded text-lg mb-2`}
      >
        {isSpinning ? "Spinning..." : "Spin"}
      </button>

      <p className="text-lg font-semibold text-center min-h-[1.5rem]">{message}</p>

      {coins === 0 && !isSpinning && (
        <button
          onClick={restartWithCoins}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mt-2"
        >
          Restart with 10 Coins
        </button>
      )}

      <button onClick={logout} className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-800 my-6">
        Switch Player
      </button>

      <h2 className="text-2xl font-bold mb-2">🌍 Global Leaderboard</h2>
      <ul className="mb-4">
        {globalBoard.map((player) => (
          <li key={player.name} className="text-sm">
            {player.name}: {player.coins} coins / {player.spins} spins
          </li>
        ))}
      </ul>
    </div>
  );
}

