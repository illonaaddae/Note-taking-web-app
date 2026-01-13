# Note-Taking Web App

This is a modern, full-featured note-taking application built with vanilla JavaScript (ES6 Modules) and Appwrite Cloud backend. It demonstrates modular architecture, advanced DOM manipulation, event handling, browser storage APIs, and cloud database integration.

## Features

- Create, read, update, and delete notes
- Archive and unarchive notes
- Organize notes with tags and filter by tag
- Real-time search by title, content, and tags
- Theme switching (light, dark, system)
- Font customization (sans-serif, serif, monospace)
- Cloud database with Appwrite backend
- User authentication (email/password, Google OAuth)
- Password recovery and auto-save drafts
- Responsive design for mobile, tablet, and desktop

## Tech Stack

| Layer          | Technology                            |
| -------------- | ------------------------------------- |
| Frontend       | HTML5, CSS3, Vanilla JavaScript (ES6) |
| Backend        | Appwrite Cloud (BaaS)                 |
| Database       | Appwrite Database                     |
| Authentication | Appwrite Auth + Google OAuth          |
| Styling        | CSS Custom Properties (Design Tokens) |
| Architecture   | ES6 Modules (no build tools)          |

## Project Architecture

The app uses a modular ES6 structure with clear separation of concerns:

- Entry: main.js
- Appwrite SDK wrapper: appwrite.js
- Note logic: noteManager.js
- UI rendering: ui.js
- Storage: storage.js
- Utilities: utils.js
- Auth modules: auth/

## File Structure

```
note-taking-web-app/
├── index.html
├── settings.html
├── data.json
├── auth/
├── scripts/
├── styles/
└── assets/
```

## Appwrite Integration

The app uses Appwrite for database, authentication, and cloud storage. All CRUD operations and user management are handled via the Appwrite SDK.

## Setup & Installation

1. Clone the repository:

```bash
git clone https://github.com/illonaaddae/Note-taking-web-app.git
cd Note-taking-web-app
```

2. Open in VS Code or your preferred editor.
3. Start a static server (e.g., Live Server extension) and open index.html.
4. The app is pre-configured to connect to the Appwrite cloud instance.

## Author

Illona Addae

## License

This project is for educational purposes as part of the AmaliTech training program.

---

## 🏗 Project Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  index.html │  │settings.html│  │   auth/*.html           │  │
│  │  (Dashboard)│  │  (Settings) │  │ (Login/Signup/Reset)    │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
└─────────┼────────────────┼─────────────────────┼────────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                     JAVASCRIPT MODULES                          │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌────────┐ ┌───────────┐  │
│  │ main.js  │ │settings.js│ │ ui.js  │ │theme.js│ │storage.js │  │
│  │ (Entry)  │ │ (Settings)│ │ (DOM)  │ │(Themes)│ │ (Local)   │  │
│  └────┬─────┘ └─────┬─────┘ └───┬────┘ └───┬────┘ └─────┬─────┘  │
│       │             │           │          │            │        │
│       └─────────────┴───────────┴──────────┴────────────┘        │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                    appwrite.js                            │    │
│  │        (Cloud Database & Authentication API)              │    │
│  └────────────────────────────┬─────────────────────────────┘    │
│                               │                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                 noteManager.js                            │    │
│  │           (Pure Functions for Note Logic)                 │    │
│  └──────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     APPWRITE CLOUD                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Database      │  │  Authentication │  │     Storage     │  │
│  │   (notesdb)     │  │  (Users/OAuth)  │  │   (Optional)    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure

