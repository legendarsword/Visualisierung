export async function init() {
    const config = {
        margin: { top: 30, right: 100, bottom: 50, left: 100 },
        width: 1500,
        barStep: 50,
        duration: 750,
        color: d3.scaleOrdinal([true, false], ["steelblue", "#aaa"]),
    };
    config.barPadding = 3 / config.barStep;

    const x = d3.scaleLinear().range([config.margin.left, config.width - config.margin.right]);
    const data = await d3.json("data/cyber_threats.json");

    const root = d3.hierarchy(data)
        .each(d => d.value = d.data.value)
        .sort((a, b) => b.value - a.value)
        .eachAfter(d => d.index = d.parent ? d.parent.index = d.parent.index + 1 || 0 : 0);

    let maxChildren = 1;
    root.each(d => {
        if (d.children) maxChildren = Math.max(maxChildren, d.children.length);
    });

    const height = maxChildren * config.barStep + config.margin.top + config.margin.bottom;

    const svg = d3.select("#barchart").append("svg")
        .attr("viewBox", [0, 0, config.width, height])
        .attr("width", config.width)
        .attr("height", height)
        .attr("style", "max-width: 100%; height: 100%;");

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

    x.domain([0, root.value]);

    svg.append("rect")
        .attr("class", "background")
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .attr("width", config.width)
        .attr("height", height)
        .attr("cursor", "pointer")
        .datum(root)
        .on("click", (_, d) => up(svg, d));

    svg.append("g").call(xAxis);
    svg.append("g").call(yAxis);

    down(svg, root);

    function bar(svg, down, d, selector) {
        const g = svg.insert("g", selector)
            .attr("class", "enter")
            .attr("transform", `translate(0,${config.margin.top + config.barStep * config.barPadding})`)
            .attr("text-anchor", "end")
            .style("font", "15px sans-serif");

        const bars = g.selectAll("g")
            .data(d.children)
            .join("g")
            .attr("cursor", d => d.children ? "pointer" : null)
            .on("click", (_, d) => down(svg, d));

        bars.append("text")
            .attr("x", config.margin.left - 6)
            .attr("y", config.barStep * (1 - config.barPadding) / 2)
            .attr("dy", ".35em")
            .text(d => d.data.name);

        bars.append("rect")
            .attr("x", x(0))
            .attr("width", d => x(d.value) - x(0))
            .attr("height", config.barStep * (1 - config.barPadding));

        return g;
    }

    function down(svg, d) {
        if (!d.children || d3.active(svg.node())) return;

        // Rebind the current node to the background.
        svg.select(".background").datum(d);
        // Define two sequenced transitions.
        const t1 = svg.transition().duration(config.duration);
        const t2 = t1.transition();

        // Mark any currently-displayed bars as exiting.
        const exit = svg.selectAll(".enter").attr("class", "exit");
        // Entering nodes immediately obscure the clicked-on bar, so hide it.
        exit.selectAll("rect").attr("fill-opacity", p => p === d ? 0 : null);
        // Transition exiting bars to fade out.
        exit.transition(t1).attr("fill-opacity", 0).remove();
        // Enter the new bars for the clicked-on data.
        // Per above, entering bars are immediately visible.
        const enter = bar(svg, down, d, ".y-axis").attr("fill-opacity", 0);
        // Have the text fade-in, even though the bars are visible.
        enter.transition(t1).attr("fill-opacity", 1);
        // Transition entering bars to their new y-position.
        enter.selectAll("g")
            .attr("transform", stack(d.index))
            .transition(t1).attr("transform", stagger());

        // Update the x-scale domain.
        x.domain([0, d3.max(d.children, d => d.value)]);
        // Update the x-axis.
        svg.selectAll(".x-axis").transition(t2).call(xAxis);

        // Transition entering bars to the new x-scale.
        enter.selectAll("g").transition(t2)
            .attr("transform", (_, i) => `translate(0,${config.barStep * i})`);

        // Color the bars as parents; they will fade to children if appropriate.
        enter.selectAll("rect")
            .attr("fill", config.color(true))
            .attr("fill-opacity", 1)
            .transition(t2)
            .attr("fill", d => config.color(!!d.children))
            .attr("width", d => x(d.value) - x(0));
    }

    function up(svg, d) {
        if (!d.parent || !svg.selectAll(".exit").empty()) return;

        // Rebind the current node to the background.
        svg.select(".background").datum(d.parent);
        // Define two sequenced transitions.
        const t1 = svg.transition().duration(config.duration);
        const t2 = t1.transition();

        // Mark any currently-displayed bars as exiting.
        const exit = svg.selectAll(".enter").attr("class", "exit");
        // Update the x-scale domain.
        x.domain([0, d3.max(d.parent.children, d => d.value)]);
        // Update the x-axis.
        svg.selectAll(".x-axis").transition(t1).call(xAxis);

        // Transition exiting bars to the new x-scale.
        exit.selectAll("g").transition(t1).attr("transform", stagger());
        // Transition exiting bars to the parent’s position.
        exit.selectAll("g").transition(t2).attr("transform", stack(d.index));
        // Transition exiting rects to the new scale and fade to parent color.
        exit.selectAll("rect").transition(t1)
            .attr("width", d => x(d.value) - x(0))
            .attr("fill", config.color(true));
        // Transition exiting text to fade out.
        // Remove exiting nodes.
        exit.transition(t2).attr("fill-opacity", 0).remove();

        // Enter the new bars for the clicked-on data's parent.
        const enter = bar(svg, down, d.parent, ".exit").attr("fill-opacity", 0);
        enter.selectAll("g")
            .attr("transform", (_, i) => `translate(0,${config.barStep * i})`);
        // Transition entering bars to fade in over the full duration.
        enter.transition(t2).attr("fill-opacity", 1);
        // Color the bars as appropriate.
        // Exiting nodes will obscure the parent bar, so hide it.
        // Transition entering rects to the new x-scale.
        // When the entering parent rect is done, make it visible!
        enter.selectAll("rect")
            .attr("fill", d => config.color(!!d.children))
            .attr("fill-opacity", p => p === d ? 0 : null)
            .transition(t2)
            .attr("width", d => x(d.value) - x(0))
            .on("end", function () { d3.select(this).attr("fill-opacity", 1); });
    }

    function stack(i) {
        let value = 0;
        return d => `translate(${x(value += d.value) - x(0)},${config.barStep * i})`;
    }

    function stagger() {
        let value = 0;
        return (_, i) => `translate(${x(value += 0) - x(0)},${config.barStep * i})`;
    }
}

init();
