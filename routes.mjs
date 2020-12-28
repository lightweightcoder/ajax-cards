import db from './models/index.mjs';

// import your controllers here
import games from './controllers/games.mjs';
import users from './controllers/users.mjs';

// import checkAuth middleware
import checkAuthMiddleware from './lib/check-auth.mjs';

export default function routes(app) {
  // pass in db for all callbacks in controllers
  const GamesController = games(db);
  const UsersController = users(db);
  const checkAuth = checkAuthMiddleware(db);

  // main page
  app.get('/', GamesController.index);

  // check if user is logged in and is in the database and find an existing game
  app.get('/games', checkAuth, GamesController.show);

  // log a user in
  app.post('/login', UsersController.login);

  // register a user
  app.post('/register', UsersController.register);

  // logout a user
  app.delete('/logout', UsersController.logout);

  // create a new game
  app.post('/games', checkAuth, GamesController.create);

  // update a game with new cards
  app.put('/games/:id/deal', GamesController.deal);
}
