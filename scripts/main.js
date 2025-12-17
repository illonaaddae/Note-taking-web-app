/**
 * Main App Entry Point
 * Initializes all modules and sets up the notes app with Appwrite backend
 */

import * as appwrite from "./appwrite.js";
import * as noteManager from "./noteManager.js";
import * as ui from "./ui.js";
import { loadPreferences } from "./storage.js";

// Store notes in memory for quick access
let notesCache = [];

// Initialize app on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  init();
});

/**
 * Initialize the application
 */
async function init() {
  try {
    // Initialize Appwrite client
    appwrite.initAppwrite();

    // Load notes from Appwrite
    notesCache = await appwrite.getAllNotes();

    // Render notes in the sidebar
    ui.renderAllNotes(notesCache.filter((n) => !n.archived));

    // Update tags in sidebar
    ui.updateTagList(noteManager.getAllTags(notesCache));

    // Set up event listeners
    setupEventListeners();

    // Load saved preferences (theme, font - still from localStorage)
    loadUserPreferences();

    console.log("Notes app initialized with Appwrite!");
  } catch (error) {
    console.error("Failed to initialize app:", error);
    ui.showToast("Failed to connect to database", "error");
  }
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  // Create new note button
  const createNoteBtn = document.getElementById("create-note-btn");
  const fabCreateNote = document.getElementById("fab-create-note");

  createNoteBtn?.addEventListener("click", handleCreateNote);
  fabCreateNote?.addEventListener("click", handleCreateNote);

  // Save note button
  const saveNoteBtn = document.getElementById("save-note-btn");
  saveNoteBtn?.addEventListener("click", handleSaveNote);

  // Cancel button
  const cancelBtn = document.getElementById("cancel-btn");
  cancelBtn?.addEventListener("click", handleCancel);

  // Archive note button
  const archiveNoteBtn = document.getElementById("archive-note-btn");
  archiveNoteBtn?.addEventListener("click", handleArchiveNote);

  // Delete note button
  const deleteNoteBtn = document.getElementById("delete-note-btn");
  deleteNoteBtn?.addEventListener("click", handleDeleteNote);

  // Search input
  const searchInput = document.getElementById("search-input");
  searchInput?.addEventListener("input", handleSearch);

  // Notes list - event delegation
  const notesList = document.getElementById("notes-list");
  notesList?.addEventListener("click", handleNoteClick);

  // Sidebar tags - event delegation
  const sidebarTags = document.getElementById("sidebar-tags");
  sidebarTags?.addEventListener("click", handleTagClick);

  // Navigation items
  document.querySelectorAll("[data-page]").forEach((item) => {
    item.addEventListener("click", handleNavClick);
  });
}

/**
 * Handle create new note
 */
async function handleCreateNote() {
  try {
    // Create note in Appwrite
    const newNote = await appwrite.createNote({
      title: "Untitled Note",
      content: "",
      tags: [],
      archived: false,
    });

    // Add to local cache
    notesCache.unshift(newNote);

    // Update UI
    ui.renderAllNotes(notesCache.filter((n) => !n.archived));
    ui.showNoteDetail(newNote);
    ui.setActiveNote(newNote.id);

    ui.showToast("New note created!");
  } catch (error) {
    console.error("Failed to create note:", error);
    ui.showToast("Failed to create note", "error");
  }
}

/**
 * Handle save note
 */
async function handleSaveNote() {
  const noteId = ui.getCurrentNoteId();
  if (!noteId) return;

  const title = document.getElementById("note-title")?.textContent || "";
  const content = document.getElementById("note-content")?.value || "";
  const tagsText = document.getElementById("note-tags")?.value || "";
  const tags = tagsText
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t);

  try {
    // Update note in Appwrite
    const updatedNote = await appwrite.updateNote(noteId, {
      title,
      content,
      tags,
    });

    // Update local cache
    const index = notesCache.findIndex((n) => n.id === noteId);
    if (index !== -1) {
      notesCache[index] = updatedNote;
    }

    // Update UI
    ui.renderAllNotes(notesCache.filter((n) => !n.archived));
    ui.updateTagList(noteManager.getAllTags(notesCache));
    ui.showToast("Note saved successfully!");
  } catch (error) {
    console.error("Failed to save note:", error);
    ui.showToast("Failed to save note", "error");
  }
}

/**
 * Handle cancel editing
 */
function handleCancel() {
  const noteId = ui.getCurrentNoteId();
  if (!noteId) return;

  const note = notesCache.find((n) => n.id === noteId);
  if (note) {
    ui.showNoteDetail(note);
  }
}

