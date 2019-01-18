// var app_fireBase = {};

(function(){
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
    // const firebase = require("firebase"); // probably really need these
  // require("firebase/firestore");

  // Initialize Cloud Firestore through Firebase
  var db = firebase.firestore();
  // Disable deprecated features
  db.settings({
    timestampsInSnapshots: true
  });

})()