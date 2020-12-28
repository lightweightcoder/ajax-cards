import getHash from './get-hash.mjs';

/**
 * set the cookie checking middleware callback
 * and supply logged-in user data to subsequent middleware
 * @param {object} req - route request
 * @param {object} res - route response
 * @param {function} next - next middleware function of app.
 */
export default function checkAuthMiddleware(db) {
  return async function checkAuth(req, res, next) {
    // check to see if the cookies you need exists
    if (req.cookies.loggedInHash && req.cookies.userId) {
      // get the hashed value that should be inside the cookie
      const hash = getHash(req.cookies.userId);

      // test the value of the cookie
      if (req.cookies.loggedInHash === hash) {
        try {
          // look for this user in the database
          const user = await db.User.findByPk(req.cookies.userId);

          if (user === null) {
            console.log('no such user in database');
            // send response
            res.send('auth failed');
          } else {
            // found a user in the database so move on to next middleware in route
            console.log('found user');

            // put user details in request for next middleware to use
            req.user = user;
            next();
          }
        } catch (error) {
          console.log(error);
        }

        // return so it wont go below
        return;
      }

      // if the testing of the cookie value failed (req.cookies.loggedInHash != hash)
      console.log('testing of the cookie value failed');

      // send response
      res.send('auth failed');

      // return so it wont go below
      return;
    }

    // if there is no loggedInHash & userId cookie
    console.log('found no userId or loggedInHash cookies');

    // send response
    res.send('auth failed');
  };
}
