# Core UI Guidelines for TODO App 

## 1. Clean, Minimal Layout
- Use a simple single‑column layout for the task list.
- Provide generous spacing for readability.
- Avoid clutter; show only essential actions.

---

## 2. Use Material Design Components
- **Buttons:** Material Elevated/Filled buttons for primary actions (e.g., “Add Task”).
- **Text Fields:** Material text inputs for adding/editing tasks.
- **Checkboxes:** Material checkboxes for marking tasks complete.
- **Task List:** Use Material ListTiles or Cards for task items.

---

## 3. Simple Color Palette
- **Primary Color:** `#3F51B5` (calm blue)
- **Accent Color:** `#03A9F4` (light blue/teal)
- **Background:** `#FFFFFF`
- **Completed Tasks:** Grey text + strikethrough

---

## 4. Button Styles
- Primary button uses a solid fill and bold text.
- Secondary actions (Edit/Delete) use icon buttons or text buttons.
- Use consistent padding and rounded corners (Material default: 4–8dp).

---

## 5. Typography
- **Task Titles:** Medium weight, 16–18px
- **Secondary Text:** Regular 14px
- **Buttons:** Bold or uppercase for primary actions
- Keep all text clean and readable.

---

## 6. Accessibility Requirements
- Minimum color contrast ratio: **4.5:1**
- Touch targets: **44×44px** minimum
- All icon buttons must have accessible labels (e.g., “Delete Task”).
- Do not rely on color alone to convey meaning.
- Ensure proper semantic roles for screen readers.

---

## 7. Visual State Indicators
- Checkbox toggles for marking tasks complete.
- Completed tasks should appear:
  - Greyed out
  - Strikethrough text
  - Slightly reduced opacity (e.g., 60%)


