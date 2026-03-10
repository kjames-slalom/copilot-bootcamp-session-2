# Testing Guidelines

## 1. Unit Tests
- Use **Jest** to test individual functions and React components in isolation.
- Unit tests must follow the naming convention:  
  **`*.test.js` or `*.test.ts`**
- **Backend unit tests** must be placed in:  
  `packages/backend/__tests__/`
- **Frontend unit tests** must be placed in:  
  `packages/frontend/src/__tests__/`
- Name unit test files based on what they test  
  _Example_: `app.test.js` tests `app.js`

---

## 2. Integration Tests
- Use **Jest + Supertest** to test backend API endpoints with real HTTP requests.
- Integration tests must live in:  
  `packages/backend/__tests__/integration/`
- Follow the same naming convention:  
  **`*.test.js` or `*.test.ts`**
- Name integration test files according to the feature or API  
  _Example_: `todos-api.test.js` for TODO API endpoints

---

## 3. End-to-End (E2E) Tests
- Use **Playwright** (required framework) to test full UI workflows via browser automation.
- E2E tests must be placed in:  
  `tests/e2e/`
- Naming convention:  
  **`*.spec.js` or `*.spec.ts`**
- Name files based on the user journey  
  _Example_: `todo-workflow.spec.js`
- **Playwright tests must use one browser only.**
- **Use the Page Object Model (POM)** pattern for maintainability.
- Limit E2E tests to **5–8 critical user journeys** (happy paths + key edge cases).
- Avoid exhaustive UI coverage — keep tests fast and reliable.

---

## 4. Test Isolation & Data Management
- All tests must be **isolated and independent**.
- Each test must set up its **own data** and **not depend on any other test**.
- Use setup and teardown hooks (`beforeEach`, `afterEach`, etc.) to ensure tests:
  - Run cleanly  
  - Work on repeated runs  
  - Don’t leak state between tests

---

## 5. Port Configuration
- All services must use **environment variables** for ports, with fallback defaults:
  - **Backend:**  
    ```js
    const PORT = process.env.PORT || 3030;
    ```
  - **Frontend:** Uses React default `3000` unless overridden with `PORT`
- This allows CI/CD pipelines to correctly detect and manage port assignments.

---

## 6. Test Coverage Requirements
- Every new feature must include **appropriate tests**:
  - Unit tests (required)
  - Integration or E2E as needed based on feature scope
