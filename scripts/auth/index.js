/**
 * Auth Module - Main Entry Point
 * Imports and initializes all auth-related functionality
 */

// Import modules
import {
  initPasswordToggle,
  initMultiplePasswordToggles,
} from "./passwordToggle.js";
import {
  initLoginForm,
  initSignupForm,
  initForgotPasswordForm,
  initResetPasswordForm,
} from "./formHandlers.js";
import * as authService from "./authService.js";
import { initTheme } from "../theme.js";

// Re-export for use elsewhere if needed
export {
  showError,
  clearError,
  isValidEmail,
  isValidPassword,
  passwordsMatch,
} from "./validation.js";
export {
  initPasswordToggle,
  initMultiplePasswordToggles,
} from "./passwordToggle.js";
export {
  initLoginForm,
  initSignupForm,
  initForgotPasswordForm,
  initResetPasswordForm,
} from "./formHandlers.js";
export * as authService from "./authService.js";

/**
 * Detect current page and initialize appropriate handlers
 */
function detectAndInitialize() {
  const path = window.location.pathname;

  if (path.includes("login")) {
    initPasswordToggle();
    initLoginForm();
  } else if (path.includes("signup")) {
    // Signup has one password field
    initPasswordToggle();
    initSignupForm();
  } else if (path.includes("forgot-password")) {
    initForgotPasswordForm();
  } else if (path.includes("reset-password")) {
    initMultiplePasswordToggles([
      { toggleId: "password-toggle", inputId: "password" },
      { toggleId: "confirm-password-toggle", inputId: "confirm-password" },
    ]);
    initResetPasswordForm();
  }
}

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  // Initialize theme first
  initTheme();

  // Then initialize page-specific handlers
  detectAndInitialize();
});