```
note-taking-web-app/
│
├── index.html              # Main dashboard page
├── settings.html           # Settings page
├── data.json               # Sample seed data
│
├── auth/                   # Authentication pages
│   ├── login.html          # Login page
│   ├── signup.html         # Sign up page
│   ├── forgot-password.html # Forgot password page
│   └── reset-password.html # Reset password page
│
├── scripts/                # JavaScript modules
│   ├── main.js             # App entry point, event handlers
│   ├── appwrite.js         # Appwrite database operations
│   ├── noteManager.js      # Note data manipulation (pure functions)
│   ├── ui.js               # DOM rendering functions
│   ├── theme.js            # Theme & font switching
│   ├── storage.js          # localStorage & sessionStorage
│   ├── settings.js         # Settings page logic
│   ├── utils.js            # Helper utilities
│   └── auth/               # Auth-specific modules
│       ├── index.js        # Auth pages entry point
│       ├── authService.js  # Appwrite authentication
│       ├── formHandlers.js # Form submission handlers
│       ├── validation.js   # Form validation logic
│       └── passwordToggle.js # Password visibility toggle
│
├── styles/                 # CSS stylesheets
│   ├── tokens.css          # Design tokens (colors, spacing, etc.)
│   ├── base.css            # Base/reset styles
│   ├── components.css      # Reusable component styles
│   ├── dashboard.css       # Dashboard-specific styles
│   ├── settings.css        # Settings page styles
│   ├── auth.css            # Auth pages styles
│   └── themes.css          # Dark theme overrides
│
└── assets/                 # Static assets
    ├── images/             # Icons, logos, images
    └── fonts/              # Custom fonts (Inter, Noto Serif, Source Code Pro)
```

---

## 🌐 Appwrite Integration

### What is Appwrite?

Appwrite is a **Backend-as-a-Service (BaaS)** platform that provides:

- Database (like Firebase Firestore)
- User Authentication
- File Storage
- Real-time subscriptions
- And more...

### Our Appwrite Configuration

```javascript
// scripts/appwrite.js
const CONFIG = {
  endpoint: "https://fra.cloud.appwrite.io/v1", // Appwrite server
  projectId: "69430f2d001f367e2aca", // Our project ID
  databaseId: "notesdb", // Database name
  collectionId: "notes", // Collection (table) name
};
```

### Database Schema

Our `notes` collection has these fields:

| Field        | Type     | Description                  |
| ------------ | -------- | ---------------------------- |
| `$id`        | string   | Auto-generated unique ID     |
| `title`      | string   | Note title                   |
| `content`    | string   | Note body/content            |
| `tags`       | string[] | Array of tag strings         |
| `archived`   | boolean  | Is note archived?            |
| `$createdAt` | datetime | Auto-generated creation time |
| `$updatedAt` | datetime | Auto-generated update time   |

### Appwrite Operations Explained

#### 1. Initialize Appwrite Client

```javascript
// appwrite.js - initAppwrite()
export async function initAppwrite() {
  const { Client, Databases, Account } = window.Appwrite;

  // Create a new Appwrite client
  client = new Client();
  client
    .setEndpoint(CONFIG.endpoint) // Point to Appwrite server
    .setProject(CONFIG.projectId); // Identify our project

  // Initialize services we'll use
  databases = new Databases(client); // For CRUD operations
  account = new Account(client); // For authentication
}
```

#### 2. Create a Note

```javascript
// appwrite.js - createNote()
export async function createNote(note) {
  const { ID } = window.Appwrite;

  // createDocument(databaseId, collectionId, documentId, data)
  const response = await databases.createDocument(
    CONFIG.databaseId,
    CONFIG.collectionId,
    ID.unique(), // Appwrite generates a unique ID
    {
      title: note.title,
      content: note.content,
      tags: note.tags,
      archived: note.archived,
    }
  );

  return response; // Returns the created document
}
```

#### 3. Read All Notes

```javascript
// appwrite.js - getAllNotes()
export async function getAllNotes() {
  const { Query } = window.Appwrite;

  // listDocuments(databaseId, collectionId, queries)
  const response = await databases.listDocuments(
    CONFIG.databaseId,
    CONFIG.collectionId,
    [
      Query.orderDesc("$createdAt"), // Sort by newest first
      Query.limit(100), // Max 100 notes
    ]
  );

  return response.documents; // Array of note objects
}
```

#### 4. Update a Note

```javascript
// appwrite.js - updateNote()
export async function updateNote(noteId, updates) {
  // updateDocument(databaseId, collectionId, documentId, data)
  const response = await databases.updateDocument(
    CONFIG.databaseId,
    CONFIG.collectionId,
    noteId, // The note's unique ID
    updates // Only the fields that changed
  );

  return response;
}
```

#### 5. Delete a Note

