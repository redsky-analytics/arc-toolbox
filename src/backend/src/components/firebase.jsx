import { initializeApp } from "firebase/app";
const app = initializeApp()

fetch('auth-config')
  .then(response => response.json())
  .then((jsonData) => {
    // jsonData is parsed json object received from url
    console.log(jsonData)
    initializeApp(jsonData['result']);

  })
  .catch((error) => {
    // handle your errors here
    console.error(error)
  })

export default app;