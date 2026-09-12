# Library Management API

A backend RESTful API for managing a library system, including users, books, authors, and borrowing operations. The project also integrates the Gemini API to generate short summaries for books.

## Features

### Authentication & Users

* User registration and login
* JWT-based authentication
* Password hashing
* Get current authenticated user
* Logout
* Role-based authorization
* Admin user management
* Roles: `admin`, `librarian`, `member`

### Authors

* Create authors
* View all authors
* View an author by ID
* Update authors
* Delete authors
* Prevent deletion of authors linked to books

### Books

* Create books
* View all books
* View a book by ID
* Update books
* Delete books
* Search, filtering, and pagination
* ISBN validation and duplicate prevention
* Book copy availability tracking
* Prevent deletion of books with active borrowed copies

### Borrowing

* Borrow books
* Return books
* View personal borrowing history
* View all borrowing records
* View a borrowing record by ID
* 14-day loan period
* Borrowing statuses:

  * `Borrowed`
  * `Returned`
  * `Overdue`
* Duplicate active borrowing prevention
* Automatic book availability updates
* MongoDB transactions for borrow and return operations

### Gemini AI

* Generate a short summary from a book title and description
* Input validation
* Gemini API error handling
* API key stored securely using environment variables

### API Documentation

Interactive Swagger/OpenAPI documentation is available at:

```text
http://localhost:3000/api-docs
```

## Technologies Used

* Node.js
* Express.js
* JavaScript (ES Modules)
* MongoDB
* Mongoose
* JWT
* bcryptjs
* dotenv
* Google Gemini API
* Swagger / OpenAPI
* Postman
* Nodemon

## Project Structure

```text
src/
├── config/
├── middlewares/
├── modules/
│   ├── ai/
│   ├── auth/
│   ├── authors/
│   ├── books/
│   ├── borrows/
│   └── users/
├── utils/
├── app.js
└── server.js

docs/
└── openapi/

postman/
└── Library-Management-API.postman_collection.json
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/KhaledNILCareer/library-management-api.git
cd library-management-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root.

Example:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

Do not commit the `.env` file or any secrets to GitHub.

### 4. Run the project

Development mode:

```bash
npm run dev
```

Production/start mode:

```bash
npm start
```

By default, the API is available at:

```text
http://localhost:3000
```

## Main API Endpoints

### Authentication

| Method | Endpoint             | Description      |
| ------ | -------------------- | ---------------- |
| POST   | `/api/auth/register` | Register a user  |
| POST   | `/api/auth/login`    | Login            |
| POST   | `/api/auth/logout`   | Logout           |
| GET    | `/api/auth/me`       | Get current user |

### Users

| Method | Endpoint              | Description      |
| ------ | --------------------- | ---------------- |
| GET    | `/api/users`          | Get all users    |
| PATCH  | `/api/users/:id/role` | Update user role |
| DELETE | `/api/users/:id`      | Delete user      |

User management endpoints are restricted to Admin users.

### Authors

| Method | Endpoint           | Description   |
| ------ | ------------------ | ------------- |
| POST   | `/api/authors`     | Create author |
| GET    | `/api/authors`     | Get authors   |
| GET    | `/api/authors/:id` | Get author    |
| PATCH  | `/api/authors/:id` | Update author |
| DELETE | `/api/authors/:id` | Delete author |

### Books

| Method | Endpoint                | Description |
| ------ | ----------------------- | ----------- |
| POST   | `/api/books`            | Create book |
| GET    | `/api/books`            | Get books   |
| GET    | `/api/books/:id`        | Get book    |
| PATCH  | `/api/books/:id`        | Update book |
| DELETE | `/api/books/:id`        | Delete book |
| POST   | `/api/books/:id/borrow` | Borrow book |

### Borrowing

| Method | Endpoint                  | Description                            |
| ------ | ------------------------- | -------------------------------------- |
| POST   | `/api/borrows/:id/return` | Return book                            |
| GET    | `/api/borrows/my`         | Get current member's borrowing history |
| GET    | `/api/borrows`            | Get all borrowing records              |
| GET    | `/api/borrows/:id`        | Get borrowing record                   |

### AI

| Method | Endpoint                 | Description                          |
| ------ | ------------------------ | ------------------------------------ |
| POST   | `/api/ai/summarize-book` | Generate a book summary using Gemini |

## Authorization

The API uses role-based authorization:

| Operation                  | Admin | Librarian | Member |
| -------------------------- | :---: | :-------: | :----: |
| Manage Users               |   ✓   |     —     |    —   |
| Manage Books               |   ✓   |     ✓     |    —   |
| View Books                 |   ✓   |     ✓     |    ✓   |
| Manage Authors             |   ✓   |     ✓     |    —   |
| Borrow Book                |   —   |     —     |    ✓   |
| View Own Borrowing History |   —   |     —     |    ✓   |
| Return Book                |   —   |     ✓     |    ✓   |
| View All Borrowing Records |   ✓   |     ✓     |    —   |

Book catalog endpoints are publicly accessible.

## Postman

A Postman collection is included in:

```text
postman/Library-Management-API.postman_collection.json
```

The collection contains requests for:

* Authentication
* Users
* Authors
* Books
* Borrowing
* Gemini AI

It also includes collection variables and automated tests for key API requests.

## Swagger / OpenAPI

After starting the server, open:

```text
http://localhost:3000/api-docs
```

The Swagger UI provides interactive documentation for the API endpoints.

## Team Members

| Member   | Responsibility                                     |
| -------- | -------------------------------------------------- |
| Khaled   | Team Lead, Authors, Integration, Review & Delivery |
| Amr      | Authentication & Users                             |
| Mohanad  | Books                                              |
| Ahmed    | Borrowing                                          |
| Abdallah | Gemini AI                                          |

## Git Workflow

Development followed a feature-based Git workflow:

```text
Jira Issue
→ Branch
→ Implementation
→ Local Testing
→ Commit
→ Push
→ Pull Request
→ Review
→ Merge into main
```

Feature work is merged into the stable `main` branch through Pull Requests.

## License

This project was developed as a team backend API project.
