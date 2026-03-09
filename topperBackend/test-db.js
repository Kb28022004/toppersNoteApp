require('dotenv').config();
const mongoose = require('mongoose');
const Note = require('./src/modules/notes/notes.model');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const notes = await Note.find().sort({ createdAt: -1 }).limit(5);
        for (let note of notes) {
            console.log(`Title: ${note.title||note.chapterName}, PageCount: ${note.pageCount}, preivewImgs: ${note.previewImages?.length}`);
        }
    } catch (e) {
        console.error("DB Error:", e);
    } finally {
        process.exit();
    }
}
run();
