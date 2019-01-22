var mainApp = {};
var firebase = app_fireBase;
const db = firebase.firestore();
db.settings({ timestampsInSnapshots: true });


(function(){
var uid = null 
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {  
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
        

        // // TODO:
        // players_ref.get().then((snapshot) => { // kick out if not a player
        //     am_I_playing = false
        //     snapshot.docs.forEach(doc => {
        //         if (user.uid == doc.id) {
        //             am_I_playing = true
        //         }
        //         return am_I_playing
        //     }).then(console.log(am_I_playing))
        //     // if (am_I_playing == false) {
        //     //     window.location = "waiting_area.html"
        //     // }
        // });


        players_ref.get().then((snapshot) => { // update player names in HTML
            snapshot.docs.forEach(doc => {
                name = get_first_name(doc.data().name)
                if (name == "Claim") {
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
                    y_sc = doc.data().yellow_sc;
                    b_sc = doc.data().black_sc;
                    if (((y_sc == 10 && b_sc <=8) || (y_sc > 10 && (y_sc - b_sc == 2)) ) || 
                        ((b_sc == 10 && yellow_sc <=8) || (b_sc > 10 && (b_sc - y_sc == 2)) )) {
                        w = "Yellow"
                        if (y_sc < b_sc) {
                            w = "Black"
                        }
                        booleans_ref.update({
                            has_game_ended: true,
                            has_game_started: false,
                            winner: w
                        });            
                        console.log("Terminal game result");
                    } else {
                        booleans_ref.update({
                            has_game_ended: false,
                            has_game_started: true,
                            winner: w
                        });            
                    }

                } else {
                    console.log("We fucked up!");
                }
            }).catch(function(error) {
                console.log("Error getting document:", error);
            });
        });

        booleans_ref.onSnapshot(function () {
            booleans_ref.get().then(doc => {
                if (doc.data().has_game_ended == true) {
                    display_popup(doc.data().winner);
                }
            } )
        });

        scores_ref.onSnapshot(function() { // Listen for changes in the scores DB 
            scores_ref.get().then(function(doc) { // and update game status if necessary    
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
                    score_history: doc.data().score_history.concat("y")
                })
            }).then(() => {
                // change scoretable implicitly by the onSnapshot listening for changes in the DB
                update_game_status();
            });

            is_game_over().then(function(result){ // check if game is over after updating score
                if (result == true) {
                    display_popup("Yellow");
                }

            })
        });

        black_div.addEventListener('click',function(e){

            scores_ref.get()
                .then((doc) => {
                    scores_ref.update({
                        black_sc: doc.data().black_sc + 1,
                        score_history: doc.data().score_history.concat("b")
                    })
                    return 0
                })
                .then( t => {
                    // change scoretable implicitly
                    update_game_status();
                    return 0
                })
                .then( t => {    
                    return is_game_over()
                })
                .then(result => { // check if game is over after updating score
                    if (result == true) {
                        display_popup("Black");
                    }
                });
        });

        // Undoing actions

        undo_button.onclick = function() {

            scores_ref.get().then((doc) => {
                last_to_score = doc.data().score_history.pop()
                sc_hist = doc.data().score_history
                sc_hist.pop()
                if (last_to_score == "y") {
                    scores_ref.update({
                        yellow_sc: doc.data().yellow_sc - 1,
                        score_history: sc_hist
                    })
                } 
                if (last_to_score == "b") {
                    scores_ref.update({
                        black_sc: doc.data().black_sc - 1,
                        score_history: sc_hist
                    })
                }// implicit skip if there were no more actions
            })
             // change scoretable implicitly
            update_game_status() // in case it was an undo of a winning goal
        };


        // Checking status of game

        function update_game_status() {
            scores_ref.get().then((doc) => {
                y_sc = doc.data().yellow_sc
                b_sc = doc.data().black_sc
                if (((y_sc == 10 && b_sc <=8) || (y_sc > 10 && (y_sc - b_sc == 2)) ) || 
                    ((b_sc == 10 && yellow_sc <=8) || (b_sc > 10 && (b_sc - y_sc == 2)) )) {
                    booleans_ref.update({
                        has_game_ended: true,
                        has_game_started: false
                    });            
                    console.log("Terminal game result")
                } else {
                    booleans_ref.update({
                        has_game_ended: false,
                        has_game_started: true
                    });            
                }
            })
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
            scores_ref.get().then((doc) => {
                last_to_score = doc.data().score_history.pop()
                sc_hist = doc.data().score_history
                sc_hist.pop()
                if (last_to_score == "y") {
                    scores_ref.update({
                        yellow_sc: doc.data().yellow_sc - 1,
                        score_history: sc_hist
                    })
                } 
                if (last_to_score == "b") {
                    scores_ref.update({
                        black_sc: doc.data().black_sc - 1,
                        score_history: sc_hist
                    })
                }// implicit skip if there were no more actions
            })
             // change scoretable implicitly
             update_game_status() // in case it was an undo of a winning goal
             popup.style.display = "none";
        };

        popup_continue.onclick = function() {
            record_game()
        };


        // // Record game results - TODO need to update users (be careful of await), unhardcode addGame()
        // function record_game(){
        //     // updatePlayerStats() 
        //     addGame();
        //     // updatePlayerStats().then(() => {
        //     //     addGame();
        //     // });
        // }

        function record_game(){
            // adds a new game to games collection in databasek
                
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

            // Helper functions

            function get_first_name(s) {
                var sArray = s.split(" ");
                return sArray[0]
            };
        

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
