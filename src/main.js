import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import firebase from "firebase/app";
//import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBf2uJy2XtNPJ_vFEUXBKrF6SOrdbtVbU8",
  authDomain: "iot-light-solution.firebaseapp.com",
  projectId: "iot-light-solution",
  databaseURL: "https://iot-light-solution-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "iot-light-solution.appspot.com",
  messagingSenderId: "1016870159273",
  appId: "1:1016870159273:web:d907fcb6897184fc7ebab8",
  measurementId: "G-FFZ73SKFV1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

createApp(App).use(router).mount('#app');