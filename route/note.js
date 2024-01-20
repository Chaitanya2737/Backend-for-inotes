const express = require("express");
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require("express-validator");

const Note = require("../models/Note");

// Route to fetch all notes for a specific user
router.get("/fetchallnotes", fetchuser, async (req, res) => {
    try {
        // Fetch all notes for the authenticated user
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        // Log and handle server errors
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

// Route to add a new note for the authenticated user
router.post("/addnote", fetchuser, [
    // Validation middleware using express-validator
    body("title").isLength({ min: 3 }),
    body("description").isLength({ min: 5 }),
], async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        // Return a 400 response with validation errors if any
        return res.status(400).json({
            errors: result.array(),
        });
    }
    try {
        const { title, description, tag } = req.body;
        // Create a new Note instance
        const note = new Note({
            title,
            description,
            tag,
            user: req.user.id,
        });
        // Save the new note
        const savedNote = await note.save();
        res.json(savedNote);
    } catch (error) {
        // Log and handle server errors
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

// Route to update a note for the authenticated user
router.put("/updatenote/:id", fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    const newNote = {};

    if (title) { newNote.title = title; }
    if (description) { newNote.description = description; }
    if (tag) { newNote.tag = tag; }

    try {
        // Validate the ID format
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send("Invalid ID format");
        }

        // Find the note by ID
        let note = await Note.findById(req.params.id);

        // Debugging output
        console.log('Note ID:', req.params.id);
        console.log('Found Note:', note);

        // If the note is not found, return a 404 response
        if (!note) {
            console.log('Note not found');
            return res.status(404).send("Note not found");
        }

        // Check if the authenticated user is the owner of the note
        if (note.user.toString() !== req.user.id.toString()) {
            // Ensure both user IDs are of the same type for strict comparison
            return res.status(401).send("Not allowed");
        }

        // Update the note, excluding the _id field
        note.set(newNote);

        // Save the updated note
        await note.save();

        // Return the updated note as a JSON response
        res.json(note);
    } catch (error) {
        // Log and handle server errors
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

// Route to delete a note for the authenticated user
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
    try {
        // Validate the ID format
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send("Invalid ID format");
        }

        // Find the note by ID and delete it
        const note = await Note.findByIdAndDelete(req.params.id);

        // Debugging output
        console.log('Note ID:', req.params.id);
        console.log('Found Note:', note);

        // If the note is not found, return a 404 response
        if (!note) {
            console.log('Note not found');
            return res.status(404).send("Note not found");
        }

        // Check if the authenticated user is the owner of the note
        if (note.user.toString() !== req.user.id.toString()) {
            // Ensure both user IDs are of the same type for strict comparison
            return res.status(401).send("Not allowed");
        }

        // Return success message
        res.json({ success: "Note has been deleted" });
    } catch (error) {
        // Log and handle server errors
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
