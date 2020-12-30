export default function gamesUserModel(sequelize, DataTypes) {
  return sequelize.define(
    'GamesUser',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      GameId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Games',
          key: 'id',
        },
      },
      UserId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      playerNum: {
        type: DataTypes.INTEGER,
      },
      score: {
        type: DataTypes.INTEGER,
      },
    },
    {
      // timestamps: false prevents Sequelize from adding
      // createdAt and updatedAt timestamp fields
      // https://sequelize.org/master/class/lib/model.js~Model.html#static-method-init
      timestamps: false,
    },
  );
}
