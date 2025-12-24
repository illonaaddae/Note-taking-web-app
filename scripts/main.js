/**
 * Main App Entry Point
 * Initializes all modules and sets up the notes app with Appwrite backend
 */

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

// Store notes in memory for quick access
let notesCache = [];
let currentUser = null;

// Modal state
let modalCallback = null;
let currentView = "all-notes"; // Track current view state

// Initialize app on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  init();
});

/**
 * Check if we're returning from an OAuth callback with tokens
 * Returns { isOAuth: boolean, userId?: string, secret?: string }
 */
function getOAuthTokens() {
  const urlParams = new URLSearchParams(window.location.search);

  // Check for OAuth token parameters (from createOAuth2Token)
  const userId = urlParams.get("userId");
  const secret = urlParams.get("secret");

  if (userId && secret) {
    return { isOAuth: true, userId, secret };
  }

  // Check if referrer indicates OAuth flow (fallback)
  const referrer = document.referrer;
  const isFromOAuth =
    referrer.includes("appwrite.io") ||
    referrer.includes("accounts.google.com");

  return { isOAuth: isFromOAuth, userId: null, secret: null };
}

/**
 * Create session from OAuth tokens in URL
 * This is the cookie-free approach that works on all browsers
 */
async function handleOAuthTokens(userId, secret) {
  try {
    console.log("🔐 Creating session from OAuth tokens...");
    const { Account } = window.Appwrite;
    const account = new Account(appwrite.getClient());

    const session = await account.createSession(userId, secret);
    console.log("✅ Session created successfully:", session);
    return true;
  } catch (error) {
    console.error("❌ Failed to create session from tokens:", error);
    return false;
  }
}

/**
 * Initialize the application
 */
