# 🎬 Film Mania

**Film Mania** is a mini project developed during my **M.Sc.** that helps users store and manage movie-related information such as **movies, actors, directors, awards, and related details**. The project is built using **Node.js, JavaScript, HTML/CSS, and MySQL**.

The system provides a user-friendly web interface for managing movie-related data efficiently. It supports storing information about movies, actors, directors, and awards while ensuring proper database consistency.

---

## ✨ Features

* 🎥 Add and manage **movie details**
* 🎭 Store and manage **actor information**
* 🎬 Maintain **director details**
* 🏆 Store **awards and achievements**
* 📊 Generate reports from stored data
* 🔒 **Database locking mechanism** to handle concurrency-related issues
* 💻 Interactive and easy-to-use web interface

---

## 🛠️ Technologies Used

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js

### Database

* MySQL

---

## 📂 Project Structure

```plaintext
film_mania/
│── frontend/
│   ├── images/               # Contains all images used in the project
│   ├── actorForm.html        # Actor details form
│   ├── directorForm.html     # Director details form
│   ├── movieForm.html        # Movie details form
│   ├── report1.html          # Report page 1
│   ├── report2.html          # Report page 2
│   ├── index.html            # Homepage
│   ├── success.html          # Success page
│   ├── custom.css            # Custom styling
│   ├── form.css              # Form styling
│   └── home.css              # Homepage styling
│
│── backend/
│   ├── app.js                # Main server file
│   ├── db.js                 # Database connection file
│   ├── package.json          # Project dependencies
│   ├── package-lock.json     # Dependency lock file
│
├── README.md
└── .gitignore
```

---

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/film_mania.git
```

### 2. Navigate to the Project Directory

```bash
cd film_mania
```

### 3. Install Dependencies

Move to the backend folder and install required packages:

```bash
cd backend
npm install
```

This will automatically generate the `node_modules` folder.

### 4. Configure MySQL Database

* Create a MySQL database
* Import the required SQL schema/tables
* Update database credentials in the `db.js` file

Example configuration:

```javascript
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'your_username',
    password: 'your_password',
    database: 'movie'
});

module.exports = connection;
```

### 5. Run the Server

```bash
node app.js
```

### 6. Open the Application

Open in your browser:

```plaintext
http://localhost:3000
```

---

## 🔒 Concurrency Handling

This project implements a **database locking mechanism (DB Lock)** to address **concurrency-related problems**. Database locks help maintain **data consistency and integrity** when multiple operations attempt to access or modify the same records simultaneously.

This ensures:

* Prevention of conflicting updates
* Better transaction management
* Improved consistency of stored movie-related data

---

## 🎯 Purpose of the Project

The main objective of this mini project was to learn and implement:

* Full-stack web development
* Database connectivity using MySQL
* CRUD operations
* Backend development using Node.js
* Frontend form handling using JavaScript
* Concurrency management using database locks
* Integration between frontend and backend

---

## 👩‍💻 Author

**Swetasree Banik**

---
