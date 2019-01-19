var db = firebase.firestore();

firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.

            addUser(user);

        }else{
            // redirect to login page
            window.location.replace("login.html");
        }
});

function addUser(user) {

	// Update/create a document in collection "users"
	db.collection("users").doc(user.uid).set({ 
	    elo: 1500,
	    name: user.displayName
	})
	.then(function() {
	    console.log("User successfully updated / created!");
	})
	.catch(function(error) {
	    console.error("Error writing document: ", error);
	});

}