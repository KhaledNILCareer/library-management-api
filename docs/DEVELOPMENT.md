# Development Guide

This document defines the shared development conventions for the Library Management API.

The project specification remains the authoritative source for project requirements. This document defines the technical and collaboration decisions used by the team while implementing those requirements.

---

## 1. Tech Stack

- Node.js
- Express.js
- JavaScript
- ES Modules
- MongoDB
- Mongoose
- JWT for authentication
- bcrypt for password hashing

Use ES Modules consistently:

```js
import express from "express";
export default router;
```

Do not mix ES Modules with CommonJS (`require`, `module.exports`).

---

## 2. Project Structure

The project uses a simple feature-based architecture.

```text
src/
├── config/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── authors/
│   ├── books/
│   ├── borrows/
│   └── ai/
├── middlewares/
├── utils/
├── app.js
└── server.js
```

Each module should contain only the files it actually needs, such as:

```text
book.model.js
book.controller.js
book.routes.js
book.service.js
```

A service layer is not required for every module. Add one only when it helps organize meaningful business logic.

Avoid unnecessary architecture layers such as repositories, DTOs, or dependency injection.

---

## 3. Data Models

Use the following field names consistently.

### User

```js
{
  name,
  email,
  password,
  role
}
```

Roles:

```text
admin
librarian
member
```

Passwords must be stored as hashes and must never be returned in API responses.

### Author

```js
{
  name,
  biography
}
```

### Book

```js
{
  title,
  description,
  ISBN,
  author,
  category,
  totalCopies,
  availableCopies
}
```

Relationship:

```text
Book.author → Author._id
```

Use a Mongoose ObjectId reference for `author`.

### Borrow

```js
{
  book,
  user,
  borrowDate,
  dueDate,
  returnDate,
  status
}
```

Relationships:

```text
Borrow.book → Book._id
Borrow.user → User._id
```

Borrow statuses:

```text
Borrowed
Returned
Overdue
```

Do not introduce alternative field names such as `authorId`, `bookId`, `userId`, or `available` for these stored model fields.

---

## 4. Required API Routes

Use the API paths defined by the project specification.

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Books

```text
POST   /api/books
GET    /api/books
GET    /api/books/:id
PATCH  /api/books/:id
DELETE /api/books/:id
```

### Authors

```text
POST   /api/authors
GET    /api/authors
GET    /api/authors/:id
PATCH  /api/authors/:id
DELETE /api/authors/:id
```

### Borrowing

```text
POST /api/books/:id/borrow
POST /api/borrows/:id/return
GET  /api/borrows/my
GET  /api/borrows
GET  /api/borrows/:id
```

### AI

```text
POST /api/ai/summarize-book
```

Do not change required endpoint paths without team agreement and verification against the project specification.

---

## 5. Authentication

Protected endpoints use JWT authentication.

Send the token using:

```http
Authorization: Bearer <token>
```

The shared JWT payload should contain:

```js
{
  id,
  role
}
```

JWT expiration is configured using:

```text
JWT_EXPIRES_IN
```

Authentication answers:

> Who is making the request?

Authorization answers:

> Is this user allowed to perform this operation?

---

## 6. Authorization

Project roles:

- Admin
- Librarian
- Member

General responsibilities from the project specification:

### Admin

- Manage users
- Manage books and authors
- View borrowing records

### Librarian

- Manage books and authors
- Manage book borrowing and returning

### Member

- View books
- Borrow and return books
- View personal borrowing history

Authorization must be enforced server-side.

---

## 7. API Response Convention

The project specification does not define a required JSON response format. The team uses the following simple convention.

Successful operation with data:

```json
{
  "message": "Book created successfully",
  "data": {}
}
```

Data retrieval may use:

```json
{
  "data": {}
}
```

Errors:

```json
{
  "message": "Book not found"
}
```

Keep responses simple and consistent.

---

