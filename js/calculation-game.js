// Import superclass
import { WindowFrame } from './window-frame.js'

// Create a structural template for a custom element 'calculation-game'
const template = document.createElement('template')

template.innerHTML =
`
<div id="gameSpace">
    
    <div id="motivation" style="margin-top: 10px; text-align: center; font-size: 20px;"></div>

    <button id="gameStartButton" 
      style="
        margin-top: 12px; 
        margin-bottom: 10px;  
        margin-left: 60px;
        padding: 3px; 
        font-size: 12px; 
        background-color:  rgb(231, 238, 221);"
    >Let the game begin?</button>

    <div id="paperWrapper" 
      style="
        margin: 7px; 
        padding: 7px; 
        background-image: url(/css/paperWrapper.jpg); 
        box-shadow: -3px -3px -0.5px rgb(206, 206, 206);">
      
          <div id="timer" 
            style="
              background-color: white;
              opacity: 0.5;
              width: 25px;
              height: 25px;
              border-style: solid;
              border-width: 1px;
              border-color: black;
              border-radius: 30px;
  
              text-align: center;
              font-size: 20px;
              color: black;
              padding: 10px;
  
              margin: auto;
              margin-top: 15px;
              margin-bottom: 10px;
            "></div>

          <div id="equation">
            <div id="firstNumber" style="display: inline; margin-left: 15px; font-size: 20px;">1</div>
            <div id="operator" style="display: inline; margin-left: 15px; font-size: 20px;">+</div>
            <div id="secondNumber" style="display: inline; margin-left: 15px; font-size: 20px;">1</div>
            <div id="euals" style="display: inline; margin-left: 15px; font-size: 20px;">=</div>
            <input id="result" type="text" style="display: inline; margin-left: 15px; width: 40px; font-size: 20px; opacity: 0.5;">
          </div>
    </div>

    <button id="submitButton" 
      style="
        margin-left: 91px; 
        margin-top: 10px; 
        padding: 7px; 
        font-size: 15px; 
        background-color: rgb(231, 238, 221);
    ">Submit</button>

    <div id="solutionStatus" style="margin-top: 7px; padding: 5px; font-size: 15px;"></div>
</div>
`

// Create a structural template for a score table
const scoreTableTemplate = document.createElement('template')

scoreTableTemplate.innerHTML =
`
<table id=score-table>
  <tr>
    <th>Player</th>
    <th>Score</th>
  </tr>
</table>
`
/**
 * Defines functionality for 'calculation-game' custom element
 * 'calculation-game' custom element will serve as a playground for a simple calculation game
 *
 * @class CalculationGame
 * @extends {WindowFrame}
 */
class CalculationGame extends WindowFrame {
  constructor () {
    super()

    // Deep clone 'calculation-game' template & Append it to the 'content block' from the WindowFrame parent class
    this._contentBlock.appendChild(template.content.cloneNode(true))
    this._iconHolder.style.background = 'url(https://image.flaticon.com/icons/svg/313/313571.svg) no-repeat'
    this._appTitle.textContent = 'Calculation Game'

    // Reference the structural parts of the appended 'calculation-game' template
    this._gameSpace = this._contentBlock.querySelector('#gameSpace')

    this._motivation = this._contentBlock.querySelector('#motivation')
    this._gameStartButton = this._contentBlock.querySelector('#gameStartButton')

    this._timer = this._contentBlock.querySelector('#timer')
    this._equation = this._gameSpace.querySelector('#equation')

    this._firstNumber = this._equation.querySelector('#firstNumber')
    this._operator = this._equation.querySelector('#operator')
    this._secondNumber = this._equation.querySelector('#secondNumber')
    this._inputResult = this._equation.querySelector('#result')
    this._correctResult = 0

    this._submitButton = this._gameSpace.querySelector('#submitButton')
    this._submitButton.style.visibility = 'hidden'
    this._enterEventIsAllowed = false

    this._solutionStatus = this._gameSpace.querySelector('#solutionStatus')

    // Generate buttons
    this._newGameButton = document.createElement('button')
    this._newGameButton.textContent = 'New Game'
    this._newGameButton.style.margin = '1px'
    this._newGameButton.style.marginRight = '2px'
    this._newGameButton.style.marginLeft = '2px'

    this._scoreButton = document.createElement('button')
    this._scoreButton.textContent = 'Score'
    this._scoreButton.style.margin = '1px'
    this._scoreButton.style.marginRight = '2px'

    this._restartScoreButton = document.createElement('button')
    this._restartScoreButton.textContent = 'Restart Score'
    this._restartScoreButton.style.margin = '1px'
    this._restartScoreButton.style.marginRight = '2px'

    this._controlPanel.appendChild(this._newGameButton)
    this._controlPanel.appendChild(this._scoreButton)
    this._controlPanel.appendChild(this._restartScoreButton)

    // Reference timer & score
    this._currentTimer = ''
    this._totalSeconds = 0
    this._currentScore = 0
    this._totalScore = 0

    // Append nickname to the game
    this._nickname = window.localStorage.getItem('nickname') || 'Unknown Hero'

    // Game switcher
    this._gameIsOn = true
    this._roundsCounter = 0
  }

