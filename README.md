# Student Registration and Management (React)

Register students, view them in a table, search and filter, edit and delete. Data is saved in the browser (localStorage), so it survives a refresh.

## Features
- Registration form with validation (name, unique email, 10-digit phone, course, year, address length)
- Errors show after a field is touched or on submit
- Search by name, email or phone, plus a course filter
- Edit (form switches to "Save changes") and delete with a confirmation dialog
- Responsive: table on desktop, stacked cards on phones

## Structure
- `src/App.jsx`: state (students, editing, search, delete target) and handlers
- `src/components/`: `StudentForm`, `StudentTable`, `SearchBar`, `ConfirmDialog` (data flows down as props, actions flow up as callbacks)
- `src/utils/`: `validate.js`, `useLocalStorage.js` (custom hook), `constants.js`

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```
Requires Node 18+. The app starts with 3 sample students; delete them or clear localStorage to start empty.
