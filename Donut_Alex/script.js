import Stack from "./stack.js"

var dataFile = "../data/Global_Cybersecurity_Threats_2015-2024.csv"
var dataStack = new Stack();
var categoriesStack = new Stack();
var sortSelect;
var categorySelect;
var currentForm = "Visual";

async function init(){
    //console.log("Init aufgerufen.");
    let promise = await initializeData();
    await promise;
    console.log("init: Erster Log: ")
    console.log(dataStack.peek());
    createSelection();
    initButton();
    visualiseData();


}

async function initializeData(){
    return new Promise( resolve => {
        d3.csv(dataFile).then(function (data){
            data.forEach(function(d){
                d["Attack Type"]=String(d["Attack Type"]);
                d["Target Industry"]=String(d["Target Industry"]);
                d["Year"]=parseFloat(d["Year"])
                d["Financial Loss (in Million $)"]=parseFloat(d["Financial Loss (in Million $)"])
                d["Number of Affected Users"]=parseInt(d["Number of Affected Users"]);
                d["Attack Source"]=String(d["Attack Source"]);
                d["Security Vulnerability Type"]=String(d["Security Vulnerability Type"]);
                d["Defense Mechanism Used"]=String(d["Defense Mechanism Used"]);
                d["Incident Resolution Time (in Hours)"]=parseInt(d["Incident Resolution Time (in Hours)"]);
            });
            dataStack.push(data);
            categoriesStack.push(data.columns.slice(0));
            //console.log("Init Stack erzeugt.");
            //console.log(dataStack.peek());
            console.log(categoriesStack.peek());
            return resolve("done");
        })
    });
}

