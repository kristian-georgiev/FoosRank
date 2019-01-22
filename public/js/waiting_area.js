var mainApp = {};
var firebase = app_fireBase;
const db = firebase.firestore();
db.settings({ timestampsInSnapshots: true });


(function(){
var uid = null
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            const scores_ref = db.collection("players_current_game").doc("scores"); // DB aliases
            const booleans_ref = db.collection("players_current_game").doc("booleans");          
            const players_ref = db.collection("players_current_game")
            
            var game_in_progress_popup = document.getElementById("game_in_progress_popup");
                        
            var yellow_1_btn = document.getElementById("yellow_1");
            var yellow_2_btn = document.getElementById("yellow_2");
            var black_1_btn = document.getElementById("black_1");
            var black_2_btn = document.getElementById("black_2");
            var start_btn = document.getElementById("start")
            // Put the modal "Game in progress"
            
            booleans_ref.onSnapshot(function() { // Listen for changes in the status of the game started/ended
                booleans_ref.get().then(function(doc) {
                    if (doc.data().has_game_started == true) {
                        console.log("Can't choose players now.")
                        game_in_progress_popup.style.display = "block";
                        players_ref.where('uid', '==', user.uid).get().then((snapshot) => { // check if user is in the current players DB 
                            if (snapshot.docs.length > 0) { // Redirect players to game page
                                window.location.replace("game.html");
                            }
                        }); 
            
                    } else {
                        game_in_progress_popup.style.display = "none";
                    }
                })
            });

            db.collection("users").doc(user.uid).get().then((me) => { // display user info in navbar    
                document.getElementById("navbar-id-text").innerHTML = get_first_name(user.displayName) + " " + me.data().elo;
                })


            // Sign-ups

            yellow_1_btn.onclick = function() {
                players_ref.where('uid', '==', user.uid).get().then((snapshot) => { // check if user is in the current players DB 
                    if (snapshot.docs.length == 0) { // Player has not signed up for other spots
                        players_ref.doc("yellow_1").update({
                            uid: user.uid,
                            name: get_first_name(user.displayName)
                        });    
                    } else { // If player has signed up for that spot, free it with the second click
                        snapshot.docs.forEach(doc => {
                            if (doc.id == "yellow_1") {
                                players_ref.doc("yellow_1").update({
                                    uid: "none",
                                    name: "Claim spot!"
                                });            
                            };
                        });
                    };
                });
            };

            yellow_2_btn.onclick = function() {
                players_ref.where('uid', '==', user.uid).get().then((snapshot) => { // check if user is in the current players DB 
                    if (snapshot.docs.length == 0) { // Player has not signed up for other spots
                        players_ref.doc("yellow_2").update({
                            uid: user.uid,
                            name: get_first_name(user.displayName)
                        });    
                    } else { // If player has signed up for that spot, free it with the second click
                        snapshot.docs.forEach(doc => {
                            if (doc.id == "yellow_2") {
                                players_ref.doc("yellow_2").update({
                                    uid: "none",
                                    name: "Claim spot!"
                                });            
                            };
                        });
                    };
                });
            };

            black_1_btn.onclick = function() {
                players_ref.where('uid', '==', user.uid).get().then((snapshot) => { // check if user is in the current players DB 
                    if (snapshot.docs.length == 0) { // Player has not signed up for other spots
                        players_ref.doc("black_1").update({
                            uid: user.uid,
                            name: get_first_name(user.displayName)
                        });    
                    } else { // If player has signed up for that spot, free it with the second click
                        snapshot.docs.forEach(doc => {
                            if (doc.id == "black_1") {
                                players_ref.doc("black_1").update({
                                    uid: "none",
                                    name: "Claim spot!"
                                });            
                            };
                        });
                    };
                });
            };

            black_2_btn.onclick = function() {
                players_ref.where('uid', '==', user.uid).get().then((snapshot) => { // check if user is in the current players DB 
                    if (snapshot.docs.length == 0) { // Player has not signed up for other spots
                        players_ref.doc("black_2").update({
                            uid: user.uid,
                            name: get_first_name(user.displayName)
                        });    
                    } else { // If player has signed up for that spot, free it with the second click
                        snapshot.docs.forEach(doc => {
                            if (doc.id == "black_2") {
                                players_ref.doc("black_2").update({
                                    uid: "none",
                                    name: "Claim spot!"
                                });            
                            };
                        });
                    };
                });
            };

            // TODO: wrap the above code in a function to avoid repeating code

            // Update HTML upon changing players DB

            players_ref.onSnapshot(function() { // Listen for changes in the status of the game started/ended
                players_ref.doc("yellow_1").get().then(function(doc) {
                    if (doc.exists) {
                        yellow_1_btn.innerHTML = doc.data().name 
                    } else {
                        console.log("We fucked up!");
                    }
                });
                players_ref.doc("yellow_2").get().then(function(doc) {
                    if (doc.exists) {
                        yellow_2_btn.innerHTML = doc.data().name 
                    } else {
                        console.log("We fucked up!");
                    }
                });
                players_ref.doc("black_1").get().then(function(doc) {
                    if (doc.exists) {
                        black_1_btn.innerHTML = doc.data().name 
                    } else {
                        console.log("We fucked up!");
                    }
                });
                players_ref.doc("black_2").get().then(function(doc) {
                    if (doc.exists) {
                        black_2_btn.innerHTML = doc.data().name 
                    } else {
                        console.log("We fucked up!");
                    }
                });
            });

            // ---end of sign-ups---


            // Starting the game

            start_btn.onclick = function() {
                    scores_ref.update({ // Set database scores back to 0 : 0 before game starts
                        yellow_sc: 0,
                        black_sc: 0,
                        score_history: []
                    }).then( function() {
                        db.collection("users").doc("none").update({ // reset dummy user 
                            elo: 1500 // used in games where there's empty spots
                        })
                    }).then( function() {
                        booleans_ref.update({ // Set start of game, triggers players to go to game.html
                            has_game_ended: false, // and everyone else to be informed there is a game in progress
                            has_game_page_been_exited: false,
                            is_ready_to_record_game: false,
                            has_game_started: false // game start is triggered in the game page
                        })                            
                    }).then( function() {
                        window.location.replace('game.html');
                    });
            }

            // ---Events triggered from start of game---

            // Helper functions

            function get_first_name(s) {
                var sArray = s.split(" ");
                return sArray[0]
            };

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