async function init() {
  try {
    // Initialize Appwrite client
    appwrite.initAppwrite();

    // Check if this is an OAuth callback with tokens
    const oauthData = getOAuthTokens();

    if (oauthData.isOAuth && oauthData.userId && oauthData.secret) {
      console.log("🔐 OAuth tokens detected! Creating session...");

      // Create session from tokens (works on ALL browsers!)
      const success = await handleOAuthTokens(
        oauthData.userId,
        oauthData.secret
      );

      // Clean up the URL (remove tokens for security)
      window.history.replaceState({}, document.title, window.location.pathname);

      if (!success) {
        console.error("❌ Failed to create session from OAuth tokens");
        window.location.href = "auth/login.html?error=oauth_session_failed";
        return;
      }
    }

    // Check if user is logged in
    currentUser = await appwrite.getCurrentUser();

    if (!currentUser) {
      // Redirect to login page if not logged in
      console.log("User not logged in, redirecting to login page...");
      window.location.href = "auth/login.html";
      return;
    }

    console.log("✅ Logged in as:", currentUser.email);
    // Update UI to show user info if needed

    // Load notes from Appwrite
    notesCache = await appwrite.getAllNotes();

    // Render notes in the sidebar
    ui.renderAllNotes(notesCache.filter((n) => !n.archived));

    // Update tags in sidebar
    ui.updateTagList(noteManager.getAllTags(notesCache));

    // Set up event listeners
    setupEventListeners();

    // Initialize theme system
    initTheme();

    // Check for unsaved draft and restore if exists
    restoreDraft();

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

  // Mobile buttons
  const mobileBackBtn = document.getElementById("mobile-back-btn");
  const mobileSaveBtn = document.getElementById("mobile-save-btn");
  const mobileCancelBtn = document.getElementById("mobile-cancel-btn");
  const mobileArchiveBtn = document.getElementById("mobile-archive-btn");
  const mobileDeleteBtn = document.getElementById("mobile-delete-btn");

  mobileBackBtn?.addEventListener("click", handleMobileBack);
  mobileSaveBtn?.addEventListener("click", handleSaveNote);
  mobileCancelBtn?.addEventListener("click", handleCancel);
  mobileArchiveBtn?.addEventListener("click", handleArchiveNote);
  mobileDeleteBtn?.addEventListener("click", handleDeleteNote);

  // Search input (desktop)
  const searchInput = document.getElementById("search-input");
  searchInput?.addEventListener("input", handleSearch);

  // Mobile search input
  const mobileSearchInput = document.getElementById("mobile-search-input");
  mobileSearchInput?.addEventListener("input", handleMobileSearch);

  // Mobile search results click handler
  const mobileSearchResults = document.getElementById("mobile-search-results");
  mobileSearchResults?.addEventListener("click", handleNoteClick);

  // Mobile tags list click handler
  const mobileTagsList = document.getElementById("mobile-tags-list");
  mobileTagsList?.addEventListener("click", handleMobileTagClick);

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

  // Settings button
  const settingsBtn = document.getElementById("settings-btn");
  settingsBtn?.addEventListener("click", () => {
    window.location.href = "settings.html";
  });

  // Modal event listeners
  const modalOverlay = document.getElementById("modal-overlay");
  const modalCancel = document.getElementById("modal-cancel");
  const modalConfirm = document.getElementById("modal-confirm");

  modalOverlay?.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  modalCancel?.addEventListener("click", closeModal);
  modalConfirm?.addEventListener("click", handleModalConfirm);

  // Keyboard navigation
  document.addEventListener("keydown", handleKeyboardNav);

  // Auto-save draft on input (sessionStorage)
  const noteTitle = document.getElementById("note-title");
  const noteContent = document.getElementById("note-content");
  const noteTags = document.getElementById("note-tags");

  noteTitle?.addEventListener("input", handleDraftAutoSave);
  noteContent?.addEventListener("input", handleDraftAutoSave);
  noteTags?.addEventListener("input", handleDraftAutoSave);

  // Tags selector event listeners
  setupTagsSelector();
}

/**
 * Set up tags selector (Mac Notes style checkboxes)
 */
function setupTagsSelector() {
  const tagsSelected = document.getElementById("tags-selected");
  const tagsDropdown = document.getElementById("tags-dropdown");
  const tagsSearchInput = document.getElementById("tags-search-input");
  const btnAddTag = document.getElementById("btn-add-tag");

  if (!tagsSelected || !tagsDropdown) return;

  // Toggle dropdown on click
  tagsSelected.addEventListener("click", (e) => {
    if (e.target.classList.contains("tag-remove")) return;
    toggleTagsDropdown();
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    const tagsSelector = document.getElementById("tags-selector");
    if (tagsSelector && !tagsSelector.contains(e.target)) {
      closeTagsDropdown();
    }
  });

  // Filter tags on search input
  tagsSearchInput?.addEventListener("input", (e) => {
    filterTagsDropdown(e.target.value);
  });

  // Add new tag button
  btnAddTag?.addEventListener("click", () => {
    const searchValue = tagsSearchInput?.value.trim();
    if (searchValue) {
      addNewTag(searchValue);
      tagsSearchInput.value = "";
    }
  });

  // Enter key to add new tag
  tagsSearchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const searchValue = tagsSearchInput.value.trim();
      if (searchValue) {
        addNewTag(searchValue);
        tagsSearchInput.value = "";
      }
    }
  });

  // Tag dropdown item click (delegation)
  const tagsDropdownList = document.getElementById("tags-dropdown-list");
  tagsDropdownList?.addEventListener("click", (e) => {
    const item = e.target.closest(".tags-dropdown-item");
    if (item) {
      const tag = item.dataset.tag;
      toggleTag(tag);
    }
  });

  // Listen for removeTag events from ui.js
  window.addEventListener("removeTag", (e) => {
    const tag = e.detail.tag;
    if (tag) {
      removeTag(tag);
    }
  });
}

/**
 * Toggle tags dropdown visibility
 */
function toggleTagsDropdown() {
  const tagsDropdown = document.getElementById("tags-dropdown");
  const isHidden = tagsDropdown?.classList.contains("hidden");

  if (isHidden) {
    openTagsDropdown();
  } else {
    closeTagsDropdown();
  }
}

/**
 * Open tags dropdown
 */
function openTagsDropdown() {
  const tagsDropdown = document.getElementById("tags-dropdown");
  const tagsSearchInput = document.getElementById("tags-search-input");

  tagsDropdown?.classList.remove("hidden");
  renderTagsDropdown();
  tagsSearchInput?.focus();
}

/**
 * Close tags dropdown
 */
function closeTagsDropdown() {
  const tagsDropdown = document.getElementById("tags-dropdown");
  tagsDropdown?.classList.add("hidden");
}

