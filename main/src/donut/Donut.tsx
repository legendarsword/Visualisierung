import React, { FC, useEffect } from 'react';
import * as d3 from 'd3';
/*
    Major Decision:
    - Should look like this: https://gist.github.com/pqthang711/e750d2f5918df1b8c5e6e244003703c6
    - Stack-like behavior with arrays, so the return is possible but huge data storage
    - D3js on visualization and filterung
    - Order:
        1. filter current data depending on selectec pie slice and add to stack
        2. Group data depending on selected category
        3. create visualization depending the selected dataview

*/

export const Donut = () => {
    useEffect(() => {
        // dataFile is in public directory
        const dataFile: string = "data/Global_Cybersecurity_Threats_2015-2024.csv";
        /*
            dataStack + categoriesStack
                1. original data
                2. after 1. filtering 
                3. after 2. filtering
                4. after 3. filtering --> showData()-table
        */
        const dataStack: any[] = [];
        const categoriesStack: string[] = [];
        let sortSelect: string;
        let categorySelect: string;
        let currentForm: string = "Visual";
        const returnCircleColor: string[] = [];
        const colorArray: string[] = ["#ffb822","#00bf8c","#219ddb","#ad85cc","#f95275","#80B647","#11AEB4","#6791D4","#D36CA1","#FC803B"];
        const colorRange: d3.ScaleOrdinal<string, unknown> = d3.scaleOrdinal().range(colorArray);
        const wordColor: string = "#d1d5dc"

        async function init(): Promise<void> {
            let promise = await initializeData();
            await promise;
            createSelection();
            initButton();
            visualiseData();
        }

        /*
            Initialize Data, parse the csv value for usage and put first data onto stack
            await because javascript tried to create visualization before creating data
        */
        async function initializeData(): Promise<string> {
            return new Promise(resolve => {
                d3.csv(dataFile).then(function (data) {
                    data.forEach(function(d) {
                        d["Attack Type"] = String(d["Attack Type"]);
                        d["Target Industry"] = String(d["Target Industry"]);
                        d["Year"] = parseFloat(d["Year"]);
                        d["Financial Loss (in Million $)"] = parseFloat(d["Financial Loss (in Million $)"]);
                        d["Number of Affected Users"] = parseInt(d["Number of Affected Users"], 10);
                        d["Attack Source"] = String(d["Attack Source"]);
                        d["Security Vulnerability Type"] = String(d["Security Vulnerability Type"]);
                        d["Defense Mechanism Used"] = String(d["Defense Mechanism Used"]);
                        d["Incident Resolution Time (in Hours)"] = parseInt(d["Incident Resolution Time (in Hours)"], 10);
                    });
                    dataStack.push(data);
                    categoriesStack.push(data.columns.slice(0));
                    return resolve("done");
                });
            });
        }

        /*
            Filter the data from peek of stack and push it to stack
            The top of the stack is now a array of row-objects
            example:
            [ 
                Object(Country, Attack Type, ....),
                Object(Country, Attack Type, ....)
            ]
        */
        function filterByKeyword(columnName: string, keyWord: string): void {
            let result: any[];
            switch (columnName) {
                case "Financial Loss (in Million $)":
                case "Number of Affected Users":
                case "Incident Resolution Time (in Hours)":
                    // These 3 categories will enter a range split with an - (e.g. 100-200) and tries to filter all rows
                    const values: number[] = keyWord.split("-").sort().map(Number);
                    result = dataStack.at(dataStack.length - 1).filter(function(d) {
                        return d[columnName] > values[0] && d[columnName] < values[1];
                    });
                    break;
                case "Country":
                case "Attack Type":
                case "Target Industry":
                case "Attack Source":
                case "Security Vulnerability Type":
                case "Defense Mechanism Used":
                case "Year":
                    // These values will return the exact filtered rows
                    result = dataStack.at(dataStack.length - 1).filter(function(d) {
                        return d[columnName] === keyWord;
                    });
                    break;
                default:
                    console.log("Fehler in der Gruppierung: " + columnName);
            }
            // Create new category list
            const newCategories: string[] = categoriesStack.at(categoriesStack.length - 1).filter(function(d) { return d !== columnName; });

            dataStack.push(result);
            categoriesStack.push(newCategories);
        }
        
        /*
            This function returns an array of arrays of values depending the selected  category
            Example: 
            [
                [Value 1, [ financialLoss, usersAffected, incidentResolutionTime, count]],
                [Value 2, [ financialLoss, usersAffected, incidentResolutionTime, count]],
            ]
        */
        function groupForVisualisation(column: string): any {
            let result: any;
            let minimum: number = 0, maximum: number = 0, nullBezug:number = 0, schrittweite:number = 0, objekt1:any, high:number = 0, low:number = 0;

            switch (column) {
                case "Country":
                case "Attack Type":
                case "Attack Source":
                case "Security Vulnerability Type":
                case "Defense Mechanism Used":
                case "Year":
                case "Target Industry":
                    // This can be done with the d3 function because of single word searches
                    result = d3.rollups(dataStack.at(dataStack.length -1),
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
                    // This is the sequential version of filtering, because of this will categorize all rows into 6 slices
                    minimum = Math.round(d3.min(dataStack.at(dataStack.length -1), (d) => d[column]));
                    maximum = Math.round(d3.max(dataStack.at(dataStack.length -1), (d) => d[column]));
                    nullBezug = maximum - minimum;
                    schrittweite = parseInt(nullBezug / 5);
                    high = Math.round(schrittweite/2)
                    result = []
                    // prepared object for each slice
                    objekt1 = {
                        financialLoss: 0,
                        incidentResolutionTime: 0,
                        usersAffected: 0,
                        count: 0,
                    }
                    // create the label text
                    for (let index = 0; index < 5; index++) {
                        result.push([low + "-" + high, structuredClone(objekt1)])
                        low = high + 1
                        high = high + schrittweite
                    }
                    result.at(4)[0] = String(low + "-" + maximum);
                    dataStack.at(dataStack.length -1).forEach(element => {
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
                    break;
                default:
                    console.log("Fehler in der Gruppierung: " + column);
            }
            
            return result;
        }

        /*
            This function is creating the pie chart, label + tooltip depending on the selection from to of stack
            it uses the visible donut-container div --> will be hiden, if table is shown --> showData()
        */
        function visualiseData(): void {
            var layerData = groupForVisualisation(categorySelect);
            var width = 450;
            var height = 450;
            var margin = 20
            var radius = Math.min(width*0.85, height*0.85) / 2 - margin
            // destroy the previous container, to not conflict the creation
            d3.select("#donut-container").select("svg").remove()
            // create new pie chart
            var svg = d3.select("#donut-container")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", [0, 0, width, height])
                .append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
            
            // Add Tooltips-Container
            d3.select('body').append('div').attr('id', 'tooltip').attr('style', 'position: absolute; opacity: 0;');
            
            // create pie object, data will be added later            
            const pie = d3.pie()
                .value(function (d) {
                    // d -> Array-Objekt
                    // d[1] -> Objekt aus Array (Test ist: ["Land", [finanzialLoss: ...]]) 
                    // d[1][1] -> Werte aus Objekt
                    return d[1][1][sortSelect]
                })
                .sort(function (a,b){ return a[1][0] > b[1][0]})

            const data_ready = pie(Object.entries(layerData))
            
            // Creation of arc sizes
            var labelArc = d3.arc()
                .innerRadius(radius*0.5)
                .outerRadius(radius*0.85)
            var sliceArcs =  d3.arc()
                .innerRadius(0.8*radius)
                .outerRadius(radius)
            var arcOver = d3.arc()
                .outerRadius(radius +9 )
                .innerRadius(0.8 * radius);

            // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
            svg.selectAll('slices')
                .data(data_ready)
                .join('path')
                .attr('d', sliceArcs)
                .attr('fill', function (d) {
                    // here the color of each slice is added
                    return (colorRange(d.data[1]))
                })
                .attr("stroke", "black")
                .style("stroke-width", "2px")
                .style("opacity", 0.7)
                .on("click", (event, d) => {
                    // after 3. selection, jump the table view, else filter, group and visulize data
                    if (dataStack.length > 2) {
                        let switchFormButton = document.getElementById("switchButton");
                        currentForm = "Data"
                        switchFormButton.innerHTML = 'Show Visualization!';
                        document.getElementById("viz-container").style.display = 'none';
                        document.getElementById("data-container").style.display = 'block';
                        filterByKeyword(categorySelect, d.data[1][0]);
                        showData();
                    } else {
                        filterByKeyword(categorySelect, d.data[1][0]);
                        createSelection();
                        // save color of slice for return arc
                        returnCircleColor.push(colorRange(d.data[1]))
                        svg.selectAll('slices').selectAll('text').remove();
                        var startAngle = d.startAngle;
                        var endAngle = d.startAngle + 2 * Math.PI;
                        var arcSelect = d3.arc()
                            .startAngle(function (s){return startAngle;})
                            .endAngle(function (s){return endAngle;})
                            .innerRadius(0.8*radius)
                            .outerRadius(radius);
                        var newArc = svg.append('path').style("fill", returnCircleColor.at(returnCircleColor.length-1)).attr("d", arcSelect).style("opacity", 1)
                        newArc.transition()
                            .duration(1000)
                            .attrTween("d", function(){
                                var newAngle = d.startAngle + 2 * Math.PI;
                                var interpolate = d3.interpolate(d.endAngle, newAngle);
                                return function (tick) {
                                    endAngle = interpolate(tick);
                                    return arcSelect(d);
                                };
                            })
                        .on("end", function(){
                            visualiseData();
                        });
                    }})
                .on("mouseover", function (event, d) {
                    // create tooltip text for slice and show it
                    const tooltipText = 
                        d.data.at(1).at(0) + "<br>" + 
                        "Count of attacks: " + d.data.at(1).at(1).count + "<br>" +
                        "Financial Loss (in Million $): " + d.data.at(1).at(1).financialLoss + "<br>" + 
                        "Number of Affected Users: " + d.data.at(1).at(1).usersAffected + "<br>" + 
                        "Incident Resolution Time (in Hours): " + d.data.at(1).at(1).incidentResolutionTime ;
                    // background 6a7282 text d1d5dc 
                    var tooltip = d3.select('#tooltip').style('opacity', 1).style("font-size", "12px").style("background-color", "#6a7282").style("color", "#d1d5dc");
                    tooltip.html(tooltipText)

                    // increase size of selected slice
                    d3.select(this).transition()
                        .duration(100)
                        .attr("d", arcOver);
                })
                .on("mouseout", function () {
                    // hide tooltip text
                    d3.select('#tooltip').style('opacity', 0)
                    // decrease size of selected slice to original size
                    d3.select(this).transition()
                        .duration(500)
                        .attr("d", sliceArcs);})
                .on('mousemove', function(event) {
                    // tooltip follow the mouse
                    d3.select('#tooltip').style('left', (event.pageX+10) + 'px').style('top', (event.pageY+10) + 'px')
                })
                ;
            
            
            // create the description of slice and add to pie chart
            svg.selectAll('slices')
                .data(data_ready)
                .enter()
                .append('text')
                .text(function(d){ return d.data[1][0]})
                .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")";  })
                .style("text-anchor", "middle")
                .style("font-size", 12)
                .attr("fill", "#d1d5dc")
                ;
            
            // create arc settings for return arc
            var arcReturn = d3.arc()
                .startAngle(0)
                .endAngle(2*Math.PI)
                .innerRadius(radius + 10)
                .outerRadius(radius * 1.1);
            var arcReturnMouseOver = d3.arc()
                .startAngle(0)
                .endAngle(2*Math.PI)
                .innerRadius(radius + 10)
                .outerRadius(radius * 1.2);
            
            //create return arc, after first selection    
            if (dataStack.length > 1){
                svg.append('path')
                    .style("fill", returnCircleColor.at(returnCircleColor.length-1))
                    .attr("d", arcReturn)
                    .text("Ebene nach Oben")
                    .style("opacity", 0.8)
                    .on("click", function (d){
                        if(dataStack.length > 1){
                            dataStack.pop();
                            categoriesStack.pop();
                            createSelection();
                            
                            var startAngle = 2*Math.PI;
                            var endAngle = 0;
                            var arcSelect = d3.arc()
                                .startAngle(function (s){return startAngle;})
                                .endAngle(function (s){return endAngle;})
                                .innerRadius(0.8*radius)
                                .outerRadius(radius);
                            var newArc = svg.append('path').style("fill", returnCircleColor.at(returnCircleColor.length-1)).attr("d", arcSelect).style("opacity", 1)
                            newArc.transition()
                                .duration(1000)
                                .attrTween("d", function(){
                                    var interpolate = d3.interpolate(2*Math.PI, 0);
                                    return function (tick) {
                                        endAngle = interpolate(tick);
                                        return arcSelect(d);
                                    };
                                })
                            .on("end", function(){
                                returnCircleColor.pop();
                                visualiseData();
                            });
                        } else console.log("Die erstes Ebene existiert schon")
                    })
                    .on("mouseover", function () {
                    d3.select(this).transition()
                        .duration(100)
                        .attr("d", arcReturnMouseOver);
                    })
                    .on("mouseout", function () {
                        d3.select(this).transition()
                            .duration(500)
                            .attr("d", arcReturn);
                    });
            }
        }

        /*
            This function creating the table, for result and intermediate showing of remaining data
            normally the data-container div is hidden, but on creation, the donut-container div will be hidden and the data-container shown
        */

        function showData(): void {
        var data = dataStack.at(dataStack.length -1);
            var column = ["Country", "Year", "Attack Type", "Target Industry", "Financial Loss (in Million $)", "Number of Affected Users", "Attack Source", "Security Vulnerability Type", "Defense Mechanism Used", "Incident Resolution Time (in Hours)"];
            var width = 968 // Kommt aus TailwindCSS ".container"-Class
            var height = 450
            var margin = 10
            // delete the previous table from data-container
            d3.select("#data-container").select("table").remove()
            // create new table
            var table = d3.select("#data-container")
                .append("table")
                .attr("width", width)
                .attr("height", height)
                //.attr("viewBox", [0, 0, width, height])
                .style("border-collapse", "collapse")
                .style("border", "2px black solid")
                .append("g")
                .attr("fill", wordColor)
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
            var thead = table.append('thead')
            var tbody = table.append("tbody")
            thead.append("tr")
                .selectAll("th")
                .data(column)
                .enter()
                .append("th")
                .style("padding", "10px")
                .style("border", "1px solid black")
                .style("border-left", "1px solid black")
                .style("text-align", "center")
                .style("background-color", "#374753").style("opacity", 1)
                .text(function (column){ return column;})
            // create a row for each object in the data
            var rows = tbody.selectAll('tr')
            .data(dataStack.at(dataStack.length -1))
            .enter()
            .append('tr')
            .on("mouseover", function () {
                d3.select(this).style("background-color", "#374753").style("opacity", 0.1).style("color", wordColor).style("opacity", 1);
            })
            .on("mouseout", function () {
                d3.select(this).style("background-color", "#0c1012").style("opacity", 1).style("color", wordColor).style("opacity", 1);
            });
            // create a cell in each row for each column
            var cells = rows.selectAll('td')
            .data(function (row) {
                return column.map(function (column) {
                return {column: column, value: row[column]};
                });
            })
            .enter()
            .append('td')
                .style("padding", "10px")
                .style("border", "1px solid black")
                .style("border-left", "1px solid black")
                .style("text-align", "center")
                .text(function (d) { return d.value; });
        }

        /*
            creates the selection menues from categoryStack and add interaction to both selectors
            can be done with react, but is done via javascript
        */
        function createSelection(): void {
        var i, L = document.getElementById('categorySelector').options.length - 1;
            for(i = L; i >= 0; i--) {
                document.getElementById('categorySelector').remove(i);
            }
            L = document.getElementById('sortSelector').options.length - 1;
            for(i = L; i >= 0; i--) {
                document.getElementById('sortSelector').remove(i);
            }

            for (const element of categoriesStack.at(categoriesStack.length -1)){
                // Step 1: Create the option element
                const option = document.createElement('option');

                // Step 2: Set the option value and text
                option.value = element;
                option.textContent = element;

                // Step 3: Append the option to the select dropdown
                document.getElementById('categorySelector').appendChild(option);
            }
            const sortArray = [["financialLoss","Financial Loss (in Million $)"],["usersAffected", "Number of Affected Users"],["incidentResolutionTime", "Incident Resolution Time (in Hours)"], ["count", "Count of attacks"]]
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
                visualiseData();
            }
            document.getElementById('categorySelector').onchange = function(){
                categorySelect = document.getElementById('categorySelector').value;
                visualiseData();
            }

            categorySelect = categoriesStack.at(categoriesStack.length -1).at(0);
            sortSelect = sortArray.at(0).at(0);
        }

        /*
            create the interaction of the switch-Button between the raw data table und the visualization
        */

        function initButton(): void {
            let switchFormButton = document.getElementById("switchButton");
            //console.log(switchFormButton)
            switchFormButton.innerHTML = 'Show raw Data!';
            switchFormButton.onclick = function(){
                if (currentForm == "Visual"){
                    currentForm = "Data"
                    switchFormButton.innerHTML = 'Show Visualization!';
                    document.getElementById("viz-container").style.display = 'none';
                    document.getElementById("data-container").style.display = 'block';
                    showData();
                } else {
                    currentForm = "Visual"
                    switchFormButton.innerHTML = 'Show raw Data!';
                    document.getElementById("viz-container").style.display = 'grid';
                    document.getElementById("data-container").style.display = 'none';
                    console.log("datastack length " + dataStack.length)
                    // pop stacks after returning from table after 3. selection
                    if (dataStack.length > 3) {
                        dataStack.pop(); categoriesStack.pop();
                    }
                    visualiseData();
                }
            }
            
        }

        init();

}, [])
    /*
        page.tsx contains only the section container with the head line.
        This will be added into the HTML-Code on load.
    */
    return (
        <div id="donut-div" className='justify-center items-center'>
            <div id="viz-container" className="grid grid-cols-2 gap-4">
                <div id="donut-container" className="p-4 rounded"></div>
                <div id="selector-container" className="p-4 rounded flex flex-col justify-center items-center">
                        <p className="text-sm text-gray-300">Chosen Category:</p>
                        <select name="categorySelector" id="categorySelector" className="border rounded p-2 text-gray-300 bg-gray-500"></select>
                        <p className="text-sm text-gray-300">Chosen Dataview:</p>
                        <select name="sortSelector" id="sortSelector" className="border rounded p-2 text-gray-300 bg-gray-500"></select>
                </div>
            </div>
            <div id="data-container" className="hidden max-h-[450px] overflow-auto border rounded p-2 text-gray-300 max-w-[968px]"></div>
            <button type="button" id="switchButton" className="bg-gray-500 text-white px-4 py-2 rounded w-full"></button>
            
        </div>
    );
};