```javascript
// appwrite.js - deleteNote()
export async function deleteNote(noteId) {
  // deleteDocument(databaseId, collectionId, documentId)
  await databases.deleteDocument(
    CONFIG.databaseId,
    CONFIG.collectionId,
    noteId
  );

  return true;
}
```

---

## Module Breakdown

### 1. `main.js` - Application Entry Point

**Purpose:** Orchestrates the entire application, initializes modules, and sets up event listeners.

**Key Responsibilities:**

- Initialize Appwrite connection
- Load notes from cloud database
- Set up all event listeners (using event delegation)
- Handle user actions (create, save, delete, archive)
- Manage the notes cache (in-memory array)
- Auto-save drafts to sessionStorage

**Important Variables:**

```javascript
let notesCache = []; // In-memory store of all notes
let currentUser = null; // Logged-in user object
let currentView = "all-notes"; // Current view state
```

**Event Listener Setup (Event Delegation Pattern):**

```javascript
// Instead of adding listeners to each note card:
// ❌ noteCard1.addEventListener('click', ...)
// ❌ noteCard2.addEventListener('click', ...)

// We add ONE listener to the parent container:
// ✅ notesList.addEventListener('click', handleNoteClick)

const notesList = document.getElementById("notes-list");
notesList?.addEventListener("click", handleNoteClick);
// This catches clicks on ALL notes, even ones added later!
```

### 2. `noteManager.js` - Pure Functions for Note Logic

**Purpose:** Contains pure functions (no side effects) for manipulating note data.

**Why Pure Functions?**

- Easier to test
- Predictable behavior
- No hidden dependencies
- Can be reused anywhere

**Key Functions:**

```javascript
// Create a new note object
export function createNote(title, content, tags) {
  return {
    id: generateId(),
    title,
    content,
    tags,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Search notes by query
export function searchNotes(notes, query) {
  const lowerQuery = query.toLowerCase();
  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery) ||
      note.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

// Get all unique tags
export function getAllTags(notes) {
  const tags = new Set();
  notes.forEach((note) => note.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort();
}
```

### 3. `ui.js` - DOM Manipulation

**Purpose:** All functions that touch the DOM (rendering, updating UI elements).

**Key Functions:**

```javascript
// Render all notes to the sidebar list
export function renderAllNotes(notes) {
  const notesList = document.getElementById("notes-list");
  notesList.innerHTML = ""; // Clear existing

  notes.forEach((note) => {
    const noteCard = createNoteCard(note);
    notesList.appendChild(noteCard);
  });
}

// Show note details in the editor panel
export function showNoteDetail(note) {
  document.getElementById("note-title").textContent = note.title;
  document.getElementById("note-content").value = note.content;
  document.getElementById("note-tags").value = note.tags.join(", ");
  // ...
}

// Show toast notification
export function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  // Auto-remove after 3 seconds
}
```

### 4. `theme.js` - Theme System

**Purpose:** Manages color themes and font preferences.

**How It Works:**

```javascript
// Apply theme by setting data attribute on <html>
export function applyTheme(theme) {
  if (theme === "system") {
    // Auto-detect user's OS preference
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    theme = prefersDark ? "dark" : "light";
  }

  document.documentElement.setAttribute("data-theme", theme);
  // CSS uses [data-theme="dark"] selectors for dark mode styles

  savePreferences({ theme }); // Persist to localStorage
}

// Apply font family
export function applyFont(font) {
  document.documentElement.setAttribute("data-font", font);
  // CSS uses [data-font="serif"] selectors

  savePreferences({ font }); // Persist to localStorage
}
```

### 5. `storage.js` - Browser Storage APIs

**Purpose:** Handles localStorage and sessionStorage operations.

**localStorage vs sessionStorage:**
| Feature | localStorage | sessionStorage |
|---------|--------------|----------------|
| Persists | Forever (until cleared) | Until tab closes |
| Use Case | User preferences, theme | Draft auto-save |
| Size | ~5-10MB | ~5-10MB |

**Key Functions:**

