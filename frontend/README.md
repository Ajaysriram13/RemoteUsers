# 🧑‍💼 RemoteUsers – Real-Time Manager to Remote User Messaging App

**RemoteUsers** is a real-time messaging platform built for managers to effectively communicate with their team members working remotely. It provides live messaging, offline tracking, and role-based controls using modern web technologies.

## 🚀 Live Demo

👉 [Open App](https://remotemessagesenderfrontend.onrender.com)

---

## 📌 Key Features

- 📬 **Message Sending:**  
  Managers can send messages to all remote team members.

- ⚡ **Real-Time Communication (WebSocket):**  
  Messages are delivered instantly and reflected on both manager and user dashboards using **Socket.IO**.

- 🚫 **Offline User Detection:**  
  When a high-priority message is sent, a **popup alert** shows all users who were offline at that time.

- 🧾 **Notification Feed:**  
  Both users and managers can view their message history.

- 🔐 **JWT Authentication:**  
  Separate JWT tokens for **Manager** and **User** roles with protected routes.

- ✏️ **CRUD Operations (Manager):**  
  Managers can create, read, update, and delete messages.

---

## 🛠️ Tech Stack

| Frontend        | Backend        | Real-Time    | Database   | Auth     |
|-----------------|----------------|--------------|------------|----------|
| React.js        | Node.js + Express.js | Socket.IO | MongoDB    | JWT      |

---

## 📁 Folder Structure

