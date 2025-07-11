# Node.js Contact App

This project is a Node.js application that allows users to upload contact details via a CSV or Excel file. The application processes the uploaded file, validates the contents, and stores the contact information in a PostgreSQL database.

## Project Structure

```
nodejs-contact-app
├── src
│   ├── controllers
│   │   └── contact.controller.js
│   ├── routes
│   │   └── contact.route.js
│   ├── respository
│   │   └── contact.repository.js
│   ├── utils
│   │   └── responseManager.js
│   └── app.js
├── package.json
└── README.md
```

## Features

- Upload contacts from CSV or Excel files.
- Validate uploaded files and handle errors gracefully.
- Insert multiple contacts into the database in a single operation.
- Use of middleware for file handling with Multer.

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd nodejs-contact-app
   ```

3. Install the dependencies:
   ```
   npm install
   ```

## Usage

1. Start the application:
   ```
   npm start
   ```

2. Use a tool like Postman to send a POST request to the following endpoint to upload contacts:
   ```
   POST /contact/upload-contacts
   ```
   - Ensure to include the file in the request body with the key `file`.

## Dependencies

- Express: Web framework for Node.js.
- Multer: Middleware for handling multipart/form-data, primarily used for uploading files.
- PostgreSQL: Database for storing contact information.

## License

This project is licensed under the MIT License.