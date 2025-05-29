# 📚 Book Review API

A RESTful API for managing books, user authentication, and book reviews. Built with **Node.js**, **Express**, **MongoDB**, and **JWT** authentication.

---

## 🔧 Tech Stack

- Node.js + Express.js
- MongoDB (via Mongoose)
- JWT for Authentication

---

## 🚀 Project Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/your-username/book-review-api.git
```
```bash
cd book-review-api
```

Install dependencies

```bash
npm install
```
Environment Variables

Create a .env file in the root directory:

```bash
PORT=5000
DB=mongodb:url
JWT_SECRET=your_jwt_secret_key
```

Run the server
```bash
npm start
```
Your server will run on http://localhost:5000

🔐 Authentication Endpoints
📝 Signup
```bash
curl -X POST http://localhost:5000/signup \
-H "Content-Type: application/json" \
-d '{"username":"john","password":"123456"}'
🔑 Login
```bash
curl -X POST http://localhost:5000/login \
-H "Content-Type: application/json" \
-d '{"username":"john","password":"123456"}'
```
Response:
{ "token": "JWT_TOKEN_HERE" }
📚 Book Endpoints
All routes below require an Authorization: Bearer <token> header (except GETs)

➕ Add a Book
```bash
curl -X POST http://localhost:5000/books \
-H "Authorization: Bearer JWT_TOKEN" \
-H "Content-Type: application/json" \
-d '{"title":"1984", "author":"George Orwell", "genre":"Dystopian"}'
📖 Get All Books (with pagination & filters)
```bash
curl "http://localhost:5000/books?page=1&limit=10&author=orwell&genre=Dystopian"
🔍 Search by Title or Author
```bash
curl "http://localhost:5000/search?q=george"
📘 Get Book by ID (with average rating + reviews)
```bash
curl http://localhost:5000/books/BOOK_ID
✍️ Review Endpoints
➕ Add Review (One per user per book)
```bash
curl -X POST http://localhost:5000/books/BOOK_ID/reviews \
-H "Authorization: Bearer JWT_TOKEN" \
-H "Content-Type: application/json" \
-d '{"rating":4, "comment":"Great book!"}'
✏️ Update Your Review
```bash
curl -X PUT http://localhost:5000/reviews/REVIEW_ID \
-H "Authorization: Bearer JWT_TOKEN" \
-H "Content-Type: application/json" \
-d '{"comment":"Even better the second time!", "rating":5}'
❌ Delete Your Review
```bash
curl -X DELETE http://localhost:5000/reviews/REVIEW_ID \
-H "Authorization: Bearer JWT_TOKEN"
```

📐 Database Schema
User
{
  username: String (unique),
  password: String (hashed)
}
Book
```bash
{
  title: String,
  author: String,
  genre: String,
  createdBy: ObjectId (User)
}
```
Review
```bash
{
  book: ObjectId (Book),
  user: ObjectId (User),
  rating: Number,
  comment: String
}
```
💡 Design Decisions & Assumptions
Only authenticated users can create books or reviews.

A user can review a book only once.

Reviews store rating and comment and can be updated/deleted only by the creator.

Search supports partial and case-insensitive matching for titles and authors.

Book listing is paginated with optional filters by author and genre.
