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
    
            

            function has_player_claimed_another_spot() {
                var query = players_ref.where("uid" = user.uid)
                console.log(query)
                return false
            }

            function has_player_claimed_this_spot() {
                return false
            }

            yellow_1_btn.onclick = function() {
                if (has_player_claimed_another_spot() == false) {    
                    players_ref.update({
                        yellow_1: user.uid,
                        yellow_1_name: user.displayName
                    });
                    yellow_1_btn.innerHTML = "Yellow 1 claimed by " + user.displayName 
                };
                if (has_player_claimed_another_spot() == true) {    
                    players_ref.update({
                        yellow_1: "",
                        yellow_1_name: ""
                    });
                    yellow_1_btn.innerHTML = "Claim Yellow 1" 
                };
            };

            yellow_2_btn.onclick = function() {
                if (has_player_claimed_another_spot() == false) {    
                    players_ref.update({
                        yellow_2: user.uid,
                        yellow_2_name: user.displayName
                    });    
                    yellow_2_btn.innerHTML = "Yellow 2 claimed by " + user.displayName 
                };
            };

            black_1_btn.onclick = function() {
                if (has_player_claimed_another_spot() == false) {    
                    players_ref.update({
                        black_1: user.uid,
                        black_1_name: user.displayName
                    });    
                    black_1_btn.innerHTML = "Black 1 claimed by " + user.displayName 
                };
            };

            black_2_btn.onclick = function() {
                if (has_player_claimed_another_spot() == false) {    
                    players_ref.update({
                        black_2: user.uid,
                        black_2_name: user.displayName
                    });    
                    black_2_btn.innerHTML = "Black 2 claimed by " + user.displayName 
                };
            };

            start_btn.onclick = function() {
                console.log("Go crazy!")
                location.href='game.html';
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