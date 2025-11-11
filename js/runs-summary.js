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

    // Count runs by direction and team
    const runsByDirectionAndTeam = {};
    const directions = ["Left", "Middle", "Right"];

    for (const direction of directions) {
        runsByDirectionAndTeam[direction] = {
            blueTeam: 0,
            orangeTeam: 0,
            greyTeam: 0,
            total: 0
        };
    }

    for (const run of runs) {
        const direction = run.rowData["direction"];
        const team = run.specialData.teamColor;
        if (direction && team && runsByDirectionAndTeam[direction]) {
            runsByDirectionAndTeam[direction][team]++;
            runsByDirectionAndTeam[direction].total++;
        }
    }

    // Get team names
    const blueTeamName = d3.select("#blue-team-name").property("value") || "Blue Team";
    const orangeTeamName = d3.select("#orange-team-name").property("value") || "Orange Team";

    // Create the summary title
    container.append("h5")
        .style("margin-bottom", "10px")
        .text("Run Summary");

    // Create legend
    const legend = container.append("div")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("gap", "20px")
        .style("margin-bottom", "10px")
        .style("font-size", "13px");

    legend.append("div")
        .style("display", "flex")
        .style("align-items", "center")
        .style("gap", "6px")
        .html(`<div style="width: 16px; height: 16px; background-color: #35aba9; border-radius: 2px;"></div><span>${blueTeamName}</span>`);

    legend.append("div")
        .style("display", "flex")
        .style("align-items", "center")
        .style("gap", "6px")
        .html(`<div style="width: 16px; height: 16px; background-color: #ea8e48; border-radius: 2px;"></div><span>${orangeTeamName}</span>`);

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

    const maxCount = Math.max(...directions.map(d => runsByDirectionAndTeam[d].total), 1);

    for (const direction of directions) {
        const data = runsByDirectionAndTeam[direction];
        const totalCount = data.total;

        const barContainer = vizContainer.append("div")
            .style("display", "flex")
            .style("flex-direction", "column")
            .style("align-items", "center")
            .style("gap", "8px");

        // Total count label
        barContainer.append("div")
            .style("font-weight", "bold")
            .style("font-size", "18px")
            .style("color", "#333")
            .text(totalCount);

        // Stacked bar container
        const stackedBarContainer = barContainer.append("div")
            .style("display", "flex")
            .style("flex-direction", "column")
            .style("width", "80px")
            .style("min-height", "5px");

        // Calculate heights for each team segment
        const maxHeight = 120;
        const blueHeight = totalCount > 0 ? (data.blueTeam / maxCount) * maxHeight : 0;
        const orangeHeight = totalCount > 0 ? (data.orangeTeam / maxCount) * maxHeight : 0;
        const greyHeight = totalCount > 0 ? (data.greyTeam / maxCount) * maxHeight : 0;

        // Orange team (top)
        if (orangeHeight > 0) {
            stackedBarContainer.append("div")
                .style("width", "100%")
                .style("height", orangeHeight + "px")
                .style("background-color", "#ea8e48")
                .style("border-radius", totalCount === data.orangeTeam ? "4px 4px 0 0" : "0")
                .attr("title", `${orangeTeamName}: ${data.orangeTeam}`);
        }

        // Grey team (middle)
        if (greyHeight > 0) {
            stackedBarContainer.append("div")
                .style("width", "100%")
                .style("height", greyHeight + "px")
                .style("background-color", "#aaaaaa")
                .attr("title", `Grey Team: ${data.greyTeam}`);
        }

        // Blue team (bottom)
        if (blueHeight > 0) {
            stackedBarContainer.append("div")
                .style("width", "100%")
                .style("height", blueHeight + "px")
                .style("background-color", "#35aba9")
                .attr("title", `${blueTeamName}: ${data.blueTeam}`);
        }

        // If no runs, show placeholder
        if (totalCount === 0) {
            stackedBarContainer.append("div")
                .style("width", "100%")
                .style("height", "5px")
                .style("background-color", "#e0e0e0");
        }

        // Direction label
        barContainer.append("div")
            .style("font-weight", "500")
            .style("font-size", "14px")
            .style("color", "#666")
            .text(direction);
    }

    // Total count with team breakdown
    const blueTotal = runs.filter(r => r.specialData.teamColor === "blueTeam").length;
    const orangeTotal = runs.filter(r => r.specialData.teamColor === "orangeTeam").length;

    container.append("div")
        .style("margin-top", "15px")
        .style("font-size", "14px")
        .style("color", "#666")
        .text(`Total Runs: ${runs.length} (${blueTeamName}: ${blueTotal}, ${orangeTeamName}: ${orangeTotal})`);
}

export { setUpRunsSummary, updateRunsSummary };
