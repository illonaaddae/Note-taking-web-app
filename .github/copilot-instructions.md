# Copilot Instructions for Note-Taking Web App

## Architecture Overview

This is a **vanilla JavaScript SPA** (no build tools) for note management with **Appwrite** cloud backend. The app follows a modular ES6 architecture with clear separation of concerns.

### Module Structure
```
scripts/
├── main.js          # Entry point, orchestrates all modules, manages notesCache
├── appwrite.js      # Appwrite SDK wrapper, CRUD operations, CONFIG object
├── noteManager.js   # Pure functions for note data manipulation
├── ui.js            # DOM rendering, tracks currentNoteId state
├── storage.js       # localStorage for preferences, sessionStorage for drafts
├── utils.js         # getDocument() helper for DOM queries
└── auth/            # Auth pages: formHandlers, validation, passwordToggle
```

### Data Flow
1. **main.js** initializes Appwrite → fetches notes → stores in `notesCache` array
2. User actions trigger handlers in main.js → call **appwrite.js** for persistence
3. After Appwrite success, update `notesCache` → call **ui.js** to re-render

## Key Patterns & Conventions

### DOM Selection Helper
Use `getDocument()` from `utils.js` instead of raw DOM APIs:
```javascript
import { getDocument } from "../utils.js";
getDocument("element-id", "id");      // getElementById
getDocument(".selector", "query");    // querySelector
getDocument(".selector", "queryAll"); // querySelectorAll
```

### Note Object Schema
```javascript
{
  id: string,           // Appwrite $id
  title: string,
  content: string,
  tags: string[],       // e.g., ["Dev", "React"]
  archived: boolean,
  createdAt: string,    // ISO 8601
  updatedAt: string
}
```

### Appwrite Configuration
Located in [scripts/appwrite.js](scripts/appwrite.js) `CONFIG` object. SDK loaded via CDN in HTML, accessed via `window.Appwrite`.

### CSS Architecture
- **Design tokens** in [styles/tokens.css](styles/tokens.css) — use CSS variables for all values
- 4px spacing scale: `--space-1` through `--space-16`
- Dark theme via `[data-theme="dark"]` attribute on root element
- Semantic color tokens: `--bg-primary`, `--text-primary`, `--brand-primary`, etc.

### Form Validation Pattern (Auth)
```javascript
// In auth/formHandlers.js
import { showError, clearError, isValidEmail } from "./validation.js";
// Validate on blur, clear on input, full validation on submit
emailInput.addEventListener("blur", () => {
  if (!isValidEmail(emailInput.value)) showError(emailInput, "Invalid email");
});
```

## Development Workflow

### Running Locally
Use any static server (Live Server extension, `npx serve`, etc.) — no build step required.

**Important**: Add `localhost` and `127.0.0.1` as Web platforms in Appwrite Console → Settings → Platforms.

### File Organization Rules
- All JavaScript uses **ES6 modules** with explicit exports/imports
- HTML files load modules with `type="module"` script tags
- Auth pages (`auth/*.html`) use `scripts/auth/index.js` as entry point
- Main dashboard (`index.html`) uses `scripts/main.js` as entry point

### CSS Guidelines
- Always use token variables, never hardcoded values
- Theme changes: toggle `data-theme="dark"` attribute
- Font families available: `--font-sans` (Inter), `--font-serif` (Noto Serif), `--font-mono` (Source Code Pro)

## Integration Points

### Appwrite Database
- Database ID: `notesdb`
- Collection ID: `notes`
- All CRUD operations in `appwrite.js` with error handling and console logging

### Local Storage Keys
- `notes_app_preferences` — theme, font settings
- `notes_app_notes` — legacy local storage (now uses Appwrite)
- Session storage `notes_app_draft` — unsaved draft recovery

## Sample Data
Reference [data.json](data.json) for note structure and seed data with tags like "Dev", "React", "Personal", "Cooking".
