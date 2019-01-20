var mainApp = {};
var firebase = app_fireBase;
const db = firebase.firestore();
db.settings({ timestampsInSnapshots: true });


(function(){
var uid = null // TODO: I don't think this is needed?    
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            const scores_ref = db.collection("score_current_game").doc("scores"); // DB aliases
            const booleans_ref = db.collection("booleans_current_game").doc("booleans");    
            const players_ref = db.collection("players_current_game")
    
            var yellow_1_btn = document.getElementById("yellow_1");
            var yellow_2_btn = document.getElementById("yellow_2");
            var black_1_btn = document.getElementById("black_1");
            var black_2_btn = document.getElementById("black_2");

            var start_btn = document.getElementById("start")
    
            

            function has_player_claimed_another_spot() {
                return false
            }

            function has_player_claimed_this_spot() {
                return false
            }


            // Sign-ups

            yellow_1_btn.onclick = function() {
                if (has_player_claimed_another_spot() == false) {    
                    players_ref.doc("yellow_1").update({
                        uid: user.uid,
                        name: user.displayName
                    });
                    yellow_1_btn.innerHTML = "Yellow 1 claimed by " + user.displayName 
                };
                if (has_player_claimed_another_spot() == true) {    
                    players_ref.doc("yellow_1").update({
                        uid: "",
                        name: ""
                    });
                    yellow_1_btn.innerHTML = "Claim Yellow 1" 
                };
            };

            yellow_2_btn.onclick = function() {
                if (has_player_claimed_another_spot() == false) {    
                    players_ref.doc("yellow_2").update({
                        uid: user.uid,
                        name: user.displayName
                    });
                    yellow_2_btn.innerHTML = "Yellow 2 claimed by " + user.displayName 
                };
            };

            black_1_btn.onclick = function() {
                if (has_player_claimed_another_spot() == false) {    
                    players_ref.doc("black_1").update({
                        uid: user.uid,
                        name: user.displayName
                    });
                    black_1_btn.innerHTML = "Black 1 claimed by " + user.displayName 
                };
            };

            black_2_btn.onclick = function() {
                if (has_player_claimed_another_spot() == false) {    
                    players_ref.doc("black_2").update({
                        uid: user.uid,
                        name: user.displayName
                    });
                    black_2_btn.innerHTML = "Black 2 claimed by " + user.displayName 
                };
            };

            // Update HTML upon changing players DB

            players_ref.onSnapshot(function() { // Listen for changes in the status of the game started/ended
                players_ref.doc("yellow_1").get().then(function(doc) {
                    if (doc.exists) {
                        yellow_1_btn.innerHTML = doc.data().name 
                    } else {
                        console.log("We fucked up!");
                    }
                });
            });



            // ---end of sign-ups


            // Starting the game

            start_btn.onclick = function() {
                console.log("Go crazy!")
                location.href='game.html';

                booleans_ref.update({ // Set start of game, triggers players to go to game.html
                    has_game_ended: false, // and everyone else to be informed there is a game in progress
                    has_game_started: true
                  });

                scores_ref.update({ // Set database scores back to 0 : 0 before game starts
                    yellow_sc: 0,
                    black_sc: 0
                });
                  
            };

            // Events triggered from start of game

            booleans_ref.onSnapshot(function() { // Listen for changes in the status of the game started/ended
                booleans_ref.get().then(function(doc) {
                    if (doc.exists) {
                        if (doc.data().has_game_started == true) {
                            start_btn.innerHTML = "Game in progress"
                        } 
                    } else {
                        console.log("We fucked up!");
                    }
                });
            });
            


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