## 8. HTTP Status Convention

Use these conventions unless a specific endpoint requires otherwise:

```text
200 OK
Successful read, update, or action

201 Created
Resource successfully created

400 Bad Request
Invalid or missing input

401 Unauthorized
Missing, invalid, or expired authentication

403 Forbidden
Authenticated user does not have permission

404 Not Found
Requested resource does not exist

409 Conflict
Request conflicts with the current resource state

500 Internal Server Error
Unexpected server error
```

Examples of conflicts include:

- Duplicate email
- Duplicate ISBN
- No available book copies
- Duplicate active borrowing

---

## 9. Error Handling

Use the shared error-handling middleware.

```text
request
↓
route/controller
↓
error
↓
error middleware
↓
consistent API response
```

Unmatched routes are handled by the shared 404 middleware.

Do not introduce a complex custom error framework unless the project develops a clear need for one.

---

## 10. Required Business Rules

Implementation must handle the business rules and edge cases defined by the project specification, including:

- Duplicate email registration
- Incorrect login credentials
- Missing, invalid, or expired JWT
- Accessing protected endpoints without authentication
- Book not found
- Author not found
- Duplicate ISBN
- No available book copies
- Duplicate active borrowing
- Returning an already returned borrowing
- Returning another user's borrowing
- Invalid Book, Author, or Borrow IDs
- Negative or invalid copy counts
- `availableCopies > totalCopies`
- Missing required book information
- Invalid borrowing dates
- Deleting a book that is actively borrowed
- Deleting an author linked to existing books

Happy-path behavior alone is not enough to complete a ticket.

---

## 11. Environment Variables

Local secrets belong in `.env`.

The repository contains only `.env.example`.

Expected variables:

```env
PORT=3000
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=
```

Never commit:

- `.env`
- MongoDB credentials
- JWT secrets
- Gemini API keys

---

## 12. Shared Files

The following files are integration-sensitive:

```text
src/app.js
src/server.js
src/config/*
src/middlewares/*
package.json
package-lock.json
.env.example
```

Developers may modify them when necessary, but changes must be relevant to the feature and clearly reviewed in the Pull Request.

Do not add dependencies without a concrete project need.

---

## 13. Git Workflow

Use:

```text
Jira Ticket
↓
Feature Branch
↓
Implementation
↓
Local Testing
↓
Commit
↓
Push
↓
Pull Request
↓
Review
↓
Merge into main
```

Do not push feature work directly to `main`.

Branch examples:

```text
feature/SCRUM-21-user-registration
feature/SCRUM-28-create-book
feature/SCRUM-37-borrow-book
```

Use simple Conventional Commits:

```text
feat(auth): implement user registration
fix(books): prevent duplicate ISBN
docs(api): document borrowing endpoints
test(auth): add login tests
```

Keep Pull Requests small enough to review effectively.

---

## 14. Definition of Done

A Jira ticket is not Done only because its happy path works.

Before considering a ticket Done:

- Required behavior is implemented.
- Relevant validation is handled.
- Authorization is correct where applicable.
- Required edge cases are handled.
- Code follows the shared project structure and conventions.
- No secrets are committed.
- The endpoint is tested locally.
- Integration impact is checked.
- API documentation is updated when necessary.
- A Pull Request is reviewed and merged into `main`.

---

## 15. Decisions Deferred Until Implementation

Some behavior is required by the specification but its implementation details are not explicitly defined.

These decisions should be made when implementing the relevant feature rather than introducing unnecessary complexity early.

### Borrowing Overdue Status

The system must support `Overdue`, but the mechanism used to update or calculate overdue status will be decided during borrowing implementation.

### Logout

A logout endpoint is required, but the specification does not require a particular token invalidation or blacklist mechanism.

### Librarian Borrowing Workflow

Librarians must be able to manage borrowing and returning. Exact behavior for acting on behalf of members should be confirmed during borrowing implementation.