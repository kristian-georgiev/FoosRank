var mainApp = {};

(function(){
    var firebase = app_fireBase;
var uid = null;    
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            print(user)
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