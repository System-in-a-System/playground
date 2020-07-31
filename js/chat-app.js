// Import superclass
import { WindowFrame } from './window-frame.js'

// Import login-field custom element
import './login-field.js'

// Create a structural template for a custom element 'chat-app'
const template = document.createElement('template')

template.innerHTML =
`
<div id="chat" style="position: relative;">
  <div id = "storedMessages" style = "height: 295px; width: 100%; overflow-y: scroll; opacity: 0.9;"></div>
  
  <div id = "newMessagePanel" style = "display: flex; height: 29px; background-color: grey; padding: 3px;">

    <textarea id = "writingMessageArea" style = "height: 20px; width: 160px; resize: none; display:inline-block;"></textarea>
    <button id = "emojiMenuButton" style = "height: 26px; width: 25px; padding: 0px; display:inline-block">🙂</button> 
    <button id = "sendButton" style = "height: 26px; display:inline-block;">Send</button>

  </div>
</div>
`

// Create a structural template for a message container
const messageTemplate = document.createElement('template')

messageTemplate.innerHTML =
`
<div class = "message" style="margin: 2px; padding: 2px;">
  <div class = "authorLine">
    
    <p class = "timeStamp" 
      style="
        display: inline; 
        float: right; 
        margin: 1px; 
        background-color: rgb(206, 226, 180); 
        font-size: 10px;">
    </p> 

    <p class = "author" style="margin: 1px; background-color: rgb(206, 226, 180);"></p>
  </div>
  
  <p class = "text" style="margin: 1px;"></p>
</div>
`
/**
 *  Defines functionality for 'chat-app' custom element
 * 'chat-app' custom element will serve as a medium for communication
 *
 * @class ChatApp
 * @extends {WindowFrame}
 */
class ChatApp extends WindowFrame {
  constructor () {
    super()

    // Deep clone 'chat-app' template & Append it to the 'content block' from the WindowFrame parent class
    this._contentBlock.appendChild(template.content.cloneNode(true))
    this._iconHolder.style.background = 'url(https://image.flaticon.com/icons/svg/567/567805.svg) no-repeat'
    this._appTitle.textContent = 'Chat'

    // Reference the structural parts of the appended 'chat-app' template
    this._chat = this._contentBlock.querySelector('#chat')

    this._storedMessagesContainer = this._contentBlock.querySelector('#storedMessages')

    this._newMessagePanel = this._contentBlock.querySelector('#newMessagePanel')
    this._textArea = this._contentBlock.querySelector('#writingMessageArea')
    this._emojiButton = this._contentBlock.querySelector('#emojiMenuButton')
    this._sendButton = this._contentBlock.querySelector('#sendButton')

    // Emoji menu switcher
    this._emojiMenuOn = false

    // Set initial socket value to null
    this.socket = null

    // Retrieve nickname information from local storage
    this._nickname = window.localStorage.getItem('nickname')
  }