  /**
   * Called when connected to the DOM
   *
   * @memberof CalculationGame
   */
  connectedCallback () {
    this.positionElement()

    this.listenForDragging()

    this._frame.addEventListener('click', e => {
      this.refocusStack()
    })

    // Recognize the player
    this._motivation.textContent = `Player: 🐰${this._nickname}`

    // Starts a game
    this._gameStartButton.addEventListener('click', e => {
      // Rearrange the layout & Motivational image & Words
      this._gameStartButton.style.visibility = 'hidden'
      this._contentBlock.querySelector('#paperWrapper').style.marginTop = '0px'
      this._motivation.textContent = `Go Go, ${this._nickname}🐰!`

      // Generate a random equation & set the timer
      this.generateEquation()
      this.setTimer()
      this._submitButton.style.visibility = 'visible'
      this._inputResult.value = ''
      this._enterEventIsAllowed = true
    })

    // Submits solutions
    this._inputResult.addEventListener('keypress', e => {
      if (e.keyCode === 13 && this._enterEventIsAllowed) {
        clearInterval(this._currentTimer)
        this.checkResults()
        this._roundsCounter++

        // Generate equation until they number reaches 10
        if (this._roundsCounter < 10) {
          this.generateEquation()
          this.setTimer()
        } else {
          this._gameIsOn = false
          this.finishGame()
        }

        e.target.value = ''
        e.preventDefault()
      }
    })

    // Submits solutions
    this._submitButton.addEventListener('click', e => {
      clearInterval(this._currentTimer)
      this.checkResults()
      this._roundsCounter++

      // Generate equation until they number reaches 10
      if (this._roundsCounter < 10) {
        this.generateEquation()
        this.setTimer()
      } else {
        this._gameIsOn = false
        this.finishGame()
      }
    })

    // Control panel buttons are listening for events:
    this._newGameButton.addEventListener('click', e => {
      this.restartTheGame()
      this._scoreButton.disabled = false
    })

    this._scoreButton.addEventListener('click', e => {
      clearInterval(this._currentTimer)
      this._totalScore = 0
      this.updateScoreList()
      this.displayScoreList()

      this._scoreButton.disabled = true
    })

    this._restartScoreButton.addEventListener('click', e => {
      clearInterval(this._currentTimer)
      window.localStorage.removeItem('cg-top-players')
      this._totalScore = 0
      this.updateScoreList()
      this.displayScoreList()

      this._scoreButton.disabled = false
    })

    this._exitButton.addEventListener('click', e => {
      this.remove()
    })
  }

  /**
   * Generates equations based on random numbers
   *
   * @memberof CalculationGame
   */
  generateEquation () {
    // Generate random operands
    const firstRandomNum = Math.floor(Math.random() * 100) + 1
    const secondRandomNum = Math.floor(Math.random() * 10) + 1

    // Generate random operator & Calculate the correct solution for equation
    let randomOperator = ''

    const random = Math.floor(Math.random() * (3 - 1 + 1)) + 1

    switch (random) {
      case 1:
        randomOperator = '+'
        this._correctResult = firstRandomNum + secondRandomNum
        break

      case 2: randomOperator = '-'
        this._correctResult = firstRandomNum - secondRandomNum
        break

      case 3: randomOperator = '*'
        this._correctResult = firstRandomNum * secondRandomNum
        break
    }

    // Display randomly generated members of equation
    this._firstNumber.textContent = firstRandomNum
    this._operator.textContent = randomOperator
    this._secondNumber.textContent = secondRandomNum
  }

  /**
   * Checks user's solution
   *
   * @memberof CalculationGame
   */
  checkResults () {
    const userResult = parseInt(this._inputResult.value, 10)
    if (userResult === this._correctResult) {
      // Confirm the solution & update the score
      this._solutionStatus.style.backgroundColor = 'rgb(136, 177, 136)'
      this._solutionStatus.textContent = 'That was correct!'
      this._currentScore += 20

      // Add sound effects
      const correctSound = new window.Audio('./css/correct.mp3')
      correctSound.volume = 0.1
      correctSound.play()
    } else {
      // Inform about incorrect answer
      this._solutionStatus.style.backgroundColor = 'rgb(177, 176, 176)'
      this._solutionStatus.textContent = `Incorrect, the right answer was ${this._correctResult}`
    }
    // Clean the input field
    this._inputResult.value = ''
  }

