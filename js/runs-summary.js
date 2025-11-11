import { getFilteredRows } from "./table/table-functions.js";
import { getCustomSetup } from "./details/details-functions.js";

function setUpRunsSummary() {
    // Check if playing-area exists
    if (d3.select("#playing-area").empty()) {
        return;
    }

    // Only set up runs summary if direction and play-type fields exist
    const { details } = getCustomSetup();
    const hasDirection = _.some(details, { id: "direction" });
    const hasPlayType = _.some(details, { id: "play-type" });

    if (!hasDirection || !hasPlayType) {
        return;
    }

    const container = d3.select("#playing-area")
        .insert("div", "#legend")
        .attr("id", "runs-summary")
        .attr("class", "center")
        .style("margin-top", "20px");

    updateRunsSummary();
}

function updateRunsSummary() {
    const container = d3.select("#runs-summary");
    if (container.empty()) return;

    container.selectAll("*").remove();

    const rows = getFilteredRows();

    // Filter for runs only
    const runs = _.filter(rows, (r) => {
        return r.rowData["play-type"] === "Run";
    });

    if (runs.length === 0) {
        return;
    }

    // Count runs by direction
    const runsByDirection = _.countBy(runs, (r) => r.rowData["direction"]);

    // Create the summary title
    container.append("h5")
        .style("margin-bottom", "10px")
        .text("Run Summary");

    // Create the visualization
    const vizContainer = container.append("div")
        .attr("class", "runs-viz")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("align-items", "flex-end")
        .style("gap", "30px")
        .style("padding", "20px")
        .style("background-color", "#f8f9fa")
        .style("border-radius", "8px")
        .style("max-width", "600px")
        .style("margin", "0 auto");

    const directions = ["Left", "Middle", "Right"];
    const maxCount = Math.max(...directions.map(d => runsByDirection[d] || 0), 1);

    for (const direction of directions) {
        const count = runsByDirection[direction] || 0;
        const barHeight = count > 0 ? (count / maxCount) * 120 : 5;

        const barContainer = vizContainer.append("div")
            .style("display", "flex")
            .style("flex-direction", "column")
            .style("align-items", "center")
            .style("gap", "8px");

        // Count label
        barContainer.append("div")
            .style("font-weight", "bold")
            .style("font-size", "18px")
            .style("color", "#333")
            .text(count);

        // Bar
        barContainer.append("div")
            .style("width", "80px")
            .style("height", barHeight + "px")
            .style("background-color", getDirectionColor(direction))
            .style("border-radius", "4px 4px 0 0")
            .style("transition", "height 0.3s ease");

        // Direction label
        barContainer.append("div")
            .style("font-weight", "500")
            .style("font-size", "14px")
            .style("color", "#666")
            .text(direction);
    }

    // Total count
    container.append("div")
        .style("margin-top", "15px")
        .style("font-size", "14px")
        .style("color", "#666")
        .text(`Total Runs: ${runs.length}`);
}

function getDirectionColor(direction) {
    switch (direction) {
        case "Left":
            return "#35aba9";
        case "Middle":
            return "#ea8e48";
        case "Right":
            return "#9b59b6";
        default:
            return "#aaaaaa";
    }
}

export { setUpRunsSummary, updateRunsSummary };
