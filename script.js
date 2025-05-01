import Stack from "./stack.js"

var dataFile = "data/Global_Cybersecurity_Threats_2015-2024.csv"
var dataStack = new Stack();
var categoriesStack = new Stack();

async function init(){
    console.log("Init aufgerufen.");
    let promise = await initializeData();
    await promise;
    visualiseData();
}

async function initializeData(){
    return new Promise( resolve => {
        d3.csv(dataFile).then(function (data){
            data.forEach(function(d){
                d["attackType"]=String(d["Attack Type"]);
                d["targetIndustry"]=String(d["Target Industry"]);
                d["financialLoss"]=parseFloat(d["Financial Loss (in Million $)"])
                d["usersAffected"]=parseInt(d["Number of Affected Users"]);
                d["attackSource"]=String(d["Attack Source"]);
                d["vulnerabilityType"]=String(d["Security Vulnerability Type"]);
                d["defenseMechanism"]=String(d["Defense Mechanism Used"]);
                d["incidentResolutionTime"]=parseInt(d["Incident Resolution Time (in Hours)"]);
            });
            dataStack.push(data);
            categoriesStack.push(data.columns.slice(0));
            console.log("Init Stack erzeugt.");
            console.log(dataStack.peek());
            console.log(categoriesStack.peek());
            return resolve("done");
        })
    });
}

// Diese Funktion filtert nach der Auswahl die aktuellen Daten
function filterByKeyword(columnName, keyWord){
    console.log(dataStack.peek());
    console.log(columnName + " " + keyWord);
}
function groupForVisualisation(column){
    console.log("groupForVisualisation aufgerufen: " + column);
    console.log(dataStack.peek());
    if (column === "Country") {
         return d3.rollups(dataStack.peek(),
            (D) => ({
                financialLoss: d3.sum(D, d => +d.financialLoss),
                usersAffected: d3.sum(D, d => +d.usersAffected),
                incidentResolutionTime: d3.sum(D, d => +d.incidentResolutionTime)
            }),
            (d) => d.Country);
    }

}
//


// Diese Funktion soll das SVG erstellen
function visualiseData(){
    var layerData = groupForVisualisation("Country");
    console.log(layerData);

}

// Testfunktion
function testFunction(){
    d3.csv(dataFile).then(function(data){
        console.log(data);
        data.forEach(function(d){
            d["financialLoss"]=parseFloat(d["Financial Loss (in Million $)"]);
            //d["displacement(cc)"]= parseFloat(d["displacement (cc)"]);
        });

        console.log(dataNew);
        var finanz = d3.sum(data, d => d["financialLoss"]);
        console.log(finanz);
        console.log(data.columns.slice(0));
        //var countryData = d3.rollup(data, v => d3.sum(v,d => d["Financial Loss (in Million $)"]) , d => d.Country);
        //console.log(countryData);
    })
}
init();