/**
 * Render tags dropdown with checkboxes
 */
function renderTagsDropdown(filterQuery = "") {
  const tagsDropdownList = document.getElementById("tags-dropdown-list");
  if (!tagsDropdownList) return;

  // Get all unique tags from notes cache
  const allTags = noteManager.getAllTags(notesCache);

  // Get currently selected tags for this note
  const selectedTags = getSelectedTags();

  // Filter tags if there's a search query
  const filteredTags = filterQuery
    ? allTags.filter((tag) =>
        tag.toLowerCase().includes(filterQuery.toLowerCase())
      )
    : allTags;

  if (filteredTags.length === 0 && !filterQuery) {
    tagsDropdownList.innerHTML = `
      <div class="tags-dropdown-empty">
        No tags yet. Create your first tag!
      </div>
    `;
    return;
  }

  if (filteredTags.length === 0 && filterQuery) {
    tagsDropdownList.innerHTML = `
      <div class="tags-dropdown-empty">
        No matching tags. Press Enter to create "${filterQuery}".
      </div>
    `;
    return;
  }

  tagsDropdownList.innerHTML = filteredTags
    .map((tag) => {
      const isSelected = selectedTags.includes(tag);
      return `
        <div class="tags-dropdown-item ${
          isSelected ? "selected" : ""
        }" data-tag="${tag}">
          <span class="tag-checkbox"></span>
          <span class="tag-name">${tag}</span>
        </div>
      `;
    })
    .join("");
}

/**
 * Filter tags dropdown based on search query
 */
function filterTagsDropdown(query) {
  renderTagsDropdown(query);

  // Update "Create new tag" button text
  const btnAddTag = document.getElementById("btn-add-tag");
  if (btnAddTag) {
    const span = btnAddTag.querySelector("span");
    if (span) {
      span.textContent = query ? `Create "${query}"` : "Create new tag";
    }
  }
}

/**
 * Get currently selected tags from UI
 */
function getSelectedTags() {
  const hiddenInput = document.getElementById("note-tags");
  const value = hiddenInput?.value || "";
  return value
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t);
}

/**
 * Set selected tags in UI
 */
function setSelectedTags(tags) {
  const hiddenInput = document.getElementById("note-tags");
  const tagsSelected = document.getElementById("tags-selected");

  if (hiddenInput) {
    hiddenInput.value = tags.join(", ");
  }

  if (tagsSelected) {
    if (tags.length === 0) {
      tagsSelected.innerHTML = `<span class="tags-placeholder">Add tags...</span>`;
    } else {
      tagsSelected.innerHTML = tags
        .map(
          (tag) => `
          <span class="tag-chip" data-tag="${tag}">
            ${tag}
            <button type="button" class="tag-remove" data-tag="${tag}">&times;</button>
          </span>
        `
        )
        .join("");

      // Add click handlers for remove buttons
      tagsSelected.querySelectorAll(".tag-remove").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const tagToRemove = btn.dataset.tag;
          removeTag(tagToRemove);
        });
      });
    }
  }

  // Trigger draft auto-save
  handleDraftAutoSave();
}

/**
 * Toggle a tag selection
 */
function toggleTag(tag) {
  const selectedTags = getSelectedTags();
  const index = selectedTags.indexOf(tag);

  if (index === -1) {
    selectedTags.push(tag);
  } else {
    selectedTags.splice(index, 1);
  }

  setSelectedTags(selectedTags);
  renderTagsDropdown();
}

/**
 * Remove a tag
 */
function removeTag(tag) {
  const selectedTags = getSelectedTags();
  const index = selectedTags.indexOf(tag);

  if (index !== -1) {
    selectedTags.splice(index, 1);
    setSelectedTags(selectedTags);
    renderTagsDropdown();
  }
}

/**
 * Add a new tag
 */
function addNewTag(tagName) {
  const selectedTags = getSelectedTags();

  // Clean up the tag name
  const cleanTag = tagName.trim();
  if (!cleanTag) return;

  // Check if tag already exists in selection
  if (!selectedTags.includes(cleanTag)) {
    selectedTags.push(cleanTag);
    setSelectedTags(selectedTags);
  }

  renderTagsDropdown();
  closeTagsDropdown();
}

/**
 * Handle create new note
 */
