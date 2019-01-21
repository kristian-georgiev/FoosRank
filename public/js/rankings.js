const db = firebase.firestore();
db.settings({ timestampsInSnapshots: true });

function createRow(data, table){
	var row = document.createElement("tr");

	for (i = 0; i < columns.length; i ++) {
		var cell = document.createElement("td");
		if (columns[i] == "Ranking"){
			var cellText = document.createTextNode(ranking);
		}
		else if (columns[i] == "Name"){
			var cellText = document.createTextNode(data.name);
		}
		else if (columns[i] == "Games Played") {
			var cellText = document.createTextNode(data.totalgames);
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

async function createTableBase(){ //TODO: see if this is actually async
	var table = document.getElementById("rankingtable");
	
	await db.collection("users").orderBy("elo","desc").get().then(function(querySnapshot) {
	    querySnapshot.forEach(function(doc) {
	        createRow(doc.data(), table);
	    });
	});

}

var columns = ["Ranking", "Name", "Games Played", "Elo"];
var ranking = 1;

createTableBase();


