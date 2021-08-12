const express = require('express');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

router.post('/login', async (req,res) => {
    const data = req.body;
    const email = data.email;
    const password = data.password;
    try{
        //todo check if the email already exists 
        const user = await User.findOne({email: email});
        if(!user){
            res.send('Email Not Registered');
            return;
        }

        //Check the validated filed 
        const validated = user.validated;
        if(!validated){
            res.send('Please activate your account: check your email');
            return;
        }

        //Check the password 
        const isValid = await bcrypt.compare(password, user.password);
        if(!isValid){
            res.send('Incorrect Password');
            return;
        }

        //generate the token
        const payload = {email};
        const token = jwt.sign(payload, process.env.SECRET, {expiresIn: '600s'});
        res.json({token: token});
    }
    catch(e){
        res.send('ERROR Verifying the user login credentials');
    }
})

router.post('/register', async (req,res) => {
    const data = req.body;
    const email = data.email;
    const password = data.password;
    const username = data.username;
    try{
        //todo check if the email already exists 
        const userExists = await User.exists({email: email});
        if(userExists){
            res.send('Email Already taken');
            return;
        }
        //generate a hash
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({email: email, password: hashedPassword, username: username});
        await newUser.save();
        //generate the token
        const payload = {username, email};
        const token = jwt.sign(payload, process.env.SECRET, {expiresIn: '120s'});
        sendEmail({
            token: token,
            email: email, 
            req: req,
            res:res,
            successMessage: 'Mail Sent Successfully. Please check your email and activate the account',
        });
    }
    catch(e){
        res.send('ERROR Creating account');
    }
})


router.get('/verify', async (req,res) => {
    const token = req.query.token;
    try {
        const decodedToken = jwt.verify(token, process.env.SECRET);
        const email = decodedToken.email;
        let user = await User.findOne({email:email});
        user.validated = true;
        await user.save();
        res.send('User Account Activated');
    }
    catch(err) {
        res.send('Invalid Token')
    }
})


const sendEmail = ({token, email, req, res, successMessage}) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.email,
            pass: process.env.password
        }
    });

    const callbackUrl = 'http://www.localhost:5000/auth/verify?token=' + token;

    const mailOptions = {
        from: process.env.email,
        to: 'xxxxxxxxx', //change it to recepient email in production
        subject: 'Activate your Library Account',
        html: `<p> Activate: <br> <a href=${callbackUrl}> Activate </a> </p>`
    };

    transporter.sendMail(mailOptions, function(err, info){
        if(err){
            console.log('Error sending Email:',err);
            res.send('Error Sending Email', err);
        }
        else{
            console.log('Email Sent');
            res.send(successMessage);
        }
    });

}


module.exports = router;