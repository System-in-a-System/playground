// Import superclass
import { WindowFrame } from './window-frame.js'

// Create a structural template for a custom element 'memory-board'
const template = document.createElement('template')

template.innerHTML =
`
<div id="gameSpace">
  
  <div id="board" tabindex="0" 
    style="
      width:fit-content; 
      height:fit-content;
      display: table; 
      margin: 0 auto;
      margin-top: 15px;
      background-color: white;
      border-style: solid;
      border-width: 0.5px;
      border-color: black;">
  </div>

  <div id="statistics" 
    style="
      margin-top: 5px;
      margin-left: 12px;
      margin-right: 50px;
      height: 50px;
      width: 200px;
      padding: 5px;">
        
        <div id="totalTries">Total tries: 0</div>
        <div id="totalTimer">Total sec  : 0</div>

  </div>
</div>
`

// Create a structural template for a custom element 'score-table'
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
 * Defines the functionality for 'memory-board' custom element
 * 'memory-board' custom element will serve as a playground for a simple memory game
 *
 * @class MemoryBoard
 * @extends {WindowFrame}
 */
class MemoryBoard extends WindowFrame {
  constructor () {
    super()

    // Deep clone 'memory-board' template & Append it to the 'content block' from the WindowFrame parent class
    this._contentBlock.appendChild(template.content.cloneNode(true))
    this._iconHolder.style.background = 'url(https://image.flaticon.com/icons/svg/882/882998.svg) no-repeat'
    this._appTitle.textContent = 'Memory Game'

    // Reference the structural parts of the appended 'memory-board' template
    this._gameSpace = this._contentBlock.querySelector('#gameSpace')
    this._board = this._contentBlock.querySelector('#board')
    this._statistics = this._contentBlock.querySelector('#statistics')
    this._totalTries = this._contentBlock.querySelector('#totalTries')
    this._totalTimer = this._contentBlock.querySelector('#totalTimer')

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

    // Generate pictures id set 'behind the bricks'
    this._pictureSet = this.generatePictureSet(4, 4)

    // Reference the proprevious, previous and current pictures
    this._propreviousPicture = 0
    this._previousPicture = 0
    this._currentPicture = 0

    // The array of indexes whose pictures id matched
    this._matchedPairs = []

    // The number of clicks (=tries) the user made to assemble the board & the derived score
    this._numberOfClicks = 0
    this._totalTime = 0
    this._currentTimer = ''
    this._score = 0

    // Retrieve the nickname from local storage or set it to default 'Unknown Hero'
    this._nickname = window.localStorage.getItem('nickname') || 'Unknown Hero'
  }

  /**
   * Called when connected to the DOM
   *
   * @memberof MemoryBoard
   */
  connectedCallback () {
    this.positionElement()

    this.displayBricks(4, 4)
    this.setTimer()

    // Control panel buttons are listening for events:
    this._newGameButton.addEventListener('click', e => {
      this.restartTheGame()
      this._scoreButton.disabled = false
    })

    this._scoreButton.addEventListener('click', e => {
      clearInterval(this._currentTimer)
      this._score = 0
      this.updateScoreList()
      this.displayScoreList()
      this._scoreButton.disabled = true
    })

    this._restartScoreButton.addEventListener('click', e => {
      clearInterval(this._currentTimer)
      window.localStorage.removeItem('mg-top-players')
      this._score = 0
      this.updateScoreList()
      this.displayScoreList()

      this._scoreButton.disabled = false
    })

    this.listenForDragging()

    this._frame.addEventListener('click', e => {
      this.refocusStack()
    })

    this._exitButton.addEventListener('click', e => {
      this.remove()
    })
  }

