import { DEFAULT_BUILDING_LEVELS, OVERPASS_TIMEOUT } from '../constants/dataConstants'

export const calculateCenterCoordinates = (coords) => {
    if (!coords.length) return null

    const total = coords.reduce(
        (acc, { lat, lon }) => {
            acc.lat += lat
            acc.lon += lon
            return acc
        },
        { lat: 0, lon: 0 }
    )

    return {
        latitude: parseFloat((total.lat / coords.length).toFixed(4)),
        longitude: parseFloat((total.lon / coords.length).toFixed(4)),
    }
}

export const returnQuery = (data, type) => {
    if (typeof data === 'object') {
        return `
                [out:json][timeout:60];
                (
                    way['building'](${data.bottomLeft.lat},${data.topLeft.lng},${data.topRight.lat},${data.bottomRight.lng});
                );
                out body geom;
            `
    }

    if (type === 'relation') {
        const areaId = 3600000000 + data
        return `
                [out:json][timeout:${OVERPASS_TIMEOUT}];
                (
                    way['building'](area:${areaId});
                );
                out body geom;
            `
    } else if (type === 'way') {
        return `
                [out:json][timeout:${OVERPASS_TIMEOUT}];
                way(${data});
                map_to_area->.searchArea;
                (
                    way['building'](area.searchArea);
                );
                out body geom;
            `
    } else if (type === 'node') {
        return `
                [out:json][timeout:${OVERPASS_TIMEOUT}];
                node(${data});
                (
                    way['building'](around:15000);
                );
                out body geom;
            `
    } else {
        throw new Error(`Invalid type: ${type}. Must be 'relation', 'way', or 'node'`)
    }
}

export const scaleCoordinates = (buildings, options = {}) => {
    const { targetSize = 3000, centerOrigin = true, metersPerLevel = 24 } = options

    if (!buildings?.length) {
        return { buildings: [], bounds: null, scale: 1 }
    }

    const bounds = buildings.reduce(
        (acc, building) => {
            building.nodes.forEach(([lon, lat]) => {
                acc.minLon = Math.min(acc.minLon, lon)
                acc.maxLon = Math.max(acc.maxLon, lon)
                acc.minLat = Math.min(acc.minLat, lat)
                acc.maxLat = Math.max(acc.maxLat, lat)
            })
            if (building.elevation != null) {
                acc.minElevation = Math.min(acc.minElevation, building.elevation)
            }
            return acc
        },
        {
            minLon: Infinity,
            maxLon: -Infinity,
            minLat: Infinity,
            maxLat: -Infinity,
            minElevation: Infinity,
        }
    )

    const centerLon = (bounds.minLon + bounds.maxLon) / 2
    const centerLat = (bounds.minLat + bounds.maxLat) / 2
    const lonSpan = bounds.maxLon - bounds.minLon
    const latSpan = bounds.maxLat - bounds.minLat

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

        const y = building.elevation != null ? (building.elevation - bounds.minElevation) * scale : 0

        const levelsToMeters = (building.height || 12) * metersPerLevel
        const scaledHeight = levelsToMeters * scale

        return {
            nodes: scaledNodes,
            height: scaledHeight,
            elevation: y,
        }
    })

    return scaledBuildings
}

export const processBuildings = (elements) => {
    return elements.map((element) => ({
        nodes: element.geometry.map((e) => [e.lon, e.lat]),
        height: element.tags?.['building:levels'] ?? DEFAULT_BUILDING_LEVELS,
        center: calculateCenterCoordinates(element.geometry),
    }))
}

export const getCenters = (elements) => {
    return elements.map((e) => ({
        latitude: parseFloat(e.center.latitude),
        longitude: parseFloat(e.center.longitude),
    }))
}
