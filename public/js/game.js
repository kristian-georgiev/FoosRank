var mainApp = {};
var firebase = app_fireBase;
var db = firebase.firestore();

(function(){
var uid = null 
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
        // User is signed in.
        var booleans_ref = db.collection("booleans_current_game").doc("booleans"); // DB aliases
        var players_ref = db.collection("players_current_game").doc("players")

        players_ref.get().then(function(doc) {
            if (doc.exists) {
                console.log("Players:")
                console.log("---------------")
                console.log(doc.data().yellow_1);
                console.log(doc.data().yellow_2);
                console.log(doc.data().black_1);
                console.log(doc.data().black_2);
                console.log("---------------")
            } else {
                console.log("We fucked up!");
            }
        })
        
        
        // Game starts

        var scores_ref = db.collection("score_current_game").doc("scores"); // DB alias

        scores_ref.set({ // Set database scores back to 0 : 0
            yellow_sc: 0,
            black_sc: 0
          });

        var yellow_sc = 0; // Initialize local score variables
        var black_sc  = 0;

        
        var score_history = [];
        var last_to_score = null;

        var y_button = document.getElementById("yellow_score");
        var b_button = document.getElementById("black_score");

        var undo_button = document.getElementById("undo");

        var scoretable = document.getElementById("scoretable");

        // Scoring goals

        scores_ref.onSnapshot(function(doc) {
            scores_ref.get().then(function(doc) {
                if (doc.exists) {
                    yellow_sc = doc.data().yellow_sc;
                    black_sc = doc.data().black_sc;
                    scoretable.innerHTML = yellow_sc + " : " + black_sc;
                } else {
                    console.log("We fucked up!");
                }
            }).catch(function(error) {
                console.log("Error getting document:", error);
            });
        });


        function change_scoretable(){
            scores_ref.get().then(function(doc) {
                if (doc.exists) {
                    black_sc = doc.data().black_sc;
                    yellow_sc = doc.data().yellow_sc;
                } else {
                    console.log("We fucked up!");
                }
            }).catch(function(error) {
                console.log("Error getting document:", error);
            });
            scoretable.innerHTML = yellow_sc + " : " + black_sc;
            }

        y_button.onclick = function() {
            yellow_sc += 1;
            scores_ref.set({
                yellow_sc: yellow_sc,
                black_sc: black_sc
              });
            // change_scoretable() implicitly by the onSnapshot listening for changes in the DB
            score_history.push("y");
            update_game_status();

            is_game_over().then(function(result){
                if (result == true) {
                    display_popup("Yellow");
                }

            })
        };

        b_button.onclick = function() {
            black_sc += 1;
            scores_ref.set({
                yellow_sc: yellow_sc,
                black_sc: black_sc
              });
            change_scoretable();
            score_history.push("b");
            update_game_status();

            is_game_over().then(function(result){
                if (result == true) {
                    display_popup("Black");
                }

            })
        };

        // Undoing actions

        undo_button.onclick = function() {
            last_to_score = score_history.pop()
            if (last_to_score == "y") {
                yellow_sc -= 1;
            } 
            if (last_to_score == "b") {
                black_sc -= 1;
            }
            scores_ref.set({
                yellow_sc: yellow_sc,
                black_sc: black_sc
              });
              change_scoretable()            
        };


        // Checking status of game

        function update_game_status() {
            if (((yellow_sc == 10 && black_sc <=8) || (yellow_sc > 10 && (yellow_sc - black_sc == 2)) ) || ((black_sc == 10 && yellow_sc <=8) || (black_sc > 10 && (black_sc - yellow_sc == 2)) )) {
                booleans_ref.set({
                    has_game_ended: true,
                    has_game_started: true
                });
                console.log("has_game_ended was bitched")
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

            addGame();
            updatePlayerStats();
        }
        }else{
            // redirect to login page
            uid = null;
            window.location.replace("login.html");
        }

        function addGame(){
        // adds a new game to games collection in database
                    db.collection("games").add({ //TODO hardcoded
                        black1uid: "temptempuid1",
                        black2uid: "temptempuid2",
                        yellow1uid: "temptempuid1",
                        yellow2uid: "temptempuid2",
                        black_score: yellow_sc,
                        yellow_score: black_sc,
                        is_yellow_winner: (yellow_sc > black_sc)
                    })
                    .then(function(docRef) {
                        console.log("Game successfully added with ID: ", docRef.id);
                        window.location = "waiting_area.html"
                    })
                    .catch(function(error) {
                        console.error("Error adding document: ", error);
                    });
        }

        function updatePlayerStats(){
            // players_ref.update({
            //     elo: user.uid,
            // });    
        }
});


function logOut(){
firebase.auth().signOut();
}

mainApp.logOut = logOut;
})()
