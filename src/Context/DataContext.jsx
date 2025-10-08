import { createContext, useContext, useEffect, useState } from "react"
import axios from "axios"

const DataContext = createContext()

const DataProvider = ({ children }) => {
    const [fetching, setFetching] = useState(false)
    const [buildings, setBuildings] = useState([])

    const [countries, setCountries] = useState({})
    const [selectedCountry, setSelectedCountry] = useState('')

    const [cities, setCities] = useState({})
    const [selectedCity, setSelectedCity] = useState(-1)

    const [message, setMessage] = useState('')
    const [mesh, setMesh] = useState(null)

    useEffect(() => {
        fetchCountries()
    }, [])

    useEffect(() => {
        if (selectedCountry) {
            fetchCities(selectedCountry)
        }
    }, [selectedCountry])

    useEffect(() => {
        if (selectedCity !== -1) {
            setFetching(true)
            fetchBuildings(selectedCity).then(() => setFetching(false))
        }
    }, [selectedCity])

    const selectCountry = (country) => {
        setCities({})
        setSelectedCountry(country)
    }

    const fetchCountries = async () => {
        try {
            const res = await axios.get('https://restcountries.com/v3.1/all?fields=name,cca2')

            const countryCodes = {}
            res.data.forEach((c) => {
                countryCodes[c.name.common.toLowerCase()] = c.cca2
            })

            setCountries(countryCodes)
        } catch (err) {
            setMessage(`"Error ${err.status}" while loading countries.`)
            return -1
        }
    }

    const fetchWithRetry = async (fetchFn, maxRetries = 3, baseDelay = 2000) => {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fetchFn()
            } catch (err) {
                console.log(err)
                const is504 = err.response?.status === 504 || err.status === 504
                const isLastAttempt = attempt === maxRetries

                if (is504 && !isLastAttempt) {
                    const delay = baseDelay * Math.pow(2, attempt) // Exponential backoff
                    setMessage(`Server timeout (504). Retrying in ${delay / 1000}s... (Attempt ${attempt + 1}/${maxRetries})`)
                    await new Promise(resolve => setTimeout(resolve, delay))
                } else {
                    throw err
                }
            }
        }
    }

    const fetchCities = async (countryCode, minPopulation = 1000) => {
        setMessage(`Loading cities...`)
        const getEnglishName = (tags) => tags['name:en'] || tags['int_name'] || tags['name:latin'] || tags['official_name:en'] || tags['name']

        const query = `
        [out:json][timeout:60];
        area["ISO3166-1"="${countryCode}"]->.country;
        (
            relation["place"~"city|town"]["population"](area.country);
        );
        out tags;
    `

        try {
            const response = await fetchWithRetry(() =>
                axios.post('https://overpass-api.de/api/interpreter', query, {
                    headers: { 'Content-Type': 'text/plain' }
                })
            )

            const cities = response.data.elements
                .filter((e) => {
                    const pop = parseInt(e.tags?.population || 0)
                    return pop >= minPopulation && e.tags?.name
                })
                .sort((a, b) => parseInt(b.tags.population || 0) - parseInt(a.tags.population || 0))

            const cityMap = {}
            cities.forEach((e) => {
                const name = getEnglishName(e.tags)
                cityMap[name] = e.id
            })

            setMessage(`Loaded ${Object.keys(cityMap).length} cities.`)

            setCities(cityMap)
        } catch (err) {
            setMessage(`"Error ${err.response?.status || err.status}" while loading cities.`)
            return -1
        }
    }

    const fetchBuildings = async (cityId) => {
        setMessage(`Generating 3D Model, Please wait...`)

        const areaId = 3600000000 + cityId
        const query = `
        [out:json][timeout:${OVERPASS_TIMEOUT}];
        (
            way["building"](area:${areaId});
        );
        out body geom;
    `

        try {
            const response = await fetchWithRetry(() =>
                axios.post('https://overpass-api.de/api/interpreter', query, { headers: { 'Content-Type': 'text/plain' } }), 3, 3000)

            const processedBuildings = response.data.elements.map((element) => ({
                nodes: element.geometry.map((e) => [e.lon, e.lat]),
                height: (element.tags?.['building:levels']) ?? DEFAULT_BUILDING_LEVELS,
            }))

            const { buildings: scaledBuildings } = scaleOSMCoordinates(processedBuildings)

            setBuildings(scaledBuildings)
            setMessage('')
        } catch (err) {
            setMessage(`"Error ${err.response?.status || err.status}" while generating 3D Model.`)
            console.log(err)
            return -1
        }
    }

    const DEFAULT_BUILDING_LEVELS = 1
    const OVERPASS_TIMEOUT = 1200

    const scaleOSMCoordinates = (buildings, options = {}) => {
        const { targetSize = 1000, centerOrigin = true } = options

        if (!buildings || buildings.length === 0) {
            return { buildings: [], bounds: null, scale: 1 }
        }

        let minLon = Infinity, maxLon = -Infinity
        let minLat = Infinity, maxLat = -Infinity

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

    const data = { mesh, setMesh, message, fetching, buildings, countries, cities, setSelectedCity, selectCountry }

    return (
        <DataContext.Provider value={data}>
            {children}
        </DataContext.Provider>
    )
}

export const useData = () => useContext(DataContext)
export { DataProvider }
export default DataContext