// Diese Funktion filtert nach der Auswahl die aktuellen Daten
function filterByKeyword(columnName, keyWord){
    //console.log(dataStack.peek());
    let result;
    //console.log("FilterByKeyword: Columnname: " + columnName + ", Keyword: " + keyWord);
    switch (columnName) {
        case "Financial Loss (in Million $)":
        case "Number of Affected Users":
        case "Incident Resolution Time (in Hours)":
            const values = keyWord.split("-").sort()
            console.log(values)
            result = dataStack.peek().filter(function(d) {
                return d[columnName] > values[0]
            }). filter (function(d){
                return d[columnName] < values[1]
            })
            break;
        case "Country":
        case "Attack Type":
        case "Target Industry":
        case "Attack Source":
        case "Security Vulnerability Type":
        case "Defense Mechanism Used":
        case "Year":
            result = dataStack.peek().filter(function(d) {
                return d[columnName] == keyWord
            })
            break;
        default:
            console.log("Fehler in der Gruppierung: " + column)
    }
    var newCategories = categoriesStack.peek().filter(function(d) { return d !== columnName;})

    //console.log(result)    
    dataStack.push(result);
    categoriesStack.push(newCategories);
}
function groupForVisualisation(column){
    console.log("groupForVisualisation aufgerufen: " + column + ", dataStack.peek: ");
    console.log(dataStack.peek());
    //for (const element of dataStack.peek()){
    //    console.log(element)
    //}
    console.log(Object.entries(dataStack.peek()))
    console.log("groupForVis: " + column)
    var result;
    let minimum = 0, maximum = 0, nullBezug = 0, schrittweite = 0, objekt1, high = 0, low = 0
    switch (column) {
        case "Country":
        case "Attack Type":
        case "Attack Source":
        case "Security Vulnerability Type":
        case "Defense Mechanism Used":
        case "Year":
        case "Target Industry":
            //TOOO: In ein vernünftiges Array umbauen -> Siehe Zeile 82
            result = d3.rollups(dataStack.peek(),
                (D) => ({
                    financialLoss: d3.sum(D, d => +d["Financial Loss (in Million $)"]),
                    usersAffected: d3.sum(D, d => +d["Number of Affected Users"]),
                    incidentResolutionTime: d3.sum(D, d => +d["Incident Resolution Time (in Hours)"]),
                    count: d3.count(D, d => d["Incident Resolution Time (in Hours)"])
                }),
                (d) => d[column]);
            break;
        
        case "Financial Loss (in Million $)":
        case "Number of Affected Users":
        case "Incident Resolution Time (in Hours)":
            minimum = Math.round(d3.min(dataStack.peek(), (d) => d[column]));
            maximum = Math.round(d3.max(dataStack.peek(), (d) => d[column]));
            nullBezug = maximum - minimum;
            schrittweite = parseInt(nullBezug / 5);
            high = Math.round(schrittweite/2)
            result = []
            objekt1 = {
                financialLoss: 0,
                incidentResolutionTime: 0,
                usersAffected: 0,
                count: 0,
            }
            for (let index = 0; index < 5; index++) {
                result.push([low + "-" + high, structuredClone(objekt1)])
                low = high + 1
                high = high + schrittweite
            }
            result.at(4)[0] = String(low + "-" + maximum);
            dataStack.peek().forEach(element => {
                if (element[column] <= Math.round(schrittweite/2)) {
                    result[0][1].financialLoss += element["Financial Loss (in Million $)"]
                    result[0][1].incidentResolutionTime += element["Incident Resolution Time (in Hours)"]
                    result[0][1].usersAffected += element["Number of Affected Users"]
                    result[0][1].count += 1
                } else if (element[column] <= ((schrittweite *1) + Math.round(schrittweite/2))) {
                    result[1][1].financialLoss += element["Financial Loss (in Million $)"]
                    result[1][1].incidentResolutionTime += element["Incident Resolution Time (in Hours)"]
                    result[1][1].usersAffected += element["Number of Affected Users"]
                    result[1][1].count += 1
                } else if (element[column] <= ((schrittweite *2) + Math.round(schrittweite/2))) {
                    result[2][1].financialLoss += element["Financial Loss (in Million $)"]
                    result[2][1].incidentResolutionTime += element["Incident Resolution Time (in Hours)"]
                    result[2][1].usersAffected += element["Number of Affected Users"]
                    result[2][1].count += 1
                } else if (element[column] <= ((schrittweite * 3) + Math.round(schrittweite/2))) {
                    result[3][1].financialLoss += element["Financial Loss (in Million $)"]
                    result[3][1].incidentResolutionTime += element["Incident Resolution Time (in Hours)"]
                    result[3][1].usersAffected += element["Number of Affected Users"]
                    result[3][1].count += 1
                } else {
                    result[4][1].financialLoss += element["Financial Loss (in Million $)"]
                    result[4][1].incidentResolutionTime += element["Incident Resolution Time (in Hours)"]
                    result[4][1].usersAffected += element["Number of Affected Users"]
                    result[4][1].count += 1
                } 
            });
            console.log("minumum: " + minimum + ", maximum: " + maximum + ", nullBezug: " + nullBezug)
            break;
        default:
            console.log("Fehler in der Gruppierung: " + column)
    }
    return result
}
//


// Diese Funktion soll das SVG erstellen
function visualiseData() {
    var layerData = groupForVisualisation(categorySelect);
    //createSelection();
    console.log("layerData:")
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
            //console.log(d[1][1][sortSelect])
            // d -> Array-Objekt
            // d[1] -> Objekt aus Array (Test ist: ["Land", [finanzialLoss: ...]]) 
            // d[1][1] -> Werte aus Objekt
            //console.log("Datenaufbau herausbekommen")
            //console.log(d)
            //console.log(d[1])
            //console.log(d[1][1])
            return d[1][1][sortSelect]
        })
    const data_ready = pie(Object.entries(layerData))
    
    console.log("data_ready: ")
    console.log(data_ready)
    //Erzeugen des Daten Donuts
    var label = d3.arc()
        .innerRadius(120)
        .outerRadius(radius)
    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg.selectAll('slices')
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
            if (dataStack.size() > 2) alert("3x schon gesprungen")
            filterByKeyword(categorySelect, d.data[1][0]);
            createSelection();
            visualiseData();
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
        .style("fill", "#ffffff")
        .attr("d", arcSelect)
        .text("Ebene nach Oben")
        .style("opacity", 0.4)
        .on("click", function (d){
            if(dataStack.size() > 1){
                console.log("Springe zurück")
                dataStack.pop();
                categoriesStack.pop();
                createSelection();
                visualiseData();
            } else console.log("Die erstes Ebene existiert schon")
        });
}

