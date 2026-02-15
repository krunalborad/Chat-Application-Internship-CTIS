import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:5000", { autoConnect: false });

const MAX_FILE_SIZE = 2 * 1024 * 1024;

function App() {
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState("General");
  const [currentSender, setCurrentSender] = useState("");
  const [activePerson, setActivePerson] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  // 🔥 NEW FOR AUDIO RECORDING
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const recognitionRef = useRef(null); // kept (not deleted)

  const [sharedPhotos, setSharedPhotos] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [rooms, setRooms] = useState([
    "General",
    "Design",
    "Marketing",
    "Sales",
  ]);

  const addRoom = () => {
    if (!newRoomName.trim()) return;
    if (rooms.includes(newRoomName)) {
      alert("Room already exists!");
      return;
    }
    setRooms([...rooms, newRoomName]);
    setNewRoomName("");
  };

  const deleteRoom = () => {
    if (rooms.length === 1) {
      alert("At least one room must exist.");
      return;
    }
    const updatedRooms = rooms.filter((r) => r !== room);
    setRooms(updatedRooms);
    setRoom(updatedRooms[0]);
    setMessages([]);
  };

  const people = [
    { name: "Alice", img: "https://randomuser.me/api/portraits/women/44.jpg" },
    { name: "Emma", img: "https://randomuser.me/api/portraits/women/68.jpg" },
    { name: "Bob", img: "https://randomuser.me/api/portraits/men/32.jpg" },
    { name: "Ryan", img: "https://randomuser.me/api/portraits/men/75.jpg" },
  ];

  // 🎤 WHATSAPP STYLE AUDIO RECORDING
  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        const audioURL = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioURL);

        audio.onloadedmetadata = () => {
          const duration = Math.floor(audio.duration);
          const formatted =
            "0:" + (duration < 10 ? "0" + duration : duration);

          const time = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          setMessages((prev) => [
            ...prev,
            {
              sender: activePerson,
              audio: audioURL,
              duration: formatted,
              time,
              status: "sent",
            },
          ]);
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleMessage = (m) => {
      const parts = m.split(": ");
      const sender = parts[0];
      const text = parts.slice(1).join(": ");

      if (sender === activePerson) return;

      const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      setMessages((prev) => [
        ...prev.map((msg) =>
          msg.status === "sent" ? { ...msg, status: "delivered" } : msg
        ),
        {
          sender,
          text,
          time,
          status: "seen",
        },
      ]);
    };

    const handleFile = (data) => {
      if (data.sender === activePerson) return;

      setMessages((prev) => [
        ...prev,
        {
          sender: data.sender,
          image: data.file,
          time: data.time,
          status: "seen",
        },
      ]);

      setSharedPhotos((prev) => [...prev, data.file]);
    };

    socket.on("message", handleMessage);
    socket.on("file", handleFile);

    return () => {
      socket.off("message", handleMessage);
      socket.off("file", handleFile);
    };
  }, [activePerson]);

  const join = () => {
    if (!name.trim()) return;
    socket.connect();
    socket.emit("join", name);
    setCurrentSender(name);
    setActivePerson(name);
    setJoined(true);
  };

  const send = () => {
    if (!msg.trim()) return;

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [
      ...prev,
      {
        sender: activePerson,
        text: msg,
        time,
        status: "sent",
      },
    ]);

    socket.emit("sendMessage", `${activePerson}: ${msg}`);
    setMsg("");
  };

  const handleFileUpload = (file) => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert("File too large. Max size is 2MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: activePerson,
          image: reader.result,
          time,
          status: "sent",
        },
      ]);

      setSharedPhotos((prev) => [...prev, reader.result]);

      socket.emit("sendFile", {
        sender: activePerson,
        file: reader.result,
        time,
      });
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const getAvatar = (sender) => {
    if (sender === name)
      return "https://randomuser.me/api/portraits/men/50.jpg";
    const person = people.find((p) => p.name === sender);
    return person?.img || "https://i.pravatar.cc/40";
  };

  if (!joined) {
  return (
    <div className="join-page">
      <div className="join-wrapper">
        <h2>Join Chat</h2>

        <div className="join-container">
          <input
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={join}>Join</button>
        </div>
      </div>
    </div>
  );
}

  return (
  <div className="app-layout">
    <div className="sidebar">
      <h3>Chats</h3>
      <div className="room-list">
        {rooms.map((r) => (
          <div
            key={r}
            className={`room ${room === r ? "active" : ""}`}
            onClick={() => {
              setRoom(r);
              setMessages([]);
            }}
          >
            {r}
          </div>
        ))}
      </div>

      <div className="sidebar-bottom">
        <input
          type="text"
          placeholder="New Chat Name"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          className="new-room-input"
        />

        <div className="chat-buttons">
          <button onClick={addRoom}>➕ Add</button>
          <button onClick={deleteRoom}>❌ Delete</button>
        </div>
      </div>
    </div>

    <div className="chat-area">
      <div className="chat-header">
        {room} | Talking as <b>{activePerson}</b>
      </div>

      <div className="messages">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`msg-row ${
              m.sender === name ? "right" : "left"
            }`}
          >
            <img src={getAvatar(m.sender)} className="avatar" />

            <div className="bubble">
              <div className="sender">
                {m.sender} {m.sender === name && "(You)"}
              </div>

              {m.text && <div className="text">{m.text}</div>}

              {m.image && (
                <img src={m.image} className="chat-image" alt="shared" />
              )}

              {/* ✅ ADDED AUDIO SUPPORT (Nothing Removed) */}
              {m.audio && (
                <div className="audio-message">
                  <audio controls src={m.audio}></audio>
                </div>
              )}

              <div className="meta">
                <span className="time">{m.time}</span>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div
        className="input-area"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <button
          className="icon-btn"
          onClick={() => fileInputRef.current.click()}
        >
          📎
        </button>

        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={(e) => handleFileUpload(e.target.files[0])}
        />

        <button
          className="icon-btn"
          onClick={() => cameraInputRef.current.click()}
        >
          📷
        </button>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => handleFileUpload(e.target.files[0])}
        />

        <input
          value={msg}
          placeholder="Type a message"
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />

        <button className="icon-btn" onClick={toggleRecording}>
          {isRecording ? "⏹️" : "🎤"}
        </button>

        <button className="send-btn" onClick={send}>
          ➤
        </button>
      </div>
    </div>

    <div className="people">
      <div className="people-header">
        <h3>{room}</h3>
        <span className="people-subtitle">People</span>
      </div>

      <div
        className={`person ${activePerson === name ? "active" : ""}`}
        onClick={() => setActivePerson(name)}
        style={{ cursor: "pointer" }}
      >
        <img src="https://randomuser.me/api/portraits/men/50.jpg" />
        {name} (You)
      </div>

      {people.map((p) => (
        <div
          key={p.name}
          className={`person ${
            activePerson === p.name ? "active" : ""
          }`}
          onClick={() => setActivePerson(p.name)}
          style={{ cursor: "pointer" }}
        >
          <img src={p.img} />
          {p.name}
        </div>
      ))}

      <div className="photos-section">
        <h4>Photos</h4>
        <div className="photos-grid">
          {sharedPhotos.map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt="shared"
              className="photo-thumb"
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);
}

export default App;