async function handleCreateNote() {
  try {
    console.log("Creating new note...");
    console.log("Current user:", currentUser);

    // Create note in Appwrite
    const newNote = await appwrite.createNote({
      title: "Untitled Note",
      content: "",
      tags: [],
      archived: false,
    });

    console.log("Note created successfully:", newNote);

    // Add to local cache
    notesCache.unshift(newNote);

    // Update UI
    ui.renderAllNotes(notesCache.filter((n) => !n.archived));
    ui.showNoteDetail(newNote);
    ui.setActiveNote(newNote.id);

    // On mobile, show the note detail section as overlay
    const noteDetailSection = document.getElementById("note-detail");
    noteDetailSection?.classList.add("active");

    ui.showToast("New note created!");
  } catch (error) {
    console.error("Failed to create note:", error);
    console.error("Error details:", error.message, error.code, error.type);
    ui.showToast("Failed to create note", "error");
  }
}

/**
 * Handle save note
 */
async function handleSaveNote() {
  const noteId = ui.getCurrentNoteId();
  console.log("Saving note with ID:", noteId);

  if (!noteId) {
    console.log("No note ID found, cannot save");
    return;
  }

  const title = document.getElementById("note-title")?.textContent || "";
  const content = document.getElementById("note-content")?.value || "";
  const tagsText = document.getElementById("note-tags")?.value || "";
  const tags = tagsText
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t);

  console.log("Saving with data:", { title, content, tags });

  try {
    // Update note in Appwrite
    const updatedNote = await appwrite.updateNote(noteId, {
      title,
      content,
      tags,
    });

    console.log("Note saved successfully:", updatedNote);

    // Update local cache
    const index = notesCache.findIndex((n) => n.id === noteId);
    if (index !== -1) {
      notesCache[index] = updatedNote;
    }

    // Update UI
    ui.renderAllNotes(notesCache.filter((n) => !n.archived));
    ui.updateTagList(noteManager.getAllTags(notesCache));

    // Clear draft after successful save
    clearDraft();

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

  // On mobile, also go back to the list
  handleMobileBack();
}

/**
 * Handle mobile back button - close note detail and return to list or search
 */
function handleMobileBack() {
  const noteDetailSection = document.getElementById("note-detail");
  noteDetailSection?.classList.remove("active");
  ui.clearCurrentNoteId();

  // If in search view, keep it visible
  if (currentView === "search") {
    const mobileSearchView = document.getElementById("mobile-search-view");
    mobileSearchView?.classList.add("active");
    mobileSearchView?.classList.remove("hidden");
  }

  // If in tags view, keep it visible
  if (currentView === "tags") {
    const mobileTagsView = document.getElementById("mobile-tags-view");
    mobileTagsView?.classList.add("active");
    mobileTagsView?.classList.remove("hidden");
  }
}

/**
 * Handle archive note
 */
function handleArchiveNote() {
  const noteId = ui.getCurrentNoteId();
  if (!noteId) return;

  const note = notesCache.find((n) => n.id === noteId);
  const isArchiving = !note.archived;

  if (isArchiving) {
    // Show archive confirmation modal
    showModal({
      icon: "archive",
      title: "Archive Note",
      message:
        "Are you sure you want to archive this note? You can find it in the Archived Notes section and restore it anytime.",
      confirmText: "Archive Note",
      confirmClass: "btn-primary",
      onConfirm: () => performArchive(noteId, true),
    });
  } else {
    // Restore without confirmation
    performArchive(noteId, false);
  }
}

/**
 * Perform the archive/restore operation
 */
async function performArchive(noteId, archive) {
  try {
    // Update in Appwrite
    await appwrite.archiveNote(noteId, archive);

    // Update local cache
    const index = notesCache.findIndex((n) => n.id === noteId);
    if (index !== -1) {
      notesCache[index].archived = archive;
    }

    // Update UI based on current view
    if (currentView === "archived") {
      ui.renderAllNotes(notesCache.filter((n) => n.archived));
    } else {
      ui.renderAllNotes(notesCache.filter((n) => !n.archived));
    }
    ui.clearNoteDetail();
    ui.updateArchiveButton(false); // Reset to default state
    ui.showToast(archive ? "Note archived!" : "Note restored!");
  } catch (error) {
    console.error("Failed to archive note:", error);
    ui.showToast("Failed to archive note", "error");
  }
}

