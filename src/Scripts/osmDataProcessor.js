const axios = require('axios')
const fs = require('fs').promises
const path = require('path')

const DATA_DIR = './data'
const OUTPUT_FILE = path.join(DATA_DIR, 'buildings.json')
const DEFAULT_BUILDING_LEVELS = 1
const OVERPASS_TIMEOUT = 500

const scaleOSMCoordinates = (buildings, options = {}) => {
    const { targetSize = 1000, centerOrigin = true } = options

    if (!buildings || buildings.length === 0) {
        return { buildings: [], bounds: null, scale: 1 }
    }

    let minLon = Infinity,
        maxLon = -Infinity
    let minLat = Infinity,
        maxLat = -Infinity

    buildings.forEach((building) => {
        building.nodes.forEach(([lon, lat]) => {
            minLon = Math.min(minLon, lon)
            maxLon = Math.max(maxLon, lon)
            minLat = Math.min(minLat, lat)
            maxLat = Math.max(maxLat, lat)
        })
    })

    const centerLon = (minLon + maxLon) / 2
    const centerLat = (minLat + maxLat) / 2

    const lonSpan = maxLon - minLon
    const latSpan = maxLat - minLat

    const latToMeters = 111320
    const lonToMeters = 111320 * Math.cos((centerLat * Math.PI) / 180)

    const widthMeters = lonSpan * lonToMeters
    const heightMeters = latSpan * latToMeters
    const maxSpanMeters = Math.max(widthMeters, heightMeters)

    const scale = targetSize / maxSpanMeters

    const scaledBuildings = buildings.map((building) => {
        const scaledNodes = building.nodes.map(([lon, lat]) => {
            let x = (lon - centerLon) * lonToMeters * scale
            let z = (lat - centerLat) * latToMeters * scale

            if (!centerOrigin) {
                x += targetSize / 2
                z += targetSize / 2
            }

            return [x, z]
        })

        return {
            nodes: scaledNodes,
            height: building.height || 2,
        }
    })

    return {
        buildings: scaledBuildings,
        bounds: {
            minLon,
            maxLon,
            minLat,
            maxLat,
            centerLon,
            centerLat,
            widthMeters,
            heightMeters,
        },
        scale,
        metersPerUnit: 1 / scale,
    }
}

const fetchBuildings = async (cityId) => {
    console.log('=== Fetching buildings ===')

    const areaId = 3600000000 + cityId
    const query = `
        [out:json][timeout:${OVERPASS_TIMEOUT}];
        (
            way["building"](area:${areaId});
        );
        out body geom;
    `

    try {
        const response = await axios.post('https://overpass-api.de/api/interpreter', query, {
            headers: { 'Content-Type': 'text/plain' },
        })

        console.log(`> Fetched ${response.data.elements.length} buildings`)
        const processedBuildings = response.data.elements.map((element) => ({
            nodes: element.geometry.map((e) => [e.lon, e.lat]),
            height: (element.tags?.['building:levels']) ?? DEFAULT_BUILDING_LEVELS,
        }))

        const { buildings: scaledBuildings } = scaleOSMCoordinates(processedBuildings);

        await fs.mkdir(DATA_DIR, { recursive: true })
        await fs.writeFile(OUTPUT_FILE, JSON.stringify(scaledBuildings, null, 2))

        console.log(`> Saved ${scaledBuildings.length} buildings to ${OUTPUT_FILE}`)
        console.log('=== Processing complete ===')

        return scaledBuildings
    } catch (err) {
        console.error(`=== Error: ${err.message} (Status: ${err.response?.status ?? 'N/A'}) ===`)
        console.log(err)
        return []
    }
}

fetchBuildings(5997314)

module.exports = {
    fetchBuildings
}
