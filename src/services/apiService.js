import { BASE_RETRY_DELAY, ELEVATION_BATCH_SIZE, MAX_RETRIES } from '../constants/dataConstants'
import axios from 'axios'

const getEnglishName = (tags) => tags['name:en'] || tags['int_name'] || tags['name:latin'] || tags['official_name:en'] || tags['name']

export const fetchWithRetryService = async (fetchFn, maxRetries = MAX_RETRIES, baseDelay = BASE_RETRY_DELAY, showError) => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fetchFn()
        } catch (err) {
            const is504 = err.response?.status === 504 || err.status === 504
            const isLastAttempt = attempt === maxRetries

            if (is504 && !isLastAttempt) {
                const delay = baseDelay * Math.pow(2, attempt)
                showError(`Server timeout (504). Retrying in ${delay / 1000}s... `)
                await new Promise((resolve) => setTimeout(resolve, delay))
            } else {
                console.log('error')
                throw err
            }
        }
    }
}

export const fetchElevationsService = async (coordinates, showError) => {
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
                await new Promise((resolve) => setTimeout(resolve, 100))
            }
        }

        return results
    } catch (err) {
        showError(`Error ${err} while fetching elevations.`)
        return []
    }
}

export const fetchCountriesService = async (showError) => {
    try {
        const res = await axios.get('https://restcountries.com/v3.1/all?fields=name,cca2')

        const countryCodes = res.data.reduce((acc, c) => {
            acc[c.name.common.toLowerCase()] = c.cca2
            return acc
        }, {})

        return countryCodes
    } catch (err) {
        showError(`Error ${err.status} while loading countries.`)

        return -1
    }
}

export const fetchCitiesService = async (countryCode, showError) => {
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
        const response = await fetchWithRetryService(() =>
            axios.post('https://overpass-api.de/api/interpreter', query, {
                headers: { 'Content-Type': 'text/plain' },
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

        return cityMap
    } catch (err) {
        showError(`Error ${err.response?.status || err.status} while loading cities.`)
        return -1
    }
}