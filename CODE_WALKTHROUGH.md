# 📚 Complete Code Walkthrough for Lab Defense

This document explains every file in the Note-Taking Web App, line by line, for lab defense preparation.

---

## 🏗️ Architecture Overview

This app follows a **modular ES6 architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                        index.html                           │
│         (Loads Appwrite SDK via CDN + main.js module)       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       main.js (Entry Point)                  │
│  - Initializes everything                                    │
│  - Holds notesCache (in-memory data)                        │
│  - Sets up all event listeners                              │
│  - Orchestrates flow between modules                        │
└─────────────────────────────────────────────────────────────┘
         ↓                    ↓                    ↓
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   appwrite.js   │  │      ui.js      │  │  noteManager.js │
│ (Database CRUD) │  │ (DOM Rendering) │  │  (Pure Logic)   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         ↓                    ↓                    ↓
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   storage.js    │  │    theme.js     │  │    utils.js     │
│ (Browser APIs)  │  │ (Theme System)  │  │ (DOM Helpers)   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 📁 FILE 1: utils.js - DOM Helper

**Purpose:** A utility function to simplify DOM selection.

```javascript
export function getDocument(selectorName, type) {
  switch (type) {
    case "id":
      return document.getElementById(selectorName); // Gets element by ID
    case "class":
      return document.getElementsByClassName(selectorName); // Gets all by class
    case "tag":
      return document.getElementsByTagName(selectorName); // Gets all by tag
    case "query":
      return document.querySelector(selectorName); // CSS selector (first match)
    case "queryAll":
      return document.querySelectorAll(selectorName); // CSS selector (all matches)
    default:
      return null;
  }
}
```

**Why this exists:** Instead of writing `document.getElementById()` everywhere, you can write `getDocument("email", "id")`. It's a **wrapper function** that makes code cleaner.

---

## 📁 FILE 2: storage.js - Browser Storage APIs

**Purpose:** Handles all browser storage operations (localStorage & sessionStorage).

### Constants (Storage Keys)

```javascript
const NOTES_KEY = "notes_app_notes"; // Key for notes in localStorage
const PREFERENCES_KEY = "notes_app_preferences"; // Key for settings (theme, font)
const DRAFT_KEY = "notes_app_draft"; // Key for draft in sessionStorage
```

### localStorage Functions (Persistent - survives browser close)

```javascript
// SAVE NOTES - Stores notes array as JSON string
export function saveNotes(notes) {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); // Convert array to string
  } catch (e) {
    if (e.name === "QuotaExceededError") {
      // Handle storage full error
      alert("Storage is full. Please delete some notes.");
    }
  }
}

// LOAD NOTES - Retrieves and parses notes from storage
export function loadNotes() {
  const notes = localStorage.getItem(NOTES_KEY); // Get string from storage
  return notes ? JSON.parse(notes) : []; // Parse back to array, or empty array
}
```

### Preferences Functions

```javascript
// SAVE PREFERENCES - Merges new settings with existing
export function savePreferences(prefs) {
  const existing = loadPreferences(); // Get current settings
  const updated = { ...existing, ...prefs }; // Spread operator merges objects
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
}

// LOAD PREFERENCES - Returns settings with defaults
export function loadPreferences() {
  const prefs = localStorage.getItem(PREFERENCES_KEY);
  return prefs ? JSON.parse(prefs) : { theme: "light", font: "sans-serif" };
}
```

### sessionStorage Functions (Temporary - cleared when tab closes)

```javascript
// SAVE DRAFT - Auto-saves while typing
export function saveDraft(draft) {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

// LOAD DRAFT - Recovers unsaved work
export function loadDraft() {
  const draft = sessionStorage.getItem(DRAFT_KEY);
  return draft ? JSON.parse(draft) : null;
}

// CLEAR DRAFT - Called after successful save
export function clearDraft() {
  sessionStorage.removeItem(DRAFT_KEY);
}
```

**Key Concept - localStorage vs sessionStorage:**

- **localStorage**: Data persists forever until manually cleared
- **sessionStorage**: Data deleted when browser tab closes

---

## 📁 FILE 3: noteManager.js - Pure Logic Functions

**Purpose:** Contains **pure functions** for data manipulation. No DOM, no API calls - just logic.

### Why "Pure Functions"?

A pure function:

