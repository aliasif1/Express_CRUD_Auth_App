const express = require('express');
const mongoose = require('mongoose');

const authRouter = require('./routes/auth');
const booksRouter = require('./routes/books');

if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/auth', authRouter);
app.use('/books', booksRouter);

const PORT = process.env.PORT ?? 5500;
const databaseUri = process.env.DATABASE_URI ?? 'mongodb://localhost:27017/testing_db'
mongoose.connect(databaseUri, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', (err) => {
    console.log('Error Connecting to Mongo Db', err);
});
db.once('open', () => {
    console.log('connected to Mongo Db')
});

app.get('/', (req,res) => {
    res.send('Api Running !!!');
})

app.listen(PORT, () => {
    console.log('Server Started at PORT: ' + PORT);
});