/**
 * Handle delete note
 */
function handleDeleteNote() {
  const noteId = ui.getCurrentNoteId();
  if (!noteId) return;

  // Show delete confirmation modal
  showModal({
    icon: "delete",
    title: "Delete Note",
    message:
      "Are you sure you want to permanently delete this note? This action cannot be undone.",
    confirmText: "Delete Note",
    confirmClass: "btn-danger",
    onConfirm: () => performDelete(noteId),
  });
}

/**
 * Perform the delete operation
 */
async function performDelete(noteId) {
  try {
    // Delete from Appwrite
    await appwrite.deleteNote(noteId);

    // Remove from local cache
    notesCache = notesCache.filter((n) => n.id !== noteId);

    // Update UI
    if (currentView === "archived") {
      ui.renderAllNotes(notesCache.filter((n) => n.archived));
    } else {
      ui.renderAllNotes(notesCache.filter((n) => !n.archived));
    }
    ui.updateTagList(noteManager.getAllTags(notesCache));
    ui.clearNoteDetail();
    ui.showToast("Note deleted!");
  } catch (error) {
    console.error("Failed to delete note:", error);
    ui.showToast("Failed to delete note", "error");
  }
}

/**
 * Handle search (desktop)
 */
function handleSearch(e) {
  const query = e.target.value.trim();
  const pageTitle = document.getElementById("page-title");
  const searchInfo = document.getElementById("search-info");

  if (!query) {
    // Show all notes if search is empty
    pageTitle.textContent =
      currentView === "archived" ? "Archived Notes" : "All Notes";
    searchInfo?.classList.add("hidden");
    const notes =
      currentView === "archived"
        ? notesCache.filter((n) => n.archived)
        : notesCache.filter((n) => !n.archived);
    ui.renderAllNotes(notes);
    return;
  }

  // Update title to show search query
  pageTitle.textContent = `Showing results for: ${query}`;

  // Show search info message
  if (searchInfo) {
    searchInfo.textContent = `All notes with the "${query}" tag are shown here.`;
    searchInfo.classList.remove("hidden");
  }

  // Search locally in cache (faster than API call for each keystroke)
  const filteredNotes = noteManager.searchNotes(notesCache, query);
  ui.renderAllNotes(filteredNotes.filter((n) => !n.archived));
}

/**
 * Handle mobile search
 */
function handleMobileSearch(e) {
  const query = e.target.value.trim();
  const mobileSearchInfo = document.getElementById("mobile-search-info");
  const mobileSearchResults = document.getElementById("mobile-search-results");

  if (!query) {
    // Clear results if search is empty
    if (mobileSearchInfo) mobileSearchInfo.textContent = "";
    if (mobileSearchResults) mobileSearchResults.innerHTML = "";
    return;
  }

  // Update info message
  if (mobileSearchInfo) {
    mobileSearchInfo.textContent = `All notes matching "${query}" are displayed below.`;
  }

  // Search locally in cache
  const filteredNotes = noteManager.searchNotes(notesCache, query);

  // Render results in mobile search view
  if (mobileSearchResults) {
    mobileSearchResults.innerHTML = filteredNotes
      .filter((n) => !n.archived)
      .map((note) => renderMobileNoteCard(note))
      .join("");
  }
}

/**
 * Render a note card for mobile search results
 */
function renderMobileNoteCard(note) {
  const tagsHtml = note.tags
    .map((tag) => `<span class="tag-badge">${tag}</span>`)
    .join("");

  const formattedDate = noteManager.formatDate(
    note.updatedAt || note.createdAt
  );

  return `
    <div class="note-card" data-note-id="${note.id}">
      <h3 class="note-card-title">${note.title || "Untitled"}</h3>
      <div class="note-card-tags">${tagsHtml}</div>
      <span class="note-card-date">${formattedDate}</span>
    </div>
  `;
}

/**
 * Render mobile tags list
 */