1. Always returns same output for same input
2. Has no side effects (doesn't modify external state)
3. Easy to test and reuse

### Helper Functions

```javascript
// Generate unique ID using timestamp + random string
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
  // Date.now() = milliseconds since 1970
  // .toString(36) = convert to base-36 (0-9 + a-z)
  // .substr(2) = remove "0." prefix from random number
}

// Format date for display (e.g., "23 Dec 2024")
export function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return date.toLocaleDateString("en-GB", options); // British format: DD Mon YYYY
}
```

### CRUD Operations (on local array)

```javascript
// CREATE - Returns new note object
export function createNote(title, content, tags = []) {
  const now = new Date().toISOString(); // ISO format: "2024-12-23T10:30:00.000Z"
  return {
    id: generateId(),
    title: title || "Untitled Note",
    content: content || "",
    tags: tags, // Array of strings
    archived: false,
    createdAt: now,
    updatedAt: now,
  };
}

// UPDATE - Returns new array with updated note (immutable)
export function updateNote(notes, id, updates) {
  return notes.map((note) => {
    // .map() creates new array
    if (note.id === id) {
      return {
        ...note, // Spread existing properties
        ...updates, // Override with new values
        updatedAt: new Date().toISOString(),
      };
    }
    return note; // Unchanged notes pass through
  });
}

// DELETE - Returns new array without the note
export function deleteNote(notes, id) {
  return notes.filter((note) => note.id !== id); // Keep all except matching ID
}

// ARCHIVE - Toggle archived status
export function archiveNote(notes, id) {
  return notes.map((note) => {
    if (note.id === id) {
      return {
        ...note,
        archived: !note.archived, // Toggle: true→false or false→true
        updatedAt: new Date().toISOString(),
      };
    }
    return note;
  });
}
```

### Search & Filter Functions

```javascript
// SEARCH - Filter notes by query in title, content, or tags
export function searchNotes(notes, query) {
  if (!query) return notes; // Return all if no query

  const lowerQuery = query.toLowerCase(); // Case-insensitive search
  return notes.filter((note) => {
    const titleMatch = note.title.toLowerCase().includes(lowerQuery);
    const contentMatch = note.content.toLowerCase().includes(lowerQuery);
    const tagMatch = note.tags.some(
      (
        tag // .some() = at least one matches
      ) => tag.toLowerCase().includes(lowerQuery)
    );
    return titleMatch || contentMatch || tagMatch; // Match any field
  });
}

// FILTER BY TAG - Find notes with specific tag
export function filterByTag(notes, tag) {
  return notes.filter((note) => note.tags.includes(tag));
}

// GET ALL TAGS - Extract unique tags from all notes
export function getAllTags(notes) {
  const tags = new Set(); // Set = unique values only
  notes.forEach((note) => {
    note.tags.forEach((tag) => tags.add(tag)); // Add each tag
  });
  return Array.from(tags).sort(); // Convert Set to sorted Array
}
```

---

## 📁 FILE 4: appwrite.js - Database Operations

**Purpose:** All communication with Appwrite cloud database.

### Configuration

```javascript
const CONFIG = {
  endpoint: "https://fra.cloud.appwrite.io/v1", // Appwrite server (Frankfurt)
  projectId: "69430f2d001f367e2aca", // Your project ID
  databaseId: "notesdb", // Database name
  collectionId: "notes", // Collection (table) name
};

let client; // Appwrite client instance
let databases; // Database operations
let account; // Authentication operations
```

### Initialize Appwrite

```javascript
export async function initAppwrite() {
  // Destructure classes from global Appwrite SDK (loaded via CDN)
  const { Client, Databases, Account } = window.Appwrite;

  // Create and configure client
  client = new Client();
  client.setEndpoint(CONFIG.endpoint).setProject(CONFIG.projectId);

  // Create service instances
  databases = new Databases(client); // For CRUD operations
  account = new Account(client); // For authentication

  // Verify connection with ping
  try {
    const ping = await client.ping();
    console.log("✅ Appwrite connection verified:", ping);
  } catch (error) {
    console.error("❌ Appwrite ping failed:", error.message);
  }
}
```

### Authentication Functions

```javascript
// GET CURRENT USER - Check who's logged in
export async function getCurrentUser() {
  try {
    const user = await account.get(); // Appwrite SDK method
    return user; // Returns user object
  } catch (error) {
    console.error("Get current user error:", error);
    return null; // Not logged in
  }
}

// LOGOUT - Delete current session
export async function logout() {
  try {
    await account.deleteSession("current"); // "current" = this session
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
}

// UPDATE PASSWORD
export async function updatePassword(newPassword, oldPassword) {
  try {
    await account.updatePassword(newPassword, oldPassword);
    return true;
  } catch (error) {
    throw error; // Re-throw for caller to handle
  }
}
```

### CRUD Operations

```javascript
// GET ALL NOTES
export async function getAllNotes() {
  try {
    const { Query } = window.Appwrite;

    const response = await databases.listDocuments(
      CONFIG.databaseId,
      CONFIG.collectionId,
      [
        Query.orderDesc("$createdAt"), // Sort by creation date (newest first)
        Query.limit(100), // Maximum 100 notes
      ]
    );

    // Transform Appwrite document format to our note format
    return response.documents.map((doc) => ({
      id: doc.$id, // Appwrite uses $id
      title: doc.title,
      content: doc.content || "", // Default to empty string
      tags: doc.tags || [], // Default to empty array
      archived: doc.archived || false,
      createdAt: doc.$createdAt, // Appwrite auto-generated
      updatedAt: doc.$updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching notes:", error);
    return []; // Return empty array on error
  }
}

// CREATE NOTE
export async function createNote(note) {
  try {
    const { ID } = window.Appwrite;

    const response = await databases.createDocument(
      CONFIG.databaseId,
      CONFIG.collectionId,
      ID.unique(), // Generate unique document ID
      {
        title: note.title || "Untitled Note",
        content: note.content || "",
        tags: note.tags || [],
        archived: note.archived || false,
      }
    );

    // Return in our note format
    return {
      id: response.$id,
      title: response.title,
      content: response.content,
      tags: response.tags,
      archived: response.archived,
      createdAt: response.$createdAt,
      updatedAt: response.$updatedAt,
    };
  } catch (error) {
    throw error; // Let caller handle
  }
}

// UPDATE NOTE
export async function updateNote(noteId, updates) {
  try {
    const response = await databases.updateDocument(
      CONFIG.databaseId,
      CONFIG.collectionId,
      noteId,
      {
        // Spread syntax with conditional - only include if defined
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.content !== undefined && { content: updates.content }),
        ...(updates.tags !== undefined && { tags: updates.tags }),
        ...(updates.archived !== undefined && { archived: updates.archived }),
      }
    );
    // Return transformed note...
  } catch (error) {
    throw error;
  }
}

// DELETE NOTE
export async function deleteNote(noteId) {
  try {
    await databases.deleteDocument(
      CONFIG.databaseId,
      CONFIG.collectionId,
      noteId
    );
    return true;
  } catch (error) {
    throw error;
  }
}

// ARCHIVE NOTE (wrapper around updateNote)
export async function archiveNote(noteId, archived) {
  return updateNote(noteId, { archived }); // Reuses updateNote
}
```

### Search Notes (with fallback)

```javascript
export async function searchNotes(query) {
  try {
    const { Query } = window.Appwrite;

    const response = await databases.listDocuments(
      CONFIG.databaseId,
      CONFIG.collectionId,
      [
        Query.or([
          // OR query - match either
          Query.contains("title", query),
          Query.contains("content", query),
        ]),
      ]
    );
    // Return transformed results...
  } catch (error) {
    // FALLBACK: If API search fails, search locally
    const allNotes = await getAllNotes();
    const lowerQuery = query.toLowerCase();
    return allNotes.filter(
      (note) =>
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery)
    );
  }
}
```

---

## 📁 FILE 5: ui.js - DOM Manipulation

**Purpose:** All DOM rendering and UI updates. No business logic, no API calls.

### State Management

```javascript
let currentNoteId = null; // Track which note is being edited

// Getter and setter functions
export function getCurrentNoteId() {
  return currentNoteId;
}

export function setCurrentNoteId(id) {
  currentNoteId = id;
}

export function clearCurrentNoteId() {
  currentNoteId = null;
}
```

### Render Functions

```javascript
// Render a single note card (returns HTML string)
function renderNoteCard(note) {
  // Create tag badges HTML
  const tagsHtml = note.tags
    .map((tag) => `<span class="tag-badge">${tag}</span>`)
    .join(""); // Join array elements into single string

  // Return HTML template using template literals
  return `
    <div class="note-card" data-note-id="${note.id}">
      <h3 class="note-card-title">${note.title || "Untitled Note"}</h3>
      <div class="note-card-tags">${tagsHtml}</div>
      <span class="note-card-date">${formatDate(note.updatedAt)}</span>
    </div>
  `;
}

// Render all notes in sidebar list
export function renderAllNotes(notes) {
  const notesList = document.getElementById("notes-list");
  if (!notesList) return;

  // Check if showing archived or all notes
  const pageTitle = document.getElementById("page-title")?.textContent || "";
  const isArchivePage = pageTitle.includes("Archived");

  const filteredNotes = isArchivePage
    ? notes.filter((n) => n.archived)
    : notes.filter((n) => !n.archived);

  // Show empty state if no notes
  if (filteredNotes.length === 0) {
    notesList.innerHTML = `
      <div class="empty-state">
        <p>No notes yet. Create your first note!</p>
      </div>
    `;
    return;
  }

  // Render all note cards
  notesList.innerHTML = filteredNotes.map(renderNoteCard).join("");
}
```

### Show Note Detail

```javascript
export function showNoteDetail(note) {
  currentNoteId = note.id; // Track current note

  // Get DOM elements
  const titleEl = document.getElementById("note-title");
  const contentEl = document.getElementById("note-content");
  const tagsEl = document.getElementById("note-tags");
  const dateEl = document.getElementById("note-date");
  const statusRow = document.getElementById("note-status-row");
  const statusEl = document.getElementById("note-status");

  // Populate fields
  if (titleEl) titleEl.textContent = note.title || "";
  if (contentEl) contentEl.value = note.content || "";
  if (tagsEl) tagsEl.value = note.tags.join(", ") || ""; // Array to comma-separated
  if (dateEl) dateEl.textContent = formatDate(note.updatedAt);

  // Show/hide archived status
  if (statusRow && statusEl) {
    if (note.archived) {
      statusRow.classList.remove("hidden");
      statusEl.textContent = "Archived";
    } else {
      statusRow.classList.add("hidden");
    }
  }

  // Auto-focus title if empty (new note)
  if (!note.title || note.title === "Untitled Note") {
    titleEl?.focus();
  }

  // Show detail section on mobile
  const detailSection = document.getElementById("note-detail");
  detailSection?.classList.add("active");
}
```

### Toast Notifications

```javascript
export function showToast(message, type = "success") {
  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`; // Dynamic class
  toast.textContent = message;

  // Add to page
  document.body.appendChild(toast);

  // Animate in (CSS transition)
  setTimeout(() => toast.classList.add("show"), 10);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300); // Wait for fade-out animation
  }, 3000);
}
```

### Update UI Elements

```javascript
// Update tag list in sidebar
export function updateTagList(tags) {
  const tagsList = document.getElementById("sidebar-tags");
  if (!tagsList) return;

  const tagsHtml = tags
    .map(
      (tag) => `
      <li class="tag-item" data-tag="${tag}">
        <img src="assets/images/icon-tag.svg" alt="" />
        <span>${tag}</span>
      </li>
    `
    )
    .join("");

  tagsList.innerHTML = tagsHtml;
}

