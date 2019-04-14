var mainApp = {};
var firebase = app_fireBase;

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        db.collection("users").doc(user.uid).get().then((me) => { // display user info in navbar    
            document.getElementById("navbar-id-text").innerHTML = user.displayName + " " + me.data().elo;
        });

        function createRow(data, table) {
            var row = document.createElement("tr");

            for (i = 0; i < columns.length; i++) {
                var cell = document.createElement("td");
                if (columns[i] == "Yellow 1") {
                    var cellText = document.createTextNode(data.yellow1uid);
                }
                else if (columns[i] == "Yeellow 2") {
                    var cellText = document.createTextNode(data.yellow2uid);
                }
                else if (columns[i] == "Black 1") {
                    var cellText = document.createTextNode(data.black1uid);
                }
                else if (columns[i] == "Black 2") {
                    var cellText = document.createTextNode(data.black2uid);
                }
                else if (columns[i] == "Games") {
                    var cellText = document.createTextNode(data.yellow_score);
                }
                else { // Elo
                    var cellText = document.createTextNode(data.black_score);
                }
                cell.appendChild(cellText);
                row.appendChild(cell);
            }

            table.appendChild(row);
            ranking += 1;
        }

        async function createTableBase() {
            var table = document.getElementById("rankingtable");

            await db.collection("users").where('is_none', '==', false).orderBy("elo", "desc").get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    createRow(doc.data(), table);
                });
            });

        }

        var columns = ["Ranking", "Name", "Elo", "Games"];
        var ranking = 1;

        createTableBase();



    } else {
        // redirect to login page
        window.location.replace("index.html");
    }

});

// Log out
function logOut() {
    firebase.auth().signOut();
}

mainApp.logOut = logOut;
