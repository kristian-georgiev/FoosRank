var mainApp = {};
var firebase = app_fireBase;
var db = firebase.firestore();


(function(){
var uid = null // TODO: I don't think this is needed?    
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            var booleans_ref = db.collection("booleans_current_game").doc("booleans"); // DB aliases
            var players_ref = db.collection("players_current_game").doc("players")
    
            var yellow_1_btn = document.getElementById("yellow_1");
            var yellow_2_btn = document.getElementById("yellow_2");
            var black_1_btn = document.getElementById("black_1");
            var black_2_btn = document.getElementById("black_2");

            var start_btn = document.getElementById("start")
    
            yellow_1_btn.onclick = function() {
                players_ref.update({
                    yellow_1: user.uid,
                });    
            };

            yellow_2_btn.onclick = function() {
                players_ref.update({
                    yellow_2: user.uid,
                });    
            };

            black_1_btn.onclick = function() {
                players_ref.update({
                    black_1: user.uid,
                });    
            };

            black_2_btn.onclick = function() {
                players_ref.update({
                    black_2: user.uid,
                });    
            };

            start_btn.onclick = function() {
                console.log("Go crazy!")
            }


        }else{
            // redirect to login page
            uid = null;
            window.location.replace("login.html");
        }
    });

    function logOut(){
        firebase.auth().signOut();
    }

    mainApp.logOut = logOut;
})()