// Set active note in list (visual highlight)
export function setActiveNote(noteId) {
  // Remove active from all
  document.querySelectorAll(".note-card").forEach((card) => {
    card.classList.remove("active");
  });

  // Add active to selected
  const activeCard = document.querySelector(`[data-note-id="${noteId}"]`);
  activeCard?.classList.add("active"); // Optional chaining - won't error if null
}
```

---

## 📁 FILE 6: theme.js - Theme System

**Purpose:** Handles theme (light/dark) and font switching.

### Constants

```javascript
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system", // Follow OS preference
};

export const FONTS = {
  SANS_SERIF: "sans-serif",
  SERIF: "serif",
  MONOSPACE: "monospace",
};
```

### System Theme Detection

```javascript
function getSystemTheme() {
  // CSS Media Query in JavaScript
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return THEMES.DARK;
  }
  return THEMES.LIGHT;
}
```

### Apply Theme

```javascript
export function applyTheme(theme) {
  let effectiveTheme = theme;

  // If user chose "system", detect actual preference
  if (theme === THEMES.SYSTEM) {
    effectiveTheme = getSystemTheme();
  }

  // Set data attribute on <html> element
  // CSS uses [data-theme="dark"] selector for dark styles
  document.documentElement.setAttribute("data-theme", effectiveTheme);

  // Save user's choice (not the effective theme)
  savePreferences({ theme });
}

