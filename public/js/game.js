var mainApp = {};
var firebase = app_fireBase;
var db = firebase.firestore();

(function(){
var uid = null 
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
        // User is signed in.


        // Waiting area code

        // Choose players

        // 'Start' clicked
        
        // Game starts

        var scores_ref = db.collection("score_current_game").doc("scores");
        var yellow_sc = 0;
        var black_sc  = 0;
        scores_ref.get().then(function(doc) {
            if (doc.exists) {
                yellow_sc = doc.data().black_sc;
                black_sc = doc.data().yellow_sc;
            } else {
                console.log("We fucked up!");
            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
        });
        
        var score_history = [];
        var last_to_score = null;

        var y_button = document.getElementById("yellow_score");
        var b_button = document.getElementById("black_score");

        var undo_button = document.getElementById("undo");

        var scoretable = document.getElementById("scoretable");

        // Scoring goals

        y_button.onclick = function() {
            yellow_sc += 1;
            scoretable.innerHTML = yellow_sc + " : " + black_sc;
            score_history.push("y");
            if(is_game_over()){
                display_popup("Yellow")
            }
        };

        b_button.onclick = function() {
            black_sc += 1;
            scoretable.innerHTML = yellow_sc + " : " + black_sc;
            score_history.push("b");
            if(is_game_over()){
                display_popup("Black")
            }
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
            scoretable.innerHTML = yellow_sc + " : " + black_sc;
        };


        // Checking status of game

        function is_game_over() {
            if ((yellow_sc == 10 && black_sc <=8) || (yellow_sc > 10 && (yellow_sc - black_sc == 2)) ) {
                return "y"
            }
            if ((black_sc == 10 && yellow_sc <=8) || (black_sc > 10 && (black_sc - yellow_sc == 2)) ) {
                return "b"
            }
            return false
        };


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


        // Record game results - TODO need to update users (be careful of await)
        function record_game(){

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
