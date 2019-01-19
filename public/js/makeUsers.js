var db = firebase.firestore();

function addUser() {

	// Add a new document with a generated id.
	db.collection("users").add({
	    name: "Tokyo",
	    country: "Japan"
	})
	.then(function(docRef) {
	    console.log("Document written with ID: ", docRef.id);
	})
	.catch(function(error) {
	    console.error("Error adding document: ", error);
	});

}

addUser();