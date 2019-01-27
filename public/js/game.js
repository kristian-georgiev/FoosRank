var mainApp = {};
var firebase = app_fireBase;
const db = firebase.firestore();
db.settings({ timestampsInSnapshots: true });


(function () {
    var uid = null
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.

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
            var popup_continue = document.getElementById("popup_continue")



            booleans_ref.update({
                has_game_started: true
            }).then(function () {
                // Game starts

                setTimeout(function () { // exit game after 45 mins, in case a user leaves the game unfinished
                    booleans_ref.get()
                    .then(doc => {
                        plrs = ["black_1", "black_2", "yellow_1", "yellow_2"]
                        for (plr in plrs) {
                            players_ref.doc(plrs[plr]).update({
                                name: "Claim spot!",
                                uid: "none"
                            });
                        }
                    }).then(function () { // and update game parameters
                        booleans_ref.update({
                            has_game_ended: false,
                            has_game_page_been_exited: true,
                            has_game_started: false,
                            is_ready_to_record_game: false,
                            start_button_enabled: false,
                            winner: ""
                        }).then(function () {
                            scores_ref.update({ // clean game result
                                yellow_sc: 0,
                                black_sc: 0,
                                score_history: []
                            }).then(
                                function () { // exit game
                                    window.location.replace("main.html")
                                });
                        });
                    });
                },  45 * 60 * 1000);

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
                    scores_ref.get().then(function (doc) { // and update game status if necessary
                        if (doc.exists) {
                            y_sc = doc.data().yellow_sc;
                            b_sc = doc.data().black_sc;
                            if (((y_sc == 10 && b_sc <= 8) || (y_sc > 10 && (y_sc - b_sc == 2))) ||
                                ((b_sc == 10 && yellow_sc <= 8) || (b_sc > 10 && (b_sc - y_sc == 2)))) {
                                w = "Yellow"
                                if (y_sc < b_sc) {
                                    w = "Black"
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

                        } else {
                            console.log("We fucked up!");
                        }
                    }).catch(function (error) {
                        console.log("Error getting document:", error);
                    });
                });

                scores_ref.onSnapshot(function () { // Listen for changes in the scores DB 
                    scores_ref.get().then(function (doc) { // and update HTML upon each change    
                        if (doc.exists) {
                            yellow_sc = doc.data().yellow_sc;
                            black_sc = doc.data().black_sc;
                            scoretable.innerHTML = yellow_sc + " : " + black_sc;
                            var min;
                            if (window.innerWidth < window.innerHeight) {
                                min = window.innerWidth;
                            } else {
                                min = window.innerHeight;
                            }

                            if (yellow_sc >= 10 || black_sc >= 10) { // sizing the scoretext right
                                scoretable.style.fontSize = (min * 0.25) + "" + "px";
                            }
                            if (yellow_sc < 10 && black_sc < 10) { //TODO see if this works
                                scoretable.style.fontSize = (min * 0.5) + "" + "px";
                            }

                        } else {
                            console.log("We fucked up!");
                        }
                    }).catch(function (error) {
                        console.log("Error getting document:", error);
                    });
                });

                booleans_ref.onSnapshot(function () { // Handle popup behaviour at end of game 
                    booleans_ref.get()
                        .then(doc => {
                            if (doc.data().has_game_ended == true) {
                                display_popup(doc.data().winner);
                            }
                        }).catch(function (error) {
                            console.log("Error getting document:", error);
                        });
                });

                booleans_ref.onSnapshot(function () { // Handle player updates after game
                    booleans_ref.get().then(doc => {
                        if (doc.data().is_ready_to_record_game == true) {
                            players_ref.get()
                                .then(snapshot => {
                                    var black_1 = snapshot.docs[0].data(); // bad practice, fix at some point in my life
                                    var black_2 = snapshot.docs[1].data();
                                    var scores = snapshot.docs[3].data();
                                    var yellow_1 = snapshot.docs[4].data();
                                    var yellow_2 = snapshot.docs[5].data();

                                    db.collection("users").doc(black_1.uid).get().then(doc => { // even worse practice lol
                                        return [doc.data()] // will have to make this parallel at some point
                                    }).then(users => {
                                        db.collection("users").doc(black_2.uid).get().then(doc => {
                                            return users.concat(doc.data())
                                        }).then(users => {
                                            db.collection("users").doc(yellow_1.uid).get().then(doc => {
                                                return users.concat(doc.data())
                                            }).then(users => {
                                                db.collection("users").doc(yellow_2.uid).get().then(doc => {
                                                    return users.concat(doc.data())
                                                }).then(users => { // Calculate and update elos
                                                    console.log(users)
                                                    var b_elo_overall = (users[0].elo + users[1].elo) / 2;
                                                    var y_elo_overall = (users[2].elo + users[3].elo) / 2;
                                                    var prob_y_win = 1.0 / (1.0 + Math.pow(10, ((b_elo_overall - y_elo_overall) / 400)));
                                                    var prob_b_win = 1 - prob_y_win;
                                                    console.log(b_elo_overall)
                                                    console.log(y_elo_overall)
                                                    console.log(prob_y_win)

                                                    if (scores.yellow_sc > scores.black_sc) {
                                                        var did_y_win = 1;
                                                        var did_b_win = 0;
                                                    } else {
                                                        var did_y_win = 0;
                                                        var did_b_win = 1;
                                                    }
                                                    b_diff = Math.round(64 * (did_b_win - prob_b_win));
                                                    y_diff = Math.round(64 * (did_y_win - prob_y_win));

                                                    db.collection("users").doc(black_1.uid).update({
                                                        elo: users[0].elo + b_diff,
                                                        totalgames: users[0].totalgames + 1,
                                                        gameslost: users[0].gameslost + did_b_win,
                                                        gameswon: users[0].gameswon + did_y_win
                                                    }).then(function () {
                                                        db.collection("users").doc(black_2.uid).update({
                                                            elo: users[1].elo + b_diff,
                                                            totalgames: users[1].totalgames + 1,
                                                            gameslost: users[1].gameslost + did_b_win,
                                                            gameswon: users[1].gameswon + did_y_win
                                                        }).then(function () {
                                                            db.collection("users").doc(yellow_1.uid).update({
                                                                elo: users[2].elo + y_diff,
                                                                totalgames: users[2].totalgames + 1,
                                                                gameslost: users[2].gameslost + did_b_win,
                                                                gameswon: users[2].gameswon + did_y_win
                                                            }).then(function () {
                                                                db.collection("users").doc(yellow_2.uid).update({
                                                                    elo: users[3].elo + y_diff,
                                                                    totalgames: users[3].totalgames + 1,
                                                                    gameslost: users[3].gameslost + did_b_win,
                                                                    gameswon: users[3].gameswon + did_y_win
                                                                }).then(function () {
                                                                    db.collection("games").add({ // add game to the db of past games
                                                                        black1uid: black_1.uid,
                                                                        black2uid: black_2.uid,
                                                                        yellow1uid: yellow_1.uid,
                                                                        yellow2uid: yellow_2.uid,
                                                                        black_score: yellow_sc,
                                                                        yellow_score: black_sc,
                                                                    }).then(doc => { // after recording, clear player spots
                                                                        booleans_ref.get()
                                                                            .then(doc => {
                                                                                plrs = ["black_1", "black_2", "yellow_1", "yellow_2"]
                                                                                for (plr in plrs) {
                                                                                    players_ref.doc(plrs[plr]).update({
                                                                                        name: "Claim spot!",
                                                                                        uid: "none"
                                                                                    });
                                                                                }
                                                                            }).then(function () { // and update game parameters
                                                                                booleans_ref.update({
                                                                                    has_game_ended: false,
                                                                                    has_game_page_been_exited: true,
                                                                                    has_game_started: false,
                                                                                    is_ready_to_record_game: false,
                                                                                    start_button_enabled: false,
                                                                                    winner: ""
                                                                                }).then(function () {
                                                                                    scores_ref.update({ // clean game result
                                                                                        yellow_sc: 0,
                                                                                        black_sc: 0,
                                                                                        score_history: []
                                                                                    }).then(
                                                                                        function () { // exit game
                                                                                            window.location.replace("main.html")
                                                                                        });
                                                                                });
                                                                            });
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                        }
                    });
                });


                // =================== catching user behaviour ===================         

                yellow_div.addEventListener('click', function (e) {
                    scores_ref.get()
                        .then((doc) => {
                            scores_ref.update({
                                yellow_sc: doc.data().yellow_sc + 1,
                                score_history: doc.data().score_history.concat("y")
                            });
                        });
                });

                black_div.addEventListener('click', function (e) {
                    scores_ref.get()
                        .then((doc) => {
                            scores_ref.update({
                                black_sc: doc.data().black_sc + 1,
                                score_history: doc.data().score_history.concat("b")
                            });
                        });
                });

                // Undoing actions

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

                // =================== end of catching user behaviour ===================         





                // =================== Popup upon ending game ===================         

                function display_popup(winning_team) {
                    popup_text.innerHTML = "<h1>" + winning_team + " wins!</h1>"
                    popup.style.display = "block";
                };

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

                popup_continue.onclick = function () {
                    popup.style.display = "none";
                    booleans_ref.update({
                        is_ready_to_record_game: true
                    });
                };


                // Helper functions

                function get_first_name(s) {
                    var sArray = s.split(" ");
                    return sArray[0]
                };

            }) // closing start of game
        } else {
            // redirect to login page
            uid = null;
            window.location.replace("login.html");
        }

    });


    function logOut() {
        firebase.auth().signOut();
    }

    mainApp.logOut = logOut;
})()
