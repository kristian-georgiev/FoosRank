
function createRow(data, table){
	console.log(data);
	var row = document.createElement("tr");

	for (i = 0; i < columns.length; i ++) {
		var cell = document.createElement("td");
		if (columns[i] == "Ranking"){
			var cellText = document.createTextNode(ranking);
		}
		else if (columns[i] == "Name"){
			var cellText = document.createTextNode(data.name);
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

async function createTableBase(){ //TODO // see if this is actually async
	var db = firebase.firestore();
	var table = document.getElementById("rankingtable");
	await db.collection("users").get().then(function(querySnapshot) {
	    querySnapshot.forEach(function(doc) {
	        createRow(doc.data(), table);
	    });
	});

}

var columns = ["Ranking", "Name", "Elo"];
var ranking = 1;
createTableBase();