function showData(){
    var data = dataStack.peek();
    console.log("Show data: ")
    console.log(data)
    var column = ["Country", "Year", "Attack Type", "Target Industry", "Financial Loss (in Million $)", "Number of Affected Users", "Attack Source", "Security Vulnerability Type", "Defense Mechanism Used", "Incident Resolution Time (in Hours)"];
    console.log("Show Columns: ")
    console.log(column)
    var width = 850
    var height = 450
    var margin = 10
    // Erzeugen des Containers
    var table = d3.select("#graph-container")
        .append("table")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    var thead = table.append('thead')
    var tbody = table.append("tbody")
    thead.append("tr")
        .selectAll("th")
        .data(column)
        .enter()
        .append("th")
        .text(function (column){ return column;})
    // create a row for each object in the data
	var rows = tbody.selectAll('tr')
	  .data(dataStack.peek())
	  .enter()
	  .append('tr');
    // create a cell in each row for each column
	var cells = rows.selectAll('td')
	  .data(function (row) {
	    return column.map(function (column) {
	      return {column: column, value: row[column]};
	    });
	  })
	  .enter()
	  .append('td')
	    .text(function (d) { return d.value; });
}

function updateInfo(){

}

function createSelection(){
    var i, L = document.getElementById('categorySelector').options.length - 1;
    for(i = L; i >= 0; i--) {
        document.getElementById('categorySelector').remove(i);
    }
    L = document.getElementById('sortSelector').options.length - 1;
    for(i = L; i >= 0; i--) {
        document.getElementById('sortSelector').remove(i);
    }

    for (const element of categoriesStack.peek()){
        // Step 1: Create the option element
        const option = document.createElement('option');

        // Step 2: Set the option value and text
        option.value = element;
        option.textContent = element;

        // Step 3: Append the option to the select dropdown
        document.getElementById('categorySelector').appendChild(option);
    }
    const sortArray = [["financialLoss","Financial Loss (in Million $)"],["usersAffected", "Number of Affected Users"],["incidentResolutionTime", "Incident Resolution Time (in Hours)"], ["count", "Anzahl der Vorkommnisse"]]
    for (const element of sortArray){
        // Step 1: Create the option element
        const option = document.createElement('option');

        // Step 2: Set the option value and text
        option.value = element.at(0);
        option.textContent = element.at(1);

        // Step 3: Append the option to the select dropdown
        document.getElementById('sortSelector').appendChild(option);
    }

    document.getElementById('sortSelector').onchange = function(){
        sortSelect = document.getElementById('sortSelector').value;
        console.log(sortSelect)
        visualiseData();
    }
    document.getElementById('categorySelector').onchange = function(){
        categorySelect = document.getElementById('categorySelector').value;
        console.log(categorySelect)
        visualiseData();
    }

    categorySelect = categoriesStack.peek().at(0);
    sortSelect = sortArray.at(0).at(0);
    console.log("sortSelect: " + sortSelect + ", categorySelect: " + categorySelect);
}



function initButton(){
    let switchFormButton = document.getElementById("switchButton");
    console.log(switchFormButton)
    switchFormButton.innerHTML = 'Show raw Data!';
    switchFormButton.onclick = function(){
        if (currentForm == "Visual"){
            currentForm = "Data"
            switchFormButton.innerHTML = 'Show Visualization!';
            d3.select("svg").remove("svg")
            document.getElementById("my-select").style.display = 'none';
            showData();
        } else {
            currentForm = "Visual"
            switchFormButton.innerHTML = 'Show raw Data!';
            d3.select("table").remove("table")
            document.getElementById("my-select").style.display = '';
            visualiseData();
        }
    }
    
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
