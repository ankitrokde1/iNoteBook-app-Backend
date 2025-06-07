const Note = require("../models/Notes");
const { validationResult } = require("express-validator");

// Fetch all notes
exports.fetchAllNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};

// Add a new note
exports.addNote = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { title, description, tag } = req.body;
  try {
    const note = new Note({
      title,
      description,
      tag,
      user: req.user.id,
    });
    const savedNote = await note.save();
    res.json(savedNote);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};

// Update an existing note
exports.updateNote = async (req, res) => {
  const { title, description, tag } = req.body;
  try {
    const newNote = {};
    if (title) newNote.title = title;
    if (description) newNote.description = description;
    if (tag) newNote.tag = tag;

    let notes = await Note.findById(req.params.id);
    if (!notes) {
      return res.status(404).send("Not Found");
    }
    if (notes.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};

// Delete an existing note
exports.deleteNote = async (req, res) => {
  try {
    let notes = await Note.findById(req.params.id);
    if (!notes) {
      return res.status(404).send("Not Found");
    }
    if (notes.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};