  /**
   * Called when connected to the DON
   *
   * @memberof ChatApp
   */
  connectedCallback () {
    this.positionElement()

    this.listenForDragging()

    this._frame.addEventListener('click', e => {
      this.refocusStack()
    })

    // If no nickname has been retrieved from local storage, ask for user nickname
    if (!this._nickname) {
      this.askForNickname()
    }

    // If there has not yet been established web socket connection, establish it
    if (!this.socket || !this.socket.username) {
      this.connect()
    }

    // Opens & closes emoji menu
    this._emojiButton.addEventListener('click', e => {
      if (!this._emojiMenuOn) {
        // Append emoji menu
        const emojiMenu = document.createElement('div')
        this._chat.appendChild(emojiMenu)
        emojiMenu.style.backgroundColor = 'grey'
        emojiMenu.style.height = '100px'
        emojiMenu.style.marginTop = '0px'

        // Populate the menu with emojis (emojis are taken from https://emojipedia.org/)
        const emojiArray = [0x1F642, 0x1F60A, 0x1F61B, 0x1F60B, 0x1F607, 0x1F601, 0x1F603, 0x1F60E, 0x1F440,
          0x1F633, 0x1F625, 0x1F614, 0x1F622, 0x1F630, 0x1F631, 0x1F628, 0x1F626, 0x1F610, 0x1F615, 0x1F616,
          0x1F635, 0x1F612, 0x1F623, 0x1F620, 0x1F62B, 0x1F624, 0x1F47F, 0x1F608, 0x1F383, 0x1F47D, 0x1F47E,
          0x1F47B, 0x1F577, 0x1F435, 0x1F436, 0x1F431, 0x1F434, 0x1F437, 0x1F418, 0x1F42D, 0x1F43B, 0x1F43C,
          0x1F43E, 0x1F414, 0x1F426, 0x1F438, 0x1F422, 0x1F40B, 0x1F41F, 0x1F419, 0x1F41A, 0x1F40C, 0x1F490,
          0x1F338, 0x1F4AE, 0x1F339, 0x1F33A, 0x1F33B, 0x1F332, 0x1F333]

        for (let i = 0; i < emojiArray.length; i++) {
          const emoji = document.createElement('p')
          emoji.style.display = 'inline'
          emoji.style.margin = '0.2px'
          emoji.innerText = String.fromCodePoint(emojiArray[i])
          emojiMenu.appendChild(emoji)

          // Attribute event listeners to each emoji
          emoji.addEventListener('click', e => {
            this._textArea.value += emoji.innerText
          })
        }
        this._emojiMenuOn = true
      } else {
        // Closes emojis menu
        this._chat.lastElementChild.remove()
        this._emojiMenuOn = false
      }
    })

    // Messages are being sent by 'enter' keypress
    this._chat.addEventListener('keypress', e => {
      if (e.keyCode === 13) {
        if (e.target.value) {
          this.sendMessage(e.target.value)
          e.target.value = ''
          e.preventDefault()
        }
      }
    })

    // Messages are being sent by button click
    this._sendButton.addEventListener('click', e => {
      this.sendMessage(this._textArea.value)
      this._textArea.value = ''
      e.preventDefault()
    })

    // Listen for new messages to arrive
    this.socket.addEventListener('message', e => {
      const recievedMessage = JSON.parse(e.data)
      // If recieved messages are not of type 'heartbeat'...
      if (recievedMessage.type !== 'heartbeat') {
        // Print them out
        const messageToPrint = JSON.parse(e.data)
        this.printMessage(messageToPrint)

        // Put a channel stamp
        this._controlPanel.textContent = `You are currently listening to ${recievedMessage.channel}`
        this._controlPanel.style.fontSize = '11px'
        this._controlPanel.style.overflow = 'hidden'

        // Add sound effects for newly printed message
        const newMessageSound = new window.Audio('./css/newmsg.mp3')
        newMessageSound.volume = 0.1
        newMessageSound.play()
      }
    })

    this._exitButton.addEventListener('click', e => {
      this.remove()
      this.socket.close()
    })
  }

  /**
   * Asks user for a nickname
   * Involves 'login-field' custom element
   *
   * @memberof ChatApp
   */
  askForNickname () {
    const currentLoginField = document.createElement('login-field')
    this._storedMessagesContainer.appendChild(currentLoginField)
  }

  /**
   * Connects to a web socket
   *
   * @memberof ChatApp
   */
  connect () {
    this.socket = new window.WebSocket('ws://vhost3.lnu.se:20080/socket/')
  }

  /**
   * Sends messages through a web socket
   *
   * @param {*} messageToSend
   * @memberof ChatApp
   */
  sendMessage (messageToSend) {
    const data = {
      type: 'message',
      data: messageToSend,
      username: `${window.localStorage.getItem('nickname')}`,
      channel: 'Rambler channel',
      key: 'eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd'
    }

    this.socket.send(JSON.stringify(data))
  }

  /**
   * Prints messages recieved from the server
   *
   * @param {*} messageToPrint
   * @memberof ChatApp
   */
  printMessage (messageToPrint) {
    // Append a message template
    this._storedMessagesContainer.appendChild(messageTemplate.content.cloneNode(true))

    // Reference structural elements of the appended message template
    const currentMessageContainer = this._storedMessagesContainer.querySelectorAll('.message')[0]
    const authorContainer = currentMessageContainer.querySelectorAll('.author')[0]
    const timeStamp = currentMessageContainer.querySelectorAll('.timeStamp')[0]
    const textContainer = currentMessageContainer.querySelectorAll('.text')[0]

    // Populate the message 'container' with respective text
    const date = new Date()
    const day = date.toLocaleDateString().substring(0, 6)
    const time = date.toLocaleTimeString()
    timeStamp.textContent = `${day} at ${time}`

    authorContainer.textContent = `👤 ${messageToPrint.username}`
    textContainer.textContent = messageToPrint.data

    // Append message container & scroll down to it
    this._storedMessagesContainer.appendChild(currentMessageContainer)
    this._storedMessagesContainer.lastChild.scrollIntoView(false)

    // Limit the number of recieved and printed messages
    const allMessages = this._storedMessagesContainer.querySelectorAll('.message')
    const numberOfMessages = allMessages.length

    if (numberOfMessages > 50) {
      this._storedMessagesContainer.querySelectorAll('.message')[0].remove()
    }
  }
}

// Register 'chat-app' custom element
window.customElements.define('chat-app', ChatApp)
