/**
 * Settings Page Module
 * Handles settings page functionality including theme switching,
 * font selection, and password changes
 */

import * as theme from "./theme.js";
import { loadPreferences, savePreferences } from "./storage.js";
import {
  initAppwrite,
  getCurrentUser,
  logout,
  updatePassword,
} from "./appwrite.js";

/**
 * Initialize settings page
 */
function init() {
  // Initialize Appwrite
  initAppwrite();

  // Initialize theme (applies saved preferences)
  theme.initTheme();

  // Load and apply saved preferences to UI
  loadSavedPreferences();

  // Set up event listeners
  setupEventListeners();

  console.log("Settings page initialized");
}

/**
 * Load saved preferences and update UI
 */
function loadSavedPreferences() {
  const prefs = loadPreferences();

  // Set color theme radio button
  const colorThemeRadio = document.querySelector(
    `input[name="color-theme"][value="${prefs.theme || "light"}"]`
  );
  if (colorThemeRadio) {
    colorThemeRadio.checked = true;
  }

  // Set font theme radio button
  const fontThemeRadio = document.querySelector(
    `input[name="font-theme"][value="${prefs.font || "sans-serif"}"]`
  );
  if (fontThemeRadio) {
    fontThemeRadio.checked = true;
  }
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  // Settings menu navigation
  const menuItems = document.querySelectorAll(
    ".settings-menu-item[data-setting]"
  );
  menuItems.forEach((item) => {
    item.addEventListener("click", handleMenuClick);
  });

  // Mobile back buttons
  const backButtons = document.querySelectorAll(".mobile-settings-back");
  backButtons.forEach((btn) => {
    btn.addEventListener("click", handleMobileBack);
  });

  // Apply color theme button
  const applyColorBtn = document.getElementById("apply-color-theme");
  applyColorBtn?.addEventListener("click", handleApplyColorTheme);

  // Apply font theme button
  const applyFontBtn = document.getElementById("apply-font-theme");
  applyFontBtn?.addEventListener("click", handleApplyFontTheme);

  // Password form
  const passwordForm = document.getElementById("change-password-form");
  passwordForm?.addEventListener("submit", handlePasswordChange);

  // Password toggle buttons
  const passwordToggles = document.querySelectorAll(".password-toggle");
  passwordToggles.forEach((toggle) => {
    toggle.addEventListener("click", handlePasswordToggle);
  });

  // Logout button
  const logoutBtn = document.getElementById("logout-btn");
  logoutBtn?.addEventListener("click", handleLogout);

  // Keyboard navigation
  document.addEventListener("keydown", handleKeyboardNav);
}

/**
 * Handle mobile back button - go back to settings menu
 */
function handleMobileBack() {
  const settingsMenu = document.querySelector(".settings-menu");
  const settingsPanels = document.querySelector(".settings-panels");

  settingsMenu?.classList.remove("hidden");
  settingsPanels?.classList.remove("active");
}

/**
 * Handle settings menu item click
 */
function handleMenuClick(e) {
  const setting = e.currentTarget.dataset.setting;

  // Update active menu item
  document.querySelectorAll(".settings-menu-item").forEach((item) => {
    item.classList.remove("active");
  });
  e.currentTarget.classList.add("active");

  // Show corresponding panel
  document.querySelectorAll(".settings-panel").forEach((panel) => {
    panel.classList.remove("active");
  });

  const targetPanel = document.querySelector(`[data-panel="${setting}"]`);
  targetPanel?.classList.add("active");

  // On mobile, show the panels container
  const settingsPanels = document.querySelector(".settings-panels");
  if (window.innerWidth <= 768) {
    settingsPanels?.classList.add("active");
    // Hide menu on mobile when panel is shown
    const settingsMenu = document.querySelector(".settings-menu");
    settingsMenu?.classList.add("hidden");
  }
}

/**
 * Handle apply color theme
 */
function handleApplyColorTheme() {
  const selectedTheme = document.querySelector(
    'input[name="color-theme"]:checked'
  )?.value;

  if (selectedTheme) {
    theme.applyTheme(selectedTheme);
    showToast("Color theme updated!");
  }
}

/**
 * Handle apply font theme
 */
function handleApplyFontTheme() {
  const selectedFont = document.querySelector(
    'input[name="font-theme"]:checked'
  )?.value;

  if (selectedFont) {
    theme.applyFont(selectedFont);
    showToast("Font theme updated!");
  }
}

/**
 * Handle password toggle visibility
 */
function handlePasswordToggle(e) {
  const toggle = e.currentTarget;
  const targetId = toggle.dataset.target;
  const input = document.getElementById(targetId);

  if (input) {
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    toggle.classList.toggle("active", isPassword);
  }
}

/**
 * Handle password change form submission
 */
async function handlePasswordChange(e) {
  e.preventDefault();

  const oldPassword = document.getElementById("old-password")?.value;
  const newPassword = document.getElementById("new-password")?.value;
  const confirmPassword = document.getElementById("confirm-password")?.value;

  // Validate inputs
  if (!oldPassword || !newPassword || !confirmPassword) {
    showToast("Please fill in all fields", "error");
    return;
  }

  if (newPassword.length < 8) {
    showToast("Password must be at least 8 characters", "error");
    return;
  }

  if (newPassword !== confirmPassword) {
    showToast("New passwords do not match", "error");
    return;
  }

  try {
    // Update password via Appwrite
    await updatePassword(newPassword, oldPassword);
    showToast("Password updated successfully!");

    // Clear form
    e.target.reset();
  } catch (error) {
    console.error("Failed to update password:", error);
    showToast(error.message || "Failed to update password", "error");
  }
}

/**
 * Handle logout
 */
async function handleLogout() {
  try {
    await logout();
    showToast("Logged out successfully!");
    // Redirect to login page
    setTimeout(() => {
      window.location.href = "auth/login.html";
    }, 500);
  } catch (error) {
    console.error("Failed to logout:", error);
    showToast("Failed to logout", "error");
  }
}

/**
 * Handle keyboard navigation
 */
function handleKeyboardNav(e) {
  // Escape key to go back to main page
  if (e.key === "Escape") {
    window.location.href = "index.html";
  }

  // Enter key to apply changes on focused panel
  if (e.key === "Enter" && e.target.type === "radio") {
    const panel = e.target.closest(".settings-panel");
    const applyBtn = panel?.querySelector(".btn-apply");
    applyBtn?.click();
  }
}

/**
 * Show toast notification
 * @param {string} message - Toast message
 * @param {string} type - "success" or "error"
 */
function showToast(message, type = "success") {
  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  // Add to DOM
  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => toast.classList.add("show"), 10);

  // Remove after delay
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", init);