  /**
   * Handles a timer for the game
   *
   * @memberof CalculationGame
   */
  setTimer () {
    // Display the timer
    this._timer.style.visibility = 'visible'

    // Set the timer to 10 seconds
    let remainingSeconds = 10

    // Start the timer
    this._currentTimer = setInterval(() => {
      // Display remaining seconds
      remainingSeconds -= 1
      this._timer.textContent = remainingSeconds

      // Count total seconds used in the game
      this._totalSeconds++

      // If the time has run out:
      if (remainingSeconds === 0) {
        clearInterval(this._currentTimer)
        this._timer.textContent = '!'
        this.generateEquation()

      // If the game was terminated:
      } else if (!this._gameIsOn) {
        clearInterval(this._currentTimer)
      }
    }, 1000)
  }

  /**
   * Clears up current game statistical information & Restarts the game
   *
   * @memberof CalculationGame
   */
  restartTheGame () {
    // Clear current statistical information
    clearInterval(this._currentTimer)
    this._currentTimer = ''
    this._totalSeconds = 0
    this._currentScore = 0
    this._totalScore = 0
    this._roundsCounter = 0
    this._gameIsOn = true

    // Clean up
    this._contentBlock.innerHTML = ''

    // Reappend refreshed game elements
    this._contentBlock.appendChild(this._gameSpace)

    this._gameStartButton.style.visibility = 'visible'
    this._submitButton.style.visibility = 'hidden'
    this._enterEventIsAllowed = false

    // Clean motivation container
    this._solutionStatus.textContent = ''
    this._solutionStatus.style.backgroundColor = 'whitesmoke'

    // Clear the equation container
    this._timer.textContent = ''
    this._firstNumber.textContent = '1'
    this._operator.textContent = '+'
    this._secondNumber.textContent = '1'
  }

  /**
   * Calculates score based on amount of correct answers and seconds spent on each
   *
   * @memberof CalculationGame
   */
  calculateScore () {
    this._totalScore = this._currentScore - this._totalSeconds
  }

  /**
   * Gracefully finishes the game
   * Calculates score and displays score information
   *
   * @memberof CalculationGame
   */
  finishGame () {
    // Clean up
    this._contentBlock.innerHTML = ''

    // Calculate score & Update global statistics
    this.calculateScore()
    this.updateScoreList()
    this.displayScoreList()
  }

  /**
   * Updates global top-players list from local storage
   *
   * @memberof CalculationGame
   */
  updateScoreList () {
    // Save current user score
    const currentNicknameScorePair = { name: this._nickname, score: this._totalScore }

    // Check if currrent user score qualifies for the list of 5 top-players
    const scoreStatistics = JSON.parse(window.localStorage.getItem('cg-top-players')) || []

    if (scoreStatistics.length >= 5) {
      for (let i = 0; i < scoreStatistics.length; i++) {
        if (this._totalScore > scoreStatistics[i].score) {
          scoreStatistics[i] = currentNicknameScorePair
          break
        }
      }
    } else {
      scoreStatistics.push(currentNicknameScorePair)
    }

    // Sort the top-player list in descending order
    scoreStatistics.sort((a, b) => {
      const current = a.score
      const next = b.score

      let comparison = 0
      if (current > next) {
        comparison = -1
      } else if (current < next) {
        comparison = 1
      }
      return comparison
    })

    // Reset updated top-players list to the the local storage
    window.localStorage.setItem('cg-top-players', JSON.stringify(scoreStatistics))
  }

  /**
   * Displays score list retrieved from local storage
   *
   * @memberof CalculationGame
   */
  displayScoreList () {
    // Clean up
    this._contentBlock.innerHTML = ''

    // Retrieve top-player list from the local storage
    const retrievedTopList = JSON.parse(window.localStorage.getItem('cg-top-players'))

    // Compile a table
    this._contentBlock.appendChild(scoreTableTemplate.content.cloneNode(true))
    const scoreTable = this._contentBlock.querySelector('#score-table')

    // Load top-players into a score-table
    for (let i = 0; i < retrievedTopList.length; i++) {
      scoreTable.innerHTML +=
      '<tr><td>' + retrievedTopList[i].name + '</td><td>' + retrievedTopList[i].score + '</td></tr>'
    }

    // Centralize the score-table
    scoreTable.style.margin = 'auto'
    scoreTable.style.marginTop = '50px'
  }
}

// Register 'calculation-game' custom element
window.customElements.define('calculation-game', CalculationGame)
