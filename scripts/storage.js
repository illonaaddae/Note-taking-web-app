/**
 * Storage Module
 * Handles localStorage operations for notes and preferences
 */

const NOTES_KEY = "notes_app_notes";
const PREFERENCES_KEY = "notes_app_preferences";
const DRAFT_KEY = "notes_app_draft";

/**
 * Save all notes to localStorage
 * @param {Array} notes - Array of note objects
 */
export function saveNotes(notes) {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error("Error saving notes:", e);
    // Handle quota exceeded error
    if (e.name === "QuotaExceededError") {
      alert("Storage is full. Please delete some notes.");
    }
  }
}

/**
 * Load all notes from localStorage
 * @returns {Array} - Array of note objects
 */
export function loadNotes() {
  try {
    const notes = localStorage.getItem(NOTES_KEY);
    return notes ? JSON.parse(notes) : [];
  } catch (e) {
    console.error("Error loading notes:", e);
    return [];
  }
}

/**
 * Save user preferences to localStorage
 * @param {Object} prefs - Preferences object
 */
export function savePreferences(prefs) {
  try {
    const existing = loadPreferences();
    const updated = { ...existing, ...prefs };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Error saving preferences:", e);
  }
}

/**
 * Load user preferences from localStorage
 * @returns {Object} - Preferences object
 */
export function loadPreferences() {
  try {
    const prefs = localStorage.getItem(PREFERENCES_KEY);
    return prefs ? JSON.parse(prefs) : { theme: "light", font: "sans-serif" };
  } catch (e) {
    console.error("Error loading preferences:", e);
    return { theme: "light", font: "sans-serif" };
  }
}

/**
 * Save draft note to sessionStorage
 * @param {Object} draft - Draft note object
 */
export function saveDraft(draft) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch (e) {
    console.error("Error saving draft:", e);
  }
}

/**
 * Load draft note from sessionStorage
 * @returns {Object|null} - Draft note object or null
 */
export function loadDraft() {
  try {
    const draft = sessionStorage.getItem(DRAFT_KEY);
    return draft ? JSON.parse(draft) : null;
  } catch (e) {
    console.error("Error loading draft:", e);
    return null;
  }
}

/**
 * Clear draft from sessionStorage
 */
export function clearDraft() {
  sessionStorage.removeItem(DRAFT_KEY);
}

/**
 * Load notes from data.json file and initialize localStorage
 * This is called once when the app first loads
 * @returns {Promise<Array>} - Array of note objects
 */
export async function loadInitialData() {
  try {
    // Check if notes already exist in localStorage
    const existingNotes = localStorage.getItem(NOTES_KEY);
    if (existingNotes) {
      return JSON.parse(existingNotes);
    }

    // Fetch from data.json and store in localStorage
    const response = await fetch("./data.json");
    const data = await response.json();

    // Transform the data to include unique IDs
    const notes = data.notes.map((note, index) => ({
      id: generateId(),
      title: note.title,
      content: note.content,
      tags: note.tags,
      archived: note.isArchived,
      createdAt: note.lastEdited,
      updatedAt: note.lastEdited,
    }));

    // Save to localStorage
    saveNotes(notes);

    return notes;
  } catch (e) {
    console.error("Error loading initial data:", e);
    return [];
  }
}

/**
 * Generate a unique ID for notes
 * @returns {string} - Unique ID string
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
