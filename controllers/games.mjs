import pkg from 'sequelize';

const { Op } = pkg;

/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *                  Card Deck Stuff
 *
 * ========================================================
 * ========================================================
 * ========================================================
 */

// get a random index from an array given it's size
const getRandomIndex = function (size) {
  return Math.floor(Math.random() * size);
};

// cards is an array of card objects
const shuffleCards = function (cards) {
  let currentIndex = 0;

  // loop over the entire cards array
  while (currentIndex < cards.length) {
    // select a random position from the deck
    const randomIndex = getRandomIndex(cards.length);

    // get the current card in the loop
    const currentItem = cards[currentIndex];

    // get the random card
    const randomItem = cards[randomIndex];

    // swap the current card and the random card
    cards[currentIndex] = randomItem;
    cards[randomIndex] = currentItem;

    currentIndex += 1;
  }

  // give back the shuffled deck
  return cards;
};

const makeDeck = function () {
  // create the empty deck at the beginning
  const deck = [];

  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];

  let suitIndex = 0;
  while (suitIndex < suits.length) {
    // make a variable of the current suit
    const currentSuit = suits[suitIndex];

    // loop to create all cards in this suit
    // rank 1-13
    let rankCounter = 1;
    while (rankCounter <= 13) {
      let cardName = rankCounter;

      // 1, 11, 12 ,13
      if (cardName === 1) {
        cardName = 'ace';
      } else if (cardName === 11) {
        cardName = 'jack';
      } else if (cardName === 12) {
        cardName = 'queen';
      } else if (cardName === 13) {
        cardName = 'king';
      }

      // make a single card object variable
      const card = {
        name: cardName,
        suit: currentSuit,
        rank: rankCounter,
      };

      // add the card to the deck
      deck.push(card);

      rankCounter += 1;
    }
    suitIndex += 1;
  }

  return deck;
};

/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *                  Controller Stuff
 *
 * ========================================================
 * ========================================================
 * ========================================================
 */

