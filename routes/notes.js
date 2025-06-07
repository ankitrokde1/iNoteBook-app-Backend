const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const fetchUser = require("../middleware/fetchUser");
const notesController = require("../controller/notesController");

// Fetch all notes
router.get("/fetchallnotes", fetchUser, notesController.fetchAllNotes);

// Add a new note
router.post(
  "/addnote",
  fetchUser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  notesController.addNote
);

// Update an existing note
router.put("/updatenote/:id", fetchUser, notesController.updateNote);

// Delete an existing note
router.delete("/deletenote/:id", fetchUser, notesController.deleteNote);

module.exports = router;
