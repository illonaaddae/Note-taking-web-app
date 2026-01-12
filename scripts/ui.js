/**
 * UI Module
 * Handles DOM manipulation and rendering
 */
import { getDocument } from "./utils.js";
import { getAllNotes } from "./appwrite.js";
import { formatDate } from "./noteManager.js";

// Track current note being edited
let currentNoteId = null;

/**
 * Get current note ID
 * @returns {string|null}
 */
export function getCurrentNoteId() {
  return currentNoteId;
}

/**
 * Set current note ID
 * @param {string} id
 */
export function setCurrentNoteId(id) {
  currentNoteId = id;
}

/**
 * Clear current note ID
 */
export function clearCurrentNoteId() {
  currentNoteId = null;
}

/**
 * Render a single note card
 * @param {Object} note - Note object
 * @returns {string} - HTML string
 */
function renderNoteCard(note) {
  const tagsHtml = note.tags
    .map((tag) => `<span class="tag-badge">${tag}</span>`)
    .join("");

  // Show "Untitled" with different styling if no title (or whitespace-only)
  const trimmedTitle = note.title?.trim() || "";
  const displayTitle = trimmedTitle || "Untitled";
  const titleClass = trimmedTitle
    ? "note-card-title"
    : "note-card-title note-card-title--empty";

  return `
    <div class="note-card" data-note-id="${note.id}">
      <h3 class="${titleClass}">${displayTitle}</h3>
      <div class="note-card-tags">${tagsHtml}</div>
      <span class="note-card-date">${formatDate(note.updatedAt)}</span>
    </div>
  `;
}

/**
 * Render all notes in the list
 * @param {Array} notes - Array of note objects
 */
export function renderAllNotes(notes) {
  const notesList = getDocument("notes-list", "id");
  if (!notesList) return;

  // Filter out archived notes for main view (unless on archive page)
  const pageTitle = getDocument("page-title", "id")?.textContent || "";
  const isArchivePage = pageTitle.includes("Archived");

  const filteredNotes = isArchivePage
    ? notes.filter((n) => n.archived)
    : notes.filter((n) => !n.archived);

  if (filteredNotes.length === 0) {
    notesList.innerHTML = `
      <div class="empty-state-info">
        <p>You don't have any notes yet. Start a new note to capture your thoughts and ideas.</p>
      </div>
    `;
    return;
  }

  notesList.innerHTML = filteredNotes.map(renderNoteCard).join("");
}

/**
 * Show note detail in the editor
 * @param {Object} note - Note object
 */
export function showNoteDetail(note) {
  currentNoteId = note.id;

  const titleEl = getDocument("note-title", "id");
  const contentEl = getDocument("note-content", "id");
  const tagsEl = getDocument("note-tags");
  const tagsSelected = getDocument("tags-selected", "id");
  const dateEl = getDocument("note-date");
  const statusRow = getDocument("note-status-row", "id");
  const statusEl = getDocument("note-status", "id");

  // Set title - trim whitespace and use empty string for CSS :empty placeholder to show
  const displayTitle = note.title?.trim() || "";
  if (titleEl) titleEl.textContent = displayTitle;
  if (contentEl) contentEl.value = note.content || "";

  // Update hidden tags input
  if (tagsEl) tagsEl.value = note.tags.join(", ") || "";

  // Update tags selector UI (Mac Notes style)
  if (tagsSelected) {
    if (note.tags && note.tags.length > 0) {
      tagsSelected.innerHTML = note.tags
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
          // Dispatch a custom event to be handled by main.js
          window.dispatchEvent(
            new CustomEvent("removeTag", { detail: { tag: tagToRemove } })
          );
        });
      });
    } else {
      tagsSelected.innerHTML = `<span class="tags-placeholder">Add tags...</span>`;
    }
  }

  if (dateEl) dateEl.textContent = formatDate(note.updatedAt);

  // Show status row only for archived notes
  if (statusRow && statusEl) {
    if (note.archived) {
      statusRow.classList.remove("hidden");
      statusEl.textContent = "Archived";
    } else {
      statusRow.classList.add("hidden");
    }
  }

  // Focus on title if it's empty or whitespace-only (new note)
  if (!displayTitle) {
    titleEl?.focus();
  }

  // Show detail section on mobile
  const detailSection = getDocument("note-detail");
  detailSection?.classList.add("active");
}

