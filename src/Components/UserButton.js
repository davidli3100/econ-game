import React from "react";
import firebase from "firebase";
import { ButtonDropdown } from "@geist-ui/react";
import { getUser, logout } from "../utils/auth";

const UserButton = () => (
  <ButtonDropdown>
    <ButtonDropdown.Item main>{getUser().displayName}</ButtonDropdown.Item>
    <ButtonDropdown.Item onClick={() => logout(firebase)}>
      Log out
    </ButtonDropdown.Item>
  </ButtonDropdown>
);

export default UserButton
