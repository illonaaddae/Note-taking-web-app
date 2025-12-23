/**
 * Form Handlers Module
 * Handles form submissions for all auth pages with Appwrite integration
 */

import { getDocument } from "../utils.js";
import {
  showError,
  clearError,
  isValidEmail,
  isValidPassword,
  passwordsMatch,
} from "./validation.js";
import * as authService from "./authService.js";

// ============================================
// UI HELPERS
// ============================================

/**
 * Show loading state on button
 */
function setButtonLoading(button, loadingText = "Please wait...") {
  button.disabled = true;
  button.dataset.originalText = button.textContent;
  button.textContent = loadingText;
  button.classList.add("loading");
}

/**
 * Reset button to normal state
 */
function resetButton(button) {
  button.disabled = false;
  button.textContent = button.dataset.originalText || "Submit";
  button.classList.remove("loading");
}

/**
 * Show success message
 */
function showSuccessMessage(form, message) {
  const existing = form.querySelector(".form-success-message");
  if (existing) existing.remove();

  const successEl = document.createElement("div");
  successEl.className = "form-success-message";
  successEl.textContent = message;
  form.insertBefore(successEl, form.firstChild);
}

/**
 * Show form-level error message
 */
function showFormError(form, message) {
  const existing = form.querySelector(".form-error-banner");
  if (existing) existing.remove();

  const errorEl = document.createElement("div");
  errorEl.className = "form-error-banner";
  errorEl.textContent = message;
  form.insertBefore(errorEl, form.firstChild);

  setTimeout(() => errorEl.remove(), 5000);
}

function initGoogleOAuth() {
  const googleBtn = document.querySelector(".btn-google");
  if (googleBtn) {
    googleBtn.addEventListener("click", () => {
      authService.loginWithGoogle();
    });
  }
}

// ============================================
// LOGIN FORM
// ============================================

export function initLoginForm() {
  const form = getDocument(".auth-form", "query");
  if (!form) return;

  const emailInput = getDocument("email", "id");
  const passwordInput = getDocument("password", "id");
  const submitBtn = form.querySelector('button[type="submit"]');

  if (!emailInput || !passwordInput) return;

  authService.initAuth();
  authService.redirectIfLoggedIn();

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

  passwordInput.addEventListener("input", () => {
    clearError(passwordInput);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let isValid = true;

    if (!emailInput.value) {
      showError(emailInput, "Email is required");
      isValid = false;
    } else if (!isValidEmail(emailInput.value)) {
      showError(emailInput, "Please enter a valid email address");
      isValid = false;
    }

    if (!passwordInput.value) {
      showError(passwordInput, "Password is required");
      isValid = false;
    }

    if (isValid) {
      setButtonLoading(submitBtn, "Logging in...");

      const result = await authService.login(
        emailInput.value,
        passwordInput.value
      );

      if (result.success) {
        showSuccessMessage(form, "Login successful! Redirecting...");
        setTimeout(() => {
          window.location.href = "../index.html";
        }, 1000);
      } else {
        resetButton(submitBtn);
        showFormError(form, result.error);
      }
    }
  });

  // Google OAuth button
  initGoogleOAuth();

  // Check for OAuth error in URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("error") === "oauth_failed") {
    showFormError(form, "Google sign-in failed. Please try again.");
  }
}

// ============================================
// SIGNUP FORM
// ============================================

