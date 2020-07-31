// Create a structural template for a custom element 'login-field'
const loginTemplate = document.createElement('template')

loginTemplate.innerHTML =
`
<div id="login" 
  style="
    z-index: 100;
    position: absolute;
    width: 80%;
    background-color: rgb(230, 231, 231);
    border: solid black 1px;
    border-radius: 5px;
    margin-left: 10px;
    margin-top: 70px;
    padding: 3px;
    text-align: center">

  <label id="label" for = "nickname">Hello, Stranger!<br>Enter your nickname:</label>
  <input id="nickname" type="text"/>
  
  <button id="submit-button" 
    style=  
      "background-color: rgb(0, 128, 107); 
      border: solid black 1px;
      border-radius: 5px;
      margin: 7px;

      text-align: center;
      color: black;
      font-size: 13px;
      padding: 6px;"
  >Enter</button> 

</div>
`

/**
 * Defines the functionality for 'login-field' custom element
 * Login-field' custom element will serve as a container for retrievement user nickname information
 *
 * @class LoginField
 * @extends {window.HTMLElement}
 */
class LoginField extends window.HTMLElement {
  constructor () {
    super()

    // Create a shadow root for the custom element
    this.attachShadow({ mode: 'open' })

    // Clone the login-field template & Append it to the shadow root
    this.shadowRoot.appendChild(loginTemplate.content.cloneNode(true))

    // Reference the structural parts of the appended 'login-field' template
    this._loginBlock = this.shadowRoot.querySelector('#login')
    this._nicknameField = this.shadowRoot.querySelector('#nickname')

    // Properties to hold user nickname & the status of its validation
    this._nicknameIsValid = false
    this._nickname = ''
  }

  /**
   * Called when connected to the DOM
   *
   * @memberof LoginField
   */
  connectedCallback () {
    // Send nickname data by button click
    this.shadowRoot.querySelector('#submit-button').addEventListener('click', e => {
      // Submit name
      this.submitName()

      // If nickname is valid, dispatch respective event & clean up
      if (this._nicknameIsValid) {
        const event = new window.CustomEvent('nicknameValid', {
          bubbles: true,
          detail: { text: () => this._nicknameField.value }
        })

        document.dispatchEvent(event)

        // Clean up
        this.cleanUp()
      }
    })

    // Send nickname data by 'enter' press
    this._nicknameField.addEventListener('keypress', e => {
      if (e.keyCode === 13) {
        // Submit name
        this.submitName()

        // If nickname is valid, dispatch respective event & clean up
        if (this._nicknameIsValid) {
          const event = new window.CustomEvent('nicknameValid', {
            bubbles: true,
            detail: { text: () => this._nicknameField.value }
          })

          document.dispatchEvent(event)

          // Clean up
          this.cleanUp()
        }
      }
    })
  }

  /**
   * Method to retrieve user nickname and check it for validity
   *
   * @memberof LoginField
   */
  submitName () {
    if (this._nicknameField.value.length > 0) {
      this._nicknameIsValid = true
      this._nickname = this._nicknameField.value
      window.localStorage.setItem('nickname', this._nickname)
    } else {
      this._loginBlock.querySelector('#label').innerText = 'Do not leave the field blank!'
    }
  }

  /**
   * Method to clean up the current shadow root
   *
   * @memberof LoginField
   */
  cleanUp () {
    this.remove()
  }
}

// Register 'login-field' custom element
window.customElements.define('login-field', LoginField)
