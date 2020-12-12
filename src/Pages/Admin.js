import { Button, ButtonGroup, Card, Dot, Modal, Text, useToasts } from "@geist-ui/react";
import React, { useEffect, useState } from "react";
import firebase from "firebase";

const Stat = ({ label, stat }) => (
  <Card hoverable>
    <Text h3 size="2rem">
      {stat}
    </Text>
    <p>{label}</p>
  </Card>
);

const incrementQuestion = ({step = 1, min = 1, max = 5, setToasts}) => {
  // firebase transaction stuff here
  firebase
    .database()
    .ref('/game/activeQuestion')
    .transaction((currentQuestionID) => {
      let questionNumber = parseInt(currentQuestionID[1]);
      questionNumber += step;

      if (questionNumber < min) {
        setToasts({ text: "asdfasd" });
        questionNumber = min
      } else if (questionNumber > max) {
        setToasts({ text: "asfsdaf" });
        questionNumber = max;
      }

      return `q${questionNumber}`;
    })
    .catch((err) => {
      console.error(err);
    });
}

const setStatus = (status) => {
  firebase
    .database()
    .ref('/game/status')
    .transaction(() => {
      return status
    })
    .catch((err) => {
      console.error(err);
    });
}

const StartGameModal = ({modalOpen, setModalOpen}) => {
  const close = () => {
    setModalOpen(false);
  }

  return (
    <Modal open={modalOpen} onClose={close}>
      <Modal.Title>Start Game</Modal.Title>
      <Modal.Content style={{ textAlign: "center" }}>Starting the game will clear all previous game data</Modal.Content>
      <Modal.Action passive onClick={close}>Cancel</Modal.Action>
      <Modal.Action className="danger-modal-button" onClick={() => startGame(setModalOpen)}>Start Game</Modal.Action>
    </Modal>
  )
}

const startGame = (setModalOpen) => {
  // Reset firebase shit
  firebase.database().ref('/answers').transaction(() => {
    return null;
  }).catch((err) => {
    console.error(err);
  });
  firebase.database().ref('/users').transaction(() => {
    return null;
  }).catch((err) => {
    console.error(err);
  });
  // set status to question
  setModalOpen(false)
  setStatus("question");
}

const Admin = () => {
  const [numUsers, setNumUsers] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [toasts, setToasts] = useToasts();
  useEffect(() => {
    // grab # of users
    firebase
      .database()
      .ref("users")
      .on("value", (snapshot) => {
        if (snapshot.val()) {
          setNumUsers(Object.keys(snapshot.val()).length);
        }
      });
  }, []);

  return (
    <>
      <Text h2>
        Admin Page <Dot className="admin-dot-indicator">{numUsers} Users</Dot>
      </Text>
      <div className="admin-content">
        <div className="admin-quickstats">
          <Stat stat="+89" label="Societal Score" />
          <Stat stat="$3004" label="Average Cash" />
        </div>
        <div className="admin-quiz-buttons">
          <ButtonGroup>
            <Button onClick={() => setStatus("waiting")}>Waiting</Button>
            <Button onClick={() => setModalOpen(true)}>Start Game</Button>
            <Button onClick={() => setStatus("question")}>Resume Game</Button>
            <Button onClick={() => setStatus("gameEnded")}>End Game</Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button onClick={() => incrementQuestion({step: -1, setToasts: setToasts})} >Previous Question</Button>
            <Button onClick={() => incrementQuestion({setToasts: setToasts})}>Next Question</Button>
          </ButtonGroup>
        </div>
      </div>
      <StartGameModal modalOpen={modalOpen} setModalOpen={setModalOpen} />
    </>
  );
};

export default Admin;
