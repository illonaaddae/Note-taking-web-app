
 // Simple DOM helper
  function getDocument(selectorName, type) {
    switch (type) {
      case "id":
        return document.getElementById(selectorName);
      case "class":
        return document.getElementsByClassName(selectorName);
      case "tag":
        return document.getElementsByTagName(selectorName);
      default:
        return null;
    }
  }


/**
 * Auth Module
 * Handles authentication-related UI interactions
 */


// ==============================
// Password Visibility Toggle
// ==============================

/**
 * Initialize password toggle functionality : Password Visibility toggle
 */
function initPasswordToggle() {
  const toggle = getDocument("password-toggle", "id");
  const input = getDocument("password", "id");

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

// ==============================
// Form Validation
// ==============================

/**
 * Show error message for a form field
 * @param {HTMLElement} input - The input element
 * @param {string} message - Error message to display
 */
function showError(input, message) {
  const formGroup = input.closest(".form-group");
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
function clearError(input) {
  const formGroup = input.closest(".form-group");
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
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Initialize form validation for login form
 */
function initLoginForm() {
  const form = document.querySelector(".auth-form");
  if (!form) return;

  const emailInput = form.querySelector("#email");
  const passwordInput = form.querySelector("#password");

  // Validate on blur
  emailInput?.addEventListener("blur", () => {
    if (emailInput.value && !isValidEmail(emailInput.value)) {
      showError(emailInput, "Please enter a valid email address");
    } else {
      clearError(emailInput);
    }
  });

  // Clear error on input
  emailInput?.addEventListener("input", () => {
    if (isValidEmail(emailInput.value)) {
      clearError(emailInput);
    }
  });

  passwordInput?.addEventListener("input", () => {
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
      // For now, just log success - we'll integrate localStorage/Appwrite later
      console.log("Form submitted:", {
        email: emailInput.value,
        password: passwordInput.value,
      });

      // Redirect to main app (we'll create this later)
      // window.location.href = '../index.html';
      alert("Login successful! (Demo - no backend yet)");
    }
  });
}

// ==============================
// Initialize on DOM Ready
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  initPasswordToggle();
  initLoginForm();
});
