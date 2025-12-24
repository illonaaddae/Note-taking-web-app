/**
 * Appwrite Auth Service
 * Handles all authentication operations with Appwrite
 */

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  endpoint: "https://fra.cloud.appwrite.io/v1",
  projectId: "69430f2d001f367e2aca",
};

// ============================================
// INITIALIZE APPWRITE CLIENT
// ============================================

let client;
let account;

/**
 * Initialize the Appwrite client for authentication
 */
export function initAuth() {
  const { Client, Account } = window.Appwrite;

  client = new Client();
  client.setEndpoint(CONFIG.endpoint).setProject(CONFIG.projectId);

  account = new Account(client);

  console.log("Auth service initialized");
  return { client, account };
}

/**
 * Get initialized account instance
 */
export function getAccount() {
  if (!account) {
    initAuth();
  }
  return account;
}

// ============================================
// AUTHENTICATION OPERATIONS
// ============================================

/**
 * Create a new user account
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} name - User name (optional)
 * @returns {Promise<Object>} - User object
 */
export async function signUp(email, password, name = "") {
  try {
    const { ID } = window.Appwrite;
    const acc = getAccount();

    // Create the user account
    const user = await acc.create(
      ID.unique(),
      email,
      password,
      name || email.split("@")[0]
    );

    console.log("User created:", user);

    // Automatically log in after signup
    await login(email, password);

    return { success: true, user };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Log in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - Session object
 */
export async function login(email, password) {
  try {
    const acc = getAccount();

    // Create email session
    const session = await acc.createEmailPasswordSession(email, password);

    console.log("Login successful:", session);

    return { success: true, session };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Log in with Google OAuth
 * Uses OAuth2 Token flow (works on all browsers including iOS)
 * This avoids third-party cookie issues by passing tokens in URL
 */
export function loginWithGoogle() {
  try {
    const acc = getAccount();
    const { OAuthProvider } = window.Appwrite;

    // Get the base path of the app (handles subfolder deployments)
    const currentPath = window.location.pathname;
    const basePath = currentPath.substring(
      0,
      currentPath.lastIndexOf("/auth/")
    );

    // URLs for OAuth flow - tokens will be passed as URL parameters
    const successUrl = `${window.location.origin}${basePath}/index.html`;
    const failureUrl = `${window.location.origin}${basePath}/auth/login.html?error=oauth_failed`;

    console.log("OAuth success URL:", successUrl);
    console.log("OAuth failure URL:", failureUrl);

    // Use createOAuth2Token instead of createOAuth2Session
    // This returns userId and secret in URL, avoiding cookie issues
    acc.createOAuth2Token(OAuthProvider.Google, successUrl, failureUrl);
  } catch (error) {
    console.error("Google OAuth error:", error);
    throw error;
  }
}

/**
 * Create a session from OAuth token parameters
 * Call this after OAuth redirect to establish the session
 * @param {string} userId - User ID from OAuth callback
 * @param {string} secret - Secret token from OAuth callback
 * @returns {Promise<Object>} - Session result
 */
export async function createSessionFromToken(userId, secret) {
  try {
    const acc = getAccount();
    const session = await acc.createSession(userId, secret);
    console.log("Session created from OAuth token:", session);
    return { success: true, session };
  } catch (error) {
    console.error("Failed to create session from token:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Log out the current user
 * @returns {Promise<Object>} - Result object
 */
export async function logout() {
  try {
    const acc = getAccount();

    // Delete current session
    await acc.deleteSession("current");

    console.log("Logout successful");

    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Get current logged in user
 * @returns {Promise<Object|null>} - User object or null
 */
export async function getCurrentUser() {
  try {
    const acc = getAccount();
    const user = await acc.get();

    return { success: true, user };
  } catch (error) {
    // User is not logged in
    return { success: false, user: null };
  }
}

/**
 * Check if user is logged in
 * @returns {Promise<boolean>}
 */
export async function isLoggedIn() {
  const result = await getCurrentUser();
  return result.success && result.user !== null;
}

/**
 * Send password recovery email
 * @param {string} email - User email
 * @returns {Promise<Object>} - Result object
 */
export async function sendPasswordRecovery(email) {
  try {
    const acc = getAccount();

    // The URL where user will be redirected to reset password
    // This should be your reset-password page with userId and secret params
    const resetUrl = `${window.location.origin}/auth/reset-password.html`;

    await acc.createRecovery(email, resetUrl);

    console.log("Recovery email sent to:", email);

    return { success: true };
  } catch (error) {
    console.error("Recovery error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Complete password recovery (reset password)
 * @param {string} userId - User ID from URL params
 * @param {string} secret - Secret from URL params
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} - Result object
 */
export async function resetPassword(userId, secret, newPassword) {
  try {
    const acc = getAccount();

    await acc.updateRecovery(userId, secret, newPassword);

    console.log("Password reset successful");

    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Update user password (when logged in)
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} - Result object
 */
export async function updatePassword(oldPassword, newPassword) {
  try {
    const acc = getAccount();

    await acc.updatePassword(newPassword, oldPassword);

    console.log("Password updated successfully");

    return { success: true };
  } catch (error) {
    console.error("Update password error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get user-friendly error message from Appwrite error
 * @param {Error} error - Appwrite error object
 * @returns {string} - User-friendly error message
 */
function getErrorMessage(error) {
  const errorMessages = {
    user_already_exists: "An account with this email already exists.",
    user_invalid_credentials: "Invalid email or password.",
    user_not_found: "No account found with this email.",
    user_blocked: "This account has been blocked.",
    user_invalid_token: "Invalid or expired reset link.",
    password_recently_used: "Please choose a different password.",
    password_personal_data: "Password should not contain personal data.",
    general_argument_invalid: "Please check your input and try again.",
    user_unauthorized: "Please log in to continue.",
    user_session_already_exists: "You are already logged in.",
  };

  // Check if it's an Appwrite error with a type
  if (error.type && errorMessages[error.type]) {
    return errorMessages[error.type];
  }

  // Check error message content
  if (error.message) {
    if (error.message.includes("already exists")) {
      return "An account with this email already exists.";
    }
    if (error.message.includes("Invalid credentials")) {
      return "Invalid email or password.";
    }
    if (error.message.includes("Rate limit")) {
      return "Too many attempts. Please try again later.";
    }
  }

  return error.message || "An unexpected error occurred. Please try again.";
}

/**
 * Redirect to login if not authenticated
 */
export async function requireAuth() {
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    window.location.href = "/auth/login.html";
    return false;
  }

  return true;
}

/**
 * Redirect to dashboard if already authenticated
 */
export async function redirectIfLoggedIn() {
  const loggedIn = await isLoggedIn();

  if (loggedIn) {
    window.location.href = "/index.html";
    return true;
  }

  return false;
}

/**
 * Get URL parameters (for reset password)
 * @returns {Object} - Object with userId and secret
 */
export function getResetParams() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    userId: urlParams.get("userId"),
    secret: urlParams.get("secret"),
  };
}