export function applyFont(font) {
  // CSS uses [data-font="serif"] selector
  document.documentElement.setAttribute("data-font", font);
  savePreferences({ font });
}
```

### Initialize Theme

```javascript
export function initTheme() {
  const prefs = loadPreferences();

  applyTheme(prefs.theme || THEMES.LIGHT);
  applyFont(prefs.font || FONTS.SANS_SERIF);

  // Listen for system theme changes (OS dark mode toggle)
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (getCurrentTheme() === THEMES.SYSTEM) {
        applyTheme(THEMES.SYSTEM); // Re-apply to pick up change
      }
    });
}
```

---

## 📁 FILE 7: main.js - Entry Point (The Orchestrator)

**Purpose:** Ties everything together. Initializes app, manages state, handles events.

### Imports & State

```javascript
// Import all modules
import * as appwrite from "./appwrite.js";
import * as noteManager from "./noteManager.js";
import * as ui from "./ui.js";
import {
  loadPreferences,
  saveDraft,
  loadDraft,
  clearDraft,
} from "./storage.js";
import { initTheme } from "./theme.js";

// Application state (in-memory)
let notesCache = []; // All notes loaded from Appwrite
let currentUser = null; // Logged in user
let modalCallback = null; // For confirmation modals
let currentView = "all-notes"; // Current page view
```

### Initialization (DOMContentLoaded)

```javascript
// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", () => {
  init();
});

