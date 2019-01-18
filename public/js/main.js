var mainApp = {};

(function(){
    var firebase = app_fireBase;
var uid = null;    
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