var app_fireBase = {};

// Initialize Firebase
var config = {
  apiKey: "AIzaSyAoyb8gVM28FrDsuCvKZ4AC5k3CI1rrKmg",
  authDomain: "foosrank-9e12f.firebaseapp.com",
  databaseURL: "https://foosrank-9e12f.firebaseio.com",
  projectId: "foosrank-9e12f",
  storageBucket: "foosrank-9e12f.appspot.com",
  messagingSenderId: "267376943062"
};
firebase.initializeApp(config);
app_fireBase = firebase;
// const firebase = require("firebase"); // probably really need these
// require("firebase/firestore");

// Initialize Cloud Firestore through Firebase
const db = firebase.firestore();
db.settings({ timestampsInSnapshots: true });