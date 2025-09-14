import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

export default function D3LineChart({ data = [], width = null, height = 300, margin = {top:20,right:20,bottom:30,left:40} }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;
    const svgEl = svgRef.current;
    const w = (width || svgEl.parentElement.clientWidth) - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    // clear
    d3.select(svgEl).selectAll("*").remove();

    const svg = d3.select(svgEl)
      .attr("width", w + margin.left + margin.right)
      .attr("height", h + margin.top + margin.bottom);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // x scale (year)
    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => +d.year))
      .range([0, w]).nice();

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => +d.avgIntensity) * 1.15])
      .range([h, 0]).nice();

    // axes
    const xAxis = d3.axisBottom(x).tickFormat(d3.format("d")).ticks(Math.min(8, data.length));
    const yAxis = d3.axisLeft(y).ticks(5);

    g.append("g").attr("transform", `translate(0,${h})`).call(xAxis);
    g.append("g").call(yAxis);

    // area (subtle)
    const area = d3.area()
      .x(d => x(d.year))
      .y0(h)
      .y1(d => y(d.avgIntensity))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(data)
      .attr("fill", "rgba(124,58,237,0.08)")
      .attr("d", area);

    // line
    const line = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.avgIntensity))
      .curve(d3.curveMonotoneX);

    const path = g.append("path")
      .datum(data)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "#7C3AED")
      .attr("stroke-width", 2.5)
      .attr("stroke-linecap", "round");

    const totalLength = path.node().getTotalLength();
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1200)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0);

    const tooltip = d3.select("body").append("div")
      .attr("class", "d3-tooltip")
      .style("position", "fixed")
      .style("pointer-events", "none")
      .style("opacity", 0);

    g.selectAll(".dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.avgIntensity))
      .attr("r", 4.5)
      .attr("fill", "#fff")
      .attr("stroke", "#7C3AED")
      .attr("stroke-width", 2)
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(120).style("opacity", 1);
        tooltip.html(`<strong>Year:</strong> ${d.year}<br/><strong>Avg:</strong> ${d.avgIntensity}`)
          .style("left", (event.clientX + 12) + "px")
          .style("top", (event.clientY + 12) + "px");
      })
      .on("mousemove", (event) => {
        tooltip.style("left", (event.clientX + 12) + "px")
          .style("top", (event.clientY + 12) + "px");
      })
      .on("mouseleave", () => {
        tooltip.transition().duration(200).style("opacity", 0);
      });

    return () => tooltip.remove();
  }, [data, height, margin, width]);

  return <svg ref={svgRef} style={{ width: "100%", height: height }} />;
}
