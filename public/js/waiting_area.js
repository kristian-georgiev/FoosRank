var mainApp = {};
var firebase = app_fireBase;
const db = firebase.firestore();
db.settings({ timestampsInSnapshots: true });


(function(){
var uid = null
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            const booleans_ref = db.collection("booleans_current_game").doc("booleans");          
            var game_in_progress_popup = document.getElementById("game_in_progress_popup");
            
            // Put the modal "Game in progress"
            
            booleans_ref.onSnapshot(function() { // Listen for changes in the status of the game started/ended
                booleans_ref.get().then(function(doc) {
                    if (doc.data().has_game_page_been_exited == false) {
                        console.log("Can't choose players now.")
                        game_in_progress_popup.style.display = "block";
                        players_ref.where('uid', '==', user.uid).get().then((snapshot) => { // check if user is in the current players DB 
                            if (snapshot.docs.length > 0) { // Redirect players to game page
                                window.location = "game.html"
                            }
                        }); 
            
                    } else {
                        game_in_progress_popup.style.display = "none";
                    }
                })
            });

            db.collection("users").doc(user.uid).get().then((me) => { // display user info in navbar
                document.getElementById("navbar-id-text").innerHTML = user.displayName + " " + me.data().elo;
                })


            const scores_ref = db.collection("score_current_game").doc("scores"); // DB aliases
            const players_ref = db.collection("players_current_game")
                        
            var yellow_1_btn = document.getElementById("yellow_1");
            var yellow_2_btn = document.getElementById("yellow_2");
            var black_1_btn = document.getElementById("black_1");
            var black_2_btn = document.getElementById("black_2");
            var start_btn = document.getElementById("start")

            // Sign-ups

            yellow_1_btn.onclick = function() {
                players_ref.where('uid', '==', user.uid).get().then((snapshot) => { // check if user is in the current players DB 
                    if (snapshot.docs.length == 0) { // Player has not signed up for other spots
                        players_ref.doc("yellow_1").update({
                            uid: user.uid,
                            name: user.displayName
                        });    
                    } else { // If player has signed up for that spot, free it with the second click
                        snapshot.docs.forEach(doc => {
                            if (doc.id == "yellow_1") {
                                players_ref.doc("yellow_1").update({
                                    uid: "",
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
                            name: user.displayName
                        });    
                    } else { // If player has signed up for that spot, free it with the second click
                        snapshot.docs.forEach(doc => {
                            if (doc.id == "yellow_2") {
                                players_ref.doc("yellow_2").update({
                                    uid: "",
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
                            name: user.displayName
                        });    
                    } else { // If player has signed up for that spot, free it with the second click
                        snapshot.docs.forEach(doc => {
                            if (doc.id == "black_1") {
                                players_ref.doc("black_1").update({
                                    uid: "",
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
                            name: user.displayName
                        });    
                    } else { // If player has signed up for that spot, free it with the second click
                        snapshot.docs.forEach(doc => {
                            if (doc.id == "black_2") {
                                players_ref.doc("black_2").update({
                                    uid: "",
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
                console.log("Go crazy!")
                
                booleans_ref.update({ // Set start of game, triggers players to go to game.html
                    has_game_ended: false, // and everyone else to be informed there is a game in progress
                    has_game_started: true,
                    has_game_page_been_exited: false
                }).then(function() {
                    location.href='game.html';
                })
                
                scores_ref.update({ // Set database scores back to 0 : 0 before game starts
                    yellow_sc: 0,
                    black_sc: 0
                });
                
            };

            // ---Events triggered from start of game---

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