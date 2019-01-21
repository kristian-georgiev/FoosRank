var mainApp = {};
var firebase = app_fireBase;
const db = firebase.firestore();
db.settings({ timestampsInSnapshots: true });


(function(){
    firebase.auth().onAuthStateChanged(function(user) {
        // if (user) { TODO uncomment

        // }else{ 
        //     // redirect to login page
        //     window.location.replace("login.html");
        // }
            db.collection("users").doc(user.uid).get().then((me) => { // display user info in navbar    
                document.getElementById("navbar-id-text").innerHTML = user.displayName + " " + me.data().elo;
            })

    });

    function logOut(){
        firebase.auth().signOut();
    }

    mainApp.logOut = logOut;
})()