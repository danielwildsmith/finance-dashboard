import express, { Request, Response } from 'express';
import { User } from '../models/user';
const router = express.Router();

// TODO: add JWT authentication, cookie integration

router.post('/signup', async (req : Request, res : Response) => {
    if(!(req.body.username && req.body.password)) {
        res.status(400).send( {error: "Missing username/password fields"} );
        return;
    }

    // Check if username already exists, and send status for that
    const err = await User.findByPk(req.body.username);
    if(err !== null) {
        res.status(409).send( { error: "Username already taken" } );
        return;
    }

    // Add user to DB
    const user = await User.create({ username: req.body.username, password: req.body.password });
    console.log(user);

    res.status(200).send("User signed up successfully!");
});

router.post('/signin', async (req : Request, res : Response) => {
    if(!(req.body.username && req.body.password)) {
        res.status(400).send( {error: "Missing username/password fields."} );
        return;
    }
    
    // check if user exists in db
    const user = await User.findByPk(req.body.username);
    if(user === null) {
        res.status(404).send( { error: "User not found." } );
        return;
    }

    // check if incorrect password
    if(user.getDataValue("password") !== req.body.password) {
        res.status(401).send( { error: "Incorrect credentials." } );
        return;
    }

    res.status(200).send("User signed in successfully");
});

router.post('/logout', async (req : Request, res : Response) => {
    // delete cookie
    res.cookie('username', req.body.username, { maxAge: 0 });

    res.status(200).send("User logged out successfully");
});

export default router;