```javascript
// Save preferences to localStorage
export function savePreferences(prefs) {
  localStorage.setItem("notes_app_preferences", JSON.stringify(prefs));
}

// Load preferences from localStorage
export function loadPreferences() {
  const prefs = localStorage.getItem("notes_app_preferences");
  return prefs ? JSON.parse(prefs) : { theme: "light", font: "sans-serif" };
}

// Auto-save draft to sessionStorage (survives page refresh, not tab close)
export function saveDraft(draft) {
  sessionStorage.setItem("notes_app_draft", JSON.stringify(draft));
}

// Load draft on page load
export function loadDraft() {
  return JSON.parse(sessionStorage.getItem("notes_app_draft"));
}
```

### 6. `auth/authService.js` - Authentication

**Purpose:** All Appwrite authentication operations.

**Key Functions:**

```javascript
// Sign up new user
export async function signUp(email, password, name) {
  const user = await account.create(ID.unique(), email, password, name);
  await login(email, password); // Auto-login after signup
  return user;
}

// Login with email/password
export async function login(email, password) {
  const session = await account.createEmailPasswordSession(email, password);
  return session;
}

// Login with Google (OAuth)
export function loginWithGoogle() {
  const successUrl = `${window.location.origin}/index.html`;
  const failureUrl = `${window.location.origin}/auth/login.html`;

  // Redirects to Google, then back to our app
  account.createOAuth2Session(OAuthProvider.Google, successUrl, failureUrl);
}

// Send password reset email
export async function sendPasswordRecovery(email) {
  const resetUrl = `${window.location.origin}/auth/reset-password.html`;
  await account.createRecovery(email, resetUrl);
  // User receives email with link containing userId and secret
}

// Complete password reset
export async function resetPassword(userId, secret, newPassword) {
  await account.updateRecovery(userId, secret, newPassword);
}
```

---

## Data Flow

### Creating a Note

```
User clicks "Create Note" button
          │
          ▼
    main.js: handleCreateNote()
          │
          ▼
    appwrite.js: createNote() ──────► Appwrite Cloud Database
          │                                    │
          │                                    ▼
          │                           Document created with
          │                           auto-generated $id
          │                                    │
          ◄────────────────────────────────────┘
          │
          ▼
    Update notesCache array (in-memory)
          │
          ▼
    ui.js: renderAllNotes() ──────► DOM updated
          │
          ▼
    ui.js: showToast("Note created!")
```

### Saving a Note

```
User edits note and clicks "Save"
          │
          ▼
    main.js: handleSaveNote()
          │
          ▼
    Get current note ID from ui.getCurrentNoteId()
          │
          ▼
    Read title, content, tags from DOM
          │
          ▼
    appwrite.js: updateNote(noteId, data) ──────► Appwrite
          │                                           │
          ◄───────────────────────────────────────────┘
          │
          ▼
    Update notesCache[index] with new data
          │
          ▼
    clearDraft() ──────► sessionStorage cleared
          │
          ▼
    ui.js: renderAllNotes() & showToast()
```

---

## Event Handling

### Event Delegation Example

```javascript
// main.js - We use event delegation for efficiency

// ONE listener handles ALL note cards (even future ones)
const notesList = document.getElementById("notes-list");
notesList.addEventListener("click", handleNoteClick);

function handleNoteClick(e) {
  // Find which note card was clicked
  const noteCard = e.target.closest(".note-card");
  if (!noteCard) return;

  // Get the note ID from data attribute
  const noteId = noteCard.dataset.noteId;

  // Find note in cache and display it
  const note = notesCache.find((n) => n.id === noteId);
  if (note) {
    ui.showNoteDetail(note);
    ui.setActiveNote(noteId);
  }
}
```

### Keyboard Navigation

```javascript
// main.js - handleKeyboardNav()
document.addEventListener("keydown", handleKeyboardNav);

function handleKeyboardNav(e) {
  // Escape - Close modal or cancel edit
  if (e.key === "Escape") {
    closeModal();
    return;
  }

  // Ctrl/Cmd + Enter - Save note
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    handleSaveNote();
    return;
  }

  // Arrow keys - Navigate notes list
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    // Move to next/previous note card
  }
}
```

---

## Authentication Flow

### Sign Up Flow

