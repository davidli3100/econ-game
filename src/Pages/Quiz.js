import React, { useEffect, useState } from "react";
import firebase from "firebase";
import {
  Breadcrumbs,
  Button,
  Card,
  Loading,
  Text,
  useToasts,
} from "@geist-ui/react";
import { getUser, logout } from "../utils/auth";
import UserButton from "../Components/UserButton";

const Quiz = ({ questionID, setGameStatus }) => {
  console.log(questionID);
  const [toasts, setToasts] = useToasts();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [answerIDs, setAnswerIDs] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittingOption, setSubmittingOption] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [submittingError, setSubmittingError] = useState(false)

  const submitAnswer = (answerID, cash, score) => {
    // set ui states
    setSubmittingOption(answerID);
    setSubmitting(true);

    // store to global answer db
    // refer to the questions/questionID/answers/answerID/count - increment value
    firebase
      .database()
      .ref(`/answers/${questionID}/${answerID}`)
      .transaction((answer) => {
        return answer + 1;
      })
      .catch((err) => {
        setSubmittingError(true)
        setSubmitting(false);
        setSubmittingOption(null);
        console.error(err);
      });

    // store to user db
    // users/student#/questions/questionID/ - push full answer
    firebase
      .database()
      .ref(
        `/users/${
          firebase.auth().currentUser.email.split("@")[0]
        }/questions/${questionID}`
      )
      .set(answerID)
      .catch((err) => {
        setSubmittingError(true)
        setToasts({ text: "Something went wrong, try again. "})
        setSubmitting(false);
        setSubmittingOption(null);
        console.error(err);
      });
    firebase
      .database()
      .ref(`/users/${firebase.auth().currentUser.email.split("@")[0]}`)
      .transaction((user) => {
        if (user && !isNaN(user.score) && !isNaN(user.cash)) {
          // who tf at google thought running the function before the data loaded was a good idea

          // console.log("foo");
          console.log(user);
          // let score = user.score

          user.score = user.score + (score || 0);
          user.cash = user.cash + (cash || 0);
        }
        return user;
      })
      .catch((err) => {
        setSubmittingError(true)
        setToasts({ text: "Something went wrong, try again. "})
        setSubmitting(false);
        setSubmittingOption(null);
        console.error(err);
      });

    setSubmittingOption("")
    if (!submittingError) {
      setToasts({ text: "Your answer was submitted" });
    }
    setTimeout(() => {
      // navigate
      setWaiting(true);
    }, 1500);
  };

  useEffect(() => {
    firebase
      .database()
      .ref(`/questions/${questionID}`)
      .once("value", (snapshot) => {
        setQuestion(snapshot.val());
        setAnswerIDs(Object.keys(snapshot.val().answers));
        setLoading(false);
      });
  }, [questionID]);

  if (waiting) {
    return (
      <Loading className="loading" size="large">Waiting for everyone else to catch up</Loading>
    )
  }

  return (
    <div>
      <div className="quiz-header">
        <Breadcrumbs className="quiz-breadcrumbs">
          <Breadcrumbs.Item href="#">The Invisible Hand</Breadcrumbs.Item>
          <Breadcrumbs.Item href="#">Questions</Breadcrumbs.Item>
          <Breadcrumbs.Item className="question-breadcrumb">
            {questionID}
          </Breadcrumbs.Item>
        </Breadcrumbs>
        <UserButton />
      </div>
      <Card shadow className="question-card">
        {loading ? (
          <Loading />
        ) : (
          <>
            <Text h3>{question.title}</Text>
            <div className="button-grid">
              {answerIDs.map((answerID) => (
                <Button
                  loading={submittingOption === answerID}
                  disabled={submitting}
                  key={answerID}
                  size="large"
                  auto
                  onClick={() => submitAnswer(answerID, question.answers[answerID].cash, question.answers[answerID].score)}
                >
                  {question.answers[answerID].title}
                </Button>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default Quiz;
