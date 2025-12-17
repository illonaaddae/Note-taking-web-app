/**
 * Password Toggle Module
 * Handles password visibility toggle functionality
 */

import { getDocument } from "../utils.js";

/**
 * Initialize password toggle functionality
 * @param {string} toggleId - ID of the toggle button
 * @param {string} inputId - ID of the password input
 */
export function initPasswordToggle(
  toggleId = "password-toggle",
  inputId = "password"
) {
  const toggle = getDocument(toggleId, "id");
  const input = getDocument(inputId, "id");

  // Safety check - exit if elements don't exist
  if (!toggle || !input) return;

  toggle.addEventListener("click", () => {
    if (input.type === "password") {
      input.type = "text";
      toggle.classList.add("active");
      toggle.setAttribute("aria-label", "Hide password");
    } else {
      input.type = "password";
      toggle.classList.remove("active");
      toggle.setAttribute("aria-label", "Show password");
    }
  });
}

/**
 * Initialize multiple password toggles (for signup with confirm password)
 * @param {Array} toggleConfigs - Array of {toggleId, inputId} objects
 */
export function initMultiplePasswordToggles(toggleConfigs) {
  toggleConfigs.forEach(({ toggleId, inputId }) => {
    initPasswordToggle(toggleId, inputId);
  });
}