function renderMobileTagsList() {
  const mobileTagsList = document.getElementById("mobile-tags-list");
  if (!mobileTagsList) return;

  const tags = noteManager.getAllTags(notesCache);

  if (tags.length === 0) {
    mobileTagsList.innerHTML = `
      <div class="empty-state">
        <p>No tags yet. Add tags to your notes to see them here.</p>
      </div>
    `;
    return;
  }

  mobileTagsList.innerHTML = tags
    .map(
      (tag) => `
      <div class="mobile-tag-item" data-tag="${tag}">
        <img src="./assets/images/icon-tag.svg" alt="" />
        <span>${tag}</span>
      </div>
    `
    )
    .join("");
}

/**
 * Handle mobile tag click
 */
function handleMobileTagClick(e) {
  const tagItem = e.target.closest(".mobile-tag-item");
  if (!tagItem) return;

  const tag = tagItem.dataset.tag;
  const filteredNotes = noteManager.filterByTag(notesCache, tag);

  // Switch to all-notes view with filtered results
  currentView = "all-notes";

  // Hide tags view, show notes list
  const mobileTagsView = document.getElementById("mobile-tags-view");
  const notesListSection = document.querySelector(".notes-list-section");
  const mainHeader = document.querySelector(".main-header");

  mobileTagsView?.classList.remove("active");
  mobileTagsView?.classList.add("hidden");
  notesListSection?.classList.remove("hidden");
  mainHeader?.classList.remove("hidden");

  // Update page title and render filtered notes
  document.getElementById("page-title").textContent = `Notes Tagged: ${tag}`;
  ui.renderAllNotes(filteredNotes.filter((n) => !n.archived));

  // Update nav active state
  document.querySelectorAll("[data-page]").forEach((item) => {
    item.classList.remove("active");
  });
  document.querySelector('[data-page="all-notes"]')?.classList.add("active");
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
    ui.updateArchiveButton(note.archived);

    // On mobile, show the note detail section as overlay
    const noteDetailSection = document.getElementById("note-detail");
    noteDetailSection?.classList.add("active");
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

  // Clear search input
  const searchInput = document.getElementById("search-input");
  if (searchInput) searchInput.value = "";

  // Hide search info
  const searchInfo = document.getElementById("search-info");
  searchInfo?.classList.add("hidden");

  // Get view elements
  const notesListSection = document.querySelector(".notes-list-section");
  const mobileSearchView = document.getElementById("mobile-search-view");
  const mainHeader = document.querySelector(".main-header");

  // Hide mobile search view by default
  mobileSearchView?.classList.remove("active");
  mobileSearchView?.classList.add("hidden");

  // Hide mobile tags view by default
  const mobileTagsView = document.getElementById("mobile-tags-view");
  mobileTagsView?.classList.remove("active");
  mobileTagsView?.classList.add("hidden");

  notesListSection?.classList.remove("hidden");

  switch (page) {
    case "all-notes":
      currentView = "all-notes";
      document.getElementById("page-title").textContent = "All Notes";
      ui.renderAllNotes(notesCache.filter((n) => !n.archived));
      ui.clearNoteDetail();
      break;
    case "archived":
      currentView = "archived";
      document.getElementById("page-title").textContent = "Archived Notes";
      ui.renderAllNotes(notesCache.filter((n) => n.archived));
      ui.clearNoteDetail();
      break;
    case "search":
      currentView = "search";
      // Show mobile search view, hide notes list
      notesListSection?.classList.add("hidden");
      mobileSearchView?.classList.remove("hidden");
      mobileSearchView?.classList.add("active");
      mainHeader?.classList.add("hidden");
      // Focus mobile search input
      document.getElementById("mobile-search-input")?.focus();
      break;
    case "tags":
      currentView = "tags";
      // Show mobile tags view, hide notes list
      notesListSection?.classList.add("hidden");
      mobileTagsView?.classList.remove("hidden");
      mobileTagsView?.classList.add("active");
      mainHeader?.classList.add("hidden");
      // Render tags list
      renderMobileTagsList();
      break;
    case "settings":
      // Navigate to settings page
      window.location.href = "settings.html";
      break;
  }
}

/**
 * Show modal dialog
 * @param {Object} options - Modal options
 */
