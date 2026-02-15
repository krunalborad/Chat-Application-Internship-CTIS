💬 Real-Time Chat Application

A full-stack real-time chat application built using **React.js (Frontend)**, **Node.js + Express.js (Backend)**, **Socket.IO**, and **MongoDB**.
This application allows users to join chat rooms, send text messages, share images, record voice messages, and view chat history in real time.

🚀 Features

👤 User Features
- Join chat with a username
- Create and delete chat rooms
- Send real-time text messages
- Share images (drag & drop supported)
- Record and send voice messages
- View previously stored chat history
- See shared photos gallery
- Responsive and modern UI with glassmorphism effect

⚡ Real-Time Communication
- Built using **Socket.IO**
- Instant message broadcasting
- Real-time file and audio sharing
- Join/Leave system notifications

🗄️ Database Features
- MongoDB for message storage
- Stores:
  - Text messages
  - Images (Base64)
  - Audio messages
  - Sender name
  - Room name
  - Timestamp
- Fetch previous messages on user join

🛠️ Tech Stack

Frontend
- React.js
- Socket.IO Client
- CSS3 (Glassmorphism UI)
- MediaRecorder API (Voice Recording)

Backend
- Node.js
- Express.js
- Socket.IO
- MongoDB
- Mongoose
- dotenv

⚙️ Installation & Setup

1️⃣ Backend Setup

cd backend
npm install

Create .env file:
MONGO_URI=your_mongodb_connection_string
PORT=5000

Start backend server:
node server.js

Server runs on:
http://localhost:5000

2️⃣ Frontend Setup

cd frontend
npm install

Start Frontend Server:
npm start

Frontend runs on:
http://localhost:3000

🎤 Voice Recording Feature
-Uses browser MediaRecorder API
-Records audio in .webm format
-Max file size: 2MB
-Stored in MongoDB as Base64

📸 Image Sharing
-Upload from device
-Capture using camera
-Drag & drop support
-Max file size: 2MB

🎯 Learning Outcomes
This project demonstrates:
-Real-time communication using WebSockets
-Full-stack integration
-REST API + Socket.IO working together
-Media handling in web apps
-MongoDB data persistence
-Modern responsive UI design

✅ Conclusion

This Real-Time Chat Application demonstrates the practical implementation of full-stack development concepts by integrating **React.js**, **Node.js**, **Express**, **Socket.IO**, and **MongoDB** into a fully functional system.
The project successfully implements:
- Real-time bidirectional communication using WebSockets
- Persistent message storage with MongoDB
- Media handling (images and voice messages)
- Room-based chat architecture
- Modern and responsive user interface
Through this project, core concepts such as REST APIs, event-driven architecture, database integration, and client-server communication were applied in a real-world scenario.
This application serves as a strong foundation for building scalable communication platforms and can be further enhanced with authentication, cloud media storage, and deployment to production environments.
