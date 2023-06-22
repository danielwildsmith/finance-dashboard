import express, {Request, Response} from "express";
import {User} from "../models/user";
import bcrypt from "bcrypt";

const router = express.Router();
const saltRounds = 4;

router.post("/signup", async (req: Request, res: Response) => {
  if (!(req.body.username && req.body.password)) {
    res.status(400).send({error: "Missing username/password fields"});
    return;
  }

  // Check if username already exists, and send status for that
  const err = await User.findByPk(req.body.username);
  if (err !== null) {
    res.status(409).send({error: "Username already taken"});
    return;
  }

  // Add user to DB - hash password
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(req.body.password, salt);

    const user = await User.create({
      username: req.body.username,
      password: hash,
    });
    res.status(200).send(user);
    return;
  } catch (error) {
    console.error(error);
    res.status(400).send("Error hashing and salting password.");
  }
});

router.post("/signin", async (req: Request, res: Response) => {
  if (!(req.body.username && req.body.password)) {
    res.status(400).send({error: "Missing username/password fields."});
    return;
  }

  // check if user exists in db
  const user = await User.findByPk(req.body.username);
  if (user === null) {
    res.status(404).send({error: "User not found."});
    return;
  }

  // check if incorrect password
  bcrypt.compare(
    req.body.password,
    user.getDataValue("password"),
    (err, result) => {
      if (result) {
        res.status(200).send("User signed in successfully");
      } else {
        res.status(401).send({error: "Incorrect credentials."});
      }
    }
  );
});

export default router;
