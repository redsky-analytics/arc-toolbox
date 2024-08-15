import firebase from "firebase/compat/app";
import {
  Admin,
  Resource,
  ListGuesser,
  EditGuesser,
  ShowGuesser,
  CustomRoutes,
  useAuthState,
} from "react-admin";
import { AppLayout } from "../layout/AppLayout";
import { dataProvider } from "../dataProvider";
// import { authProvider } from "./authProvider";
import { FirebaseAuthProvider } from "react-admin-firebase";
import {Route} from "react-router-dom"

import CustomLoginPage from "./CustomLoginPage";

import firebaseConfig from "../firebase-auth.json"
import { DocsPage } from "./DocsPage";

const firebaseApp = firebase.initializeApp(firebaseConfig);

const authProvider = FirebaseAuthProvider(firebaseConfig, {})

firebaseApp.auth().onAuthStateChanged((user) => {
  if (user) {
     console.log("logged in", user)
  } else {
    console.log("logged out")
  }
})  
export const AdminPage = () => {
  // const { isPending, authenticated } = useAuthState();
  // console.log(authenticated)
  return <Admin
    layout={AppLayout}
    loginPage={CustomLoginPage}
    dataProvider={dataProvider}
    authProvider={authProvider}
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
    <CustomRoutes>
      <Route path="/docs" element={<DocsPage />}></Route>
    </CustomRoutes>
  </Admin>
};