function showModal({
  icon,
  title,
  message,
  confirmText,
  confirmClass,
  onConfirm,
}) {
  const overlay = document.getElementById("modal-overlay");
  const modalIcon = document.getElementById("modal-icon");
  const modalTitle = document.getElementById("modal-title");
  const modalMessage = document.getElementById("modal-message");
  const modalConfirm = document.getElementById("modal-confirm");

  // Update modal content
  modalIcon.innerHTML = `<img src="./assets/images/icon-${icon}.svg" alt="" />`;
  modalIcon.className = icon === "delete" ? "modal-icon danger" : "modal-icon";
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modalConfirm.textContent = confirmText;
  modalConfirm.className = `btn ${confirmClass}`;

  // Store callback
  modalCallback = onConfirm;

  // Show modal
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");

  // Focus trap - focus the cancel button
  document.getElementById("modal-cancel")?.focus();
}

/**
 * Close modal dialog
 */
function closeModal() {
  const overlay = document.getElementById("modal-overlay");
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  modalCallback = null;
}

/**
 * Handle modal confirm button click
 */
function handleModalConfirm() {
  if (modalCallback) {
    modalCallback();
  }
  closeModal();
}

/**
 * Handle keyboard navigation
 */
function handleKeyboardNav(e) {
  const modal = document.getElementById("modal-overlay");
  const isModalOpen = modal?.classList.contains("active");

  // Handle Escape key
  if (e.key === "Escape") {
    if (isModalOpen) {
      closeModal();
    } else {
      // Cancel current edit
      handleCancel();
    }
    return;
  }

  // Handle Enter key
  if (e.key === "Enter") {
    // If in modal, confirm on Enter (unless focused on cancel)
    if (isModalOpen && document.activeElement?.id !== "modal-cancel") {
      handleModalConfirm();
      return;
    }

    // Save note on Ctrl/Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && !isModalOpen) {
      handleSaveNote();
      return;
    }
  }

  // Arrow key navigation in notes list
  if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !isModalOpen) {
    const noteCards = document.querySelectorAll(".note-card");
    const activeCard = document.querySelector(".note-card.active");

    if (noteCards.length === 0) return;

    let currentIndex = Array.from(noteCards).indexOf(activeCard);
    if (currentIndex === -1) currentIndex = -1;

    let newIndex;
    if (e.key === "ArrowDown") {
      newIndex = Math.min(currentIndex + 1, noteCards.length - 1);
    } else {
      newIndex = Math.max(currentIndex - 1, 0);
    }

    const newCard = noteCards[newIndex];
    if (newCard) {
      newCard.click();
      newCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }
}

/**
 * Auto-save draft to sessionStorage while typing
 */
function handleDraftAutoSave() {
  const noteId = ui.getCurrentNoteId();
  if (!noteId) return;

  const title = document.getElementById("note-title")?.textContent || "";
  const content = document.getElementById("note-content")?.value || "";
  const tagsText = document.getElementById("note-tags")?.value || "";

  const draft = {
    noteId,
    title,
    content,
    tags: tagsText,
    timestamp: new Date().toISOString(),
  };

  saveDraft(draft);
  console.log("Draft auto-saved to sessionStorage");
}

/**
 * Restore draft from sessionStorage on page load
 */
function restoreDraft() {
  const draft = loadDraft();
  if (!draft) return;

  // Check if draft is recent (within last 24 hours)
  const draftTime = new Date(draft.timestamp);
  const now = new Date();
  const hoursDiff = (now - draftTime) / (1000 * 60 * 60);

  if (hoursDiff > 24) {
    clearDraft();
    return;
  }

  // Find the note in cache
  const note = notesCache.find((n) => n.id === draft.noteId);
  if (!note) {
    clearDraft();
    return;
  }

  // Check if draft has unsaved changes
  const hasChanges =
    draft.title !== note.title ||
    draft.content !== note.content ||
    draft.tags !== note.tags.join(", ");

  if (hasChanges) {
    // Show toast and restore draft
    ui.showToast("Restored unsaved draft", "info");

    // Show the note with draft content
    ui.showNoteDetail(note);
    ui.setActiveNote(note.id);

    // Restore draft content
    setTimeout(() => {
      const titleEl = document.getElementById("note-title");
      const contentEl = document.getElementById("note-content");
      const tagsEl = document.getElementById("note-tags");

      if (titleEl) titleEl.textContent = draft.title;
      if (contentEl) contentEl.value = draft.content;
      if (tagsEl) tagsEl.value = draft.tags;
    }, 100);

    console.log("Draft restored from sessionStorage");
  } else {
    // No changes, clear the draft
    clearDraft();
  }
}
