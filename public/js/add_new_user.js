var db = firebase.firestore();

firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
       		var tempDocRef = db.collection('users').doc(user.uid);
			tempDocRef.get().then((docData) => {
			    if (docData.exists) {
			      	console.log("current user already exists");
			    } else {
			      	console.log("current user doesn't exist yet, adding user");
			    	addNewUser(user);
			    }
				}).catch((fail) => {
					console.error("Error adding user: ", fail);

			});
        
        }else{
            // redirect to login page
            window.location.replace("login.html");
        }
});

function addNewUser(user) {

	// Create a new document in collection "users"
	db.collection("users").doc(user.uid).set({ // default values
	    elo: 1500,
	    name: user.displayName,
	    totalgames: 0,
	    gameswon: 0,
	    gameslost: 0
	})
	.then(function() {
	    console.log("New user successfully added!");
	})
	.catch(function(error) {
	    console.error("Error writing document: ", error);
	});

}