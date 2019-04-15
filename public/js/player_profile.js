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
                    var cellText = document.createTextNode(data.yellow1name);
                }
                else if (columns[i] == "Yellow 2") {
                    var cellText = document.createTextNode(data.yellow2name);
                }
                else if (columns[i] == "Yellow Score") {
                    var cellText = document.createTextNode(data.yellow_score);
                }
                else if (columns[i] == "Black Score") { 
                    var cellText = document.createTextNode(data.black_score);
                }
                else if (columns[i] == "Black 1") {
                    var cellText = document.createTextNode(data.black1name);
                }
                else if (columns[i] == "Black 2") {
                    var cellText = document.createTextNode(data.black2name);
                }
                else if (columns[i] == "Time") {
                    var cellText = timeConverter(document.createTextNode(data.timestamp));
                };
                if (cellText == "Claim spot!") {
                    cellText = "";
                };
                cell.appendChild(cellText);
                row.appendChild(cell);
        };

            table.appendChild(row);
        }

        async function createTableBase() {
            var table = document.getElementById("gamestable");

            await db.collection("games").where('uids', 'array-contains', user.uid).get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    createRow(doc.data(), table);
                });
            });

        }

        
        function timeConverter(t) {     
            var a = new Date(t * 1000);
            var today = new Date();
            var yesterday = new Date(Date.now() - 86400000);
            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var year = a.getFullYear();
            var month = months[a.getMonth()];
            var date = a.getDate();
            var hour = a.getHours();
            var min = a.getMinutes();
            if (a.setHours(0,0,0,0) == today.setHours(0,0,0,0))
                return 'today, ' + hour + ':' + min;
            else if (a.setHours(0,0,0,0) == yesterday.setHours(0,0,0,0))
                return 'yesterday, ' + hour + ':' + min;
            else if (year == today.getFullYear())
                return date + ' ' + month + ', ' + hour + ':' + min;
            else
                return date + ' ' + month + ' ' + year + ', ' + hour + ':' + min;
        };

        var columns = ["Yellow 1", "Yellow 2", "Yellow Score", "Black Score", "Black 1", "Black 2", "Time"];

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
