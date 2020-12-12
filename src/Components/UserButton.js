import React from "react";
import firebase from "firebase";
import { ButtonDropdown } from "@geist-ui/react";
import { getUser, isAdmin, logout } from "../utils/auth";
import { useHistory } from "react-router-dom";

const UserButton = () => {
  let history = useHistory();

  const redirectToAdmin = () => {
    history.push("/admin");
  };

  return (
    <ButtonDropdown>
      <ButtonDropdown.Item main>{getUser().displayName}</ButtonDropdown.Item>
      <ButtonDropdown.Item onClick={() => logout(firebase)}>
        Log out
      </ButtonDropdown.Item>
      {isAdmin() && (
        <ButtonDropdown.Item onClick={redirectToAdmin}>
          Admin
        </ButtonDropdown.Item>
      )}
    </ButtonDropdown>
  );
};

export default UserButton;
