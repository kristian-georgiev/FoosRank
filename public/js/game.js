var mainApp = {};
var firebase = app_fireBase;
const booleans_ref = db.collection("players_current_game").doc("booleans"); // DB aliases
const players_ref = db.collection("players_current_game");
const scores_ref = db.collection("players_current_game").doc("scores");

var yellow_div = document.getElementById("yellow_color"); // Grab elts from page
var black_div = document.getElementById("black_color");
var undo_button = document.getElementById("undo");
var scoretable = document.getElementById("scoretable");

var yellow_1 = document.getElementById("y_1_name"); // Player names to be displayed
var yellow_2 = document.getElementById("y_2_name"); // ignore linter marking them as not used
var black_1 = document.getElementById("b_1_name"); // in use "update player names in HTML"
var black_2 = document.getElementById("b_2_name");

var popup = document.getElementById("popup");
var popup_text = document.getElementById("popup_text");
var popup_undo = document.getElementById("popup_undo");
var popup_record = document.getElementById("popup_record")
var popup_container = document.getElementById("popup_container")

var popup_with_elos = document.getElementById("popup_with_elos");
var popup_with_elos_text = document.getElementById("popup_with_elos_text");
var popup_with_elos_continue = document.getElementById("popup_with_elos_continue");

// Stop game and exit without recording if either side has no players
// should never happen, but just to be safe
players_ref.onSnapshot(async function () {
    snapshot = await players_ref.get()
    data = snapshot.docs.map(function (elt) {
        return elt.data();
    });
    let [black_1, black_2, _, __, yellow_1, yellow_2] = data;
    let players = [black_1, black_2, yellow_1, yellow_2];
    if ((black_1.uid == black_2.uid) && (black_1.uid == "none") ||
        ((yellow_1.uid == yellow_2.uid) && (yellow_1.uid == "none"))) {
        booleans_ref.update({ // Update game status
            has_game_started: false,
            has_game_ended: false,
            start_button_enabled: false,
            ready_to_exit_page: true
        });
    };
});