export function initSignupForm() {
  const form = getDocument(".auth-form", "query");
  if (!form) return;

  const emailInput = getDocument("email", "id");
  const passwordInput = getDocument("password", "id");
  const confirmPasswordInput = getDocument("confirm-password", "id");
  const submitBtn = form.querySelector('button[type="submit"]');

  if (!emailInput || !passwordInput) return;

  authService.initAuth();
  authService.redirectIfLoggedIn();

  // Google OAuth button
  initGoogleOAuth();

  emailInput.addEventListener("blur", () => {
    if (emailInput.value && !isValidEmail(emailInput.value)) {
      showError(emailInput, "Please enter a valid email address");
    } else {
      clearError(emailInput);
    }
  });

  passwordInput.addEventListener("blur", () => {
    if (passwordInput.value && !isValidPassword(passwordInput.value)) {
      showError(passwordInput, "Password must be at least 8 characters");
    } else {
      clearError(passwordInput);
    }
  });

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

  emailInput.addEventListener("input", () => {
    if (isValidEmail(emailInput.value)) clearError(emailInput);
  });

  passwordInput.addEventListener("input", () => {
    if (isValidPassword(passwordInput.value)) clearError(passwordInput);
  });

  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener("input", () => {
      if (passwordsMatch(passwordInput.value, confirmPasswordInput.value)) {
        clearError(confirmPasswordInput);
      }
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let isValid = true;

    if (!emailInput.value) {
      showError(emailInput, "Email is required");
      isValid = false;
    } else if (!isValidEmail(emailInput.value)) {
      showError(emailInput, "Please enter a valid email address");
      isValid = false;
    }

    if (!passwordInput.value) {
      showError(passwordInput, "Password is required");
      isValid = false;
    } else if (!isValidPassword(passwordInput.value)) {
      showError(passwordInput, "Password must be at least 8 characters");
      isValid = false;
    }

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
      setButtonLoading(submitBtn, "Creating account...");

      const result = await authService.signUp(
        emailInput.value,
        passwordInput.value
      );

      if (result.success) {
        showSuccessMessage(form, "Account created! Redirecting...");
        setTimeout(() => {
          window.location.href = "../index.html";
        }, 1000);
      } else {
        resetButton(submitBtn);
        showFormError(form, result.error);
      }
    }
  });
}

// ============================================
// FORGOT PASSWORD FORM
// ============================================

export function initForgotPasswordForm() {
  const form = getDocument(".auth-form", "query");
  if (!form) return;

  const emailInput = getDocument("email", "id");
  const submitBtn = form.querySelector('button[type="submit"]');

  if (!emailInput) return;

  authService.initAuth();

  emailInput.addEventListener("blur", () => {
    if (emailInput.value && !isValidEmail(emailInput.value)) {
      showError(emailInput, "Please enter a valid email address");
    } else {
      clearError(emailInput);
    }
  });

  emailInput.addEventListener("input", () => {
    if (isValidEmail(emailInput.value)) clearError(emailInput);
  });

  form.addEventListener("submit", async (e) => {
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
      setButtonLoading(submitBtn, "Sending...");

      const result = await authService.sendPasswordRecovery(emailInput.value);

      resetButton(submitBtn);
      showSuccessMessage(
        form,
        "If an account exists with this email, you will receive a password reset link shortly."
      );
      emailInput.value = "";
    }
  });
}

// ============================================
// RESET PASSWORD FORM
// ============================================

export function initResetPasswordForm() {
  const form = getDocument(".auth-form", "query");
  if (!form) return;

  const passwordInput = getDocument("password", "id");
  const confirmPasswordInput = getDocument("confirm-password", "id");
  const submitBtn = form.querySelector('button[type="submit"]');

  if (!passwordInput || !confirmPasswordInput) return;

  authService.initAuth();

  const { userId, secret } = authService.getResetParams();

  if (!userId || !secret) {
    showFormError(
      form,
      "Invalid or expired reset link. Please request a new one."
    );
    if (submitBtn) submitBtn.disabled = true;
    return;
  }

  passwordInput.addEventListener("blur", () => {
    if (passwordInput.value && !isValidPassword(passwordInput.value)) {
      showError(passwordInput, "Password must be at least 8 characters");
    } else {
      clearError(passwordInput);
    }
  });

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

  passwordInput.addEventListener("input", () => {
    if (isValidPassword(passwordInput.value)) clearError(passwordInput);
  });

  confirmPasswordInput.addEventListener("input", () => {
    if (passwordsMatch(passwordInput.value, confirmPasswordInput.value)) {
      clearError(confirmPasswordInput);
    }
  });

  form.addEventListener("submit", async (e) => {
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
      setButtonLoading(submitBtn, "Resetting password...");

      const result = await authService.resetPassword(
        userId,
        secret,
        passwordInput.value
      );

      if (result.success) {
        showSuccessMessage(
          form,
          "Password reset successful! Redirecting to login..."
        );
        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      } else {
        resetButton(submitBtn);
        showFormError(form, result.error);
      }
    }
  });
}
