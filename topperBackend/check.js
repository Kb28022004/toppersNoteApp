const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://karanbharti28022004_db_user:toppertaskmanagement@cluster0.5z7xbrx.mongodb.net/toppernotes?retryWrites=true&w=majority')
  .then(async () => {
    try {
      const TopperProfile = require('./src/modules/toppers/topper.model');
      const profile = await TopperProfile.findOne().lean();
      if (!profile) return console.log('No profile');
      const res = await fetch('http://127.0.0.1:8000/api/v1/toppers/' + profile.userId.toString() + '/public');
      const data = await res.json();
      console.log('API returned subjectMarks:', JSON.stringify(data.data.subjectMarks, null, 2));
      console.log('API returned marksheetUrl:', data.data.marksheetUrl);
    } catch(e) { console.error('Error:', e.message); }
    process.exit(0);
  })
  .catch(console.error);