```
1. User fills signup form
2. authService.signUp(email, password, name)
3. Appwrite creates user account
4. Auto-login after signup
5. Redirect to dashboard (index.html)
```

### Login Flow

```
1. User fills login form
2. authService.login(email, password)
3. Appwrite validates credentials
4. Creates session cookie
5. Redirect to dashboard
```

### Google OAuth Flow

```
1. User clicks "Sign in with Google"
2. authService.loginWithGoogle()
3. Redirect to Google consent screen
4. User grants permission
5. Google redirects back to our successUrl
6. Appwrite creates/links account
7. User is now logged in
```

### Password Reset Flow

```
1. User clicks "Forgot Password"
2. Enters email address
3. authService.sendPasswordRecovery(email)
4. Appwrite sends email with reset link
5. User clicks link → reset-password.html?userId=xxx&secret=xxx
6. User enters new password
7. authService.resetPassword(userId, secret, newPassword)
8. Redirect to login page
```

---

## Storage Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    STORAGE LAYERS                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              APPWRITE CLOUD DATABASE                 │   │
│  │  • All notes (permanent, synced across devices)     │   │
│  │  • User accounts                                     │   │
│  │  • Authentication sessions                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                │
│                            ▼                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  LOCAL STORAGE                       │   │
│  │  • Theme preference (light/dark/system)             │   │
│  │  • Font preference (sans-serif/serif/monospace)     │   │
│  │  • Persists forever until cleared                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                │
│                            ▼                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 SESSION STORAGE                      │   │
│  │  • Draft auto-save (while typing)                   │   │
│  │  • Restored on page refresh                         │   │
│  │  • Cleared on tab close or successful save          │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                │
│                            ▼                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 IN-MEMORY CACHE                      │   │
│  │  • notesCache array in main.js                      │   │
│  │  • Fast access without database calls               │   │
│  │  • Synced with Appwrite on changes                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Theming System

### CSS Custom Properties (Design Tokens)

```css
/* styles/tokens.css */
:root {
  /* Colors */
  --neutral-0: #ffffff;
  --neutral-950: #0e121b;
  --blue-500: #335cff;

  /* Semantic tokens */
  --bg-primary: var(--neutral-0);
  --text-primary: var(--neutral-950);
  --brand-primary: var(--blue-500);

  /* Spacing scale (4px base) */
  --space-1: 4px;
  --space-2: 8px;
  --space-4: 16px;
  /* ... */
}

/* Dark theme overrides */
[data-theme="dark"] {
  --bg-primary: var(--neutral-950);
  --text-primary: var(--neutral-0);
}

/* Font theme */
[data-font="serif"] {
  --font-body: "Noto Serif", serif;
}
[data-font="monospace"] {
  --font-body: "Source Code Pro", monospace;
}
```

---

## Responsive Design

### Breakpoints

```css
/* Mobile First Approach */

/* Base styles = Mobile (< 768px) */
.note-card {
  ...;
}

/* Tablet (768px - 1024px) */
@media (min-width: 768px) {
  .note-card {
    ...;
  }
}

/* Desktop (> 1024px) */
@media (min-width: 1024px) {
  .note-card {
    ...;
  }
}
```

### Layout Strategy

| Viewport            | Layout                                 |
| ------------------- | -------------------------------------- |
| Mobile (<768px)     | Single column, bottom nav, FAB         |
| Tablet (768-1024px) | Single column with side panel          |
| Desktop (>1024px)   | Three columns (sidebar, notes, detail) |

---

## Setup & Installation

### Prerequisites

- Any modern web browser
- A code editor (VS Code recommended)
- Live Server extension (or any static server)

### Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/illonaaddae/Note-taking-web-app.git
   cd Note-taking-web-app
   ```

2. **Open in VS Code**

   ```bash
   code .
   ```

3. **Start Live Server**

   - Right-click `index.html`
   - Select "Open with Live Server"

4. **Appwrite Setup (Already Configured)**
   - The app connects to our Appwrite cloud instance
   - No additional setup needed for testing

### Appwrite Console Access

- URL: https://cloud.appwrite.io
- Project: Notes App (ID: 69430f2d001f367e2aca)

---

## Lab Requirements Coverage

### DOM Manipulation (25%)

| Requirement                 | Implementation                              | File  |
| --------------------------- | ------------------------------------------- | ----- |
| Create elements dynamically | ✅ `createNoteCard()`                       | ui.js |
| Append to DOM               | ✅ `renderAllNotes()`                       | ui.js |
| Update DOM in real-time     | ✅ `showNoteDetail()`                       | ui.js |
| Remove elements             | ✅ `renderAllNotes()` clears and re-renders | ui.js |

### Event Handling (25%)

| Requirement         | Implementation           | File                          |
| ------------------- | ------------------------ | ----------------------------- |
| Click events        | ✅ All buttons and cards | main.js                       |
| Input events        | ✅ Search, form fields   | main.js                       |
| Submit events       | ✅ Forms                 | main.js, auth/formHandlers.js |
| Event delegation    | ✅ Notes list, tags list | main.js                       |
| Keyboard navigation | ✅ Escape, Enter, Arrows | main.js                       |

### Browser APIs (20%)

| Requirement    | Implementation               | File                |
| -------------- | ---------------------------- | ------------------- |
| localStorage   | ✅ Preferences               | storage.js          |
| sessionStorage | ✅ Draft auto-save           | storage.js, main.js |
| Additional API | ✅ Appwrite (cloud database) | appwrite.js         |

### Code Organization (15%)

| Requirement            | Implementation                              |
| ---------------------- | ------------------------------------------- |
| ES6 Modules            | ✅ All files use import/export              |
| Separation of concerns | ✅ Distinct modules for each responsibility |
| Reusable functions     | ✅ Pure functions in noteManager.js         |

### Interactive Features (10%)

| Requirement     | Implementation               |
| --------------- | ---------------------------- |
| CRUD operations | ✅ Full implementation       |
| Archive system  | ✅ Toggle archive status     |
| Tag system      | ✅ Add, filter, display tags |
| Search          | ✅ Real-time search          |
| Themes          | ✅ Light, Dark, System       |

### Accessibility & Responsiveness (5%)

| Requirement         | Implementation                 |
| ------------------- | ------------------------------ |
| Keyboard navigation | ✅ Full keyboard support       |
| ARIA labels         | ✅ On all interactive elements |
| Responsive design   | ✅ Mobile, Tablet, Desktop     |
| Focus management    | ✅ Modal focus trap            |

### Bonus Features 

| Feature               | Implementation                   |
| --------------------- | -------------------------------- |
| Cloud Database        | ✅ Appwrite integration          |
| User Authentication   | ✅ Email/Password + Google OAuth |
| Password Recovery     | ✅ Forgot/Reset password flow    |
| Dark Mode Auto-detect | ✅ `prefers-color-scheme`        |

---

## Lab Defense Preparation

### Key Points to Mention

1. **"Why Appwrite instead of just localStorage?"**

   - Real-world applications need cloud databases
   - Data persists across devices
   - Demonstrates understanding of backend integration
   - Shows initiative beyond basic requirements

2. **"How does event delegation work?"**

   - Instead of attaching listeners to each element, we attach ONE listener to the parent
   - Events "bubble up" from child to parent
   - More efficient (less memory) and works for dynamically added elements
   - Example: `notesList.addEventListener('click', ...)` handles all note cards

3. **"Explain the module architecture"**

   - Each module has a single responsibility
   - `appwrite.js` - database operations only
   - `ui.js` - DOM manipulation only
   - `noteManager.js` - data logic only
   - `main.js` - orchestrates everything

4. **"How does the theme system work?"**

   - CSS custom properties for all colors/spacing
   - JavaScript sets `data-theme` attribute on `<html>`
   - CSS uses `[data-theme="dark"]` selectors
   - Preferences saved to localStorage

5. **"What's the difference between localStorage and sessionStorage?"**
   - localStorage: persists forever
   - sessionStorage: cleared when tab closes
   - We use localStorage for preferences (permanent)
   - We use sessionStorage for draft auto-save (temporary)

---

## Author

**Illona Addae**  
AmaliTech - Module Lab Project

---

## License

This project is for educational purposes as part of the AmaliTech training program.