  /**
   * Displays game bricks & Attaches event listeners to them
   *
   * @param {*} columns
   * @param {*} rows
   * @memberof MemoryBoard
   */
  displayBricks (columns, rows) {
    for (let i = 0; i < columns * rows; i++) {
      // Display 16 bricks organised 4X4
      const image = document.createElement('img')
      image.setAttribute('src', 'image/0.png')
      image.setAttribute('alt', `${i}`)
      image.setAttribute('tabindex', `${i + 1}`)
      image.style.height = '54px'

      this._board.appendChild(image)

      if ((i + 1) % 4 === 0) {
        this._board.appendChild(document.createElement('br'))
      }

      // Each brick listens for a click event
      image.addEventListener('click', e => {
        // Update number of clicks
        this._numberOfClicks++
        this._totalTries.textContent = `Total tries: ${this._numberOfClicks}`

        // Locate image position (index) in an array
        const imagePosition = i

        // Update pictures status
        this._propropreviousPicture = this._propreviousPicture
        this._propreviousPicture = this._previousPicture
        this._previousPicture = this._currentPicture
        this._currentPicture = this._pictureSet[imagePosition]

        // Turn over the brick & Remove pointer events (to prevent double clicking)
        image.setAttribute('src', `image/${this._currentPicture}.png`)
        image.style.pointerEvents = 'none'

        // Add sound effects
        const turnSound = new window.Audio('./css/turn.mp3')
        turnSound.volume = 0.1
        turnSound.play()

        // Check the current pair for matching
        this.checkForMatching()

        // If all pairs are matched, finish the game
        if (this._matchedPairs.length === 16) {
          this.finishTheGame()
        }
        e.preventDefault()
      })

      // Each brick listens for an enter keypress event (when focused with tab)
      image.addEventListener('keypress', e => {
        if (e.keyCode === 13) {
          // Update number of clicks
          this._numberOfClicks++

          // Locate image position (index) in an array
          const imagePosition = i

          // Update pictures status
          this._propropreviousPicture = this._propreviousPicture
          this._propreviousPicture = this._previousPicture
          this._previousPicture = this._currentPicture
          this._currentPicture = this._pictureSet[imagePosition]

          // Turn over the brick & Remove pointer events (to prevent double clicking)
          image.setAttribute('src', `image/${this._currentPicture}.png`)
          image.style.pointerEvents = 'none'

          // Add sound effects
          const turnSound = new window.Audio('./css/turn.mp3')
          turnSound.volume = 0.1
          turnSound.play()

          // Check the current pair for matching
          this.checkForMatching()

          // If all pairs are matched, finish the game
          if (this._matchedPairs.length === 16) {
            this.finishTheGame()
          }

          e.preventDefault()
        }
      })
    }
  }

  /**
 * Generates an array of shuffled pictures id
 *
 * @param {*} columns
 * @param {*} rows
 * @returns
 * @memberof MemoryBoard
 */
  generatePictureSet (columns, rows) {
    const pictureArray = []

    // Generate an array of pictures id
    for (let i = 1; i <= (columns * rows) / 2; i++) {
      pictureArray.push(i)
      pictureArray.push(i)
    }

    // Shuffle an array of pictures id
    for (let i = 0; i < pictureArray.length - 1; i++) {
      const randomIndex1 = Math.floor(Math.random() * pictureArray.length)
      const randomIndex2 = Math.floor(Math.random() * pictureArray.length)

      const pictureToShuffle = pictureArray[randomIndex1]
      pictureArray[randomIndex1] = pictureArray[randomIndex2]
      pictureArray[randomIndex2] = pictureToShuffle
    }

    return pictureArray
  }

  /**
   * Timer handler
   *
   * @memberof MemoryBoard
   */
  setTimer () {
    // Start the timer
    this._currentTimer = setInterval(() => {
      // Display total seconds
      this._totalTime++
      this._totalTimer.textContent = `Total sec : ${this._totalTime}`
    }, 1000)
  }

  /**
   * Checks pictures id for matching
   * Registers the match
   * Turns over unmatched pictures
   *
   * @memberof MemoryBoard
   */
  checkForMatching () {
    if (this._currentPicture === this._previousPicture) {
      this.registerMatch(this._currentPicture, this._previousPicture)
    }
    this.hidePicture(this._propropreviousPicture)
    this.hidePicture(this._propreviousPicture)
  }

  /**
   * Registers matched pictures id by pushing their indexes into a separate array
   *
   * @param {*} firstMatch
   * @param {*} secondMatch
   * @memberof MemoryBoard
   */
  registerMatch (firstMatch, secondMatch) {
    const index1 = this._pictureSet.indexOf(firstMatch)
    const index2 = this._pictureSet.lastIndexOf(secondMatch)

    if (!this._matchedPairs.includes(index1)) {
      this._matchedPairs.push(index1)
    }

    if (!this._matchedPairs.includes(index2)) {
      this._matchedPairs.push(index2)
    }

    // Add sound effects
    // const sound = new window.Audio('./css/match.mp3')
    // sound.volume = 0.1
    // sound.play()
  }

  /**
   * Hides unmatched pictures & Activates pointer events for them
   *
   * @param {*} picture
   * @memberof MemoryBoard
   */
  hidePicture (picture) {
    const imagePosition = this._pictureSet.indexOf(picture)
    const imagePosition2 = this._pictureSet.lastIndexOf(picture)

    // Check if the pictures are not registered as a matched pair
    let reservedMatch = false

    for (let i = 0; i < this._matchedPairs.length; i++) {
      if (this._matchedPairs[i] === imagePosition || this._matchedPairs[i] === imagePosition2) {
        reservedMatch = true
      }
    }

    if (imagePosition !== -1 && !reservedMatch) {
      // Turn back the pictures and reactivate their pointer events
      this._board.querySelectorAll('img')[imagePosition].setAttribute('src', 'image/0.png')
      this._board.querySelectorAll('img')[imagePosition].style.pointerEvents = 'auto'

      this._board.querySelectorAll('img')[imagePosition2].setAttribute('src', 'image/0.png')
      this._board.querySelectorAll('img')[imagePosition2].style.pointerEvents = 'auto'
    }
  }

