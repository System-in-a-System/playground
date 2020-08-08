// Import superclass
import { WindowFrame } from './window-frame.js'

// Create a structural template for a custom element 'tic-toc'
const template = document.createElement('template')

template.innerHTML =
`
<div id="tictocBoard">
  
  <div id="tictocPlayground" tabindex="0" 
    style="
      width:fit-content; 
      height:fit-content;
      margin: 0 auto;
      margin-top: 15px;
      background-color: white;
      border-style: solid;
      border-width: 0.5px;
      border-color: black;">

        <div id="topLeft" style="display: inline-block; height: 50px; width: 50px; border-style: solid; border-width: 0.3px; border-color: black;"></div>
        <div id="topMiddle" style="display: inline-block; height: 50px; width: 50px; border-style: solid; border-width: 0.3px; border-color: black;"></div>
        <div id="topRight" style="display: inline-block; height: 50px; width: 50px; border-style: solid; border-width: 0.3px; border-color: black;"></div>

        <br>

        <div id="middleLeft" style="display: inline-block; height: 50px; width: 50px; border-style: solid; border-width: 0.3px; border-color: black;"></div>
        <div id="middleMiddle" style="display: inline-block; height: 50px; width: 50px; border-style: solid; border-width: 0.3px; border-color: black;"></div>
        <div id="middleRight" style="display: inline-block; height: 50px; width: 50px; border-style: solid; border-width: 0.3px; border-color: black;"></div>

        <br>

        <div id="bottomLeft" style="display: inline-block; height: 50px; width: 50px; border-style: solid; border-width: 0.3px; border-color: black;"></div>
        <div id="bottomMiddle" style="display: inline-block; height: 50px; width: 50px; border-style: solid; border-width: 0.3px; border-color: black;"></div>
        <div id="bottomRight" style="display: inline-block; height: 50px; width: 50px; border-style: solid; border-width: 0.3px; border-color: black;"></div>
  </div>


  <div id="tictocStatistics" 
    style="
      margin-top: 5px;
      margin-left: 12px;
      margin-right: 50px;
      height: 50px;
      width: 200px;
      padding: 5px;">


  </div>
</div>
`


/**
 * Defines the functionality for 'tic-toc' custom element
 * 'tic-toc' custom element will serve as a playground for a simple tic toc game
 *
 * @class TicToc
 * @extends {WindowFrame}
 */
export class TicToc extends WindowFrame {
  constructor () {
    super()

    // Deep clone 'tic-toc' template & Append it to the 'content block' from the WindowFrame parent class
    this._contentBlock.appendChild(template.content.cloneNode(true))
    
    // Title the current window accordingly
    this._iconHolder.style.background = 'url(https://image.flaticon.com/icons/svg/3274/3274051.svg) no-repeat' 
    this._appTitle.textContent = 'Tic Toc'

    // Reference the structural parts of the appended 'tic-toc' template
    this._tictocBoard = this._contentBlock.querySelector('#tictocBoard')

    this._tictocPlayground = this._contentBlock.querySelector('#tictocPlayground')
    
    this._topLeft = this._contentBlock.querySelector('#topLeft');
    this._topMiddle = this._contentBlock.querySelector('#topMiddle');
    this._topRight = this._contentBlock.querySelector('#topRight');
    this._middleLeft = this._contentBlock.querySelector('#middleLeft');
    this._middleMiddle = this._contentBlock.querySelector('#middleMiddle');
    this._middleRight = this._contentBlock.querySelector('#middleRight');
    this._bottomLeft = this._contentBlock.querySelector('#bottomLeft');
    this._bottomMiddle = this._contentBlock.querySelector('#bottomMiddle');
    this._bottomRight = this._contentBlock.querySelector('#bottomRight');

    this._statistics = this._contentBlock.querySelector('#tictocStatistics')

    // Generate buttons
    this._newGameButton = document.createElement('button')
    this._newGameButton.textContent = 'New Game'
    this._newGameButton.style.margin = '1px'
    this._newGameButton.style.marginRight = '2px'
    this._newGameButton.style.marginLeft = '2px'

    this._controlPanel.appendChild(this._newGameButton)
 

    // Retrieve the nickname from local storage or set it to default 'Unknown Hero'
    this._nickname = window.localStorage.getItem('nickname') || 'Unknown Hero'

    // Set starting figure to a cross
    this._cross = true;
  }

  /**
   * Called when connected to the DOM
   *
   * @memberof TicToc
   */
  connectedCallback () {
    this.positionElement()

    // Squares are listening for events
    this._topLeft.addEventListener('click', e => {
      this.makeAMove()
    })


    // Control panel buttons are listening for events:
    this._newGameButton.addEventListener('click', e => {
      this.restartTheGame()
    })


    // Window frame is listening for refocusing & dragging & canceling
    this.listenForDragging()

    this._frame.addEventListener('click', e => {
      this.refocusStack()
    })

    this._exitButton.addEventListener('click', e => {
      this.remove()
    })
  }
  
  /**
   * Makes a move
   * 
   * @memberof TicToc
   */
  makeAMove () {
    if (this._cross) {
      this.textContent = 'X'
      this._cross = false
    } else {
      this.textContent = '0'
      this._cross = true
    }
  }


  /**
   * Clears up current game statistical information & Restarts the game
   *
   * @memberof TicToc
   */
  restartTheGame () {
    this._tictocPlayground.querySelectorAll('div').textContent = ''
    this._statistics.textContent = ''
  }

  /**
   * Finishes the game gracefully
   *
   * @memberof TicToc
   */
  finishTheGame () {
    // Disable pointer events for the tic toc board
    this._tictocPlayground.style.pointerEvents = 'none'

    // Announce the end of the game
    this._statistics.textContent = 'Game is over'
  }
}

// Register 'tic-toc' custom element
window.customElements.define('tic-toc', TicToc)