/**
 * Clear note detail editor
 */
export function clearNoteDetail() {
  currentNoteId = null;

  const titleEl = getDocument("note-title", "id");
  const contentEl = getDocument("note-content", "id");
  const tagsEl = getDocument("note-tags", "id");
  const tagsSelected = getDocument("tags-selected", "id");
  const dateEl = getDocument("note-date", "id");

  if (titleEl) titleEl.textContent = "Select a note to view";
  if (contentEl) contentEl.value = "";
  if (tagsEl) tagsEl.value = "";
  if (tagsSelected)
    tagsSelected.innerHTML = `<span class="tags-placeholder">Add tags...</span>`;
  if (dateEl) dateEl.textContent = "-";

  // Hide detail section on mobile
  const detailSection = document.getElementById("note-detail");
  detailSection?.classList.remove("active");
}

/**
 * Set active note in the list
 * @param {string} noteId - Note ID
 */
export function setActiveNote(noteId) {
  // Remove active class from all cards
  getDocument(".note-card", "queryAll").forEach((card) => {
    card.classList.remove("active");
  });

  // Add active class to selected card
  const activeCard = getDocument(`[data-note-id="${noteId}"]`, "query");
  activeCard?.classList.add("active");
}

/**
 * Update tags list in sidebar
 * @param {Array} tags - Array of tag strings
 */
export function updateTagList(tags) {
  const tagsList = getDocument("sidebar-tags", "id");
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

/**
 * Set active tag in sidebar
 * @param {string} tag - Tag name
 */
export function setActiveTag(tag) {
  getDocument(".tag-item", "queryAll").forEach((item) => {
    item.classList.remove("active");
  });

  const activeTag = getDocument(`[data-tag="${tag}"]`, "query");
  activeTag?.classList.add("active");
}

/**
 * Show toast notification
 * @param {string} message - Toast message
 * @param {string} type - "success", "error", "info"
 * @param {Object} options - Optional action configuration
 * @param {string} options.actionText - Text for action link
 * @param {Function} options.actionCallback - Callback when action is clicked
 */
export function showToast(message, type = "success", options = {}) {
  // Remove any existing toast
  const existingToast = getDocument(".toast", "query");
  if (existingToast) {
    existingToast.remove();
  }

  // Determine icon based on type
  const iconMap = {
    success: "icon-checkmark-green.svg",
    error: "icon-error.svg",
    info: "icon-info.svg",
  };
  const iconSrc = `./assets/images/${iconMap[type] || iconMap.success}`;

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  // Build toast HTML structure
  toast.innerHTML = `
    <img class="toast-icon" src="${iconSrc}" alt="${type}" />
    <div class="toast-content">
      <span class="toast-message">${message}</span>
      ${
        options.actionText
          ? `<a class="toast-action" href="#">${options.actionText}</a>`
          : ""
      }
    </div>
    <button class="toast-close" aria-label="Close">
      <img src="./assets/images/icon-cross.svg" alt="Close" />
    </button>
  `;

  // Add to DOM
  document.body.appendChild(toast);

  // Set up close button
  const closeBtn = toast.querySelector(".toast-close");
  closeBtn.addEventListener("click", () => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  });

  // Set up action link if provided
  if (options.actionText && options.actionCallback) {
    const actionLink = toast.querySelector(".toast-action");
    actionLink.addEventListener("click", (e) => {
      e.preventDefault();
      options.actionCallback();
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    });
  }

  // Animate in
  setTimeout(() => toast.classList.add("show"), 10);

  // Auto-remove after delay
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }
  }, 4000);
}

