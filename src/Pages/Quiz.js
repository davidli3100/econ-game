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

  const submitAnswer = (answerID) => {
    // set ui states
    setSubmittingOption(answerID);
    setSubmitting(true);

    // store to global answer db
    // refer to the questions/questionID/answers/answerID/count - increment value
    firebase
      .database()
      .ref(`/questions/${questionID}/answers/${answerID}/`)
      .transaction((answer) => {
        if (answer) {
          if (answer.count) {
            answer.count++;
          } else {
            answer.count = 0;
          }
        }
        return answer;
      })
      .catch((err) => {
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
        setToasts({ text: "Something went wrong, try again. "})
        setSubmitting(false);
        setSubmittingOption(null);
        console.error(err);
      });
    firebase
      .database()
      .ref(`/users/${firebase.auth().currentUser.email.split("@")[0]}`)
      .transaction((user) => {
        return user;
      })
      .catch((err) => {
        setToasts({ text: "Something went wrong, try again. "})
        setSubmitting(false);
        setSubmittingOption(null);
        console.error(err);
      });

    setSubmittingOption("")
    setToasts({ text: "Your answer was submitted" });
    setTimeout(() => {
      // navigate
    }, 3000);
  };

  useEffect(() => {
    firebase
      .database()
      .ref(`/questions/${questionID}`)
      .once("value", (snapshot) => {
        console.log(snapshot.val());
        setQuestion(snapshot.val());
        setAnswerIDs(Object.keys(snapshot.val().answers));
        setLoading(false);
      });
  }, [questionID]);
  console.log(question);
  return (
    <div className="quiz-container">
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
                  onClick={() => submitAnswer(answerID)}
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
