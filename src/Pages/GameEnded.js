import React, { useEffect, useState } from "react";
import firebase from "firebase";
import { Card, Text } from "@geist-ui/react";

const GameEnded = () => {
  const [user, setUser] = useState({score: 0, cash: 0});

  useEffect(() => {
    const username = firebase.auth().currentUser.email.split("@")[0];
    firebase.database().ref(`/users/${username}`).on("value", (snapshot) => {
      setUser(snapshot.val());
    })
  }, []);

  return (
    <div
      style={{ maxWidth: "500px", margin: "auto" }}
      className="game-ended-page"
    >
      <Text h3>
        <Text h2 i>
          Game Over <br />
        </Text>
        Here's how you tallied up:
      </Text>
      <Card hoverable style={{ marginTop: "32px" }}>
        <Text h3>
          {user.score.toFixed(0)}{"  "}
          <Text type="secondary" style={{ display: "inline" }}>
            Societal Score
          </Text>
        </Text>
        {user.score > 0 ? (
          <Text>
            This means that through your self-motivated interests and decisions,
            you were able to make a net positive impact on society!
          </Text>
        ) : (
          <Text>
          This means that through your self-motivated interests and decisions,
          you might've chosen a few shady routes. While those routes did present an opportunity to make money, the risk to yourself and society
          was factored into the cost. You've been a net negative impact on society!
        </Text>
        )}
      </Card>
      <Card hoverable style={{ marginTop: "40px" }}>
        <Text h3>
          ${user.cash.toFixed(2)}{"  "}
          <Text type="secondary" style={{ display: "inline" }}>
            Final Cash Balance
          </Text>
        </Text>
        {user.score > 0 ? (
          <Text>
            Good job! You were able to maximize the amount of money you earned in this simulation. Did your conscience feel good while doing so?
            Did you feel like you fulfilled your own moral values?
          </Text>
        ) : (
          <Text>
          Ouch, you ended up losing money. Maybe you made a few rash decisions. Did you feel good about making those decisions? Like you were
          taking the high road, or potentially making more money? Probably not.
        </Text>
        )}
      </Card>
    </div>
  );
};

export default GameEnded;
