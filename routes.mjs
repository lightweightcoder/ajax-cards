import db from './models/index.mjs';

// import your controllers here
import games from './controllers/games.mjs';
import users from './controllers/users.mjs';

export default function routes(app) {
  // pass in db for all callbacks in controllers
  const GamesController = games(db);
  const UsersController = users(db);

  // main page
  app.get('/', GamesController.index);

  // log a user in
  app.post('/login', UsersController.login);

  // register a user
  app.post('/register', UsersController.register);

  // logout a user
  app.delete('/logout', UsersController.logout);

  // create a new game
  app.post('/games', GamesController.create);

  // update a game with new cards
  app.put('/games/:id/deal', GamesController.deal);
}
