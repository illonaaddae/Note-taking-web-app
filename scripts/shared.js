// shared.js - Read-only shared note view
import { CONFIG } from "./appwrite.js";

const container = document.getElementById("shared-note-container");

// Parse note ID from URL
const urlParams = new URLSearchParams(window.location.search);
const noteId = urlParams.get("note");

if (!noteId) {
  showError("No note specified.");
} else {
  loadNote(noteId);
}

function showError(msg) {
  container.innerHTML = `<div class="shared-note-error">${msg}</div>`;
}

async function loadNote(id) {
  try {
    // Init Appwrite
    const { Client, Databases } = window.Appwrite;
    const client = new Client();
    client.setEndpoint(CONFIG.endpoint).setProject(CONFIG.projectId);
    const databases = new Databases(client);

    // Fetch note by ID
    const doc = await databases.getDocument(
      CONFIG.databaseId,
      CONFIG.collectionId,
      id
    );
    renderNote(doc);
  } catch (err) {
    showError("Note not found or access denied.");
  }
}

function renderNote(doc) {
  const tags = (doc.tags || [])
    .map((tag) => `<span class="shared-note-tag">${tag}</span>`)
    .join("");
  container.innerHTML = `
    <div class="shared-note-title">${escapeHtml(doc.title) || "Untitled"}</div>
    <div class="shared-note-tags">${tags}</div>
    <div class="shared-note-content">${
      doc.content ? doc.content : "<em>No content</em>"
    }</div>
    <div class="shared-note-date">Last updated: ${formatDate(
      doc.$updatedAt
    )}</div>
  `;
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, function (m) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[m];
  });
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString();
}
