import { useState } from "react";

export default function Join({ setUser }) {
  const [name, setName] = useState("");

  const join = () => {
    if (!name) return;
    setUser(name);
  };

  return (
    <div className="join">
      <h2>💬 Join Chat</h2>

      <input
        placeholder="Enter name"
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={join}>Join</button>
    </div>
  );
}