  /**
   * Clears up current game statistical information & Restarts the game
   *
   * @memberof MemoryBoard
   */
  restartTheGame () {
    // Clear current statistical information
    clearInterval(this._currentTimer)
    this._matchedPairs = []
    this._totalTime = 0
    this._numberOfClicks = 0

    // Clear the content block
    this._contentBlock.innerHTML = ''
    this._board.innerHTML = ''

    // Reappend the board & statistical block
    this._contentBlock.appendChild(this._gameSpace)
    this._gameSpace.appendChild(this._statistics)
    this._board.style.pointerEvents = 'auto'

    // Generate a new pictures id set 'behind the bricks'
    this._pictureSet = this.generatePictureSet(4, 4)

    // Repopulate the board & Reset the timer
    this.displayBricks(4, 4)
    this.setTimer()

    // Reset statistics
    this._totalTimer.textContent = `Total sec : ${this._totalTime}`
    this._totalTries.textContent = `Total tries : ${this._numberOfClicks}`
  }

  /**
   * Finishes the game gracefully
   * Calculates and outputs score
   * Offers an access to the global scorelist
   *
   * @memberof MemoryBoard
   */
  finishTheGame () {
    // Disable pointer events for the game board
    this._board.style.pointerEvents = 'none'

    // Clear interval
    clearInterval(this._currentTimer)

    // Clear space for further score information
    this._statistics.remove()

    if (this._gameSpace.querySelectorAll('div').length > 0) {
      return
    }

    // Announce the end of the game
    const gameIsOverAnnouncement = document.createElement('div')
    gameIsOverAnnouncement.textContent = 'All pairs are matched!'
    gameIsOverAnnouncement.style.marginTop = '5px'
    gameIsOverAnnouncement.style.marginBottom = '2px'
    gameIsOverAnnouncement.style.marginLeft = '50px'
    this._contentBlock.appendChild(gameIsOverAnnouncement)

    // Caclulate & Output score
    this.calculateScore()
    const scoreAnnouncement = document.createElement('div')
    scoreAnnouncement.textContent = `Your score is ${this._score}!`
    scoreAnnouncement.style.marginBottom = '2px'
    scoreAnnouncement.style.marginLeft = '55px'
    this._contentBlock.appendChild(scoreAnnouncement)

    // Provide the button to access the score list
    const scoreListButton = document.createElement('button')
    scoreListButton.textContent = 'Display Scorelist'
    scoreListButton.style.marginLeft = '55px'
    scoreListButton.style.backgroundColor = 'rgb(225, 241, 203)'
    this._contentBlock.appendChild(scoreListButton)

    scoreListButton.addEventListener('click', e => {
      // Update & Display score list from Local Storage
      scoreListButton.remove()
      this.updateScoreList()
      this.displayScoreList()
    })
  }

  /**
   * Calculates score based on the number of clicks used during the game
   *
   * @memberof MemoryBoard
   */
  calculateScore () {
    this._score = Math.floor(32 / this._numberOfClicks * 100)
  }

  /**
   * Updates global score list
   *
   * @memberof MemoryBoard
   */
  updateScoreList () {
    // Save current user score
    const currentNicknameScorePair = { name: this._nickname, score: this._score }

    // Check if currrent user score qualifies for the list of 5 top-players
    const scoreStatistics = JSON.parse(window.localStorage.getItem('mg-top-players')) || []

    if (scoreStatistics.length >= 5) {
      for (let i = 0; i < scoreStatistics.length; i++) {
        if (this._score > scoreStatistics[i].score) {
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
    window.localStorage.setItem('mg-top-players', JSON.stringify(scoreStatistics))
  }

  /**
   * Displays score list
   *
   * @memberof MemoryBoard
   */
  displayScoreList () {
    // Clean up
    this._board.innerHTML = ''
    this._contentBlock.innerHTML = ''

    // Retrieve top-player list from the local storage
    const retrievedTopList = JSON.parse(window.localStorage.getItem('mg-top-players'))

    // Compile a table
    this._contentBlock.appendChild(scoreTableTemplate.content.cloneNode(true))
    const scoreTable = this._contentBlock.querySelector('#score-table')

    // Load top-players into a score-table
    for (let i = 0; i < retrievedTopList.length; i++) {
      scoreTable.innerHTML +=
      '<tr><td>' + retrievedTopList[i].name + '</td><td>' + retrievedTopList[i].score + '</td></tr>'
    }

    // Centralize the score-table
    this._contentBlock.style.padding = '10px'
    scoreTable.style.margin = 'auto'
    scoreTable.style.marginTop = '50px'
  }
}

// Register 'memory-board' custom element
window.customElements.define('memory-board', MemoryBoard)
