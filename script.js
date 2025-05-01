import stack from "./stack"
var dataFile = "data/Global_Cybersecurity_Threats_2015-2024.csv"

function createData(){
    d3.csv(dataFile).then(function(data){
        console.log(data);
        data.forEach(function(d){
            d["financialLoss"]=parseFloat(d["Financial Loss (in Million $)"]);
            //d["displacement(cc)"]= parseFloat(d["displacement (cc)"]);
        });
        var dataNew = d3.rollup(data, (D) => d3.sum(D, d => d["financialLoss"]), (d) => d.Country);
        console.log(dataNew);
        var finanz = d3.sum(data, d => d["financialLoss"]);
        console.log(finanz);
        console.log(data.columns.slice(0));
        //var countryData = d3.rollup(data, v => d3.sum(v,d => d["Financial Loss (in Million $)"]) , d => d.Country);
        //console.log(countryData);
    })
}

createData();