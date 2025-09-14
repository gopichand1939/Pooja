// src/Components/Dashboard/D3Scatter.jsx
import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

export default function D3Scatter({ data = [], width = null, height = 320, margin = {top:20,right:20,bottom:40,left:50} }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!data) return;
    const svgEl = svgRef.current;
    const w = (width || svgEl.parentElement.clientWidth) - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    d3.select(svgEl).selectAll("*").remove();
    const svg = d3.select(svgEl)
      .attr("width", w + margin.left + margin.right)
      .attr("height", h + margin.top + margin.bottom);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, d3.max(data, d => +d.likelihood || 4)]).range([0, w]).nice();
    const y = d3.scaleLinear().domain([0, d3.max(data, d => +d.intensity || 100)]).range([h, 0]).nice();
    const r = d3.scaleSqrt().domain([0, d3.max(data, d => +d.relevance || 5)]).range([3, 12]);

    g.append("g").attr("transform", `translate(0,${h})`).call(d3.axisBottom(x).ticks(5));
    g.append("g").call(d3.axisLeft(y).ticks(6));

    const clip = g.append("clipPath").attr("id", "clip-scatter").append("rect").attr("width", w).attr("height", h);

    const area = g.append("g").attr("clip-path", "url(#clip-scatter)");

    const tooltip = d3.select("body").append("div").attr("class", "d3-tooltip").style("position","fixed").style("pointer-events","none").style("opacity",0);

    // points with enter animation
    const points = area.selectAll("circle").data(data, (d,i) => d.label || i);

    points.enter()
      .append("circle")
      .attr("cx", d => x(d.likelihood))
      .attr("cy", d => y(0)) // start at bottom
      .attr("r", 0)
      .attr("fill", "#6366F1")
      .attr("fill-opacity", 0.85)
      .attr("stroke", "rgba(0,0,0,0.06)")
      .transition()
      .duration(800)
      .attr("cy", d => y(d.intensity))
      .attr("r", d => r(d.relevance));

    // hover interactions
    area.selectAll("circle")
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget).transition().duration(120).attr("r", r(d.relevance) * 1.6);
        tooltip.transition().duration(120).style("opacity", 1);
        tooltip.html(`<strong>${d.label ?? ""}</strong><br/>Intensity: ${d.intensity}<br/>Likelihood: ${d.likelihood}`)
          .style("left", (event.clientX + 10) + "px")
          .style("top", (event.clientY + 10) + "px");
      })
      .on("mousemove", (event) => {
        tooltip.style("left", (event.clientX + 10) + "px").style("top", (event.clientY + 10) + "px");
      })
      .on("mouseleave", (event, d) => {
        d3.select(event.currentTarget).transition().duration(120).attr("r", r(d.relevance));
        tooltip.transition().duration(200).style("opacity", 0);
      });

    // zoom
    const zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", (event) => {
      area.attr("transform", event.transform);
    });

    svg.call(zoom);

    return () => tooltip.remove();
  }, [data, height, margin, width]);

  return <svg ref={svgRef} style={{ width: "100%", height: height }} />;
}
