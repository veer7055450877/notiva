24157e53b9f8c70cdfd19ed99d28cd6d93ac80bb5ff6dbe292a39f515d8cbc38

# Notiva — Intelligent Notes Workspace

Notiva is a modern, responsive note management web application built with **React, TypeScript, and TailwindCSS**.
It provides a fast and polished user experience for creating, managing, and organizing notes with advanced UX features such as command shortcuts, optimistic updates, and offline synchronization.

This project was built as part of a frontend internship challenge.

---

## 🌐 Live Demo

Deployed App:
https://notiva.vercel.app

---

## 📦 GitHub Repository

https://github.com/ConceptualCode-official/Notiva_notes-workspace

---

## 🛠 Tech Stack

- React
- TypeScript
- TailwindCSS
- Fetch API
- MockAPI
- Vite

---

## ✨ Features

### Notes Management
- Create notes
- Edit notes
- Delete notes
- Soft delete with undo (10 seconds)
- Pin important notes
- Duplicate notes

### Search & Organization
- Debounced search
- Sort notes by title, date, or ID
- Pagination (20 notes per page)
- Tag system
- Color labels for notes

### UI / UX
- Fully responsive layout
- Dark mode toggle
- Modern card-based layout
- Command palette (Ctrl + K)
- Keyboard shortcuts
- Floating action button
- Focus mode for reading notes
- Smooth animations and transitions

### Performance & Async UX
- Optimistic UI updates
- Skeleton loading states
- Loading indicators for async actions
- Error handling
- Empty states for better UX

### Offline Support
- Notes cached locally when offline
- Pending changes queued locally
- Automatic sync with API when connection is restored
- Sync status indicator

### Additional Features
- Export notes as JSON
- Import notes
- Note statistics dashboard
- Activity timeline

---

## ⚙️ API

This project uses **MockAPI** as the backend service.

Endpoints used:

GET /notes
POST /notes
PUT /notes/:id
DELETE /notes/:id

All API requests are handled through a reusable API service module.

---

## 📂 Project Structure


src
├── api
│ ├── api.ts
│ └── mockApi.ts
│
├── components
│ ├── CommandPalette.tsx
│ ├── Layout.tsx
│ ├── DeleteModal.tsx
│ ├── CustomSelect.tsx
│ ├── DeviceStatus.tsx
│ ├── FocusMode.tsx
│ ├── NoteCard.tsx
│ ├── NoteEditor.tsx
│ └── ThemeToggle.tsx
│
├── context
│ └── NotesContext.tsx
│
├── hooks
│ ├── useDebounce.ts
│ └── useDeviceStatus.ts
│
├── pages
│ ├── Home.tsx
│ └── NotFound.tsx
│
├── types
│ └── index.ts
│
├── App.tsx
├── index.css
└── main.tsx


---

## 🚀 How to Run the Project

### 1️⃣ Clone the repository


git clone https://github.com/ConceptualCode-official/Notiva_notes-workspace.git


### 2️⃣ Navigate to the project folder


cd Notiva_notes-workspace


### 3️⃣ Install dependencies


npm install || yarn install


### 4️⃣ Start development server


npm run dev || yarn dev


The application will run at:


http://localhost:5171


---

## 🚀 Deployment

This project can be deployed using:

- Vercel
- Netlify
- GitHub Pages

---

## 💡 Additional Feature

One custom feature added in this project is the **Command Palette**.

Users can press **Ctrl + K** to quickly access commands such as:

- Create new note
- Search notes
- Toggle dark mode
- Navigate pages
- Export notes

This improves productivity and provides a power-user experience inspired by modern productivity tools.

---

## 🧠 Development Approach

The main goal was to build a **clean, scalable frontend architecture** while providing a polished user experience.

Key decisions:

- Separate API logic from UI components
- Use TypeScript for type safety
- Implement reusable components
- Focus heavily on UX (loading states, empty states, keyboard shortcuts)
- Optimize async interactions with optimistic UI updates

---

## ⚖️ Trade-offs & Assumptions

- MockAPI is used as a mock backend instead of a real database.
- Offline support uses browser storage as a temporary cache.
- Rich text editing features were simplified to keep the app lightweight.

---

## 📚 Dependencies Added

- TailwindCSS → UI styling
- React → frontend framework
- TypeScript → type safety
- MockAPI → backend API service

---

## 🔮 Future Improvements

If more time were available, the following improvements would be added:

- Markdown support in notes
- Real-time collaboration
- Authentication system
- Advanced note tagging and filtering
- Cloud backup support
- AI-powered note summarization

---

## 👨‍💻 Created By

ConceptualCode (Veer Singh)
Frontend Developer

GitHub: https://github.com/conceptualcode-official
Instagram: https://instagram.com/conceptualcode
LinkedIn: https://www.linkedin.com/in/vivek-kumar786

---
