# UMAP Visualization Tool

A web-based tool for visualizing UMAP (Uniform Manifold Approximation and Projection) coordinates from CSV data, built with HTML, JavaScript, and Plotly.js. This tool allows users to upload CSV files containing UMAP coordinates, customize visualizations, and explore data interactively.

## Features

- **File Upload**: Upload CSV files containing UMAP coordinates and metadata.
- **Interactive Plots**: Visualize UMAP coordinates (X_umap1, X_umap2) with hover tooltips displaying cell barcodes and cluster information.

## Requirements

- A modern web browser (e.g., Chrome, Firefox, Safari, Edge).
- No additional software or server setup required—just open the `index.html` file in a browser.

## Data Format

The tool expects a CSV file with at least the following required columns:
- `X_umap1`: UMAP coordinate 1 (numeric).
- `X_umap2`: UMAP coordinate 2 (numeric).

Optional columns:
- `cell_barcode`: Unique identifier for each point (displayed on hover).
- `Cluster`: Cluster labels or any other column for coloring (can be numeric or categorical).
- Additional `X_pcaN` columns are ignored unless used for coloring.

### Example CSV

```csv
cell_barcode,X_pca1,X_pca2,X_pca3,X_umap1,X_umap2,Cluster
AAACATACACCGAT,3.954,-5.444,-2.829,8.115,-1.905,NNN
AAACATACAGAGAT,-3.408,7.240,-6.679,0.115,3.171,NNN
AAACATACCAGAAA,2.553,7.292,-8.084,0.134,4.114,NNN
AAACATACCACTGT,3.954,-5.444,-2.829,8.115,-1.905,NNN
```

You can get this data format using `scanpy`  from `anndata` in Python.
```python
import scanpy as sc

adata = sc.read_h5ad('your_data.h5ad')

# Do other preprocessing steps(e.g., filtering, normalization, etc.)

# Perform UMAP
sc.pp.neighbors(adata, n_neighbors=15, n_pcs=10, metric="cosine")
sc.tl.umap(adata, min_dist=0.1)

# Save UMAP coordinates
umap_df = adata.obsm.to_df()
umap_df.index = adata.obs_names
umap_df["Cluster"] = "NNN" # Replace with your cluster labels(e.g., adata.obs['louvain'])
```


- Rows with missing or malformed data will be skipped.
- Numeric columns (e.g., `X_umap1`, `X_umap2`) must contain valid numbers.

## Troubleshooting

- **File Not Loading**: Ensure the CSV has the required `X_umap1` and `X_umap2` columns and is properly formatted.
- **No Plot Displayed**: Check the browser console (F12) for JavaScript errors and verify your file structure.

## Dependencies

- [Plotly.js](https://plotly.com/javascript/): Included via CDN (`https://cdn.plot.ly/plotly-latest.min.js`).

## Contributing

Feel free to fork this repository, submit issues, or suggest enhancements via pull requests. Improvements to performance, additional features (e.g., 3D visualization), or UI tweaks are welcome!

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Plotly.js](https://plotly.com/javascript/) for interactive plotting.
- Inspired by the need for simple, browser-based UMAP visualization.