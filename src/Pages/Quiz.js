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
  const [submitting, setSubmitting] = useState(false);
  const [submittingOption, setSubmittingOption] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [submittingError, setSubmittingError] = useState(false);

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
        setSubmittingError(true);
        setSubmitting(false);
        setSubmittingOption(null);
        console.error(err);
      });

    firebase
      .database()
      .ref(`/answers/score`)
      .transaction((globalScore) => {
        return globalScore + (score || 0);
      })
      .catch((err) => {
        setSubmittingError(true);
        setSubmitting(false);
        setSubmittingOption(null);
        console.error(err);
      });

    firebase
      .database()
      .ref(`/answers/cash`)
      .transaction((globalCash) => {
        return globalCash + (cash || 0);
      })
      .catch((err) => {
        setSubmittingError(true);
        setSubmitting(false);
        setSubmittingOption(null);
        console.error(err);
      });

    // store to user db
    // users/student#/questions/questionID/ - push full answer
    // This code is shit and @jhthenerd should feel bad. Too Bad!
    firebase
      .database()
      .ref(
        `/users/${
          firebase.auth().currentUser.email.split("@")[0]
        }/questions/${questionID}`
      )
      .transaction(() => {
        return answerID;
      })
      .catch((err) => {
        setSubmittingError(true);
        setToasts({ text: "Something went wrong, try again. " });
        setSubmitting(false);
        setSubmittingOption(null);
        console.error(err);
      });
    firebase
      .database()
      .ref(`/users/${firebase.auth().currentUser.email.split("@")[0]}/cash`)
      .transaction((userCash) => {
        return userCash + (cash || 0);
      })
      .catch((err) => {
        setSubmittingError(true);
        setToasts({ text: "Something went wrong, try again. " });
        setSubmitting(false);
        setSubmittingOption(null);
        console.error(err);
      });
    firebase
      .database()
      .ref(`/users/${firebase.auth().currentUser.email.split("@")[0]}/score`)
      .transaction((scoreCash) => {
        return scoreCash + (score || 0);
      })
      .catch((err) => {
        setSubmittingError(true);
        setToasts({ text: "Something went wrong, try again. " });
        setSubmitting(false);
        setSubmittingOption(null);
        console.error(err);
      });

    setSubmittingOption("");
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
        console.log(snapshot.val().answers)
        const question = snapshot.val()
        setQuestion(question);
        setWaiting(false);
        setSubmitting(false);
        setSubmittingOption("");
        setSubmittingError(false);
        setLoading(false);
      });
  }, [questionID]);

  if (waiting) {
    return (
      <Loading className="loading" size="large">
        Waiting for everyone else to catch up
      </Loading>
    );
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
              {Object.keys(question.answers).map((answerID) => (
                <Button
                  loading={submittingOption === answerID}
                  disabled={submitting}
                  key={answerID}
                  size="large"
                  className="quiz-button"
                  onClick={() =>
                    submitAnswer(
                      answerID,
                      question.answers[answerID].cash,
                      question.answers[answerID].score
                    )
                  }
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
