# Student Management REST API

Node.js + Express + MySQL backend with create / read / update / delete, search, pagination, validation and a database health check.

## Setup
1. Install Node 18+ and MySQL 8 (MariaDB also works). Make sure MySQL is running.
2. Install dependencies and configure the database login:
   ```bash
   npm install
   cp .env.example .env      # then put your MySQL password in .env
   ```
3. Create the database and table (either way):
   ```bash
   npm run db:init                       # uses sql/schema.sql, no mysql CLI needed
   # or: mysql -u root -p < sql/schema.sql
   ```
4. Start the server:
   ```bash
   npm start                 # prints "MySQL connected." then "API running at http://localhost:3000"
   ```

## Endpoints
| Method | URL | Purpose |
|---|---|---|
| GET | `/health` | Verifies the database connection |
| POST | `/api/students` | Register a student (201) |
| GET | `/api/students?search=&course=&page=1&limit=10` | List with search and pagination |
| GET | `/api/students/:id` | Get one student |
| PUT | `/api/students/:id` | Update a student |
| DELETE | `/api/students/:id` | Delete a student |

Body for POST/PUT:
```json
{ "name": "Asha Rao", "email": "asha@example.com", "phone": "9876543210", "course": "Computer Science", "year": 2, "address": "12 Lake Road" }
```
Rules: name 2-100 letters, valid unique email, phone exactly 10 digits, course required, year 1-4. Errors: `400` validation (with `details`), `404` not found, `409` duplicate email, `503` database down.

## Test with Postman
1. Postman > **Import** > choose `postman/student-api.postman_collection.json`.
2. Start the server, then run the requests in order, or use **Run collection**. Each request has a built-in test, and the collection saves the new student's id automatically.
3. First check **Health check**: `{"status":"ok","database":"connected"}` confirms the MySQL connection.

## Automated tests
`npm test` runs 6 integration tests against a real MySQL server using a separate `student_db_test` database (your data is untouched).

## Structure
```
src/server.js          start-up + DB connectivity check
src/app.js             Express app, health route, error handling
src/db.js              MySQL connection pool
src/routes/students.js CRUD routes (parameterised queries, so SQL injection safe)
src/validate.js        input validation
sql/schema.sql         database + table
postman/               Postman collection
test/api.test.js       integration tests
```
