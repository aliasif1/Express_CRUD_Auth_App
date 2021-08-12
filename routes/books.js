const express = require('express');
const jwt = require('jsonwebtoken');
const Book = require('../models/book');
const { exists } = require('../models/user');
const { route } = require('./auth');
const router = express.Router();


const authenticateRequest = (req, res, next) => {
    let bearerToken = req.headers.authorization;
    if(! bearerToken){
        res.status(401).send('Unauthorized: No Token found');
        return;
    }
    const token = bearerToken.split(" ")[1];
    try{
        //validate the token 
        const decodedToken = jwt.verify(token, process.env.SECRET);
        // Valid token, resource can be accessed
        req.userEmail = decodedToken.email;  
        next();
    }
    catch(e){
        res.status(401).send('Unauthorized: Invalid Token');
        return;
    }

}

router.use('/', authenticateRequest);

//get all the books 
router.get('/', async (req,res) => {
    try{
        const books = await Book.find();
        res.json(books);
    }
    catch(e){
        res.status(500).send('Error Retrieving books')
    }
})

//get a specific book
router.get('/book/:title', async (req,res) => {
    try{
        const book = await Book.findOne({title: req.params.title});
        if(!book){
            res.send('No book found');
        }
        else{
            res.json(book);
        }
    }
    catch(e){
        res.status(500).send('Error Retrieving book')
    }
})

//create a new book
router.post('/', async (req,res) => {
    try{
        const email = req.userEmail;
        const title = req.body.title;
        const pages = parseInt(req.body.pages);
        const newBook = new Book({author: email, title: title, pages: pages});
        await newBook.save();
        res.status(201).send('Successfully created book');
    }
    catch(e){
        res.status(500).send('Error Creating Book');
    }
})

//update a book
router.post('/updatePages', async (req,res) => {
    try{
        const title = req.body.title;
        const pages = parseInt(req.body.pages);
        const book = await Book.findOne({title: title});
        book.pages = pages;
        await book.save();
        res.send('Successfully updated book');
    }
    catch(e){
        res.status(500).send('Error updating Book');
    }
})

//delete a book
router.delete('/delete/:title', async (req,res) => {
    try{
        const book = await Book.findOne({title: req.params.title});
        if(!book){
            res.send('No book found');
        }
        else{
            await book.remove();
            res.send('Book Deleted');
        }
    }
    catch(e){
        res.status(500).send('Error deleting book')
    }
})


module.exports = router;