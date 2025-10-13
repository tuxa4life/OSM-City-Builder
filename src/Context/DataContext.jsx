import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import { useError } from './ErrorContext'
import axios from "axios"

const DataContext = createContext()

const DEFAULT_BUILDING_LEVELS = 3
const OVERPASS_TIMEOUT = 1200
const ELEVATION_BATCH_SIZE = 10000
const MAX_RETRIES = 3
const BASE_RETRY_DELAY = 2000
const RETRY_DELAY_504 = 3000

const DataProvider = ({ children }) => {
    const { showError, setLoaderState, setLoaderMessage } = useError()

    const [fetching, setFetching] = useState(false)
    const [buildings, setBuildings] = useState([])
    const [countries, setCountries] = useState({})
    const [selectedCountry, setSelectedCountry] = useState('')
    const [cities, setCities] = useState({})
    const [selectedCity, setSelectedCity] = useState(-1)
    const [mesh, setMesh] = useState(null)
    const [elevated, setElevated] = useState(true)

    const calculateCenter = useCallback((coords) => {
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
    }, [])

    const getEnglishName = useCallback((tags) =>
        tags['name:en'] || tags['int_name'] || tags['name:latin'] ||
        tags['official_name:en'] || tags['name'], [])

    const fetchWithRetry = useCallback(async (fetchFn, maxRetries = MAX_RETRIES, baseDelay = BASE_RETRY_DELAY) => {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fetchFn()
            } catch (err) {
                const is504 = err.response?.status === 504 || err.status === 504
                const isLastAttempt = attempt === maxRetries

                if (is504 && !isLastAttempt) {
                    const delay = baseDelay * Math.pow(2, attempt)
                    showError(`Server timeout (504). Retrying in ${delay / 1000}s... `)
                    await new Promise(resolve => setTimeout(resolve, delay))
                } else {
                    throw err
                }
            }
        }
    }, [])

    const fetchCountries = useCallback(async () => {
        try {
            const res = await axios.get('https://restcountries.com/v3.1/all?fields=name,cca2')

            const countryCodes = res.data.reduce((acc, c) => {
                acc[c.name.common.toLowerCase()] = c.cca2
                return acc
            }, {})

            setCountries(countryCodes)
        } catch (err) {
            showError(`Error ${err.status} while loading countries.`)

            return -1
        }
    }, [])

    const fetchCities = useCallback(async (countryCode) => {
        const query = `
            [out:json][timeout:60];
            area["ISO3166-1"="${countryCode}"]->.country;
                (
                    relation["place"~"city|town"]["population"](area.country);
                    way["place"~"city|town"]["population"](area.country);
                    node["place"~"city|town"]["population"](area.country); 
                );
            out tags center;
        `

        try {
            const response = await fetchWithRetry(() =>
                axios.post('https://overpass-api.de/api/interpreter', query, {
                    headers: { 'Content-Type': 'text/plain' }
                })
            )
            
            const typeOrder = { relation: 0, way: 1, node: 2 }
            const cityMap = response.data.elements
                .sort((a, b) => {
                    const typeComparison = typeOrder[a.type] - typeOrder[b.type]
                    if (typeComparison !== 0) return typeComparison

                    const popA = parseInt(a.tags?.population) || 0
                    const popB = parseInt(b.tags?.population) || 0
                    return popB - popA
                })
                .reduce((acc, e) => {
                    const name = getEnglishName(e.tags)
                    if (!acc[name]) {
                        acc[name] = {
                            id: e.id,
                            type: e.type,
                        }
                    }
                    return acc
                }, {})

            setCities(cityMap)
        } catch (err) {
            showError(`Error ${err.response?.status || err.status} while loading cities.`)
            return -1
        }
    }, [fetchWithRetry, getEnglishName])

    const fetchElevations = useCallback(async (coordinates) => {
        setLoaderMessage('Fetching building elevation data...')
        const url = 'https://api.open-elevation.com/api/v1/lookup'
        const results = []

        try {
            for (let i = 0; i < coordinates.length; i += ELEVATION_BATCH_SIZE) {
                const batch = coordinates.slice(i, i + ELEVATION_BATCH_SIZE)
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ locations: batch }),
                })

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const data = await response.json()
                results.push(...data.results)

                if (i + ELEVATION_BATCH_SIZE < coordinates.length) {
                    await new Promise(resolve => setTimeout(resolve, 100))
                }
            }

            return results
        } catch (err) {
            showError(`Error ${err} while fetching elevations.`)
            return []
        }
    }, [])

    const scaleOSMCoordinates = useCallback((buildings, options = {}) => {
        setLoaderMessage('Scaling models to target size...')
        const { targetSize = 3000, centerOrigin = true } = options

        if (!buildings?.length) {
            return { buildings: [], bounds: null, scale: 1 }
        }

        const bounds = buildings.reduce((acc, building) => {
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
        }, {
            minLon: Infinity,
            maxLon: -Infinity,
            minLat: Infinity,
            maxLat: -Infinity,
            minElevation: Infinity
        })

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

            const y = building.elevation != null
                ? (building.elevation - bounds.minElevation) * scale
                : 2

            return {
                nodes: scaledNodes,
                height: (building.height || 2) * (targetSize / 1000),
                elevation: y
            }
        })

        return scaledBuildings
    }, [])

    const fetchBuildings = useCallback(async (cityId, type) => {
        setLoaderState(true)
        setLoaderMessage('Fetching building nodes...')

        let query;

        if (type === 'relation') {
            const areaId = 3600000000 + cityId
            query = `
            [out:json][timeout:${OVERPASS_TIMEOUT}];
            (
                way["building"](area:${areaId});
            );
            out body geom;
        `
        } else if (type === 'way') {
            query = `
            [out:json][timeout:${OVERPASS_TIMEOUT}];
            way(${cityId});
            map_to_area->.searchArea;
            (
                way["building"](area.searchArea);
            );
            out body geom;
        `
        } else if (type === 'node') {
            query = `
            [out:json][timeout:${OVERPASS_TIMEOUT}];
            node(${cityId});
            (
                way["building"](around:15000);
            );
            out body geom;
        `
        } else {
            throw new Error(`Invalid type: ${type}. Must be 'relation', 'way', or 'node'`)
        }

        try {
            const response = await fetchWithRetry(() => axios.post('https://overpass-api.de/api/interpreter', query, {
                headers: { 'Content-Type': 'text/plain' }
            }), MAX_RETRIES, RETRY_DELAY_504)

            const processedBuildings = response.data.elements.map((element) => ({
                nodes: element.geometry.map((e) => [e.lon, e.lat]),
                height: element.tags?.['building:levels'] ?? DEFAULT_BUILDING_LEVELS,
                center: calculateCenter(element.geometry)
            }))

            const centers = processedBuildings.map(e => ({
                latitude: parseFloat(e.center.latitude),
                longitude: parseFloat(e.center.longitude)
            }))

            const elevations = await fetchElevations(centers)
            const processedElevatedBuildings = processedBuildings.map((b, i) => ({
                ...b,
                elevation: elevations[i]?.elevation
            }))

            const scaledBuildings = scaleOSMCoordinates(processedElevatedBuildings)

            setBuildings(scaledBuildings)
        } catch (err) {
            showError(`Error ${err.response?.status || err.status} while generating fetching buildings.`)
            return -1
        }
    }, [fetchWithRetry, calculateCenter, fetchElevations, scaleOSMCoordinates])

    const selectCountry = useCallback((country) => {
        setCities({})
        setSelectedCountry(country)
    }, [])

    useEffect(() => {
        fetchCountries()
    }, [fetchCountries])

    useEffect(() => {
        if (selectedCountry) {
            setFetching(true)
            fetchCities(selectedCountry).finally(() => setFetching(false))
        }
    }, [selectedCountry, fetchCities])

    useEffect(() => {
        if (selectedCity !== -1) {
            fetchBuildings(selectedCity.id, selectedCity.type)
        }
    }, [selectedCity, fetchBuildings])

    const contextValue = useMemo(() => ({
        mesh,
        setMesh,
        fetching,
        buildings,
        countries,
        cities,
        setSelectedCity,
        selectCountry,
        elevated,
        setElevated,
    }), [mesh, fetching, buildings, countries, cities, elevated, selectCountry])

    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    )
}

export const useData = () => {
    const context = useContext(DataContext)
    if (!context) {
        throw new Error('useData must be used within a DataProvider')
    }
    return context
}

export { DataProvider }
export default DataContext