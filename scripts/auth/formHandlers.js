/**
 * Form Handlers Module
 * Handles form submissions for all auth pages
 */

import { getDocument } from "../utils.js";
import {
  showError,
  clearError,
  isValidEmail,
  isValidPassword,
  passwordsMatch,
} from "./validation.js";

/**
 * Initialize login form validation and submission
 */
export function initLoginForm() {
  const form = getDocument(".auth-form", "query");
  if (!form) return;

  const emailInput = getDocument("email", "id");
  const passwordInput = getDocument("password", "id");

  if (!emailInput || !passwordInput) return;

  // Validate email on blur
  emailInput.addEventListener("blur", () => {
    if (emailInput.value && !isValidEmail(emailInput.value)) {
      showError(emailInput, "Please enter a valid email address");
    } else {
      clearError(emailInput);
    }
  });

  // Clear error on input
  emailInput.addEventListener("input", () => {
    if (isValidEmail(emailInput.value)) {
      clearError(emailInput);
    }
  });

  passwordInput.addEventListener("input", () => {
    clearError(passwordInput);
  });

  // Form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let isValid = true;

    // Validate email
    if (!emailInput.value) {
      showError(emailInput, "Email is required");
      isValid = false;
    } else if (!isValidEmail(emailInput.value)) {
      showError(emailInput, "Please enter a valid email address");
      isValid = false;
    }

    // Validate password
    if (!passwordInput.value) {
      showError(passwordInput, "Password is required");
      isValid = false;
    }

    if (isValid) {
      // For now, log success - we'll integrate localStorage/Appwrite later
      console.log("Login form submitted:", {
        email: emailInput.value,
        password: passwordInput.value,
      });

      // TODO: Redirect to main app after authentication
      // window.location.href = '../index.html';
      alert("Login successful! (Demo - no backend yet)");
    }
  });
}

/**
 * Initialize signup form validation and submission
 */
export function initSignupForm() {
  const form = getDocument(".auth-form", "query");
  if (!form) return;

  const emailInput = getDocument("email", "id");
  const passwordInput = getDocument("password", "id");
  const confirmPasswordInput = getDocument("confirm-password", "id");

  if (!emailInput || !passwordInput) return;

  // Validate email on blur
  emailInput.addEventListener("blur", () => {
    if (emailInput.value && !isValidEmail(emailInput.value)) {
      showError(emailInput, "Please enter a valid email address");
    } else {
      clearError(emailInput);
    }
  });

  // Validate password on blur
  passwordInput.addEventListener("blur", () => {
    if (passwordInput.value && !isValidPassword(passwordInput.value)) {
      showError(passwordInput, "Password must be at least 8 characters");
    } else {
      clearError(passwordInput);
    }
  });

  // Validate confirm password on blur
  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener("blur", () => {
      if (
        confirmPasswordInput.value &&
        !passwordsMatch(passwordInput.value, confirmPasswordInput.value)
      ) {
        showError(confirmPasswordInput, "Passwords do not match");
      } else {
        clearError(confirmPasswordInput);
      }
    });
  }

  // Clear errors on input
  emailInput.addEventListener("input", () => {
    if (isValidEmail(emailInput.value)) {
      clearError(emailInput);
    }
  });

  passwordInput.addEventListener("input", () => {
    if (isValidPassword(passwordInput.value)) {
      clearError(passwordInput);
    }
  });

  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener("input", () => {
      if (passwordsMatch(passwordInput.value, confirmPasswordInput.value)) {
        clearError(confirmPasswordInput);
      }
    });
  }

  // Form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let isValid = true;

    // Validate email
    if (!emailInput.value) {
      showError(emailInput, "Email is required");
      isValid = false;
    } else if (!isValidEmail(emailInput.value)) {
      showError(emailInput, "Please enter a valid email address");
      isValid = false;
    }

    // Validate password
    if (!passwordInput.value) {
      showError(passwordInput, "Password is required");
      isValid = false;
    } else if (!isValidPassword(passwordInput.value)) {
      showError(passwordInput, "Password must be at least 8 characters");
      isValid = false;
    }

    // Validate confirm password
    if (confirmPasswordInput) {
      if (!confirmPasswordInput.value) {
        showError(confirmPasswordInput, "Please confirm your password");
        isValid = false;
      } else if (
        !passwordsMatch(passwordInput.value, confirmPasswordInput.value)
      ) {
        showError(confirmPasswordInput, "Passwords do not match");
        isValid = false;
      }
    }

    if (isValid) {
      console.log("Signup form submitted:", {
        email: emailInput.value,
        password: passwordInput.value,
      });

      // TODO: Create user account with Appwrite
      alert("Account created successfully! (Demo - no backend yet)");
    }
  });
}

