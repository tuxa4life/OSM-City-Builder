# OSM 3D Map Builder

A React app that fetches geographic data from **OpenStreetMap (OSM)** and generates a **3D map** using **Three.js** based on node information. You can also **export the 3D map as a GLTF file**.

## Features

- Fetch city/region data from OSM.
- Convert OSM nodes into 3D geometries.
- Interactive 3D map rendering with **Three.js**.
- Export the generated map as a **GLTF file**.
- User-friendly interface to select countries or regions.
- Dynamic updates for selected areas.

## Installation

```bash
git clone https://github.com/Tuxa4Life/OSM-City-Builder.git
cd OSM-City-Builder
npm install
npm start
```

## Usage
1. Open the app in your browser.
2. Select a country or region.
3. The app fetches OSM data and generates a 3D map.
4. Interact with the map using mouse controls (rotate, zoom, pan).
5. Click Export to save the map as a .gltf file.

## Tech Stack
- React – Frontend framework
- Three.js – 3D map rendering
- Axios – API requests to OSM
- OpenStreetMap API – Geospatial data source