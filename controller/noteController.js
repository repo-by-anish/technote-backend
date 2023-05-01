const User = require("../models/User");
const Note = require("../models/Note");



const getAllNotes = async (req, res) => {

    const notes = await Note.find().lean();

    console.log(req.cookies);

    if (!notes.length) {
        return res.status(400).json({ message: "No Notes is found" });

    }

    //notes with user

    const noteWithUser = await Promise.all(notes.map(async note => {
        const user = await User.findById(note.user).lean().exec();
        return { ...note, username: user.username }
    }))

    res.json(noteWithUser);

}

const createNewNote = async (req, res) => {
    const { user, title, text } = req.body

    // Confirm data
    if (!user || !title || !text) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate title
    const duplicate = await Note.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate note title' })
    }

    const note = await Note.create({ user, title, text })


    if (note) { // Created 
        return res.status(201).json({ message: 'New note created' })
    } else {
        return res.status(400).json({ message: 'Invalid note data received' })
    }

}

const updateNote = async (req, res) => {

    const { id, user, title, text, completed } = req.body;

    if (!id || !user || !title || !text || !completed == null) {
        return res.status(400).json({ message: "Require All Feild" });
    }

    const note = await Note.findById(id).exec();

    if (!note) {
        return res.status(400).json({ message: "Cannot find the note." })
    }

    const duplicate = await Note.findOne({ title }).collation({ locale: 'en', strength: 2 }).lean().exec();
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: "Duplicate note found" });
    }

    note.user = user;
    note.title = title;
    note.text = text;
    note.completed = completed

    const updatedNote = await note.save();

    res.json(`${updatedNote.title} updated`)

}

const deleteNote = async (req, res) => {

    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: "Id is not provided" });
    }

    const note = await Note.findById(id).exec();

    if (!note) {
        return res.status(400).json({ message: "Cannot Find Note" });
    }

    const result = await note.deleteOne();

    const reply = `${result.title} Deleted with id: ${result._id}`


    res.json({ message: reply });
}


module.exports = {
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote
}