require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Book = require('../models/Book');
const Activity = require('../models/Activity');

async function check() {
  try {
    // using absolute connection string for testing
    await mongoose.connect('mongodb://127.0.0.1:27017/elibrary_mobile');
    const book1984 = await Book.findOne({ title: /1984/i });
    console.log('1984 Book:', book1984);
    
    // get recent activities
    const activities = await Activity.find().sort('-lastReadAt').limit(5);
    console.log('\n--- Recent Activities ---');
    console.log(activities);

    // check if activity bookIds exist
    const bookIds = activities.map(a => a.bookId);
    const books = await Book.find({
       $or: [
           { legacyId: { $in: bookIds.map(id => Number(id)).filter(id => !isNaN(id)) } },
           { _id: { $in: bookIds.filter(id => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)) } }
       ]
    });
    
    console.log('\n--- Books for these Activities ---');
    console.log(books.map(b => `${b._id} / ${b.legacyId} - ${b.title}`));

    mongoose.connection.close();
  } catch (e) {
    console.error(e);
  }
}
check();
