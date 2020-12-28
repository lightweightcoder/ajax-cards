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
// show the login and registration modal
const modal = document.getElementById('modal');
modal.classList.add('show-modal');

// get and create the elements for the login and register form
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const invalidMsgDiv = document.getElementById('invalid-message');
const invalidMsgEl = document.createElement('p');

// get and create elements for displaying user data and logout btn
const sessionCol = document.getElementById('session-col');
const welcomeMsgEl = document.createElement('span');
const logoutBtn = document.createElement('button');

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
