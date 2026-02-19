const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// 1. Better Connection Handling
// Added /bookstore and authSource=admin to ensure the credentials work correctly
const dbURI = "mongodb://admin:TPVqih77329@node86152-fs-mahou.th.app.ruk-com.cloud:11823/bookstore?authSource=admin";

mongoose.connect(dbURI)
    .then(() => console.log("✅ MongoDB Connected..."))
    .catch(err => {
        console.error("❌ MongoDB Connection Error:");
        console.error(err.message);
    });

// 2. Book Model (Fixed "required" typo)
const Book = mongoose.model("Book", {
    id: {
        type: Number,
        unique: true,
        required: true, // Fixed from 'require'
    },
    title: String,
    author: String,
});

// --- ROUTES ---

// Create
app.post("/books", async (req, res) => {
    try {
        const lastBook = await Book.findOne().sort({ id: -1 });
        const nextId = lastBook ? lastBook.id + 1 : 1;

        const book = new Book({
            id: nextId,
            ...req.body,
        });

        await book.save();
        res.status(201).send(book);
    } catch (error) {
        res.status(500).send({ message: "Error creating book", error: error.message });
    }
});

// Read all
app.get("/books", async (req, res) => {
    try {
        const books = await Book.find();
        res.send(books);
    } catch (error) {
        res.status(500).send({ message: "Error fetching books", error: error.message });
    }
});

// Read one
app.get("/books/:id", async (req, res) => {
    try {
        const book = await Book.findOne({ id: req.params.id });
        if (!book) return res.status(404).send({ message: "Book not found" });
        res.send(book);
    } catch (error) {
        res.status(500).send({ message: "Error fetching book", error: error.message });
    }
});

// Update
app.put("/books/:id", async (req, res) => {
    try {
        const book = await Book.findOneAndUpdate({ id: req.params.id }, req.body, {
            new: true,
        });
        if (!book) return res.status(404).send({ message: "Book not found" });
        res.send(book);
    } catch (error) {
        res.status(500).send({ message: "Error updating book", error: error.message });
    }
});

// Delete
app.delete("/books/:id", async (req, res) => {
    try {
        const book = await Book.findOneAndDelete({ id: req.params.id });
        if (!book) return res.status(404).send({ message: "Book not found" });
        res.send(book);
    } catch (error) {
        res.status(500).send({ message: "Error deleting book", error: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server started at http://localhost:${PORT}`);
});