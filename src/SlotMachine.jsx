import { useState } from "react";

const symbols = ["🍒", "🍋", "🔔", "💎", "🐯", "💰"];

export default function SlotMachine() {
  const [reels, setReels] = useState(["❓", "❓", "❓"]);
  const [spins, setSpins] = useState(0);
  const [coins, setCoins] = useState(100);
  const [message, setMessage] = useState("");

  const spin = () => {
    if (coins <= 0) {
      setMessage("Out of coins! 💸");
      return;
    }

    const newReels = [
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
    ];

    setReels(newReels);
    setSpins(spins + 1);
    setCoins(coins - 1);

    const [a, b, c] = newReels;
    if (a === b && b === c) {
      setMessage("🎉 Jackpot! +50 coins!");
      setCoins((prev) => prev + 50);
    } else if (a === b || b === c || a === c) {
      setMessage("🥳 You win! +10 coins!");
      setCoins((prev) => prev + 10);
    } else {
      setMessage("😢 Try again!");
    }
  };

  return (
    <div className="text-center text-white p-6 bg-gray-900 min-h-screen flex flex-col items-center justify-center space-y-6">
      <h1 className="text-3xl font-bold">🎰 Slot Machine</h1>
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
    </div>
  );
}

