/**
 * Appwrite Configuration and Database Operations
 * This module handles all interactions with Appwrite cloud database
 */

// Appwrite SDK is loaded via CDN in index.html
// We access it through the global 'Appwrite' object

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  endpoint: "https://fra.cloud.appwrite.io/v1",
  projectId: "69430f2d001f367e2aca",
  databaseId: "notesdb",
  collectionId: "notes",
};

// ============================================
// INITIALIZE APPWRITE CLIENT
// ============================================

let client;
let databases;
let account;

/**
 * Initialize the Appwrite client
 * Must be called after the SDK is loaded
 */
export async function initAppwrite() {
  // Access the Appwrite SDK from the global scope (loaded via CDN)
  const { Client, Databases, Account } = window.Appwrite;

  client = new Client();
  client.setEndpoint(CONFIG.endpoint).setProject(CONFIG.projectId);

  databases = new Databases(client);
  account = new Account(client);

  // Ping the Appwrite server to verify the setup
  try {
    const ping = await client.ping();
    console.log("✅ Appwrite connection verified:", ping);
  } catch (error) {
    console.error("❌ Appwrite ping failed:", error.message);
    console.log(
      "Make sure you've added 'localhost' and '127.0.0.1' as Web platforms in Appwrite Console → Settings → Platforms"
    );
  }

  console.log("Appwrite initialized successfully!");
}

// ============================================
// AUTHENTICATION
// ============================================

/**
 * Get current logged in user
 * @returns {Promise<Object|null>} - User object or null
 */
export async function getCurrentUser() {
  try {
    const user = await account.get();
    return user;
  } catch (error) {
    // User is not logged in
    return null;
  }
}

/**
 * Logout the current user
 * @returns {Promise<boolean>} - True if successful
 */
export async function logout() {
  try {
    await account.deleteSession("current");
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
}

/**
 * Update user's password
 * @param {string} newPassword - New password
 * @param {string} oldPassword - Current password
 * @returns {Promise<boolean>} - True if successful
 */
export async function updatePassword(newPassword, oldPassword) {
  try {
    await account.updatePassword(newPassword, oldPassword);
    return true;
  } catch (error) {
    console.error("Update password error:", error);
    throw error;
  }
}

// ============================================
// NOTES CRUD OPERATIONS
// ============================================

/**
 * Get all notes from Appwrite database
 * @returns {Promise<Array>} - Array of note objects
 */
export async function getAllNotes() {
  try {
    const { Query } = window.Appwrite;

    const response = await databases.listDocuments(
      CONFIG.databaseId,
      CONFIG.collectionId,
      [Query.orderDesc("$createdAt"), Query.limit(100)]
    );

    // Transform Appwrite documents to our note format
    return response.documents.map((doc) => ({
      id: doc.$id,
      title: doc.title,
      content: doc.content || "",
      tags: doc.tags || [],
      archived: doc.archived || false,
      createdAt: doc.$createdAt,
      updatedAt: doc.$updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching notes:", error);
    return [];
  }
}

/**
 * Create a new note in Appwrite
 * @param {Object} note - Note object with title, content, tags
 * @returns {Promise<Object>} - Created note object
 */
export async function createNote(note) {
  try {
    const { ID } = window.Appwrite;

    const response = await databases.createDocument(
      CONFIG.databaseId,
      CONFIG.collectionId,
      ID.unique(),
      {
        title: note.title || "Untitled Note",
        content: note.content || "",
        tags: note.tags || [],
        archived: note.archived || false,
      }
    );

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
    console.error("Error creating note:", error);
    throw error;
  }
}

/**
 * Update an existing note in Appwrite
 * @param {string} noteId - The note ID to update
 * @param {Object} updates - Object with fields to update
 * @returns {Promise<Object>} - Updated note object
 */
export async function updateNote(noteId, updates) {
  try {
    const response = await databases.updateDocument(
      CONFIG.databaseId,
      CONFIG.collectionId,
      noteId,
      {
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.content !== undefined && { content: updates.content }),
        ...(updates.tags !== undefined && { tags: updates.tags }),
        ...(updates.archived !== undefined && { archived: updates.archived }),
      }
    );

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
    console.error("Error updating note:", error);
    throw error;
  }
}

/**
 * Delete a note from Appwrite
 * @param {string} noteId - The note ID to delete
 * @returns {Promise<boolean>} - True if deleted successfully
 */
export async function deleteNote(noteId) {
  try {
    await databases.deleteDocument(
      CONFIG.databaseId,
      CONFIG.collectionId,
      noteId
    );
    return true;
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
}

/**
 * Toggle archive status of a note
 * @param {string} noteId - The note ID
 * @param {boolean} archived - New archive status
 * @returns {Promise<Object>} - Updated note object
 */
export async function archiveNote(noteId, archived) {
  return updateNote(noteId, { archived });
}

/**
 * Get a single note by ID
 * @param {string} noteId - The note ID
 * @returns {Promise<Object>} - Note object
 */
export async function getNote(noteId) {
  try {
    const response = await databases.getDocument(
      CONFIG.databaseId,
      CONFIG.collectionId,
      noteId
    );

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
    console.error("Error fetching note:", error);
    throw error;
  }
}

/**
 * Search notes by title or content
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of matching notes
 */
export async function searchNotes(query) {
  try {
    const { Query } = window.Appwrite;

    const response = await databases.listDocuments(
      CONFIG.databaseId,
      CONFIG.collectionId,
      [
        Query.or([
          Query.contains("title", query),
          Query.contains("content", query),
        ]),
      ]
    );

    return response.documents.map((doc) => ({
      id: doc.$id,
      title: doc.title,
      content: doc.content || "",
      tags: doc.tags || [],
      archived: doc.archived || false,
      createdAt: doc.$createdAt,
      updatedAt: doc.$updatedAt,
    }));
  } catch (error) {
    console.error("Error searching notes:", error);
    // Fallback: return all notes and filter client-side
    const allNotes = await getAllNotes();
    const lowerQuery = query.toLowerCase();
    return allNotes.filter(
      (note) =>
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery)
    );
  }
}