/**
 * Toggle archive view
 */
export function toggleArchiveView() {
  const pageTitle = getDocument("page-title", "id");
  if (pageTitle) {
    const isArchive = pageTitle.textContent.includes("Archived");
    pageTitle.textContent = isArchive ? "All Notes" : "Archived Notes";
  }
}

/**
 * Update archive button text based on note status
 * @param {boolean} isArchived - Whether the note is archived
 */
export function updateArchiveButton(isArchived) {
  const archiveBtn = getDocument("archive-note-btn", "id");
  if (!archiveBtn) return;

  const img = archiveBtn.querySelector("img");
  const span = archiveBtn.querySelector("span");

  if (isArchived) {
    // Show "Restore Note" for archived notes
    if (img) img.src = "./assets/images/icon-restore.svg";
    if (span) span.textContent = "Restore Note";
  } else {
    // Show "Archive Note" for active notes
    if (img) img.src = "./assets/images/icon-archive.svg";
    if (span) span.textContent = "Archive Note";
  }
}

// Export Notes
export function setupExportButton() {
  const exportBtn = getDocument("export-notes-btn", "id");
  if (exportBtn) {
    exportBtn.addEventListener("click", async () => {
      // Always await getAllNotes if you use it
      const notes =
        window.notesCache && window.notesCache.length
          ? window.notesCache
          : await getAllNotes();
      const dataStr = JSON.stringify(notes, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "notes-export.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }
}

// Import  Notes
export function setupImportButton() {
  const importBtn = getDocument("import-notes-btn", "id");
  const importInput = getDocument("import-notes-input", "id");

  if (importBtn && importInput) {
    // When the button is clicked, trigger the file input
    importBtn.addEventListener("click", () => {
      importInput.value = ""; // Reset input so same file can be re-imported
      importInput.click();
    });

    // When a file is selected, handle the import
    importInput.addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const json = e.target.result;
          const importedNotes = JSON.parse(json);

          // Validate structure: must be an array of note objects
          if (!Array.isArray(importedNotes)) {
            showToast("Invalid file: Not an array of notes", "error");
            return;
          }

          // Validate each note object (basic schema check)
          const validNotes = importedNotes.filter(
            (note) =>
              note &&
              typeof note === "object" &&
              typeof note.title === "string" &&
              typeof note.content === "string" &&
              Array.isArray(note.tags) &&
              typeof note.archived === "boolean" &&
              typeof note.createdAt === "string" &&
              typeof note.updatedAt === "string"
          );

          if (validNotes.length === 0) {
            showToast("No valid notes found in file", "error");
            return;
          }

          // Prevent duplicates: compare by id (or title/content if id missing)
          const existingNotes = window.notesCache || [];
          const existingIds = new Set(existingNotes.map((n) => n.id));
          const newNotes = validNotes.filter(
            (note) => !existingIds.has(note.id)
          );

          if (newNotes.length === 0) {
            showToast(
              "All notes already exist (no duplicates imported)",
              "info"
            );
            return;
          }

          // Import new notes (persist to Appwrite)
          // Import one by one to preserve permissions and schema
          let importedCount = 0;
          const appwrite = await import("./appwrite.js");
          for (const note of newNotes) {
            try {
              // Remove id, createdAt, updatedAt (Appwrite will generate new ones)
              const { title, content, tags, archived } = note;
              await appwrite.createNote({ title, content, tags, archived });
              importedCount++;
            } catch (err) {
              // Continue importing others
              console.error("Failed to import note:", err);
            }
          }

          showToast(`Imported ${importedCount} new note(s)`, "success");
          // Optionally, refresh notes list
          window.location.reload();
        } catch (err) {
          showToast("Failed to import notes: Invalid JSON", "error");
        }
      };
      reader.readAsText(file);
    });
  }
}