/**
 * Initialize forgot password form
 */
export function initForgotPasswordForm() {
  const form = getDocument(".auth-form", "query");
  if (!form) return;

  const emailInput = getDocument("email", "id");

  if (!emailInput) return;

  // Validate email on blur
  emailInput.addEventListener("blur", () => {
    if (emailInput.value && !isValidEmail(emailInput.value)) {
      showError(emailInput, "Please enter a valid email address");
    } else {
      clearError(emailInput);
    }
  });

  emailInput.addEventListener("input", () => {
    if (isValidEmail(emailInput.value)) {
      clearError(emailInput);
    }
  });

  // Form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let isValid = true;

    if (!emailInput.value) {
      showError(emailInput, "Email is required");
      isValid = false;
    } else if (!isValidEmail(emailInput.value)) {
      showError(emailInput, "Please enter a valid email address");
      isValid = false;
    }

    if (isValid) {
      console.log("Password reset requested for:", emailInput.value);

      // TODO: Send reset email with Appwrite
      alert("Password reset link sent! (Demo - no backend yet)");
    }
  });
}

/**
 * Initialize reset password form
 */
export function initResetPasswordForm() {
  const form = getDocument(".auth-form", "query");
  if (!form) return;

  const passwordInput = getDocument("password", "id");
  const confirmPasswordInput = getDocument("confirm-password", "id");

  if (!passwordInput || !confirmPasswordInput) return;

  // Validate password on blur
  passwordInput.addEventListener("blur", () => {
    if (passwordInput.value && !isValidPassword(passwordInput.value)) {
      showError(passwordInput, "Password must be at least 8 characters");
    } else {
      clearError(passwordInput);
    }
  });

  // Validate confirm password on blur
  confirmPasswordInput.addEventListener("blur", () => {
    if (
      confirmPasswordInput.value &&
      !passwordsMatch(passwordInput.value, confirmPasswordInput.value)
    ) {
      showError(confirmPasswordInput, "Passwords do not match");
    } else {
      clearError(confirmPasswordInput);
    }
  });

  // Clear errors on input
  passwordInput.addEventListener("input", () => {
    if (isValidPassword(passwordInput.value)) {
      clearError(passwordInput);
    }
  });

  confirmPasswordInput.addEventListener("input", () => {
    if (passwordsMatch(passwordInput.value, confirmPasswordInput.value)) {
      clearError(confirmPasswordInput);
    }
  });

  // Form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let isValid = true;

    if (!passwordInput.value) {
      showError(passwordInput, "Password is required");
      isValid = false;
    } else if (!isValidPassword(passwordInput.value)) {
      showError(passwordInput, "Password must be at least 8 characters");
      isValid = false;
    }

    if (!confirmPasswordInput.value) {
      showError(confirmPasswordInput, "Please confirm your password");
      isValid = false;
    } else if (
      !passwordsMatch(passwordInput.value, confirmPasswordInput.value)
    ) {
      showError(confirmPasswordInput, "Passwords do not match");
      isValid = false;
    }

    if (isValid) {
      console.log("Password reset completed");

      // TODO: Update password with Appwrite
      alert("Password reset successful! (Demo - no backend yet)");
    }
  });
}