/**
 * Handle archive note
 */
async function handleArchiveNote() {
  const noteId = ui.getCurrentNoteId();
  if (!noteId) return;

  try {
    const note = notesCache.find((n) => n.id === noteId);
    const newArchivedStatus = !note.archived;

    // Update in Appwrite
    await appwrite.archiveNote(noteId, newArchivedStatus);

    // Update local cache
    const index = notesCache.findIndex((n) => n.id === noteId);
    if (index !== -1) {
      notesCache[index].archived = newArchivedStatus;
    }

    // Update UI
    ui.renderAllNotes(notesCache.filter((n) => !n.archived));
    ui.clearNoteDetail();
    ui.showToast(newArchivedStatus ? "Note archived!" : "Note restored!");
  } catch (error) {
    console.error("Failed to archive note:", error);
    ui.showToast("Failed to archive note", "error");
  }
}

/**
 * Handle delete note
 */
async function handleDeleteNote() {
  const noteId = ui.getCurrentNoteId();
  if (!noteId) return;

  // TODO: Replace with custom modal
  if (confirm("Are you sure you want to delete this note?")) {
    try {
      // Delete from Appwrite
      await appwrite.deleteNote(noteId);

      // Remove from local cache
      notesCache = notesCache.filter((n) => n.id !== noteId);

      // Update UI
      ui.renderAllNotes(notesCache.filter((n) => !n.archived));
      ui.updateTagList(noteManager.getAllTags(notesCache));
      ui.clearNoteDetail();
      ui.showToast("Note deleted!");
    } catch (error) {
      console.error("Failed to delete note:", error);
      ui.showToast("Failed to delete note", "error");
    }
  }
}

/**
 * Handle search
 */
function handleSearch(e) {
  const query = e.target.value.trim();

  if (!query) {
    // Show all notes if search is empty
    ui.renderAllNotes(notesCache.filter((n) => !n.archived));
    return;
  }

  // Search locally in cache (faster than API call for each keystroke)
  const filteredNotes = noteManager.searchNotes(notesCache, query);
  ui.renderAllNotes(filteredNotes.filter((n) => !n.archived));
}

/**
 * Handle note click in list
 */
function handleNoteClick(e) {
  const noteCard = e.target.closest(".note-card");
  if (!noteCard) return;

  const noteId = noteCard.dataset.noteId;
  const note = notesCache.find((n) => n.id === noteId);

  if (note) {
    ui.showNoteDetail(note);
    ui.setActiveNote(noteId);
  }
}

/**
 * Handle tag click in sidebar
 */
function handleTagClick(e) {
  const tagItem = e.target.closest(".tag-item");
  if (!tagItem) return;

  const tag = tagItem.dataset.tag;
  const filteredNotes = noteManager.filterByTag(notesCache, tag);

  ui.renderAllNotes(filteredNotes.filter((n) => !n.archived));
  ui.setActiveTag(tag);
  document.getElementById("page-title").textContent = `Notes Tagged: ${tag}`;
}

/**
 * Handle navigation click
 */
function handleNavClick(e) {
  e.preventDefault();
  const page = e.currentTarget.dataset.page;

  // Update active state
  document.querySelectorAll("[data-page]").forEach((item) => {
    item.classList.remove("active");
  });
  e.currentTarget.classList.add("active");

  // Clear any active tag selection
  document.querySelectorAll(".tag-item").forEach((item) => {
    item.classList.remove("active");
  });

  switch (page) {
    case "all-notes":
      document.getElementById("page-title").textContent = "All Notes";
      ui.renderAllNotes(notesCache.filter((n) => !n.archived));
      break;
    case "archived":
      document.getElementById("page-title").textContent = "Archived Notes";
      ui.renderAllNotes(notesCache.filter((n) => n.archived));
      break;
    case "search":
      // Focus search input
      document.getElementById("search-input")?.focus();
      break;
    case "tags":
      // Show tags view (could expand sidebar on mobile)
      break;
    case "settings":
      // Navigate to settings page
      window.location.href = "settings.html";
      break;
  }
}

/**
 * Load user preferences from localStorage
 */
function loadUserPreferences() {
  const prefs = loadPreferences();
  if (prefs.theme) {
    document.documentElement.setAttribute("data-theme", prefs.theme);
  }
  if (prefs.font) {
    document.documentElement.setAttribute("data-font", prefs.font);
  }
}