async function init() {
  try {
    // 1. Initialize Appwrite client
    appwrite.initAppwrite();

    // 2. Check if user is logged in
    currentUser = await appwrite.getCurrentUser();

    // 3. Load all notes from database
    notesCache = await appwrite.getAllNotes();

    // 4. Render notes (only non-archived)
    ui.renderAllNotes(notesCache.filter((n) => !n.archived));

    // 5. Update tags in sidebar
    ui.updateTagList(noteManager.getAllTags(notesCache));

    // 6. Set up all event listeners
    setupEventListeners();

    // 7. Initialize theme
    initTheme();

    // 8. Check for unsaved drafts
    restoreDraft();

    console.log("Notes app initialized with Appwrite!");
  } catch (error) {
    console.error("Failed to initialize app:", error);
    ui.showToast("Failed to connect to database", "error");
  }
}
```

### Event Listeners Setup (Event Delegation pattern)

```javascript
function setupEventListeners() {
  // Button clicks
  const createNoteBtn = document.getElementById("create-note-btn");
  createNoteBtn?.addEventListener("click", handleCreateNote);

  const saveNoteBtn = document.getElementById("save-note-btn");
  saveNoteBtn?.addEventListener("click", handleSaveNote);

  // EVENT DELEGATION - One listener for many items
  const notesList = document.getElementById("notes-list");
  notesList?.addEventListener("click", handleNoteClick);
  // Instead of adding listener to each note card,
  // we listen on parent and check what was clicked

  const sidebarTags = document.getElementById("sidebar-tags");
  sidebarTags?.addEventListener("click", handleTagClick);

  // Search input
  const searchInput = document.getElementById("search-input");
  searchInput?.addEventListener("input", handleSearch);
  // "input" fires on every keystroke

  // Keyboard navigation
  document.addEventListener("keydown", handleKeyboardNav);

  // Auto-save draft on typing
  const noteTitle = document.getElementById("note-title");
  const noteContent = document.getElementById("note-content");
  const noteTags = document.getElementById("note-tags");

  noteTitle?.addEventListener("input", handleDraftAutoSave);
  noteContent?.addEventListener("input", handleDraftAutoSave);
  noteTags?.addEventListener("input", handleDraftAutoSave);
}
```

### Event Handlers

```javascript
// CREATE NOTE
async function handleCreateNote() {
  try {
    // 1. Create in Appwrite database
    const newNote = await appwrite.createNote({
      title: "Untitled Note",
      content: "",
      tags: [],
      archived: false,
    });

    // 2. Add to local cache (at beginning)
    notesCache.unshift(newNote); // unshift adds to start of array

    // 3. Update UI
    ui.renderAllNotes(notesCache.filter((n) => !n.archived));
    ui.showNoteDetail(newNote);
    ui.setActiveNote(newNote.id);

    ui.showToast("New note created!");
  } catch (error) {
    ui.showToast("Failed to create note", "error");
  }
}

// SAVE NOTE
async function handleSaveNote() {
  const noteId = ui.getCurrentNoteId();
  if (!noteId) return; // Guard clause - exit early if no note selected

  // Get values from DOM
  const title = document.getElementById("note-title")?.textContent || "";
  const content = document.getElementById("note-content")?.value || "";
  const tagsText = document.getElementById("note-tags")?.value || "";

  // Convert comma-separated tags to array
  const tags = tagsText
    .split(",") // Split by comma
    .map((t) => t.trim()) // Remove whitespace
    .filter((t) => t); // Remove empty strings

  try {
    // 1. Update in Appwrite
    const updatedNote = await appwrite.updateNote(noteId, {
      title,
      content,
      tags,
    });

    // 2. Update local cache
    const index = notesCache.findIndex((n) => n.id === noteId);
    if (index !== -1) {
      notesCache[index] = updatedNote;
    }

    // 3. Update UI
    ui.renderAllNotes(notesCache.filter((n) => !n.archived));
    ui.updateTagList(noteManager.getAllTags(notesCache));

    // 4. Clear draft (successful save)
    clearDraft();

    ui.showToast("Note saved successfully!");
  } catch (error) {
    ui.showToast("Failed to save note", "error");
  }
}

// NOTE CLICK (Event Delegation)
function handleNoteClick(e) {
  // Find the clicked note card (might have clicked child element)
  const noteCard = e.target.closest(".note-card");
  if (!noteCard) return; // Clicked outside any note card

  const noteId = noteCard.dataset.noteId; // Get data-note-id attribute
  const note = notesCache.find((n) => n.id === noteId);

  if (note) {
    ui.showNoteDetail(note);
    ui.setActiveNote(noteId);
    ui.updateArchiveButton(note.archived);

    // Mobile: show detail overlay
    const noteDetailSection = document.getElementById("note-detail");
    noteDetailSection?.classList.add("active");
  }
}
```

### Delete with Confirmation Modal

```javascript
function handleDeleteNote() {
  const noteId = ui.getCurrentNoteId();
  if (!noteId) return;

  // Show confirmation modal (custom modal, not browser confirm)
  showModal({
    icon: "delete",
    title: "Delete Note",
    message:
      "Are you sure you want to permanently delete this note? This action cannot be undone.",
    confirmText: "Delete Note",
    confirmClass: "btn-danger",
    onConfirm: () => performDelete(noteId), // Callback function
  });
}

