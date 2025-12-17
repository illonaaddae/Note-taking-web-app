/**
 * Note Manager Module
 * Handles note CRUD operations and data manipulation
 */

/**
 * Generate unique ID
 * @returns {string} - Unique ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return date.toLocaleDateString("en-GB", options);
}

/**
 * Create a new note
 * @param {string} title - Note title
 * @param {string} content - Note content
 * @param {Array} tags - Array of tags
 * @returns {Object} - New note object
 */
export function createNote(title, content, tags = []) {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title: title || "Untitled Note",
    content: content || "",
    tags: tags,
    archived: false,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Update an existing note
 * @param {Array} notes - All notes
 * @param {string} id - Note ID to update
 * @param {Object} updates - Fields to update
 * @returns {Array} - Updated notes array
 */
export function updateNote(notes, id, updates) {
  return notes.map((note) => {
    if (note.id === id) {
      return {
        ...note,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    }
    return note;
  });
}

/**
 * Delete a note
 * @param {Array} notes - All notes
 * @param {string} id - Note ID to delete
 * @returns {Array} - Updated notes array
 */
export function deleteNote(notes, id) {
  return notes.filter((note) => note.id !== id);
}

/**
 * Archive/unarchive a note
 * @param {Array} notes - All notes
 * @param {string} id - Note ID to archive
 * @returns {Array} - Updated notes array
 */
export function archiveNote(notes, id) {
  return notes.map((note) => {
    if (note.id === id) {
      return {
        ...note,
        archived: !note.archived,
        updatedAt: new Date().toISOString(),
      };
    }
    return note;
  });
}

/**
 * Search notes by title, content, and tags
 * @param {Array} notes - All notes
 * @param {string} query - Search query
 * @returns {Array} - Filtered notes
 */
export function searchNotes(notes, query) {
  if (!query) return notes;

  const lowerQuery = query.toLowerCase();
  return notes.filter((note) => {
    const titleMatch = note.title.toLowerCase().includes(lowerQuery);
    const contentMatch = note.content.toLowerCase().includes(lowerQuery);
    const tagMatch = note.tags.some((tag) =>
      tag.toLowerCase().includes(lowerQuery)
    );
    return titleMatch || contentMatch || tagMatch;
  });
}

/**
 * Filter notes by tag
 * @param {Array} notes - All notes
 * @param {string} tag - Tag to filter by
 * @returns {Array} - Filtered notes
 */
export function filterByTag(notes, tag) {
  return notes.filter((note) => note.tags.includes(tag));
}

/**
 * Get all unique tags from notes
 * @param {Array} notes - All notes
 * @returns {Array} - Array of unique tags
 */
export function getAllTags(notes) {
  const tags = new Set();
  notes.forEach((note) => {
    note.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
}

/**
 * Sort notes by date
 * @param {Array} notes - All notes
 * @param {string} order - "asc" or "desc"
 * @returns {Array} - Sorted notes
 */
export function sortByDate(notes, order = "desc") {
  return [...notes].sort((a, b) => {
    const dateA = new Date(a.updatedAt);
    const dateB = new Date(b.updatedAt);
    return order === "desc" ? dateB - dateA : dateA - dateB;
  });
}