var uid = null
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.

        booleans_ref.update({ // Update game status
            has_game_started: true,
            has_game_ended: false,
            start_button_enabled: false,
            ready_to_exit_page: false
        });

        console.log("Game starts")
        // Game starts

        setTimeout(function () { // exit game after 45 mins, in case a user leaves the game unfinished
            clean_after_game()
        }, 45 * 60 * 1000);



        players_ref.get().then((snapshot) => { // update player names in HTML
            snapshot.docs.forEach(doc => {
                if ((doc.id != "booleans") && (doc.id != "scores")) {
                    name = get_first_name(doc.data().name)
                    if (name == "Claim") {
                        name = ""
                    }
                    eval(doc.id + ".innerHTML = '" + name + "' ")
                }
            })
        });


        scores_ref.onSnapshot(function () { // Listen for changes in the scores DB 
            scores_ref.get().then(function (doc) { // and update game status and HTML
                y_sc = doc.data().yellow_sc;
                b_sc = doc.data().black_sc;

                // ---HTML---
                scoretable.innerHTML = y_sc + " : " + b_sc;
                var min;
                if (window.innerWidth < window.innerHeight) {
                    min = window.innerWidth;
                } else {
                    min = window.innerHeight;
                }

                if (y_sc >= 10 || b_sc >= 10) { // sizing the scoretext right
                    scoretable.style.fontSize = (min * 0.25) + "" + "px";
                }
                if (y_sc < 10 && b_sc < 10) { //TODO see if this works
                    scoretable.style.fontSize = (min * 0.5) + "" + "px";
                }

                // ---Game status---
                if (((y_sc == 10 && b_sc <= 8) || (y_sc > 10 && (y_sc - b_sc == 2))) || // end-of-game conditions
                    ((b_sc == 10 && y_sc <= 8) || (b_sc > 10 && (b_sc - y_sc == 2)))) {
                    w = "Yellow";
                    if (y_sc < b_sc) {
                        w = "Black";
                    }
                    booleans_ref.update({
                        has_game_ended: true,
                        winner: w
                    });
                    console.log("Terminal game result");
                } else {
                    booleans_ref.update({
                        has_game_ended: false,
                        winner: ""
                    });
                }
            }).catch(function (error) {
                console.log("Error getting document:", error);
            });
        });

        booleans_ref.onSnapshot(async function () {
            raw = await booleans_ref.get();
            is_ready_to_exit = raw.data().ready_to_exit_page;
            if (is_ready_to_exit == true) {
                window.location.replace("playerprofile.html")
            };
        });


        // =================== catching user behaviour ===================         

        yellow_div.addEventListener('click', function (e) {
            scores_ref.get()
                .then((doc) => {
                    scores_ref.update({
                        yellow_sc: doc.data().yellow_sc + 1,
                        score_history: doc.data().score_history.concat("y")
                    }).then( _ => {
                        if ((y_sc == 10 && b_sc <= 8) || (y_sc > 10 && (y_sc - b_sc == 2))) {
                            display_popup("Yellow");
                        }
                    });
                });
        });

        black_div.addEventListener('click', function (e) {
            scores_ref.get()
                .then((doc) => {
                    scores_ref.update({
                        black_sc: doc.data().black_sc + 1,
                        score_history: doc.data().score_history.concat("b")
                    }).then(_ => {
                        if ((b_sc == 10 && y_sc <= 8) || (b_sc > 10 && (b_sc - y_sc == 2))) {
                            display_popup("Black");
                        }
                    });
                });
        });

        undo_button.onclick = function () {
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
        };


        // booleans_ref.onSnapshot(function () { // Handle popup behaviour at end of game 
        //     booleans_ref.get()
        //         .then(doc => {
        //             if (doc.data().has_game_ended == true) {
        //                 display_popup(doc.data().winner);
        //             }
        //         }).catch(function (error) {
        //             console.log("Error getting document:", error);
        //         });
        // });

        popup_undo.onclick = function () {
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
            popup.style.display = "none";
        };

        popup_record.onclick = async function () {

            popup_container.innerHTML = "Recording...";
            const res = await get_new_elos_and_update_players();
            [new_elos, y_diff, b_diff] = res;
            if (y_diff > 0) {
                y_color = "green";
                b_color = "red";
            } else {
                y_color = "red";
                b_color = "green";
            }
            color = [b_color, b_color, y_color, y_color];
            elos_text = "";
            elo_change = [b_diff, b_diff, y_diff, y_diff];
            for (let i = 0; i < new_elos.length; i++) {
                player = new_elos[i][0];
                elo = new_elos[i][1];
                if (player != "none") {
                    elos_text += "<p><font color='" + color[i] + "'>" + player + ": " + elo + ", elo change " + elo_change[i] + "</font></p>";
                };
            };
            popup.style.display = "none";
            popup_with_elos_text.innerHTML = elos_text;
            popup_with_elos.style.display = "block";
        };

        popup_with_elos_continue.onclick = function () {
            clean_after_game()
        };


        // Functions

        function display_popup(winning_team) {
            popup_text.innerHTML = "<h1>" + winning_team + " wins!</h1>"
            popup.style.display = "block";
        };

        async function clean_after_game() {
            console.log("Restoring defaults after game is finished!")
            await booleans_ref.get()
                .then(doc => {
                    plrs = ["black_1", "black_2", "yellow_1", "yellow_2"]
                    for (plr in plrs) {
                        players_ref.doc(plrs[plr]).update({
                            name: "Claim spot!",
                            uid: "none"
                        });
                    }
                })
            await scores_ref.update({ // clean game result
                yellow_sc: 0,
                black_sc: 0,
                score_history: []
            })

            await booleans_ref.update({ // update game parameters
                has_game_ended: false,
                has_game_started: false,
                start_button_enabled: false,
                ready_to_exit_page: true,
                winner: ""
            })
        };


        async function get_new_elos_and_update_players() {
            snapshot = await players_ref.get()
            data = snapshot.docs.map(function (elt) {
                return elt.data();
            });

            let [black_1_pl, black_2_pl, _, scores, yellow_1_pl, yellow_2_pl] = data;

            let players = [black_1_pl, black_2_pl, yellow_1_pl, yellow_2_pl];

            let temp = [0, 0, 0, 0];

            for (let i = 0; i < players.length; i++) {
                temp[i] = db.collection("users").doc(players[i].uid).get();
            };

            let users_info = await Promise.all(temp);

            users = users_info.map(function (user) {
                return user.data()
            });
            
            // ==============================================
            // ========= ELO calculation ====================
            // ==============================================

            const b_elo_overall = (users[0].elo + users[1].elo) / 2;
            const y_elo_overall = (users[2].elo + users[3].elo) / 2;
            const prob_y_win = 1.0 / (1.0 + Math.pow(10, ((b_elo_overall - y_elo_overall) / 400)));
            const prob_b_win = 1 - prob_y_win;

            y_score = scores.yellow_sc; 
            b_score = scores.black_sc;
           
            // Make the game slightly not zero-sum
            win_reward = 18;
            lose_penalty = 15;
            
            // Treat each point as an independent trial
            const b_diff = Math.round(y_score * lose_penalty * (0 - prob_b_win)) + Math.round(b_score * win_reward * (1 - prob_b_win)); 
            const y_diff = Math.round(b_score * lose_penalty * (0 - prob_y_win)) + Math.round(y_score * win_reward * (1 - prob_y_win));


            new_elos = users.map((user, index) => {
                elo = user.elo;
                if (index <= 1) { // if black
                    elo += b_diff
                } else {
                    elo += y_diff
                }
                return [user.name, elo]
            });


            // ==============================================
            // ======= Updates and Game recording ===========
            // ==============================================

            timeStamps = [];
            for (let i = 0; i < users.length; i++) {
                if (users[i].timestamps != null){
                    timeStamps.push(users[i].timestamps.concat(Date.now()))
                } else {
                    timeStamps.push([Date.now()])
                }
            };

            elosArr = [];
            for (let i = 0; i < users.length; i++) {
                if (users[i].elos != null){
                    elosArr.push(users[i].elos.concat(new_elos[i][1]))
                } else {
                    elosArr.push([new_elos[i][1]])
                }
            };

            updates = []
            did_b_win = b_score > y_score;
            did_y_win = y_score > b_score;

            for (let i = 0; i < users.length; i++) {
                updates.push(
                    db.collection("users").doc(players[i].uid).set({
                        elo: new_elos[i][1],
                        totalgames: users[i].totalgames + 1,
                        gameslost: users[i].gameslost + did_b_win,
                        gameswon: users[i].gameswon + did_y_win,
                        elos: elosArr[i],
                        timestamps: timeStamps[i]
                    }));
            };  

            _ = await Promise.all(updates)


            _ = await db.collection("games").doc(Date.now().toString()).set({
                uids : players.map(x => x.uid),
                black1name: black_1_pl.name,
                black2name: black_2_pl.name,
                yellow1name: yellow_1_pl.name,
                yellow2name: yellow_2_pl.name,
                yellow_score: y_score,
                black_score: b_score,
                timestamp: Date.now()
            });

            console.log(new_elos);

            res = [new_elos, y_diff, b_diff];

            return res;
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