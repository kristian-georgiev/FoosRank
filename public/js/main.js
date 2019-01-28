var mainApp = {};
var firebase = app_fireBase;

var uid = null // TODO: I don't think this is needed?    
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            user.providerData.forEach(function (profile) {
                console.log("Sign-in provider: " + profile.providerId);
                console.log("  Provider-specific UID: " + profile.uid);
                console.log("  Name: " + profile.displayName);
                console.log("  Email: " + profile.email);
                console.log("  Photo URL: " + profile.photoURL);

            });

            db.collection("users").doc(user.uid).get().then((me) => { // display user info in navbar    
                document.getElementById("navbar-id-text").innerHTML = get_first_name(user.displayName) + " " + me.data().elo;
                })

            function createRow(data, table){
                var row = document.createElement("tr");

                for (i = 0; i < columns.length; i ++) {
                    var cell = document.createElement("td");
                    if (columns[i] == "Ranking"){
                        var cellText = document.createTextNode(ranking);
                    }
                    else if (columns[i] == "Name"){
                        var cellText = document.createTextNode(data.name);
                    }
                    else if (columns[i] == "Games") {
                        var cellText = document.createTextNode(data.totalgames);
                    }
                    else { // Elo
                        var cellText = document.createTextNode(data.elo);
                    }
                    cell.appendChild(cellText);
                    row.appendChild(cell);
                }

                table.appendChild(row);
                ranking += 1;
            }

            async function createTableBase(){ //TODO: see if this is actually async
                var table = document.getElementById("rankingtable");
                
                await db.collection("users").where('is_none', '==', false).orderBy("elo","desc").get().then(function(querySnapshot) {
                    querySnapshot.forEach(function(doc) {
                        createRow(doc.data(), table);
                    });
                });

            }

            var columns = ["Ranking", "Name", "Elo", "Games"];
            var ranking = 1;

            createTableBase();

            // Helper functions

            function get_first_name(s) {
                var sArray = s.split(" ");
                return sArray[0]
            };


        }else{
            // redirect to login page
            uid = null;
            window.location.replace("index.html");
        }
    });

    function logOut(){
        firebase.auth().signOut();
    }

    mainApp.logOut = logOut;