async function performDelete(noteId) {
  try {
    // 1. Delete from Appwrite
    await appwrite.deleteNote(noteId);

    // 2. Remove from local cache
    notesCache = notesCache.filter((n) => n.id !== noteId);

    // 3. Update UI
    ui.renderAllNotes(notesCache.filter((n) => !n.archived));
    ui.updateTagList(noteManager.getAllTags(notesCache));
    ui.clearNoteDetail();
    ui.showToast("Note deleted!");
  } catch (error) {
    ui.showToast("Failed to delete note", "error");
  }
}
```

### Search Handler

```javascript
function handleSearch(e) {
  const query = e.target.value.trim();
  const pageTitle = document.getElementById("page-title");

  if (!query) {
    // Empty search - show all notes
    pageTitle.textContent = "All Notes";
    ui.renderAllNotes(notesCache.filter((n) => !n.archived));
    return;
  }

  // Update title to show search
  pageTitle.textContent = `Showing results for: ${query}`;

  // Search locally (faster than API for each keystroke)
  const filteredNotes = noteManager.searchNotes(notesCache, query);
  ui.renderAllNotes(filteredNotes.filter((n) => !n.archived));
}
```

### Draft Auto-Save (sessionStorage)

```javascript
function handleDraftAutoSave() {
  const noteId = ui.getCurrentNoteId();
  if (!noteId) return;

  // Get current form values
  const title = document.getElementById("note-title")?.textContent || "";
  const content = document.getElementById("note-content")?.value || "";
  const tagsText = document.getElementById("note-tags")?.value || "";

  // Save to sessionStorage
  const draft = {
    noteId,
    title,
    content,
    tags: tagsText,
    timestamp: new Date().toISOString(),
  };

  saveDraft(draft);
}

