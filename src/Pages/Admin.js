import {
  Button,
  ButtonGroup,
  Card,
  Dot,
  Modal,
  Text,
  useToasts,
  Table,
} from "@geist-ui/react";
import { ChevronLeft, ChevronRight } from "@geist-ui/react-icons";
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

const incrementAnswers = ({
  step = 1,
  currentAnswer,
  max,
  min,
  setToasts,
  setAnswer,
}) => {
  let questionNumber = currentAnswer;
  questionNumber += step;

  if (questionNumber < min) {
    setToasts({ text: "You can't go backwards any more!" });
    questionNumber = min;
  } else if (questionNumber > max) {
    setToasts({ text: "You can't go forwards any more!" });
    questionNumber = max;
  }

  setAnswer(questionNumber);
};

const incrementQuestion = ({ step = 1, min = 1, max = 5, setToasts }) => {
  // firebase transaction stuff here
  firebase
    .database()
    .ref("/game/activeQuestion")
    .transaction((currentQuestionID) => {
      let questionNumber = parseInt(currentQuestionID[1]);
      questionNumber += step;

      if (questionNumber < min) {
        setToasts({ text: "You can't go backwards any more!" });
        questionNumber = min;
      } else if (questionNumber > max) {
        setToasts({ text: "You can't go forwards any more!" });
        questionNumber = max;
      }

      return `q${questionNumber}`;
    })
    .catch((err) => {
      console.error(err);
    });
};

const setStatus = (status) => {
  firebase
    .database()
    .ref("/game/status")
    .transaction(() => {
      return status;
    })
    .catch((err) => {
      console.error(err);
    });
};

const StartGameModal = ({ modalOpen, setModalOpen }) => {
  const close = () => {
    setModalOpen(false);
  };

  return (
    <Modal open={modalOpen} onClose={close}>
      <Modal.Title>Start Game</Modal.Title>
      <Modal.Content style={{ textAlign: "center" }}>
        Starting the game will clear all previous game data
      </Modal.Content>
      <Modal.Action passive onClick={close}>
        Cancel
      </Modal.Action>
      <Modal.Action
        className="danger-modal-button"
        onClick={() => startGame(setModalOpen)}
      >
        Start Game
      </Modal.Action>
    </Modal>
  );
};

const startGame = (setModalOpen) => {
  // Reset firebase shit
  firebase
    .database()
    .ref("/answers")
    .transaction(() => {
      return null;
    })
    .catch((err) => {
      console.error(err);
    });
  firebase
    .database()
    .ref("/users")
    .transaction(() => {
      return null;
    })
    .catch((err) => {
      console.error(err);
    });
  // set status to question
  setModalOpen(false);
  setStatus("question");
};

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [numUsers, setNumUsers] = useState(0);
  const [questions, setQuestions] = useState({});
  const [activeAnswer, setActiveAnswer] = useState(0);
  const [answers, setAnswers] = useState({});
  const [stats, setStats] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [toasts, setToasts] = useToasts();
  const [game, setGame] = useState({});
  useEffect(() => {
    // grab # of users
    firebase
      .database()
      .ref("users")
      .on("value", (snapshot) => {
        if (snapshot.val()) {
          setUsers(
            Object.keys(snapshot.val()).map((key) => {
              return { ...snapshot.val()[key], user: key };
            })
          );
          setNumUsers(Object.keys(snapshot.val()).length);
        }
      });

    firebase
      .database()
      .ref("game")
      .on("value", (snapshot) => {
        if (snapshot.val()) {
          setGame(snapshot.val());
        }
      });

    // grab all questions
    firebase
      .database()
      .ref("questions")
      .once("value", (snapshot) => {
        let questions = snapshot.val();
        setQuestions(snapshot.val());
        firebase
          .database()
          .ref("answers")
          .on("value", (snapshot2) => {
            // setAnswers(snapshot2.val());
            let tempAnswers = snapshot2.val();
            const answers = [];
            Object.keys(tempAnswers).forEach((questionID) => {
              if (questionID !== "cash" && questionID !== "score") {
                const answer = [];
                console.log(questionID);
                Object.keys(tempAnswers[questionID]).forEach((answerID) => {
                  console.log(answerID);
                  answer.push({
                    answer: questions[questionID].answers[answerID].title,
                    count: tempAnswers[questionID][answerID],
                  });
                });
                answers.push(answer);
              }
            });
            setAnswers(answers);
            setStats(tempAnswers);
          });
      });

    // grab answers
  }, []);
  return (
    <>
      <Text h2>
        Admin Page <Dot className="admin-dot-indicator">{numUsers} Users</Dot>
      </Text>
      <div className="admin-content">
        <div className="admin-quickstats">
          <Stat stat={stats.score / numUsers} label="Societal Score" />
          <Stat
            stat={`$${(stats.cash / numUsers).toFixed(2)}`}
            label="Average Cash"
          />
          <Stat
            stat={{ question: game.activeQuestion }[game.status] || "-"}
            label={
              {
                question: "Active Question",
                waiting: "Waiting for Game to Start",
                gameEnded: "Game Ended",
              }[game.status]
            }
          />
        </div>
        <div className="admin-quiz-buttons">
          <ButtonGroup>
            <Button onClick={() => setStatus("waiting")}>Waiting</Button>
            <Button onClick={() => setModalOpen(true)}>Start Game</Button>
            <Button onClick={() => setStatus("question")}>Resume Game</Button>
            <Button onClick={() => setStatus("gameEnded")}>End Game</Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button
              onClick={() =>
                incrementQuestion({ step: -1, setToasts: setToasts })
              }
            >
              Previous Question
            </Button>
            <Button onClick={() => incrementQuestion({ setToasts: setToasts })}>
              Next Question
            </Button>
          </ButtonGroup>
        </div>
        <div className="admin-table">
          <Text h3>Users</Text>
          <Table hover emptyText="0" data={users}>
            <Table.Column prop="user" label="User" />
            <Table.Column prop="cash" label="Cash" />
            <Table.Column prop="score" label="Score" />
          </Table>
        </div>
        <div className="admin-table">
          <div className="questions-table-title">
            <Text h3>Q{activeAnswer + 1}</Text>
            <ButtonGroup className="questions-table-title-buttons" size="mini">
              <Button
                onClick={() =>
                  incrementAnswers({
                    step: -1,
                    currentAnswer: activeAnswer,
                    max: answers.length,
                    min: 0,
                    setToasts: setToasts,
                    setAnswer: setActiveAnswer,
                  })
                }
                iconRight={<ChevronLeft />}
              />
              <Button
                onClick={() =>
                  incrementAnswers({
                    currentAnswer: activeAnswer,
                    max: answers.length-1,
                    min: 0,
                    setToasts: setToasts,
                    setAnswer: setActiveAnswer,
                  })
                }
                iconRight={<ChevronRight />}
              />
            </ButtonGroup>
          </div>
          <Table hover emptyText="0" data={answers[activeAnswer]}>
            <Table.Column prop="answer" label="Option" />
            <Table.Column prop="count" label="Answers" />
          </Table>
        </div>
      </div>
      <StartGameModal modalOpen={modalOpen} setModalOpen={setModalOpen} />
    </>
  );
};

export default Admin;
