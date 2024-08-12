import firebase from "firebase/compat/app";
import {
  Admin,
  Resource,
  ListGuesser,
  EditGuesser,
  ShowGuesser,
} from "react-admin";
import { Layout } from "./Layout";
import { dataProvider } from "./dataProvider";
// import { authProvider } from "./authProvider";
import { FirebaseAuthProvider } from "react-admin-firebase";
import CustomLoginPage from "./pages/CustomLoginPage";

const firebaseConfig = {
  apiKey: "AIzaSyA7opW4O_fum2z98Y_1p3sFdeFuQ7ajiSI",
  authDomain: "untangler-97276.firebaseapp.com",
  projectId: "untangler-97276",
  storageBucket: "untangler-97276.appspot.com",
  messagingSenderId: "980270888352",
  appId: "1:980270888352:web:0e5996973c58c462f7e0c5"
};
const firebaseApp = firebase.initializeApp(firebaseConfig);



const authProvider = FirebaseAuthProvider(firebaseConfig, {})

export const App = () => (
  <Admin
    layout={Layout}
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
  </Admin>
);
