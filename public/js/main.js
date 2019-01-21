var mainApp = {};
var firebase = app_fireBase;


(function(){
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
                document.getElementById("navbar-id-text").innerHTML = user.displayName + " " + me.data().elo;
                })


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