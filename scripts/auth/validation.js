/**
 * Validation Module
 * Handles form validation display and logic
 */

/**
 * Show error message for a form field
 * @param {HTMLElement} input - The input element
 * @param {string} message - Error message to display
 */
export function showError(input, message) {
  const formGroup = input.closest(".form-group");
  if (!formGroup) return;

  formGroup.classList.add("error");
  formGroup.classList.remove("success");

  // Remove existing error message if any
  const existingError = formGroup.querySelector(".form-error-message");
  if (existingError) {
    existingError.remove();
  }

  // Add error message
  const errorElement = document.createElement("span");
  errorElement.className = "form-error-message";
  errorElement.textContent = message;
  formGroup.appendChild(errorElement);
}

/**
 * Clear error message from a form field
 * @param {HTMLElement} input - The input element
 */
export function clearError(input) {
  const formGroup = input.closest(".form-group");
  if (!formGroup) return;

  formGroup.classList.remove("error");

  const existingError = formGroup.querySelector(".form-error-message");
  if (existingError) {
    existingError.remove();
  }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {number} minLength - Minimum length (default 8)
 * @returns {boolean} - True if valid
 */
export function isValidPassword(password, minLength = 8) {
  return password.length >= minLength;
}

/**
 * Check if passwords match (for signup/reset)
 * @param {string} password - Password
 * @param {string} confirmPassword - Confirm password
 * @returns {boolean} - True if they match
 */
export function passwordsMatch(password, confirmPassword) {
  return password === confirmPassword;
}
