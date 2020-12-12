import {
  Button,
  CssBaseline,
  GeistProvider,
  Loading,
  Text
} from "@geist-ui/react";
import firebase from "firebase";
import { useEffect, useState } from "react";
import Quiz from "./Pages/Quiz";
import "./App.css";
import { setUser } from "./utils/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDN_i9crnVUhgOak4rGRCpAkrFtfWHWJh0",
  authDomain: "the-invisible-hand-933c9.firebaseapp.com",
  databaseURL: "https://the-invisible-hand-933c9-default-rtdb.firebaseio.com",
  projectId: "the-invisible-hand-933c9",
  storageBucket: "the-invisible-hand-933c9.appspot.com",
  messagingSenderId: "1063063138020",
  appId: "1:1063063138020:web:61cc687531fbc2682f06f1",
};

firebase.initializeApp(firebaseConfig);

function App() {
  const database = firebase.database();
  const gameRef = database.ref("game");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [gameStatus, setGameStatus] = useState("waiting");
  const [questionID, setQuestionID] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gameRef.on("value", (snapshot) => {
      console.log(snapshot.val());
      setGameStatus(snapshot.val().status || "waiting");
      setQuestionID(snapshot.val().activeQuestion);
      setLoading(false);
    });
  }, [gameRef]);

  const AuthProvider = new firebase.auth.GoogleAuthProvider();
  AuthProvider.setCustomParameters({
    login_hint: "000000@pdsb.net",
    hd: "pdsb.net",
  });

  const authenticate = () => {
    setIsSigningIn(true)
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(() => {
      firebase.auth().signInWithPopup(AuthProvider).then(res => {
        firebase.database().ref(`/users/${res.user.email.split("@")[0]}`).set({score: 0, cash: 1000});
        setUser(res.user)
      });
    });
  }

  useEffect(() => {
    const unregisterAuthObserver = firebase
      .auth()
      .onAuthStateChanged((user) => {
        setIsSignedIn(!!user);
      });
    return () => unregisterAuthObserver();
  }, []);

  if (!isSignedIn) {
    return (
      <GeistProvider theme={{ type: "dark" }}>
        <CssBaseline />
        <Button
          type="secondary"
          ghost
          loading={isSigningIn}
          onClick={authenticate}
        >
          Login
        </Button>
      </GeistProvider>
    );
  }

  return (
    <GeistProvider theme={{ type: "dark" }}>
      <CssBaseline />
      <div className="App">
        {console.log(gameStatus)}
        {loading ? (
          <Loading />
        ) : (
          {
            /* todo: redirect to waiting if user has answered question already */
            waiting: <Text h2> Waiting for game to start...</Text>,
            question: <Quiz questionID={questionID} />,
            gameEnded: <Text h2>Game Ended</Text>,
            nextQuestion: <Text h2>Waiting for the next question...</Text>
          }[gameStatus] || <Text h1>Something went wrong</Text>
        )}
      </div>
    </GeistProvider>
  );
}

export default App;
