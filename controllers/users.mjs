import pkg from 'sequelize';
import getHash from '../lib/get-hash.mjs';

const { UniqueConstraintError, ValidationError, DatabaseError } = pkg;

export default function users(db) {
  const login = async (req, res) => {
    try {
      const emailInput = req.body.email;
      const passwordInput = req.body.password;
      const hashedPasswordInput = getHash(passwordInput);

      // try to find a user
      const user = await db.User.findOne(
        {
          where: { email: emailInput, password: hashedPasswordInput },
        },
      );

      // check if a user is found
      if (user === null) {
        console.log('user not found');
        res.send('no user');
      } else {
        // generate a hashed userId
        const loggedInHash = getHash(user.id);

        // set cookies with the userId and hashed userId
        res.cookie('userId', user.id);
        res.cookie('loggedInHash', loggedInHash);

        res.send(user);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const register = async (req, res) => {
    try {
      const emailInput = req.body.email;
      const passwordInput = req.body.password;
      const hashedPasswordInput = getHash(passwordInput);

      // try to create a user
      const user = await db.User.create({
        email: emailInput,
        password: hashedPasswordInput,
      });

      // generate a hashed userId
      const loggedInHash = getHash(user.id);

      // set cookies with the userId and hashed userId
      res.cookie('userId', user.id);
      res.cookie('loggedInHash', loggedInHash);

      res.send(user);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        console.log('SORRY UNIQUE ERROR');
        console.log(error);
        res.status(500).send(error);
      } else if (error instanceof ValidationError) {
        console.log('SORRY VALIDATION ERROR');

        console.log(error);
        console.log('THIS IS WHAT HAPPENED:');
        console.log(error.errors[0].message);
      } else if (error instanceof DatabaseError) {
        console.log('SORRY DB ERROR');

        console.log(error);
      }
      else {
        console.log(error);
      }
    }
  };

  const logout = async (req, res) => {
    try {
      // clear cookies
      res.clearCookie('userId');
      res.clearCookie('loggedInHash');

      res.send('logged out');
    } catch (error) {
      console.log(error);
    }
  };

  return { login, register, logout };
}
