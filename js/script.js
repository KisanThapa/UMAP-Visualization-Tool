let currentData = null;
const plotDiv = document.getElementById("plot");

function updateStatus(message, type = "loading") {
	const status = document.getElementById("status");
	status.textContent = message;
	status.className = type;
}

function populateColorOptions(headers) {
	const colorSelect = document.getElementById("colorSelect");
	colorSelect.innerHTML = '<option value="none">None</option>';
	headers.forEach((header) => {
		if (!header.includes("X_")) {
			const option = document.createElement("option");
			option.value = header;
			option.textContent = header;
			colorSelect.appendChild(option);
		}
	});
}

function parseCSV(content, delimiter = ",") {
	const lines = content.trim().split("\n");
	const headers = lines[0].split(delimiter).map((h) => h.trim());
	const data = {};

	headers.forEach((header) => (data[header] = []));
	const required = ["X_umap1", "X_umap2"];
	if (!required.every((col) => headers.includes(col))) {
		throw new Error("Missing required columns: " + required.join(", "));
	}

	for (let i = 1; i < lines.length; i++) {
		const values = lines[i].split(delimiter).map((v) => v.trim());
		if (values.length !== headers.length) continue; // Skip malformed rows
		headers.forEach((header, idx) => {
			const value = header.includes("X_") ? parseFloat(values[idx]) : values[idx];
			if (header.includes("X_") && isNaN(value)) {
				throw new Error(`Invalid numeric value at row ${i + 1}, column ${header}`);
			}
			data[header].push(value);
		});
	}
	return data;
}

function parseFile(file) {
	updateStatus(`Loading ${file.name}...`);
	const reader = new FileReader();
	reader.onload = function (e) {
		try {
			const content = e.target.result;
			const extension = file.name.split(".").pop().toLowerCase();
			let delimiter;
			if (extension === "csv") {
				delimiter = ",";
			} else if (extension === "tsv") {
				delimiter = "\t";
			} else {
				throw new Error("Unsupported file type");
			}
			currentData = parseCSV(content, delimiter);
			populateColorOptions(Object.keys(currentData));
			createPlot();
			updateStatus(
				`Loaded ${file.name} successfully (${currentData.X_umap1.length} points)`,
				"success"
			);
		} catch (error) {
			updateStatus(`Error: ${error.message}`, "error");
		}
	};
	reader.onerror = () => updateStatus("Error reading file", "error");
	reader.readAsText(file);
}

function createPlot(colorBy = "Cluster") {
	if (!currentData || !currentData.X_umap1) return;

	const markerSize = parseInt(document.getElementById("markerSize").value);
	const opacity = parseFloat(document.getElementById("opacity").value);

	const trace = {
		x: currentData.X_umap1,
		y: currentData.X_umap2,
		mode: "markers",
		type: "scatter",
		marker: { size: markerSize, opacity },
		text: currentData.cell_barcode.map((barcode, i) => {
			return `${barcode}<br>Cluster: ${
				currentData.Cluster?.[i] || "N/A"
			}<br>X: ${currentData.X_umap1[i].toFixed(2)}<br>Y: ${currentData.X_umap2[i].toFixed(2)}`;
		}),
		hoverinfo: "text",
	};

	if (colorBy !== "none" && currentData[colorBy]) {
		trace.marker.color = currentData[colorBy];
	}

	const layout = {
		title: { text: "UMAP Coordinates Visualization", font: { size: 18 } },
		xaxis: { title: "UMAP 1", zeroline: false },
		yaxis: { title: "UMAP 2", zeroline: false },
		hovermode: "closest",
		plot_bgcolor: "#ffffff",
		paper_bgcolor: "#ffffff",
		margin: { t: 60, b: 60, l: 60, r: 60 },
		showlegend: false,
	};

	const config = {
		responsive: true,
		displayModeBar: true,
		modeBarButtonsToAdd: ["drawrect", "drawcircle"],
		modeBarButtonsToRemove: ["lasso2d", "select2d"],
	};

	Plotly.newPlot(plotDiv, [trace], layout, config);
}

// Event Listeners
document.getElementById("fileInput").addEventListener("change", (e) => {
	if (e.target.files[0]) parseFile(e.target.files[0]);
});

document
	.getElementById("colorSelect")
	.addEventListener("change", (e) => createPlot(e.target.value));
document
	.getElementById("markerSize")
	.addEventListener("input", () => createPlot(document.getElementById("colorSelect").value));
document
	.getElementById("opacity")
	.addEventListener("input", () => createPlot(document.getElementById("colorSelect").value));
document.getElementById("resetZoom").addEventListener("click", () => {
	Plotly.relayout(plotDiv, { "xaxis.autorange": true, "yaxis.autorange": true });
});
