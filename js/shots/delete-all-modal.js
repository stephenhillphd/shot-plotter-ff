import { clearTable } from "../table/table-functions.js";
import { dataStorage } from "../../setup.js";

function setUpDeleteAllModal(id) {
    let m = d3
        .select(id)
        .attr("class", "modal fade")
        .attr("aria-hidden", true)
        .attr("aria-labelledby", "customize-options")
        .append("div")
        .attr("class", "modal-dialog")
        .append("div")
        .attr("class", "modal-content");

    let h = m.append("div").attr("class", "modal-header");
    h.append("h5")
        .attr("class", "modal-title")
        .text("Reset All Data");
    h.append("button")
        .attr("type", "button")
        .attr("class", "btn-close")
        .attr("data-bs-dismiss", "modal")
        .attr("aria-label", "Close");

    let mb = m
        .append("div")
        .attr("class", "modal-body")
        .text("Are you sure? This will delete all recorded events and reset all settings to their original state. This action cannot be undone.");

    m.append("div")
        .attr("class", "modal-footer")
        .append("button")
        .attr("type", "button")
        .attr("class", "grey-btn")
        .text("Reset All Data")
        .on("click", () => {
            dataStorage.clear();
            window.location.reload();
        });
}

export { setUpDeleteAllModal };
