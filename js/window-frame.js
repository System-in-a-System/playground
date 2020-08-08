// Import global loaded applications counter
import { windowCounter } from './app.js'

// Create a structural template for a custom element 'window-frame'
const template = document.createElement('template')

template.innerHTML =
`
<div id="frame"
  style="
    position: absolute;
    opacity: 0.99;

    height: 373px;
    width: 260px;

    margin-top: 22px;
    
    border: solid;
    border-width: 6px;
    border-color: rgb(128, 125, 125);
    border-radius: 3px;
    
    background-color: whitesmoke;">
    
      <div id="upper_panel" style="height: 25px; background-color: rgb(128, 125, 125);">
        <span id="icon_holder" style="float: left; width: 20px; height: 20px;"></span>
        <p id="app_title" style="display: inline;"></p>
        <button id="exit_button" style="display: inline; float: right;">X</button>
    </div>

    <div id="control_panel" style="height: 23px; background-color: rgb(214, 210, 210);"></div> 
            
    <div class="content_block"></div>
</div>
`

// Declare priority number to handle multiple window-frames display priority
let priorityNumber = 0

/**
 * Defines the functionality for 'window-frame' custom element
 * 'window-frame' custom element will serve as a basic frame for applications
 *
 * @class WindowFrame
 * @extends {window.HTMLElement}
 */
export class WindowFrame extends window.HTMLElement {
  constructor () {
    super()

    // Create a shadow root for the custom element
    this.attachShadow({ mode: 'open' })

    // Deep clone 'window-frame' template & Append it to the shadow root
    this.shadowRoot.appendChild(template.content.cloneNode(true))

    // Reference the structural parts of the appended 'window-frame' template
    this._frame = this.shadowRoot.querySelector('#frame')

    this._panel = this.shadowRoot.querySelector('#upper_panel')
    this._appTitle = this.shadowRoot.querySelector('#app_title')
    this._iconHolder = this.shadowRoot.querySelector('#icon_holder')
    this._exitButton = this.shadowRoot.querySelector('#exit_button')

    this._controlPanel = this.shadowRoot.querySelector('#control_panel')

    this._contentBlock = this.shadowRoot.querySelector('.content_block')

    // Set a priority number for display priority
    priorityNumber++
    this._frame.style.zIndex = priorityNumber
  }

  /**
   * Called when connected to the DOM
   *
   * @memberof WindowFrame
   */
  connectedCallback () {
    this.positionElement()

    this.listenForDragging()

    this._frame.addEventListener('click', e => {
      this.refocusStack()
    })

    this._exitButton.addEventListener('click', e => {
      this.remove()
    })
  }

  /**
   * Position element by upload following stacking order
   *
   * @memberof WindowFrame
   */
  positionElement () {
    const count = windowCounter

    if (count < 20) {
      this._frame.style.left = count * 15 + 'px'
      this._frame.style.top = count * 15 + 'px'
    } else if (count >= 20 && count < 38) {
      this._frame.style.left = count * 15 + 'px'
      this._frame.style.bottom = (count - 20) * 15 + 'px'
    } else if (count >= 38 && count < 56) {
      this._frame.style.left = count * 15 + 'px'
      this._frame.style.top = (count - 38) * 15 + 'px'
    } else if (count >= 56 && count < 75) {
      this._frame.style.left = count * 15 + 'px'
      this._frame.style.bottom = (count - 56) * 15 + 'px'
    } else if (count >= 75 && count < 85) {
      this._frame.style.left = count * 15 + 'px'
      this._frame.style.top = (count - 74) * 15 + 'px'
    }
  }

  /**
   * Refocuses elements
   *
   * @memberof WindowFrame
   */
  refocusStack () {
    priorityNumber++
    this._frame.style.zIndex = priorityNumber
  }

  /**
   * Handles drop&move
   *
   * @memberof WindowFrame
   */
  listenForDragging () {
    let offset = [0, 0]
    let mouseIsDown = false

    this._frame.addEventListener('mousedown', e => {
      mouseIsDown = true
      this.refocusStack()
      offset = [this._frame.offsetLeft - e.clientX, this._frame.offsetTop - e.clientY]
    })

    document.addEventListener('mouseup', e => {
      mouseIsDown = false
    })

    document.addEventListener('mousemove', e => {
      if (mouseIsDown) {
        this._frame.style.left = (e.clientX + offset[0]) + 'px'
        this._frame.style.top = (e.clientY + offset[0]) + 'px'
      }
    })
  }

  /**
   * Set observed attributes
   * @readonly
   * @static
   * @memberof WindowFrame
   */
  static get observedAttributes () {
    return ['left', 'top', 'z-index']
  }

  /**
   * Handles attribute change
   * @param {String} name
   * @param {String} oldValue
   * @param {String} newValue
   * @memberof WindowFrame
   */
  attributeChangedCallback (name, oldValue, newValue) {
    console.log(`Change "${name}" from "${oldValue}" to "${newValue}"`)

    if (this[name] !== newValue) {
      this[name] = newValue
    }

    switch (name) {
      case 'left':
        this._frame.style.left = newValue + 'px'
        break

      case 'top':
        this._frame.style.top = newValue + 'px'
        break

      case 'z-index':
        this._frame.style.top = newValue
    }
  }
}

// Register 'window-frame' custom element
window.customElements.define('window-frame', WindowFrame)
