const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!isValid(username)) {
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    return res.status(404).json({message: "Unable to register user."});
});

// Get all books
public_users.get('/', async (req, res) => {
    try {
        const bookList = await new Promise((resolve) => resolve(books));
        return res.status(200).json(bookList);
    } catch (error) {
        return res.status(500).json({message: "Failed to retrieve books"});
    }
});

// Get book by ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;
        const book = await new Promise((resolve, reject) => {
            books[isbn] ? resolve(books[isbn]) : reject("Book not found");
        });
        return res.status(200).json(book);
    } catch (error) {
        return res.status(404).json({message: error});
    }
});

// Get books by author
public_users.get('/author/:author', async (req, res) => {
    try {
        const author = req.params.author;
        const filteredBooks = await new Promise((resolve) => {
            const results = Object.entries(books)
                .filter(([_, book]) => book.author === author)
                .map(([isbn, book]) => ({ isbn, ...book }));
            resolve(results);
        });
        
        return filteredBooks.length > 0
            ? res.status(200).json({ books: filteredBooks })
            : res.status(404).json({ message: "No books found by this author" });
    } catch (error) {
        return res.status(500).json({message: "Server error"});
    }
});

// Get books by title
public_users.get('/title/:title', async (req, res) => {
    try {
        const title = req.params.title;
        const filteredBooks = await new Promise((resolve) => {
            const results = Object.entries(books)
                .filter(([_, book]) => book.title === title)
                .map(([isbn, book]) => ({ isbn, ...book }));
            resolve(results);
        });
        
        return filteredBooks.length > 0
            ? res.status(200).json({ books: filteredBooks })
            : res.status(404).json({ message: "No books found with this title" });
    } catch (error) {
        return res.status(500).json({message: "Server error"});
    }
});

// Get reviews for a book
public_users.get('/review/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;
        const reviews = await new Promise((resolve, reject) => {
            books[isbn]?.reviews 
                ? resolve(books[isbn].reviews)
                : reject("Book not found");
        });
        return res.status(200).json(reviews);
    } catch (error) {
        return res.status(404).json({ message: error });
    }
});


module.exports.general = public_users;