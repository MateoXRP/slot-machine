import { useState, useEffect } from "react";
import SlotMachine from "./SlotMachine";
import Cookies from "js-cookie";

export default function App() {
  const [playerName, setPlayerName] = useState("");
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    const stored = Cookies.get("slotPlayer");
    if (stored) setPlayerName(stored);
  }, []);

  const saveName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setPlayerName(trimmed);
    Cookies.set("slotPlayer", trimmed);
  };

  const logout = () => {
    Cookies.remove("slotPlayer");
    setPlayerName("");
    setNameInput("");
  };

  if (!playerName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <h1 className="text-3xl font-bold mb-2 text-center">Play Slot Machine!</h1>
        <div className="text-4xl mb-4">🍒 🔔 💰</div>
        <h2 className="text-xl font-semibold mb-2">Enter Your Name</h2>
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          className="px-4 py-2 text-black rounded mb-2"
          placeholder="Your name"
        />
        <button
          onClick={saveName}
          className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-600"
        >
          Start Game
        </button>
      </div>
    );
  }

  return (
    <>
      <SlotMachine playerName={playerName} />
      <div className="text-center mt-4">
        <button
          onClick={logout}
          className="text-xs text-white underline hover:text-yellow-400"
        >
          Switch Player
        </button>
      </div>
    </>
  );
}

