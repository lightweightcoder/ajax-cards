/* eslint-disable max-len */
/** pseudo-code
 * 1. On page load, use cookies and query database (using user controller) to check if user is logged in (axios.get('/check')).
 *  1.1 If user is not logged in, create elements to display login form
 *  1.2 If user is logged in, query database for games that belong to that user (using games controller? need any includes bcos need games and gamesUser models?). Check for a game that has no winner yet. (do I do this checking in the controller or client side js?)
 * await axios.get('/game')
 *    1.2.1 If user has a game that has no winner yet, display the score, the previous round's hand, the deal btn, and refresh btn (refresh btn is a axios.get of the main page?).
 *    1.2.2 If user has no game that has no winner, display the start game btn.
 */

/**
 * ==========================================================================
 * ==========================================================================
 * ==========================================================================
 * ==========================================================================
 */

// get the login and registration form modal
const modal = document.getElementById('modal');
// modal.classList.add('show-modal');

// get and create the elements for the login and register form ----------------------
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const invalidMsgDiv = document.getElementById('invalid-message');
const invalidMsgEl = document.createElement('p');

// get and create elements for displaying user data and logout btn ------------------
const sessionCol = document.getElementById('session-col');
const welcomeMsgEl = document.createElement('span');
const logoutBtn = document.createElement('button');

// game container manipulation elements --------------------------------------------
// global value that holds info about the current hand.
let currentGame = null;

// create game btn
const createGameBtn = document.createElement('button');

// container to display game buttons
const gameBtnsCol = document.getElementById('game-buttons-col');

// game display header container
const gameDisplayHeaderCol = document.getElementById('game-display-header');

// players cards container
const player1CardsDiv = document.getElementById('player1-cards-div');
const player2CardsDiv = document.getElementById('player2-cards-div');

// Functions ========================================================================
const clearWebpage = () => {
  // remove the login and registration modal
  modal.classList.remove('show-modal');

  // clear login and reg form inputs
  emailInput.innerHTML = '';
  passwordInput.innerHTML = '';
  invalidMsgDiv.innerHTML = '';

  // clear user session info
  sessionCol.innerHTML = '';

  // remove game buttons
  gameBtnsCol.innerHTML = '';

  // remove game display header
  gameDisplayHeaderCol.innerHTML = '';

  // remove players cards
  player1CardsDiv.innerHTML = '';
  player2CardsDiv.innerHTML = '';
};

// show login and registration form -------------------------------------------------
const showLoginAndRegForm = () => {
  // show the login and registration modal
  modal.classList.add('show-modal');
};

// game container manipulation functions --------------------------------------------
// DOM manipulation function that displays the player's current hand.
const runGame = function ({ cards }) {
  // manipulate DOM
  const gameContainer = document.querySelector('#game-container');

  gameContainer.innerText = `
    Your Hand:
    ====
    ${cards.playerHand[0].name}
    of
    ${cards.playerHand[0].suit}
    ====
    ${cards.playerHand[1].name}
    of
    ${cards.playerHand[1].suit}
  `;
};

// make a request to the server
// to change the deck. set 2 new cards into the player hand.
const dealCards = function () {
  axios.put(`/games/${currentGame.id}/deal`)
    .then((response) => {
      // get the updated hand value
      currentGame = response.data;

      // display it to the user
      runGame(currentGame);
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

const createGame = function () {
  // Make a request to create a new game
  axios.post('/games')
    .then((response) => {
      // set the global value to the new game.
      currentGame = response.data;

      console.log(currentGame);

      // display it out to the user
      runGame(currentGame);

      // for this current game, create a button that will allow the user to
      // manipulate the deck that is on the DB.
      // Create a button for it.
      const dealBtn = document.createElement('button');
      dealBtn.addEventListener('click', dealCards);

      // display the button
      dealBtn.innerText = 'Deal';
      document.body.appendChild(dealBtn);
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

const initCreateGameBtn = () => {
  // manipulate DOM, set up create game button
  createGameBtn.addEventListener('click', createGame);
  createGameBtn.innerText = 'Create Game';
  document.body.appendChild(createGameBtn);
};

// logout and display user info functions -----------------------------------
// handler to log a user out
const handleLogoutBtnClick = async () => {
  try {
    await axios.delete('/logout');

    modal.classList.add('show-modal');

    // remove elements
    sessionCol.remove(welcomeMsgEl, logoutBtn);
    invalidMsgDiv.remove(invalidMsgEl);
    emailInput.value = '';
    passwordInput.value = '';
  } catch (error) {
    // handle error
    console.log(error);
  }
};

// display the user's info and logout btn
const displayUserData = (data) => {
  welcomeMsgEl.innerHTML = `welcome back user ${data.id}`;
  logoutBtn.innerText = 'logout';

  // event listner for logout btn
  logoutBtn.addEventListener('click', handleLogoutBtnClick);

  // append elements
  sessionCol.append(welcomeMsgEl, logoutBtn);
};

// login and register form functions ---------------------------------------
// handler to make a request to the server to login a user
const handleLoginBtnClick = async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  const data = {};
  data.email = email;
  data.password = password;

  // find user data from database
  try {
    const userInfo = await axios.post('/login', data);

    if (userInfo.data === 'no user') {
      // display invalid login msgs
      invalidMsgEl.innerText = 'You have entered an wrong email/password';
      invalidMsgEl.style.color = 'red';

      invalidMsgDiv.append(invalidMsgEl);
    } else {
      console.log('found user');
      // display logged in user info
      const userData = userInfo.data;

      displayUserData(userData);

      initCreateGameBtn();

      // remove modal display
      modal.classList.remove('show-modal');
    }
  } catch (error) {
    // handle error
    console.log(error);
  }
};

// handler to make a request to the server to register a user
const handleRegisterBtnClick = async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  const data = {};
  data.email = email;
  data.password = password;

  // find user data from database
  try {
    const userInfo = await axios.post('/register', data);

    // display logged in user info
    const userData = userInfo.data;

    displayUserData(userData);

    // remove modal display
    modal.classList.remove('show-modal');
  } catch (error) {
    // handle error
    console.log(error);
  }
};

// setup login button
loginBtn.addEventListener('click', handleLoginBtnClick);

// setup register button
registerBtn.addEventListener('click', handleRegisterBtnClick);

// game initalisation ======================================================
const initGame = () => {
  // when /views/games/index.ejs loads, check if user is logged in and is a user in the database and find an ongoing game
  axios.get('/games')
    .then((res) => {
      // if response is auth failed, then build login form
      // if response is found game data, check if there is an ongoing game
      // if there is ongoing game, display ongoing game
      // if there is no ongoing game, display create game button
      const userGameData = res.data;

      if (userGameData === 'auth failed') {
        console.log('showLogin');
        showLoginAndRegForm();
      } else {
        console.log('display user sess info');
        const userData = {};
        userData.id = userGameData.userId;
        displayUserData(userData);

        console.log('initCreateGameBtn');
        initCreateGameBtn();
      }
    })
    .catch((error) => {
    // handle error
      console.log(error);
    });
};

// initialise game
initGame();