export default function games(db) {
  // render the main page
  const index = (request, response) => {
    response.render('games/index');
  };

  // create a new game. Insert a new row in the DB.
  const create = async (request, response) => {
    // deal out a new shuffled deck for this game.
    const deck = shuffleCards(makeDeck());

    try {
      // get the logged in user id
      const loggedInUserId = request.user.id;

      // find all players who are not the logged in user in the database
      // returns array of user objects
      const users = await db.User.findAll({
        where: {
          id: {
            [Op.ne]: loggedInUserId,
          },
        },
      });

      // get a random user's id to be the 2nd player
      const randomIndex = Math.floor((Math.random() * users.length));
      const randomUserId = users[randomIndex].id;

      // set players ids for new game
      // const playersIds = [loggedInUserId, randomUserId];

      // const newGame = {
      //   cards: {
      //     // playerHand: [deck.pop(), deck.pop()],
      //     deck,
      //   },
      // };
      const newGame = {
        cards: deck,
      };

      // run the DB INSERT query to create a new game
      const game = await db.Game.create(newGame);

      const gamesUsersData = [];

      // add the loggedInUser's data for GameUsers table
      gamesUsersData.push({
        GameId: game.id,
        UserId: loggedInUserId,
        playerNum: 1,
      });

      // add the random users's data for GameUsers table
      gamesUsersData.push({
        GameId: game.id,
        UserId: randomUserId,
        playerNum: 2,
      });

      // create entries in the GamesUsers table
      await db.GamesUser.bulkCreate(gamesUsersData);

      // send the new game back to the user.
      // dont include the deck so the user can't cheat
      response.send({
        id: game.id,
        randomUserId,
        loggedInUserId,
      });
    } catch (error) {
      console.log('error is', error);
      response.status(500).send(error);
    }
  };

  // deal two new cards from the deck.
  const deal = async (request, response) => {
    console.log('in gamescontroller.deal');
    try {
      // get the game by the ID passed in the request
      const game = await db.Game.findByPk(request.params.id);

      // get the userIds and playerIds of the game
      const gameUsers = await db.GamesUser.findAll({
        where: {
          GameId: request.params.id,
        },
        order: [
          // order by player number in ascending order
          ['playerNum', 'ASC'],
        ],
      });

      console.log('gameUsers are:', gameUsers);

      console.log('deck length before pop', game.cards.length);
      // set the players card and players number in an array of objects
      // to pass into response
      const playerNumAndCards = [];
      const player1NumAndCards = {
        playerNum: 1,
        card: game.cards.pop(),
      };
      const player2NumAndCards = {
        playerNum: 2,
        card: game.cards.pop(),
      };
      playerNumAndCards.push(player1NumAndCards);
      playerNumAndCards.push(player2NumAndCards);
      console.log('playerNumAndCards is', playerNumAndCards);

      // find out with player has the higher card or draw
      const player1CardRank = player1NumAndCards.card.rank;
      const player2CardRank = player2NumAndCards.card.rank;
      let winnerPlayerNum = 'draw';
      if (player1CardRank > player2CardRank) {
        winnerPlayerNum = 1;
      } else if (player1CardRank < player2CardRank) {
        winnerPlayerNum = 2;
      }

      // update GamesUsers table on the score if there is a winner
      if (winnerPlayerNum !== 'draw') {
        // find the previous score and userId of the winner
        // this returns an array of GamesUser objects
        const winner = gameUsers.filter((gameUser) => gameUser.playerNum === winnerPlayerNum);

        console.log('winner is', winner);

        const newScore = winner[0].score + 1;

        // update the score of the winner for that round
        await db.GamesUser.update({ score: newScore }, {
          where: {
            GameId: request.params.id,
            UserId: winner[0].UserId,
          },
        });

        console.log('done with updating gamesUserTable score');

        // if the score is 2, update Games table WinnerId with the userId who got the score
        if (newScore === 2) {
          await db.Game.update({ WinnerId: winner[0].UserId }, {
            where: {
              id: request.params.id,
            },
          });

          console.log('done updating games table with WinnerId');
        }
      }

      // // make changes to the object
      // // const playerHand = [game.cards.deck.pop(), game.cards.deck.pop()];
      // const { deck } = game.cards;
      const deck = game.cards;

      console.log('1st updating Games table');
      // update the game with the new info
      // this doesnt seem to work, does not run any query
      console.log('game deck length is', game.cards.length);
      const updatedGame = await game.update(
        {
          cards: [...deck],
        },
      );
      // const updatedGame = await game.update(
      //   {
      //     cards: {
      //     // playerHand,
      //       deck,
      //     },
      //   },
      // );
      // but this works
      console.log('updatedGame deck length is', updatedGame.cards.length);
      console.log('2nd updating Games table');
      // await db.Game.update(
      //   {
      //     cards: {
      //     // playerHand,
      //       deck,
      //     },
      //   },
      //   {
      //     where: {
      //       id: request.params.id,
      //     },
      //   },
      // );

      console.log('deck is', deck);

      // send the updated game back to the user.
      // dont include the deck so the user can't cheat
      response.send({
        id: game.id,
        playerNumAndCards,
        // cards: {
        //   playerHand: game.cards.playerHand,
        // },
      });
    } catch (error) {
      console.log('deal fn error:', error);
      response.status(500).send(error);
    }
  };

  // get game data based on logged in user
  const show = async (request, response) => {
    try {
      console.log('user is:', request.user);
      // const userId = request.user.Id;

      // db.GamesUser.findAll({
      //   where: {
      //     UserId: userId,
      //   },
      //   include: {
      //     model: db.Game,
      //   },
      // });

      const data = {};

      // set the user's Id for use in displayUserData in script.js
      data.userId = request.user.id;

      response.send(data);
    } catch (error) {
      response.status(500).send(error);
    }
  };

  // return all functions we define in an object
  // refer to the routes file above to see this used
  return {
    deal,
    create,
    index,
    show,
  };
}
