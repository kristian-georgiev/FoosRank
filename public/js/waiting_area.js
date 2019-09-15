var mainApp = {};
var firebase = app_fireBase;

var uid = null
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        const scores_ref   = db.collection("players_current_game").doc("scores"); // DB aliases
        const booleans_ref = db.collection("players_current_game").doc("booleans");
        const players_ref  = db.collection("players_current_game");

        const raspberry_pi_ref = db.collection("raspberry_pi_input").doc("fake_button_presses");

        var game_in_progress_popup = document.getElementById("game_in_progress_popup");

        var yellow_1_btn = document.getElementById("yellow_1");
        var yellow_2_btn = document.getElementById("yellow_2");
        var black_1_btn = document.getElementById("black_1");
        var black_2_btn = document.getElementById("black_2");
        var start_btn = document.getElementById("start");
        const empty_spot_text = "Claim spot!";


        db.collection("users").doc(user.uid).get().then((me) => { // display user info in navbar    
            document.getElementById("navbar-id-text").innerHTML = get_first_name(user.displayName) + " " + me.data().elo;
        })



        // Sign-ups

        yellow_1_btn.onclick = function () {
            sign_up("yellow_1"); // updates player_ref
        };

        yellow_2_btn.onclick = function () {
            sign_up("yellow_2");
        };

        black_1_btn.onclick = function () {
            sign_up("black_1");
        };

        black_2_btn.onclick = function () {
            sign_up("black_2");
        };

        // ---end of sign-ups---


        // Watch for player changes

        players_ref.onSnapshot(async function () {
            await update_buttons(); // updates HTML

            await toggle_start_button(); // updates start_button_enabled boolean accordingly
        });

        // Watch for boolean changes
        booleans_ref.onSnapshot(async function () { // Listen for changes in the status of the game started/ended

            _ = await update_start_button(); // Enable/disable start button

            let booleans = await booleans_ref.get();

            if (booleans.data().has_game_started == true) {
                game_in_progress_popup.style.display = "block";
                players = await players_ref.where('uid', '==', user.uid).get();
                if (players.docs.length > 0) { // check if user is in the current players DB
                    window.location.replace("game.html"); // Redirect players to game page
                };
            } else {
                game_in_progress_popup.style.display = "none";
            }
        });


        // Starting the game

        start_btn.onclick = async function () {

            let scores = scores_ref.update({ // Set database scores back to 0 : 0 before game starts
                yellow_sc: 0,
                black_sc: 0,
                score_history: []
            });

            let dummy = db.collection("users").doc("none").update({ // reset dummy user 
                elo: 1500 // used in games where there's empty spots
            });

            let booleans = booleans_ref.update({ // Set start of game, triggers players to go to game.html
                has_game_ended: false, // and everyone else to be informed there is a game in progress
                has_game_started: false, // game start is triggered in the game page
                ready_to_exit_page: false,
                start_button_enabled: false
            })
            _ = await Promise.all([scores, dummy, booleans]); // resolve the updates before going to game page

            window.location.replace('game.html');
        };


        // Functions

        async function sign_up(btn) {
            await players_ref.where('uid', '==', user.uid).get().then((snapshot) => { // check if user is in the current players DB 
                if (snapshot.docs.length == 0) { // Player has not signed up for other spots
                    players_ref.doc(btn).update({
                        uid: user.uid,
                        name: get_first_name(user.displayName)
                    });
                } else { // If player has signed up for that spot, free it with the second click
                    snapshot.docs.forEach(doc => {
                        if (doc.id == btn) {
                            players_ref.doc(btn).update({
                                uid: "none",
                                name: empty_spot_text
                            });
                        };
                    });
                };
            });
        };

        async function update_buttons() {
            // Change buttons text to respective names 
            // and button colors to empty/taken
            const data = await players_ref.get()
            let [black_1, black_2, _, __, yellow_1, yellow_2] = data.docs.map(elt => {
                return elt.data();
            });
            const players = [black_1, black_2, yellow_1, yellow_2];
            const player_names = players.map(player => {
                return player.name;
            })
            const btns = ["black_1_btn", "black_2_btn", "yellow_1_btn", "yellow_2_btn"]

            for (let i = 0; i < player_names.length; i++) {
                var btn = eval(btns[i]);
                var player_name = player_names[i];
                if (player_name == empty_spot_text) {
                    btn.style.color = btn.style.borderColor;
                    btn.style.backgroundColor = "#FFFFFF";
                } else {
                    btn.style.color = "#FFFFFF";
                    btn.style.backgroundColor = btn.style.borderColor;
                }
                btn.innerHTML = player_name;
            };
        }

        async function toggle_start_button() {
            if (((yellow_1_btn.innerHTML == yellow_2_btn.innerHTML) && (yellow_1_btn.innerHTML == empty_spot_text)) || // both yellow empty
                ((black_1_btn.innerHTML == black_2_btn.innerHTML) && (black_1_btn.innerHTML == empty_spot_text))) { // both black empty
                let _ = await booleans_ref.update({
                    start_button_enabled: false
                });
            } else {
                let _ = await booleans_ref.update({
                    start_button_enabled: true
                });
            };
        };

        async function update_start_button() {
            // Enable/disable start button
            raw = await booleans_ref.get();
            booleans = raw.data();
            is_start_button_enabled = booleans.start_button_enabled;
            if (is_start_button_enabled == true) {
                start_btn.removeAttribute('disabled');
                start_btn.disabled = false;
            } else {
                start_btn.setAttribute('disabled', 'disabled');
                start_btn.disabled = true;
            };
        };


        function get_first_name(s) {
            var sArray = s.split(" ");
            return sArray[0]
        };

    } else {
        // redirect to login page
        uid = null;
        window.location.replace("index.html");
    }
});

function logOut() {
    firebase.auth().signOut();
}

mainApp.logOut = logOut;