"use client"
import * as d3 from 'd3'
import { useEffect } from 'react';

export const Barchart = () => {
    useEffect(() => {
        // Asynchronously load data from a JSON file
        const fetchData = async () => {
            return await d3.json("data/cyber_threats.json");
        }

        fetchData().then(data => {
            // Configuration settings for the chart
            type Config = {
                margin: { top: number; right: number; bottom: number; left: number };
                width: number;
                barStep: number;
                duration: number;
                color: d3.ScaleOrdinal<boolean, string, never>;
                barPadding?: number;
            };

            const config: Config = {
                margin: { top: 30, right: 100, bottom: 50, left: 100 },
                width: 1500,
                barStep: 50,
                duration: 750,
                color: d3.scaleOrdinal([true, false], ["steelblue", "#aaa"]), // color scale based on whether node has children
            };
           
            config.barPadding = 3 / config.barStep;

            // X-scale: maps values to horizontal pixel positions
            const x = d3.scaleLinear().range([config.margin.left, config.width - config.margin.right]);

            // Create a hierarchical structure from data
            const root = d3.hierarchy(data)
                .sum(d => d.value) 
                .sort((a, b) => b.value! - a.value!) 
                .eachAfter(d => d.index = d.parent ? d.parent.index + 1 : 0);

            // Determine max number of children for calculating height
            let maxChildren = 1;
            root.each(d => {
                if (d.children) maxChildren = Math.max(maxChildren, d.children.length);
            });
            const height = maxChildren * config.barStep + config.margin.top + config.margin.bottom;

            // Create SVG element
            const svg = d3.select("#barchart").append("svg")
                .attr("viewBox", [0, 0, config.width, height])
                .attr("width", config.width)
                .attr("height", height)
                .attr("style", "max-width: 100%; height: 100%;");

            // Define the X and Y axis
            const xAxis = g => g
                .attr("class", "x-axis")
                .attr("transform", `translate(0,${height - 20})`)
                .call(d3.axisTop(x).ticks(config.width / 200, "m"))
                .call(g => g.select(".domain").remove());

            const yAxis = g => g
                .attr("class", "y-axis")
                .attr("transform", `translate(${config.margin.left + 0.5},0)`)
                .call(g => g.append("line")
                    .attr("stroke", "currentColor")
                    .attr("y1", config.margin.top)
                    .attr("y2", root.children.length * config.barStep + config.margin.top));

            // Set the X domain based on the root value
            x.domain([0, root.value]);

            // Add a transparent background for capturing click events (used for "up" navigation)
            svg.append("rect")
                .attr("class", "background")
                .attr("fill", "none")
                .attr("pointer-events", "all")
                .attr("width", config.width)
                .attr("height", height)
                .attr("cursor", "pointer")
                .datum(root)
                .on("click", (_, d) => up(svg, d));

            // Append axes to the SVG
            svg.append("g").call(xAxis);
            svg.append("g").call(yAxis);

            // Initial display
            down(svg, root);

            // Draw bars for a given node (level)
            function bar(svg, down, d, selector) {
                const g = svg.insert("g", selector)
                    .attr("class", "enter")
                    .attr("transform", `translate(0,${config.margin.top + config.barStep * config.barPadding})`)
                    .attr("text-anchor", "end")
                    .style("font", "15px sans-serif")
                    .style("fill", "gray");

                const bars = g.selectAll("g")
                    .data(d.children)
                    .join("g")
                    .attr("cursor", d => d.children ? "pointer" : null)
                    .on("click", (_, d) => down(svg, d));

                // Append label text for each bar
                bars.append("text")
                    .attr("x", config.margin.left - 6)
                    .attr("y", config.barStep * (1 - config.barPadding) / 2)
                    .attr("dy", ".35em")
                    .text(d => d.data.name);

                // Append rectangle bars
                bars.append("rect")
                    .attr("x", x(0))
                    .attr("width", d => x(d.value) - x(0))
                    .attr("height", config.barStep * (1 - config.barPadding));

                return g;
            }

            // Navigate down the hierarchy
            function down(svg, d) {
                if (!d.children || d3.active(svg.node())) return;

                svg.select(".background").datum(d);
                const t1 = svg.transition().duration(config.duration);
                const t2 = t1.transition();

                const exit = svg.selectAll(".enter").attr("class", "exit");
                exit.selectAll("rect").attr("fill-opacity", p => p === d ? 0 : null);
                exit.transition(t1).attr("fill-opacity", 0).remove();

                const enter = bar(svg, down, d, ".y-axis").attr("fill-opacity", 0);
                enter.transition(t1).attr("fill-opacity", 1);
                enter.selectAll("g")
                    .attr("transform", stack(d.index))
                    .transition(t1).attr("transform", stagger());

                x.domain([0, d3.max(d.children, d => d.value)]);
                svg.selectAll(".x-axis").transition(t2).call(xAxis);

                enter.selectAll("g").transition(t2)
                    .attr("transform", (_, i) => `translate(0,${config.barStep * i})`);

                enter.selectAll("rect")
                    .attr("fill", config.color(true))
                    .attr("fill-opacity", 1)
                    .transition(t2)
                    .attr("fill", d => config.color(!!d.children))
                    .attr("width", d => x(d.value) - x(0));
            }

            // Navigate up the hierarchy
            function up(svg, d) {
                if (!d.parent || !svg.selectAll(".exit").empty()) return;

                svg.select(".background").datum(d.parent);
                const t1 = svg.transition().duration(config.duration);
                const t2 = t1.transition();

                const exit = svg.selectAll(".enter").attr("class", "exit");
                x.domain([0, d3.max(d.parent.children, d => d.value)]);
                svg.selectAll(".x-axis").transition(t1).call(xAxis);

                exit.selectAll("g").transition(t1).attr("transform", stagger());
                exit.selectAll("g").transition(t2).attr("transform", stack(d.index));
                exit.selectAll("rect").transition(t1)
                    .attr("width", d => x(d.value) - x(0))
                    .attr("fill", config.color(true));
                exit.transition(t2).attr("fill-opacity", 0).remove();

                const enter = bar(svg, down, d.parent, ".exit").attr("fill-opacity", 0);
                enter.selectAll("g")
                    .attr("transform", (_, i) => `translate(0,${config.barStep * i})`);
                enter.transition(t2).attr("fill-opacity", 1);
                enter.selectAll("rect")
                    .attr("fill", d => config.color(!!d.children))
                    .attr("fill-opacity", p => p === d ? 0 : null)
                    .transition(t2)
                    .attr("width", d => x(d.value) - x(0))
                    .on("end", function () { d3.select(this).attr("fill-opacity", 1); });
            }

            // Positioning for stacked bars (used during transitions)
            function stack(i: number) {
                let value = 0;
                return d => `translate(${x(value += d.value) - x(0)},${config.barStep * i})`;
            }

            // Vertical spacing between bars (used during transitions)
            function stagger() {
                let value = 0;
                return (_, i: number) => `translate(${x(value += 0) - x(0)},${config.barStep * i})`;
            }
        })
    }, [])

    // Container for the chart
    return (<div id="barchart"/>)
}
