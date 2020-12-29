import { Sequelize } from 'sequelize';
import allConfig from '../config/config.js';

import gameModel from './game.mjs';
import userModel from './user.mjs';
import gamesUserModel from './gamesUser.mjs';

const env = process.env.NODE_ENV || 'development';

const config = allConfig[env];

const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

// add your model definitions to db here
db.Game = gameModel(sequelize, Sequelize.DataTypes);
db.User = userModel(sequelize, Sequelize.DataTypes);
db.GamesUser = gamesUserModel(sequelize, Sequelize.DataTypes);

db.Game.belongsToMany(db.User, { through: db.GamesUser });
db.User.belongsToMany(db.Game, { through: db.GamesUser });
// db.User.hasMany(db.Game, { as: winner });
// db.Game.belongsTo(db.User, { foreignKey: 'WinnerId' });

// Define 1-M associations between GamesUsers table and associated tables
// to access GamesUser attributes from Game and User instances
db.Game.hasMany(db.GamesUser);
db.GamesUser.belongsTo(db.Game);
db.User.hasMany(db.GamesUser);
db.GamesUser.belongsTo(db.User);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
