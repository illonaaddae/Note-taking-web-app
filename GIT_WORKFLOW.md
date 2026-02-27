# Git Workflow Documentation

## Branching Strategy

This project uses a **three-branch strategy**:

```
main        ← Production-ready code only. Never commit directly here.
│
dev         ← Integration branch. All feature PRs merge into dev first.
│
feature/*   ← One branch per feature, created from dev.
```

**Flow:**
1. Create a feature branch from `dev`: `git checkout -b feature/feature-name`
2. Implement the feature with at least 3 logical commits
3. Push the feature branch and open a Pull Request targeting `dev`
4. After TA review and approval, merge into `dev`
5. Once all features are stable on `dev`, merge `dev` into `main`

**Branch names used in this project:**
- `feature/export-import-notes`
- `feature/note-categories`
- `feature/rich-text-formatting`
- `feature/note-sharing`

---

## Commit Conventions

Commits follow the **Conventional Commits** standard:

```
<type>: <short description>
```

**Types used:**
| Type | When to use |
|------|-------------|
| `feat` | A new feature or user-facing change |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | CSS, formatting — no logic changes |
| `chore` | Maintenance tasks (gitignore, assets, config) |
| `refactor` | Code change that isn't a fix or new feature |

**Examples from this project:**
```
feat: add export/import UI buttons and icon assets to sidebar
feat: implement exportNotes and importNotes functions with duplicate prevention
feat: wire up export/import buttons in app initialization and update .gitignore
feat: add share button icon asset and CSS styles to note cards
feat: add shared.html read-only view for shared notes with error handling
fix: resolve merge conflict in README.md - keep clean original title
chore: clean up .gitignore to only include entries relevant to this vanilla JS project
```

**Rules:**
- Use imperative mood: "add" not "added" or "adds"
- Keep the description under 72 characters
- At least 3 commits per feature — each representing a logical unit of work

---

## Merge Conflicts Encountered

### Conflict in `README.md` — Feature/Conflict-Demo-2 vs Dev

**What happened:**

While working on documentation updates, two branches modified the same line in `README.md` (the `<h1>` title) independently:

- `dev` changed it to: `# Note-Taking Web App | Full-Featured Notes App`
- `feature/conflict-demo-2` changed it to: `# Note-Taking Web App | Shared Features Branch`

When merging `feature/conflict-demo-2` into `dev`, Git could not automatically decide which version to keep and flagged a conflict.

**What the conflict looked like:**

```
<<<<<<< HEAD
# Note-Taking Web App | Full-Featured Notes App
=======
# Note-Taking Web App | Shared Features Branch
>>>>>>> feature/conflict-demo-2
```

**How I resolved it:**

I opened the file, removed the conflict markers, and kept the original clean title that was more appropriate for the main README:

```markdown
# Note-Taking Web App
```

**Commands used:**

```bash
# After the failed auto-merge
git status                          # See which files have conflicts
# (Manually edit README.md to remove conflict markers)
git add README.md                   # Stage the resolved file
git commit -m "fix: resolve merge conflict in README.md - keep clean original title"
```

**Lesson learned:** Conflicts happen when two branches edit the same lines. The key is to read both versions carefully, understand the intent of each, and keep whichever is most correct — or combine both if needed.

---

## Git Commands Used

```bash
# Setup
git init                            # Initialize a new repository
git config user.name "Your Name"    # Set your identity
git config user.email "you@example.com"
git remote add origin <url>         # Connect to remote repo

# Branching
git checkout -b feature/name        # Create and switch to new branch
git checkout dev                    # Switch to an existing branch
git branch -a                       # List all branches (local + remote)
git branch -d feature/name          # Delete a branch locally

# Committing
git status                          # See what changed
git add <file>                      # Stage a specific file
git add .                           # Stage all changes
git commit -m "type: description"   # Commit with message
git log --oneline --all --graph     # Visual history of all branches

# Syncing with remote
git push -u origin feature/name     # Push branch and set upstream
git push --force-with-lease         # Safe force-push (rewrites history)
git pull origin dev                 # Pull latest changes from dev

# Merging & conflicts
git merge feature/name              # Merge a branch into current
git merge --abort                   # Cancel a failed merge
git diff                            # See unstaged changes

# Fixing history
git reset HEAD~1                    # Undo last commit, keep changes staged
git commit --amend -m "new msg"     # Fix/rename last commit message
git rebase -i HEAD~3                # Interactively reorder/edit last 3 commits
```

---

## Screenshots

### Git Log — Commit History
*Run this to see the full history across all branches:*
```bash
git log --oneline --all --graph
```

### Branch Structure
```
* main   — Production-ready builds
|
* dev    — Integration: all features merge here first
|
├── feature/export-import-notes   (merged)
├── feature/note-categories        (merged)
├── feature/rich-text-formatting   (merged)
└── feature/note-sharing           (merged)
```

### Example Resolved Conflict
See the **Merge Conflicts Encountered** section above for the full before/after.

### Example Pull Request
Each PR was submitted to `dev` with:
- A descriptive title following `feat: <feature name>` convention
- A description listing changes, files modified, and new functionality
- Testing notes explaining how to verify the feature works
- The `feature` label applied
- TA assigned as reviewer