function restoreDraft() {
  const draft = loadDraft();
  if (!draft) return;

  // Check if draft is recent (within 24 hours)
  const draftTime = new Date(draft.timestamp);
  const now = new Date();
  const hoursDiff = (now - draftTime) / (1000 * 60 * 60);

  if (hoursDiff > 24) {
    clearDraft();
    return;
  }

  // Find matching note
  const note = notesCache.find((n) => n.id === draft.noteId);
  if (!note) {
    clearDraft();
    return;
  }

  // Check if draft differs from saved note
  const hasChanges =
    draft.title !== note.title ||
    draft.content !== note.content ||
    draft.tags !== note.tags.join(", ");

  if (hasChanges) {
    ui.showToast("Restored unsaved draft", "info");
    ui.showNoteDetail(note);

    // Restore draft content
    setTimeout(() => {
      document.getElementById("note-title").textContent = draft.title;
      document.getElementById("note-content").value = draft.content;
      document.getElementById("note-tags").value = draft.tags;
    }, 100);
  }
}
```

### Keyboard Navigation

```javascript
function handleKeyboardNav(e) {
  const modal = document.getElementById("modal-overlay");
  const isModalOpen = modal?.classList.contains("active");

  // ESC key - close modal or cancel edit
  if (e.key === "Escape") {
    if (isModalOpen) {
      closeModal();
    } else {
      handleCancel();
    }
    return;
  }

  // Ctrl/Cmd + Enter - save note
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !isModalOpen) {
    handleSaveNote();
    return;
  }

  // Arrow keys - navigate notes list
  if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !isModalOpen) {
    const noteCards = document.querySelectorAll(".note-card");
    const activeCard = document.querySelector(".note-card.active");

    let currentIndex = Array.from(noteCards).indexOf(activeCard);

    let newIndex;
    if (e.key === "ArrowDown") {
      newIndex = Math.min(currentIndex + 1, noteCards.length - 1);
    } else {
      newIndex = Math.max(currentIndex - 1, 0);
    }

    const newCard = noteCards[newIndex];
    if (newCard) {
      newCard.click(); // Trigger click handler
      newCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }
}
```

---

## 📁 FILE 8: authService.js - Authentication

**Purpose:** All authentication operations with Appwrite.

### Sign Up

```javascript
export async function signUp(email, password, name = "") {
  try {
    const { ID } = window.Appwrite;
    const acc = getAccount();

    // Create user account
    const user = await acc.create(
      ID.unique(), // Auto-generate user ID
      email,
      password,
      name || email.split("@")[0] // Default name: part before @
    );

    // Auto-login after signup
    await login(email, password);

    return { success: true, user };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
```

### Login

```javascript
export async function login(email, password) {
  try {
    const acc = getAccount();

    // Create email session (logs in)
    const session = await acc.createEmailPasswordSession(email, password);

    return { success: true, session };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
```

### Google OAuth

```javascript
export function loginWithGoogle() {
  try {
    const acc = getAccount();
    const { OAuthProvider } = window.Appwrite;

    // Where to redirect after auth
    const successUrl = `${window.location.origin}/index.html`;
    const failureUrl = `${window.location.origin}/auth/login.html?error=oauth_failed`;

    // Redirect to Google (Appwrite handles OAuth flow)
    acc.createOAuth2Session(OAuthProvider.Google, successUrl, failureUrl);
  } catch (error) {
    throw error;
  }
}
```

### Password Recovery

```javascript
// SEND RECOVERY EMAIL
export async function sendPasswordRecovery(email) {
  try {
    const acc = getAccount();

    // URL user will be redirected to (with userId and secret in params)
    const resetUrl = `${window.location.origin}/auth/reset-password.html`;

    await acc.createRecovery(email, resetUrl);

    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// COMPLETE RESET (after clicking email link)
export async function resetPassword(userId, secret, newPassword) {
  try {
    const acc = getAccount();

    await acc.updateRecovery(userId, secret, newPassword);

    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
```

### Error Message Helper

```javascript
function getErrorMessage(error) {
  const errorMessages = {
    user_already_exists: "An account with this email already exists.",
    user_invalid_credentials: "Invalid email or password.",
    user_not_found: "No account found with this email.",
    user_blocked: "This account has been blocked.",
    user_invalid_token: "Invalid or expired reset link.",
    // ... more error mappings
  };

  if (error.type && errorMessages[error.type]) {
    return errorMessages[error.type]; // User-friendly message
  }

  return error.message || "An unexpected error occurred.";
}
```

---

## 📁 FILE 9: validation.js - Form Validation

**Purpose:** Validation display and logic for auth forms.

```javascript
// SHOW ERROR on input field
export function showError(input, message) {
  const formGroup = input.closest(".form-group"); // Find parent container
  if (!formGroup) return;

  formGroup.classList.add("error");
  formGroup.classList.remove("success");

  // Remove existing error
  const existingError = formGroup.querySelector(".form-error-message");
  if (existingError) existingError.remove();

  // Add new error message
  const errorElement = document.createElement("span");
  errorElement.className = "form-error-message";
  errorElement.textContent = message;
  formGroup.appendChild(errorElement);
}

// CLEAR ERROR
export function clearError(input) {
  const formGroup = input.closest(".form-group");
  if (!formGroup) return;

  formGroup.classList.remove("error");

  const existingError = formGroup.querySelector(".form-error-message");
  if (existingError) existingError.remove();
}

// VALIDATE EMAIL (using regex)
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Breakdown:
  // ^[^\s@]+  - Start with one or more chars that aren't space or @
  // @         - Then literal @
  // [^\s@]+   - Then one or more chars that aren't space or @
  // \.        - Then literal dot
  // [^\s@]+$  - End with one or more chars that aren't space or @
  return emailRegex.test(email);
}

// VALIDATE PASSWORD (minimum length)
export function isValidPassword(password, minLength = 8) {
  return password.length >= minLength;
}

// CHECK PASSWORDS MATCH
export function passwordsMatch(password, confirmPassword) {
  return password === confirmPassword;
}
```

---

## 📁 FILE 10: formHandlers.js - Auth Form Logic

**Purpose:** Handles form submissions for login, signup, forgot password, reset password.

```javascript
// INIT LOGIN FORM
export function initLoginForm() {
  const form = getDocument(".auth-form", "query");
  if (!form) return;

  const emailInput = getDocument("email", "id");
  const passwordInput = getDocument("password", "id");
  const submitBtn = form.querySelector('button[type="submit"]');

  // Initialize auth
  authService.initAuth();
  authService.redirectIfLoggedIn(); // Redirect to dashboard if already logged in

  // BLUR validation - when user leaves field
  emailInput.addEventListener("blur", () => {
    if (emailInput.value && !isValidEmail(emailInput.value)) {
      showError(emailInput, "Please enter a valid email address");
    } else {
      clearError(emailInput);
    }
  });

  // INPUT validation - clear error when typing valid
  emailInput.addEventListener("input", () => {
    if (isValidEmail(emailInput.value)) {
      clearError(emailInput);
    }
  });

  // FORM SUBMIT
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent page reload
    let isValid = true;

    // Validate all fields
    if (!emailInput.value) {
      showError(emailInput, "Email is required");
      isValid = false;
    } else if (!isValidEmail(emailInput.value)) {
      showError(emailInput, "Please enter a valid email address");
      isValid = false;
    }

    if (!passwordInput.value) {
      showError(passwordInput, "Password is required");
      isValid = false;
    }

    if (isValid) {
      setButtonLoading(submitBtn, "Logging in...");

      const result = await authService.login(
        emailInput.value,
        passwordInput.value
      );

      if (result.success) {
        showSuccessMessage(form, "Login successful! Redirecting...");
        setTimeout(() => {
          window.location.href = "../index.html"; // Go to dashboard
        }, 1000);
      } else {
        resetButton(submitBtn);
        showFormError(form, result.error); // Show error banner
      }
    }
  });

  // Google OAuth button
  initGoogleOAuth();
}
```

---

## 🔄 Data Flow Summary

### When App Loads:

```
1. DOMContentLoaded fires → init() runs
2. initAppwrite() → Creates Appwrite client
3. getCurrentUser() → Check if logged in
4. getAllNotes() → Fetch from Appwrite database
5. Store in notesCache[] (in-memory)
6. renderAllNotes() → Display in DOM
7. setupEventListeners() → Attach handlers
8. initTheme() → Apply saved theme
9. restoreDraft() → Recover unsaved work
```

### When User Creates Note:

```
1. Click "Create Note" button
2. handleCreateNote() called
3. appwrite.createNote() → Save to database
4. notesCache.unshift(newNote) → Add to memory
5. ui.renderAllNotes() → Re-render list
6. ui.showNoteDetail() → Show in editor
```

### When User Saves Note:

```
1. Click "Save" button (or Ctrl+Enter)
2. handleSaveNote() called
3. Get values from DOM inputs
4. appwrite.updateNote() → Save to database
5. Update notesCache[index] → Update memory
6. ui.renderAllNotes() → Re-render list
7. clearDraft() → Clear sessionStorage
8. showToast() → Confirm to user
```

### When User Types (Draft Auto-Save):

```
1. Input event fires on title/content/tags
2. handleDraftAutoSave() called
3. Get current values from DOM
4. saveDraft() → Save to sessionStorage
5. (On page reload) restoreDraft() → Recover
```

---

## 🎯 Key Concepts for Defense

### 1. ES6 Modules

- `import/export` syntax for code organization
- Each file is a separate module with its own scope
- Explicit dependencies make code easier to understand

### 2. Event Delegation

- Instead of attaching listeners to each note card, attach one to parent container
- Use `e.target.closest()` to find the actual clicked element
- More efficient and works with dynamically added elements

### 3. Async/Await

- Modern way to handle asynchronous operations
- `async` functions return Promises
- `await` pauses until Promise resolves
- `try/catch` for error handling

### 4. Spread Operator (...)

- Copy arrays/objects: `[...array]`, `{...object}`
- Merge objects: `{...existing, ...updates}`
- Immutable updates (don't mutate original)

### 5. Optional Chaining (?.)

- `element?.classList` - won't error if element is null
- Safer than `element && element.classList`

### 6. localStorage vs sessionStorage

- localStorage: Persistent (survives browser close)
- sessionStorage: Temporary (cleared when tab closes)
- Both store strings only (use JSON.stringify/parse)

### 7. Template Literals

- Backtick strings: `` `Hello ${name}` ``
- Multi-line strings without concatenation
- Embedded expressions with `${}`

### 8. Array Methods

- `.map()` - transform each element, returns new array
- `.filter()` - keep elements matching condition
- `.find()` - get first element matching condition
- `.findIndex()` - get index of first match
- `.some()` - true if at least one matches
- `.forEach()` - loop without returning

### 9. Destructuring

- Extract values: `const { name, email } = user`
- Rename: `const { $id: id } = document`
- Default values: `const { theme = "light" } = prefs`

### 10. Guard Clauses

- Early return pattern: `if (!noteId) return;`
- Avoids deep nesting
- Makes code more readable

---

## 📝 Common Interview Questions

**Q: Why use ES6 modules?**
A: Code organization, explicit dependencies, separate scope, reusability, maintainability.

**Q: What is event delegation?**
A: Attaching one event listener to a parent element instead of many to child elements. Uses event bubbling to catch events from children.

**Q: Difference between localStorage and sessionStorage?**
A: localStorage persists until manually cleared; sessionStorage clears when tab closes. Both store strings only.

**Q: What is async/await?**
A: Syntax for handling Promises. `async` makes function return Promise, `await` pauses until Promise resolves.

**Q: Why transform Appwrite documents?**
A: Appwrite uses `$id`, `$createdAt` etc. We transform to our own schema (`id`, `createdAt`) for consistency and to hide backend details from rest of app.

**Q: What is the spread operator?**
A: `...` syntax to spread array/object elements. Used for copying, merging, and immutable updates.

---

Good luck with your lab defense! 🎓
