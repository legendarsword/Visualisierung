'use client';
import * as d3 from 'd3'
import { useEffect, useState } from 'react';

export const FinancialMap = () => {

    const [inputValue, setInputValue] = useState('0');

    useEffect(() => {
        const width = 928;
        const height = width;
        const keys = d3.range(2015, 2024, 1);

        const formatNumber = d3.format(",d");
        const parseNumber = str => +str.replace(/,/g, "");

        const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height + 20)
        .attr("viewBox", [0, -20, width, height + 20])
        .style("font", "10px sans-serif");

        Promise.all([
        d3.csv("data/census-regions.csv"),
        d3.tsv("data/financial_losses_2015_2024.tsv")
        ]).then(([regions, statesRaw]) => {
            const states = statesRaw.map(row => ({
                name: row[""],
                values: keys.map(key => parseNumber(row[key]))
            }));

            const regionByState = new Map(regions.map(d => [d.State, d.Region]));
            const divisionByState = new Map(regions.map(d => [d.State, d.Division]));
            const grouped = d3.group(states, d => regionByState.get(d.name), d => divisionByState.get(d.name));

            const max = d3.max(keys, (d, i) =>
                d3.hierarchy(grouped).sum(d => d.values[i]).value
            );

            const color = d3.scaleOrdinal()
                .domain(grouped.keys())
                .range(d3.schemeCategory10.map(d => d3.interpolateRgb(d, "white")(0.5)));

            const treemap = d3.treemap()
                .size([width, height])
                .tile(d3.treemapResquarify)
                .padding(d => d.height === 1 ? 1 : 0)
                .round(true);

            const root = d3.hierarchy(grouped)
                .sum(d => Array.isArray(d.values) ? d3.sum(d.values) : 0)
                .sort((a, b) => b.value - a.value);

            const box = svg.append("g")
                .selectAll("g")
                .data(keys.map((key, i) => {
                const value = root.sum(d => d.values[i]).value;
                return { key, value, i, k: Math.sqrt(value / max) };
                }).reverse())
                .join("g")
                .attr("transform", d => `translate(${(1 - d.k) / 2 * width},${(1 - d.k) / 2 * height})`)
                .attr("opacity", d => d.i === 0 ? 1 : 0)
                .call(g => g.append("text")
                    .attr("y", -6)
                    .attr("fill", "#777")
                    .selectAll("tspan")
                    .data(d => [d.key, ` ${formatNumber(d.value)}`])
                    .join("tspan")
                    .attr("font-weight", (d, i) => i === 0 ? "bold" : null)
                    .text(d => d))
                .call(g => g.append("rect")
                    .attr("fill", "none")
                    .attr("stroke", "#ccc")
                    .attr("width", d => d.k * width)
                    .attr("height", d => d.k * height));

            const leafGroup = svg.append("g");

            function layout(index) {
                const k = Math.sqrt(root.sum(d => d.values[index]).value / max);
                const tx = (1 - k) / 2 * width;
                const ty = (1 - k) / 2 * height;

                return treemap.size([width * k, height * k])(root.copy())
                .each(d => {
                    d.x0 += tx;
                    d.x1 += tx;
                    d.y0 += ty;
                    d.y1 += ty;
                    if (d.values) d.value = d.values[index];
                })
                .leaves();
            }

            function update(index, duration = 2000) {
                d3.select("#yearLabel").text(`Year: ${keys[index]}`);

                box.transition()
                .duration(duration)
                .attr("opacity", d => d.i >= index ? 1 : 0);

                const leaves = layout(index);

                const leaf = leafGroup.selectAll("g")
                .data(leaves, d => d.data.name);

                const gEnter = leaf.enter().append("g")
                .attr("transform", d => `translate(${d.x0},${d.y0})`);

                gEnter.append("rect")
                .attr("fill", d => {
                    let node = d;
                    while (node.depth > 1) node = node.parent;
                    return color(node.data[0]);
                })
                .attr("width", d => d.x1 - d.x0)
                .attr("height", d => d.y1 - d.y0);

                gEnter.append("text")
                .attr("x", 3)
                .attr("y", 12)
                .selectAll("tspan")
                .data(d => [d.data.name, formatNumber(d.value)])
                .join("tspan")
                    .attr("x", 3)
                    .attr("dy", (d, i) => i ? "1em" : 0)
                    .attr("fill-opacity", (d, i) => i ? 0.7 : 1)
                    .text(d => d);

                leaf.transition()
                .duration(duration)
                .attr("transform", d => `translate(${d.x0},${d.y0})`)
                .select("rect")
                    .attr("width", d => d.x1 - d.x0)
                    .attr("height", d => d.y1 - d.y0);
            

                leaf.select("text tspan:last-child")
                .transition()
                .duration(duration)
                .tween("text", function(d) {
                    const i = d3.interpolate(parseNumber(this.textContent), d.value);
                    return function(t) {
                    this.textContent = formatNumber(i(t));
                    };
                });

                leaf.exit().remove();
            }

            
            update(0);

            d3.select("#yearSlider")
                .attr("max", keys.length - 1)
                .on("input", function () {
                update(+this.value, 1000);
                });
            });
        }, [])
        return (
            <div>
            <input type="range" id="yearSlider" min="0" max="20" step="1" value={inputValue} onChange={(event) => {setInputValue(event.target.value)}}/>
            <div id="chart"/>
        </div>
    )
}