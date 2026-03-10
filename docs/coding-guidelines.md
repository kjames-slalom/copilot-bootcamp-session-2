# 🧩 Coding Style & Quality Principles — Summary

This document outlines the core coding style, formatting rules, and quality expectations for the project. All contributors should follow these guidelines to maintain a clean, consistent, and maintainable codebase.

---

## 1. General Formatting Rules
- Follow a **consistent, readable code style** across all files.
- Use **Prettier** for automatic formatting (single source of truth for whitespace, quotes, semicolons, etc.).
- Use **2-space indentation** (default).
- Keep lines reasonably short (≈ 80–100 characters).
- Prefer **descriptive names** for variables, functions, and files.
- Keep functions **small** and **single‑purpose**.

---

## 2. Import Organization
- Order imports in the following structure:
  1. **External libraries** (React, Express, etc.)
  2. **Internal modules**
  3. **Local files** (components, utilities)
  4. **Styles / assets**
- Avoid long relative paths using `../../../` — prefer **path aliases** where supported.
- Remove unused imports automatically via linter.

---

## 3. Linting & Static Analysis
- Use **ESLint** to enforce code standards and catch issues early.
- Prettier and ESLint should be integrated so they do not conflict.
- Linter runs automatically via:
  - Pre-commit hooks
  - CI pipeline
- All new code must pass linting before merging.

---

## 4. Code Quality Best Practices
### DRY Principle (Don’t Repeat Yourself)
- Reuse logic through utility functions, hooks, or shared modules.
- Avoid duplicating constants, types, or configuration.

### KISS Principle (Keep It Simple, Stupid)
- Prefer straightforward solutions over clever ones.
- Small, composable components > large multipurpose components.

### Single Responsibility Principle
- Each function, module, and component should have *one clear responsibility*.

### Fail Fast
- Validate inputs early.
- Handle errors predictably.
- Avoid silent failures.

### Consistent Error Handling
- Use centralized error utilities where possible.
- All async functions should use standardized try/catch patterns.

---

## 5. File & Folder Structure
- Keep files **small and focused**.
- Organize by feature when possible.
- Use consistent naming conventions:
  - Components: `PascalCase.jsx`
  - Hooks: `useThing.ts`
  - Utilities: `camelCase.js`
  - Tests: `*.test.js` or `*.spec.js`

---

## 6. Comments & Documentation
- Write comments only when the intent is not obvious from code.
- Use JSDoc/TSDoc for important utilities and shared functions.
