require('dotenv').config();
const mongoose = require('mongoose');
require('./src/modules/users/user.model'); // Register User schema
require('./src/modules/toppers/topper.model'); // Register Topper profile
const Note = require('./src/modules/notes/notes.model');
const noteService = require('./src/modules/notes/notes.service');

async function testApi() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const notes = await Note.find().sort({ createdAt: -1 }).limit(1);
        if (notes.length > 0) {
            const noteId = notes[0]._id.toString();
            // test as topper
            const result = await noteService.getNoteDetails(noteId, notes[0].topperId.toString(), 'TOPPER');
            console.log("previewImages count for TOPPER:", result.previewImages.length);
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
testApi();
