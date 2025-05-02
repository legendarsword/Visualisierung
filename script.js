import Stack from "./stack.js"

var dataFile = "data/Global_Cybersecurity_Threats_2015-2024.csv"
var dataStack = new Stack();
var categoriesStack = new Stack();

async function init(){
    //console.log("Init aufgerufen.");
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
            //console.log("Init Stack erzeugt.");
            //console.log(dataStack.peek());
            //console.log(categoriesStack.peek());
            return resolve("done");
        })
    });
}

// Diese Funktion filtert nach der Auswahl die aktuellen Daten
function filterByKeyword(columnName, keyWord){
    //console.log(dataStack.peek());
    console.log("FilterByKeyword: Columnname: " + columnName + ", Keyword: " + keyWord);
    dataStack.push(dataStack.peek());
}
function groupForVisualisation(column){
    //console.log("groupForVisualisation aufgerufen: " + column);
    //console.log(dataStack.peek());
    if (column === "Country") {
        //TOOO: In ein vernünftiges Array umbauen -> Siehe Zeile 82
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
function visualiseData() {
    var layerData = groupForVisualisation("Country");
    console.log(layerData);
    var width = 450
    var height = 450
    var margin = 10
    var radius = Math.min(width, height) / 2 - margin
    d3.select("svg").remove("svg")
    // Erzeugen des Containers
    var svg = d3.select("#graph-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    // set the color scale
    const color = d3.scaleOrdinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"])
// Compute the position of each group on the pie:
    const pie = d3.pie()
        .value(function (d) {
            //TODO: Vernünftiges Array umbauen
            return d[1][1].incidentResolutionTime
        })
    const data_ready = pie(Object.entries(layerData))
    //Erzeugen des Daten Donuts
    var label = d3.arc()
        .innerRadius(120)
        .outerRadius(radius)
    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg .selectAll('slices')
        .data(data_ready)
        .join('path')
        .attr('d', d3.arc()
            .innerRadius(150)
            .outerRadius(radius)
        )
        .attr('fill', function (d) {
            return (color(d.data[1]))
        })
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)
        .on("click", (event, d) => {
            filterByKeyword("Country", d.data[1][0]);
        });
    // Erzeugen der Beschriftung
    svg.selectAll('slices')
        .data(data_ready)
        .enter()
        .append('text')
        .text(function(d){ return d.data[1][0]})
        .attr("transform", function(d) { return "translate(" + label.centroid(d) + ")";  })
        .style("text-anchor", "middle")
        .style("font-size", 17);
    //Erzeugen des inneren Kerns fürs zurückspringen
    var arcSelect = d3.arc()
        .startAngle(0)
        .endAngle(2*Math.PI)
        .innerRadius(0)
        .outerRadius(149);

    svg.append('path')
        .style("fill", "#a05d56")
        .attr("d", arcSelect)
        .text("Ebene nach Oben")
        .style("opacity", 0.4)
        .on("click", function (d){
            if(dataStack.size() > 1){
                console.log("Springe zurück")
                dataStack.pop();
                visualiseData();
            } else console.log("Die erstes Ebene existiert schon")
        });
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
