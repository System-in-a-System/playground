// Import superclass
import { WindowFrame } from './window-frame.js'

// Create a structural template for a custom element 'tic-toc'
const template = document.createElement('template')

template.innerHTML =
`
<div id="tictocBoard" style="background-color:rgb(189, 185, 185);">
  
  <div id="tictocPlayground"
    style="
      width: 166px; 
      height: 166px;
      padding: 1px;
      margin: 0 auto;
      margin-top: 15px;">

        <div id="topLeft" style="display: inline-block; height: 50px; width: 50px; border-style: solid; border-width: 0.3px; border-color: black; font-size: 18px; padding-top: 10px; text-align: center;">&nbsp;</div>
        <div id="topMiddle" style="display: inline-block; height: 50px; width: 50px; border-style: solid; border-width: 0.3px; border-color: black; font-size: 18px; padding-top: 10px; text-align: center;">&nbsp;</div>
        <div id="topRight" style="display: inline-block; height: 50px; width: 50px; border-style: solid; border-width: 0.3px; border-color: black; font-size: 18px; padding-top: 10px; text-align: center;">&nbsp;</div>

        <br>

        <div id="middleLeft" style="display: inline-block; height: 50px; width: 50px; border-style: solid; border-width: 0.3px; border-color: black; font-size: 18px; padding-top: 10px; text-align: center;">&nbsp;</div>
        <div id="middleMiddle" style="display: inline-block; height: 50px; width: 50px; border-style: solid; border-width: 0.3px; border-color: black; font-size: 18px; padding-top: 10px; text-align: center;">&nbsp;</div>
        <div id="middleRight" style="display: inline-block; height: 50px; width: 50px; border-style: solid; border-width: 0.3px; border-color: black; font-size: 18px; padding-top: 10px; text-align: center;">&nbsp;</div>

        <br>

        <div id="bottomLeft" style="display: inline-block; height: 50px; width: 50px; border-style: solid; border-width: 0.3px; border-color: black; font-size: 18px; padding-top: 10px; text-align: center;">&nbsp;</div>
        <div id="bottomMiddle" style="display: inline-block; height: 50px; width: 50px; border-style: solid; border-width: 0.3px; border-color: black; font-size: 18px; padding-top: 10px; text-align: center;">&nbsp;</div>
        <div id="bottomRight" style="display: inline-block; height: 50px; width: 50px; border-style: solid; border-width: 0.3px; border-color: black; font-size: 18px; padding-top: 10px; text-align: center;">&nbsp;</div>
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
    
    this._topLeft = this._contentBlock.querySelector('#topLeft')
    this._topMiddle = this._contentBlock.querySelector('#topMiddle')
    this._topRight = this._contentBlock.querySelector('#topRight')
    this._middleLeft = this._contentBlock.querySelector('#middleLeft')
    this._middleMiddle = this._contentBlock.querySelector('#middleMiddle')
    this._middleRight = this._contentBlock.querySelector('#middleRight')
    this._bottomLeft = this._contentBlock.querySelector('#bottomLeft')
    this._bottomMiddle = this._contentBlock.querySelector('#bottomMiddle')
    this._bottomRight = this._contentBlock.querySelector('#bottomRight')


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
      this._topLeft.textContent = this.makeAMove()
      this._topLeft.style.pointerEvents = 'none'

      this.checkForMatch()

      e.preventDefault()
    })

    this._topMiddle.addEventListener('click', e => {
      this._topMiddle.textContent = this.makeAMove()
      this._topMiddle.style.pointerEvents = 'none'

      this.checkForMatch()

      e.preventDefault()
    })

    this._topRight.addEventListener('click', e => {
      this._topRight.textContent = this.makeAMove()
      this._topRight.style.pointerEvents = 'none'

      this.checkForMatch()

      e.preventDefault()
    })

    this._middleLeft.addEventListener('click', e => {
      this._middleLeft.textContent = this.makeAMove()
      this._middleLeft.style.pointerEvents = 'none'

      this.checkForMatch()

      e.preventDefault()
    })

    this._middleMiddle.addEventListener('click', e => {
      this._middleMiddle.textContent = this.makeAMove()
      this._middleMiddle.style.pointerEvents = 'none'

      this.checkForMatch()

      e.preventDefault()
    })

    this._middleRight.addEventListener('click', e => {
      this._middleRight.textContent = this.makeAMove()
      this._middleRight.style.pointerEvents = 'none'

      this.checkForMatch()

      e.preventDefault()
    })
    
    this._bottomLeft.addEventListener('click', e => {
      this._bottomLeft.textContent = this.makeAMove()
      this._bottomLeft.style.pointerEvents = 'none'

      this.checkForMatch()

      e.preventDefault()
    })

    this._bottomMiddle.addEventListener('click', e => {
      this._bottomMiddle.textContent = this.makeAMove()
      this._bottomMiddle.style.pointerEvents = 'none'

      this.checkForMatch()

      e.preventDefault()
    })

    this._bottomRight.addEventListener('click', e => {
      this._bottomRight.textContent = this.makeAMove()
      this._bottomRight.style.pointerEvents = 'none'

      this.checkForMatch()

      e.preventDefault()
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
    let sign = ''

    if (this._cross) {
      sign = 'X'
      this._cross = false
    } else {
      sign = '0'
      this._cross = true
    }

    return sign
  }

  /** Checks if the preceding move made a match in some of the lines 
   * 
   * @memberof TicToc
  */
  checkForMatch() {

    // Matching horizontal lines
    if(this._topLeft.textContent === 'X' || this._topLeft.textContent === '0') {
        
      if(this._topLeft.textContent === this._topMiddle.textContent && this._topMiddle.textContent === this._topRight.textContent) {
        this._topLeft.style.backgroundColor = 'green'
        this._topMiddle.style.backgroundColor = 'green'
        this._topRight.style.backgroundColor = 'green'

        this.finishTheGame();
      }
    }

    if(this._middleLeft.textContent === 'X' || this._middleLeft.textContent === '0') {
      
      if(this._middleLeft.textContent === this._middleMiddle.textContent && this._middleMiddle.textContent === this._middleRight.textContent) {
        this._middleLeft.style.backgroundColor = 'green'
        this._middleMiddle.style.backgroundColor = 'green'
        this._middleRight.style.backgroundColor = 'green'

        this.finishTheGame();
      }
    }

    if(this._bottomLeft.textContent === 'X' || this._bottomLeft.textContent === '0') {
      
      if(this._bottomLeft.textContent === this._bottomMiddle.textContent && this._bottomMiddle.textContent === this._bottomRight.textContent) {
        this._bottomLeft.style.backgroundColor = 'green'
        this._bottomMiddle.style.backgroundColor = 'green'
        this._bottomRight.style.backgroundColor = 'green'

        this.finishTheGame();
      }
    }

    // Matching vertical lines
    if(this._topLeft.textContent === 'X' || this._topLeft.textContent === '0') {
      
      if(this._topLeft.textContent === this._middleLeft.textContent && this._middleLeft.textContent == this._bottomLeft.textContent) {
        this._topLeft.style.backgroundColor = 'green'
        this._middleLeft.style.backgroundColor = 'green'
        this._bottomLeft.style.backgroundColor = 'green'

        this.finishTheGame();
      }
    }

    if(this._topMiddle.textContent === 'X' || this._topMiddle.textContent === '0') {
      
      if(this._topMiddle.textContent === this._middleMiddle.textContent && this._middleMiddle.textContent == this._bottomMiddle.textContent) {
        this._topMiddle.style.backgroundColor = 'green'
        this._middleMiddle.style.backgroundColor = 'green'
        this._bottomMiddle.style.backgroundColor = 'green'

        this.finishTheGame();
      }
    }

    if(this._topRight.textContent === 'X' || this._topRight.textContent === '0') {
      
      if(this._topRight.textContent === this._middleRight.textContent && this._middleRight.textContent == this._bottomRight.textContent) {
        this._topRight.style.backgroundColor = 'green'
        this._middleRight.style.backgroundColor = 'green'
        this._bottomRight.style.backgroundColor = 'green'

        this.finishTheGame();
      }
    }
    
    // Matching diagonal lines
    if(this._middleMiddle.textContent === 'X' || this._middleMiddle.textContent === '0') {
      
      if(this._topLeft.textContent === this._middleMiddle.textContent && this._middleMiddle.textContent === this._bottomRight.textContent) {
        this._topLeft.style.backgroundColor = 'green'
        this._middleMiddle.style.backgroundColor = 'green'
        this._bottomRight.style.backgroundColor = 'green'

        this.finishTheGame();
      }

      if(this._topRight.textContent === this._middleMiddle.textContent && this._middleMiddle.textContent === this._bottomLeft.textContent) {
        this._topRight.style.backgroundColor = 'green'
        this._middleMiddle.style.backgroundColor = 'green'
        this._bottomLeft.style.backgroundColor = 'green'

        this.finishTheGame();
      }
    }
  }

  /**
   * Finishes the game gracefully
   *
   * @memberof TicToc
   */
  finishTheGame () {
    // Disable pointer events for the tic toc board
    this._tictocPlayground.style.pointerEvents = 'none'
  }
}

// Register 'tic-toc' custom element
window.customElements.define('tic-toc', TicToc)
