var mainApp = {};
var firebase = app_fireBase;
const db = firebase.firestore();
db.settings({ timestampsInSnapshots: true });


firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        db.collection("users").doc(user.uid).get().then((me) => { // display user info in navbar    
            document.getElementById("navbar-id-text").innerHTML = user.displayName + " " + me.data().elo;
        });
    } else {
        // redirect to login page
        window.location.replace("index.html");
    }

});

function logOut() {
    firebase.auth().signOut();
}

mainApp.logOut = logOut;
