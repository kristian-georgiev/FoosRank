function loadData(){ //TODO: check to see if this handles data spacing right when dates aren't uniform
    // TODO: hardcoded rn
    var a = moment('2017-01-01');
    var b = moment('2017-03-01');
    dateList = [];
    for (var m = moment(a); m.diff(b, 'days') <= 0; m.add(1, 'days')) {
        dateList.push(m.toDate());
    }

    const eloList = []
    for (n = 0; n < 1; n ++ ){
        for (i = 0; i < dateList.length; i ++) {
            eloList.push(Math.floor(Math.random() * 300) + Math.floor(Math.random() * 50));
        }
    }
    return [dateList, eloList];
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
                            beginAtZero: true,
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

function main(){

    const loadedData = loadData();

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