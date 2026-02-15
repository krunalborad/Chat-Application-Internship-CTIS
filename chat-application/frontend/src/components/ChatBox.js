import { useState, useEffect } from "react";
import socket from "../socket";
import Message from "./Message";

export default function ChatBox({ user }) {
  const rooms = ["General", "Design", "Marketing", "Alice", "Bob"];

  const [room, setRoom] = useState("General");
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setMessages([]);

    socket.emit("joinRoom", { username: user, room });

    socket.on("message", (m) => {
      setMessages((prev) => [...prev, m]);
    });

    return () => socket.off("message");
  }, [room, user]);

  const send = () => {
    if (!msg) return;
    socket.emit("sendMessage", msg);
    setMsg("");
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <div className="sidebar">
        <h3>💬 Chats</h3>

        {rooms.map((r) => (
          <div
            key={r}
            className={`room ${room === r ? "active" : ""}`}
            onClick={() => setRoom(r)}
          >
            {r}
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div className="chat">
        <div className="chat-header">#{room}</div>

        <div className="messages">
          {messages.map((m, i) => (
            <Message key={i} text={m} self={m.startsWith(user)} />
          ))}
        </div>

        <div className="input-area">
          <input
            value={msg}
            placeholder="Type message..."
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />

          <button onClick={send}>Send</button>
        </div>
      </div>
    </div>
  );
}