import firebase from "firebase/compat/app";
import {
  Admin,
  Resource,
  ListGuesser,
  EditGuesser,
  ShowGuesser,
} from "react-admin";
import { Layout } from "../Layout";
import { dataProvider } from "../dataProvider";
// import { authProvider } from "./authProvider";
import { FirebaseAuthProvider } from "react-admin-firebase";
import CustomLoginPage from "./CustomLoginPage";

import firebaseConfig from "../firebase-auth.json"

const firebaseApp = firebase.initializeApp(firebaseConfig);

const authProvider = FirebaseAuthProvider(firebaseConfig, {})

export const AdminPage = () => (
  <Admin
    layout={Layout}
    loginPage={CustomLoginPage}
    dataProvider={dataProvider}
    authProvider={authProvider}
    // basename="/admin/"
  >
    <Resource
      name="posts"
      list={ListGuesser}
      edit={EditGuesser}
      show={ShowGuesser}
    />
    <Resource
      name="comments"
      list={ListGuesser}
      edit={EditGuesser}
      show={ShowGuesser}
    />
    <Resource
      name="users"
      list={ListGuesser}
      edit={EditGuesser}
      show={ShowGuesser}
    />
  </Admin>
);
