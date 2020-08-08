// Import custom elements
import './window-frame.js'
import './login-field.js'
import './memory-board.js'
import './calculation-game.js'
import './tic-toc.js'

// Login & Logoff button
const loginButton = document.querySelector('#loginButton')

// Online status container
const status = document.querySelector('#status')
if (window.localStorage.getItem('nickname')) {
  status.textContent = ` 😎 ${window.localStorage.getItem('nickname')} is online`
  loginButton.textContent = 'Log off'
}

// Handle login / logoff
loginButton.addEventListener('click', e => {
  // If the user is already logged in, the button works as a log off button
  if (window.localStorage.getItem('nickname')) {
    status.textContent = 'You have been logged off'
    window.localStorage.removeItem('nickname')
    loginButton.textContent = 'Log in'
    return
  }

  // Display login field
  const loginField = document.createElement('login-field')
  document.querySelector('#desktop').appendChild(loginField)

  // Catch dispatched event from login field (nickname is valid)
  document.addEventListener('nicknameValid', e => {
    status.textContent = ` 😎 ${e.detail.text()} is online.`
    loginButton.textContent = 'Log off'
  })
})

// Loaded applications counter (for smooth mutual positioning)
let windowCounter = 0

// Applications start buttons
const memoryGameButton = document.querySelector('#memoryGameIcon')
const calculationGameButton = document.querySelector('#calculationGameIcon')
const tictocButton = document.querySelector('#tictocIcon')

// Buttons listen for events:
memoryGameButton.addEventListener('click', e => {
  const memoryGame = document.createElement('memory-board')
  document.querySelector('#desktop').appendChild(memoryGame)
  windowCounter++
})


calculationGameButton.addEventListener('click', e => {
  const calculationGame = document.createElement('calculation-game')
  document.querySelector('#desktop').appendChild(calculationGame)
  windowCounter++
})

tictocButton.addEventListener('click', e => {
  const tictocGame = document.createElement('tic-toc')
  document.querySelector('#desktop').appendChild(tictocGame)
  windowCounter++
})

// Export loaded applications counter
export { windowCounter }
