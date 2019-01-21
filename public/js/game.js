var mainApp = {};
var firebase = app_fireBase;
const db = firebase.firestore();
db.settings({ timestampsInSnapshots: true });

(function(){
var uid = null 
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {  // TODO: only if a player is part of the game

        // User is signed in.
        const booleans_ref = db.collection("booleans_current_game").doc("booleans"); // DB aliases
        const players_ref = db.collection("players_current_game")


        // Go back to waiting area when there is no game
        
        booleans_ref.onSnapshot(function() { // Listen for changes in the status of the game started/ended
            booleans_ref.get().then(function(doc) {
                if (doc.data().has_game_page_been_exited == true) {
                    console.log("No game going on now.")
                    window.location = "waiting_area.html"
                }
            })
        });

        var yellow_1 = document.getElementById("y_1_name"); // Player names to be displayed
        var yellow_2 = document.getElementById("y_2_name");
        var black_1 = document.getElementById("b_1_name");
        var black_2 = document.getElementById("b_2_name");
        

        players_ref.get().then((snapshot) => { // update player names in HTML
            snapshot.docs.forEach(doc => {
                name = doc.data().name
                if (name == "Claim spot!") {
                    name = ""
                }
                eval(doc.id + ".innerHTML = '" + name + "' ")
            })
        });
        
        // Game starts

        const scores_ref = db.collection("score_current_game").doc("scores"); // DB alias

        
        var yellow_div = document.getElementById("yellow_color"); // Grab elts from page
        var black_div = document.getElementById("black_color");
        var undo_button = document.getElementById("undo");
        var scoretable = document.getElementById("scoretable");

        // Scoring goals

        scores_ref.onSnapshot(function() { // Listen for changes in the scores DB 
            scores_ref.get().then(function(doc) { // and update HTML upon each change
                if (doc.exists) {
                    yellow_sc = doc.data().yellow_sc;
                    black_sc = doc.data().black_sc;
                    scoretable.innerHTML = yellow_sc + " : " + black_sc;
                    var min;
                    if (window.innerWidth < window.innerHeight){
                        min = window.innerWidth;
                    } else{
                        min = window.innerHeight;
                    }

                    if (yellow_sc >= 10 || black_sc >= 10){ // sizing the scoretext right
                        scoretable.style.fontSize = (min * 0.25) + "" + "px";
                    }
                    if  (yellow_sc < 10 && black_sc < 10){ //TODO see if this works
                        scoretable.style.fontSize = (min * 0.5) + "" + "px";
                    }

                } else {
                    console.log("We fucked up!");
                }
            }).catch(function(error) {
                console.log("Error getting document:", error);
            });
        });


        yellow_div.addEventListener('click',function(e){

            scores_ref.get().then((doc) => {
                scores_ref.update({
                    yellow_sc: doc.data().yellow_sc + 1,
                    black_sc: doc.data().black_sc,
                    score_history: doc.data().score_history.concat("y")
                })
            })

            // change scoretable implicitly by the onSnapshot listening for changes in the DB
            update_game_status();

            is_game_over().then(function(result){ // check if game is over after updating score
                if (result == true) {
                    display_popup("Yellow");
                }

            })
        });

        black_div.addEventListener('click',function(e){

            scores_ref.get().then((doc) => {
                scores_ref.update({
                    yellow_sc: doc.data().yellow_sc,
                    black_sc: doc.data().black_sc + 1,
                    score_history: doc.data().score_history.concat("b")
                })
            })
            // change scoretable implicitly
            update_game_status();

            is_game_over().then(function(result){ // check if game is over after updating score
                if (result == true) {
                    display_popup("Black");
                }

            })
        });

        // Undoing actions

        undo_button.onclick = function() {
            last_to_score = score_history.pop()
            if (last_to_score == "y") {
                yellow_sc -= 1;
            } 
            if (last_to_score == "b") {
                black_sc -= 1;
            } // implicit skip if there were no more actions
            scores_ref.update({
                yellow_sc: yellow_sc,
                black_sc: black_sc
              });
            // change scoretable implicitly
            update_game_status() // in case it was an undo of a winning goal
        };


        // Checking status of game

        function update_game_status() {
            if (((yellow_sc == 10 && black_sc <=8) || (yellow_sc > 10 && (yellow_sc - black_sc == 2)) ) || ((black_sc == 10 && yellow_sc <=8) || (black_sc > 10 && (black_sc - yellow_sc == 2)) )) {
                booleans_ref.update({
                    has_game_ended: true,
                    has_game_started: false
                });            
                console.log("has_game_ended was bitched")
            } else {
                booleans_ref.update({
                    has_game_ended: false,
                    has_game_started: true
                });            
            }
        };

        function is_game_over() {
            var buff = false;
            return booleans_ref.get().then(function(doc) {
                if (doc.exists) {
                    if(doc.data().has_game_ended == true) {
                        buff = true;
                    }
                    return buff;
                }   
            });
        }


        // Popup upon ending game

        var popup = document.getElementById("popup");
        var popup_text = document.getElementById("popup_text");
        var popup_undo = document.getElementById("popup_undo");
        var popup_continue = document.getElementById("popup_continue")

        function display_popup(winning_team) {
            popup_text.innerHTML = "<h1>" + winning_team + " wins!</h1>"
            popup.style.display = "block";
        };

        popup_undo.onclick = function() {
            last_to_score = score_history.pop()
            if (last_to_score == "y") {
                yellow_sc -= 1;
            } 
            if (last_to_score == "b") {
                black_sc -= 1;
            }
            scoretable.innerHTML = yellow_sc + " : " + black_sc;
            popup.style.display = "none";
        };

        popup_continue.onclick = function() {
            record_game()
        };


        // Record game results - TODO need to update users (be careful of await), unhardcode addGame()
        function record_game(){
            // updatePlayerStats() 
            addGame();
            // updatePlayerStats().then(() => {
            //     addGame();
            // });
        }

        function addGame(){
            // adds a new game to games collection in database
                
            players_ref.get().then((snapshot) => {
                snapshot.docs.forEach(doc => {
                    var player_uid = doc.data().uid
                    if (player_uid != "") {
                        db.collection("users").doc(player_uid).get().then((doc) => {
                            db.collection("users").doc(player_uid).update({
                                elo: doc.data().elo + 100
                            })
                        })
                    }
                })
            }).then(() => {
                db.collection("games").add({ //TODO hardcoded
                    black1uid: "temptempuid1",
                    black2uid: "temptempuid2",
                    yellow1uid: "temptempuid1",
                    yellow2uid: "temptempuid2",
                    black_score: yellow_sc,
                    yellow_score: black_sc,
                    is_yellow_winner: (yellow_sc > black_sc)
                }).then(() => {
                    players_ref.get().then((snapshot) => { // Kick out players in the end
                        snapshot.docs.forEach(doc => {
                            doc.data().name = "Claim spot!"
                            doc.data().uid = ""
                            console.log("Kicked out players.")
                        })
                    }).then(() => {
                        // console.log("ebete si maikite")
                        booleans_ref.update({ // Set end of game, triggers waiting_area.html to be active again
                            has_game_page_been_exited: true
                        });
                    });
                })
            })
            }
        

        } else {
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
