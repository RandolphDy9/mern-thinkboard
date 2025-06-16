import express from "express";
import { createNote, deleteNote, getAllNotes, getNoteById, updateNote } from "../controller/notesController.js";

const router = express.Router();

router.get("/", getAllNotes);
router.get("/:id", getNoteById);
router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

// nf7ef6zeL9VWjrF4

export default router;