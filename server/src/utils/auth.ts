import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const authenticateUser = (req : Request, res: Response, next : NextFunction) => {
  if(process.env.NODE_ENV != 'development') {
    const token = req.headers.authorization?.split(' ')[1];
    const usernameFromParams = req.params.username;
    console.log(token, usernameFromParams);

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
        if (err) {
          return res.sendStatus(403); // Invalid token
        }

        const usernameFromToken = (decoded as JwtPayload).username;
        console.log(usernameFromToken);

        if (usernameFromToken !== usernameFromParams) {
          return res.sendStatus(401); // Unauthorized access
        }

        // UserID in token matches the one in route parameters
        next();
      });
    } else {
      res.sendStatus(401); // No token provided
    }
  }
  else {
    next();
  }
};