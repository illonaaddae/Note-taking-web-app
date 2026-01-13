# Git Workflow Documentation

## Branching Strategy

We use a three-branch strategy:

- **main**: Production-ready, stable code only.
- **dev**: Integration branch for merging features before release.
- **feature/\***: Individual feature branches for each enhancement (e.g., feature/note-sharing).

## Commit Conventions

- Use clear, descriptive commit messages.
- Minimum 3 commits per feature branch.
- Each commit represents a discrete unit of work (e.g., UI change, logic implementation, bug fix).
- Example: `feat: add share button to note card`, `fix: handle clipboard errors`, `docs: update workflow documentation`

## Merge Conflicts Encountered

- During merging, a conflict occurred in `scripts/ui.js` due to simultaneous changes in note card rendering.
- Conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) were resolved by keeping the latest share button logic and ensuring tag badges display correctly.
- After resolution, tested UI to confirm both features work as intended.

## Git Commands Used

- `git init`
- `git add .`
- `git commit -m "Initial commit"`
- `git checkout -b dev`
- `git checkout -b feature/note-sharing`
- `git status`
- `git push -u origin <branch>`
- `git pull origin dev`
- `git merge feature/note-sharing`
- `git branch -d feature/note-sharing`
- `git log --oneline --graph`

## Screenshots

- Commit history showing main, dev, and feature branches
- Branch structure visualized with `git log --oneline --graph`
- Example of resolved conflict in `scripts/ui.js`
- Example pull request for Note Sharing feature

---

## Feature Checklist (Note Sharing)

- [x] Created feature branch from dev
- [x] Made minimum 3 commits with clear messages
- [x] Pushed feature branch to remote
- [x] Created pull request to dev branch
- [x] Assigned PR to TA
- [x] Addressed TA feedback (if any)
- [x] TA approved and merged PR
- [x] Pulled updated dev branch
- [x] Deleted feature branch locally and remotely
