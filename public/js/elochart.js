var uid = null
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.

        async function loadData(){ //TODO: check to see if this handles data spacing right when dates aren't uniform
            let userInfo = await db.collection("users").doc(user.uid).get();
            let userData = userInfo.data();
            console.log([userData.timestamps, userData.elos])
            return [userData.timestamps, userData.elos];
        }

        function createChart(data, ctx){
            const options = {
                    type: 'line',
                    data: data,
                    options: {
                        fill: false,
                        responsive: true,
                        scales: {
                            xAxes: [{
                                type: 'time',
                                display: true,
                                scaleLabel: {
                                    display: true,
                                    labelString: "Time",
                                }
                            }],
                            yAxes: [{
                                ticks: {
                                    beginAtZero: false,
                                },
                                display: true,
                                scaleLabel: {
                                    display: true,
                                    labelString: "ELO",
                                }
                            }]
                        }
                    }
                }    
                
            const chart = new Chart(ctx, options);
        }

        async function main(){

            const loadedData = await loadData();

            const dateList = loadedData[0];
            const eloList = loadedData[1];

            const data = {
                labels: dateList,
                datasets: [],
            }

            // rendering player's ELO on the graph
            data.datasets.push(
                {
                fill: false,
                label: "Your ELO",
                data: eloList,
                borderColor: '#FFC128',
                backgroundColor: '#FFC128',
                lineTension: 0,
                }
            )

            const ctx = document.getElementById('myChart').getContext('2d');

            createChart(data, ctx);
            

        }


        main();

}});