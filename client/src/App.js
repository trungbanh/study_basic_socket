import React, { useEffect, useState } from 'react'
import { w3cwebsocket as W3CWebSocket } from 'websocket'
import Identicon from '@polkadot/react-identicon'
import { Button, Navbar, NavbarBrand, UncontrolledTooltip } from 'reactstrap'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
const client = new W3CWebSocket('ws://127.0.0.1:8080')

const contentDefaultMessage = 'Start writing your document here'

const App = () => {
  const [userInfo, setUserInfo] = useState({
    currentUsers: [],
    userActivity: [],
    username: null,
    text: '',
    isLog: false,
  })

  const [message, setMessage] = useState()

  useEffect(() => {
    client.onopen = () => {
      console.log('WebSocket Client Connected')
    }

    client.onmessage = (message) => {
      const dataFromServer = message.data
      const stateToChange = {}

      if (dataFromServer.type === 'userevent') {
        stateToChange.currentUsers = Object.values(dataFromServer.data.users)
      } else if (dataFromServer.type === 'contentchange') {
        console.log(
          'dataFromServer.data.editorContent  :>> ',
          dataFromServer.data.editorContent,
        )
        stateToChange.text =
          dataFromServer.data.editorContent || contentDefaultMessage
      }
      // stateToChange.userActivity = dataFromServer.data.userActivity
      setUserInfo({
        ...userInfo,
        stateToChange,
      })
    }
  }, [userInfo])

  useEffect(() => {
    // await state update
    client.send(
      JSON.stringify({
        username: userInfo.username,
        type: 'userevent',
      }),
    )
  }, [userInfo.isLog])

  const logInUser = () => {
    const username = userInfo.username

    console.log('username :>> ', username)
    setUserInfo({
      ...userInfo,
      username,
      isLog: true,
    })
  }

  /* When content changes, we send the
  current content of the editor to the server. */
  const onEditorStateChange = (event) => {
    setMessage({
      ...message,
      message: event.target.value,
    })
  }

  const showLoginSection = () => (
    <div className="account">
      <div className="account__wrapper">
        <div className="account__card">
          <div className="account__profile">
            <Identicon
              className="account__avatar"
              size={64}
              string="randomness"
            />
            <p className="account__name">Hello, user!</p>
            <p className="account__sub">Join to edit the document</p>
          </div>
          <input
            key="login"
            name="username"
            onChange={(event) => {
              setUserInfo({
                ...userInfo,
                username: event.target.value,
              })
            }}
            className="form-control"
          />
          <button
            type="button"
            onClick={logInUser}
            className="btn btn-primary account__btn"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  )

  const pushMessage = (event) => {
    client.send(
      JSON.stringify({
        type: 'contentchange',
        username: userInfo.username,
        content: message,
      }),
    )
  }

  const showEditorSection = () => (
    <div className="main-content">
      <div className="document-holder">
        <div className="currentusers">
          {userInfo.currentUsers.map((user) => (
            <React.Fragment>
              <span id={user.username} className="userInfo" key={user.username}>
                <Identicon
                  className="account__avatar"
                  style={{ backgroundColor: user.randomcolor }}
                  size={40}
                  string={user.username}
                />
              </span>
              <UncontrolledTooltip placement="top" target={user.username}>
                {user.username}
              </UncontrolledTooltip>
            </React.Fragment>
          ))}
        </div>
        <input
          key="message"
          className="body-editor"
          text={userInfo.text}
          onChange={onEditorStateChange}
        />
      </div>
      <div className="history-holder">
        <ul>
          {userInfo.userActivity.map((activity, index) => (
            <li key={`activity-${index}`}>{activity}</li>
          ))}
        </ul>
      </div>
    </div>
  )

  return (
    <React.Fragment>
      <Navbar color="light" light>
        <NavbarBrand href="/">Real-time document editor</NavbarBrand>
      </Navbar>
      <div className="container-fluid">
        {userInfo.isLog && userInfo.username
          ? showEditorSection()
          : showLoginSection()}
      </div>
      <Button onClick={pushMessage}>send</Button>
    </React.Fragment>
  )
}

export default App
