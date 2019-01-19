var db = firebase.firestore();

firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
        	//TODO check if it's a new user
            addNewUser(user);

        }else{
            // redirect to login page
            window.location.replace("login.html");
        }
});

function addNewUser(user) {

	// Create a new document in collection "users"
	db.collection("users").doc(user.uid).set({ 
	    elo: 1500,
	    name: user.displayName,

	})
	.then(function() {
	    console.log("User successfully added!");
	})
	.catch(function(error) {
	    console.error("Error writing document: ", error);
	});

}

function updateExistingUser(user){

	
}