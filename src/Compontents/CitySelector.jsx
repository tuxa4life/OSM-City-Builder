import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js"
import { useData } from "../Context/DataContext"
import Dropdown from "./Dropdown"

const CitySelector = () => {
    const { countries, cities, selectCountry, setSelectedCity, message, mesh } = useData()

    const formatData = (data) => {
        return Object.entries(data).map(([name, code]) => ({
            text: name.charAt(0).toUpperCase() + name.slice(1),
            value: code,
        }))
    }

    const exportObject = () => {
        const exporter = new GLTFExporter()

        exporter.parse(
            mesh,
            (gltf) => {
                const blob = new Blob([JSON.stringify(gltf)], {
                    type: "application/json"
                })
                const link = document.createElement("a")
                link.download = "Output.gltf"
                link.href = URL.createObjectURL(blob)
                link.click()
                URL.revokeObjectURL(link.href)
            },
            (error) => {
                console.error("Export failed:", error)
            },
            { binary: false }
        )
    }

    return <div style={{ position: 'absolute', top: '10px', right: '10px', padding: '10px 20px', backgroundColor: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(5px)', borderRadius: '7px', boxShadow: '0px 0px 7px 0px rgba(0,0,0,0.4)' }}>
        <div style={{ margin: '20px 0' }}>
            <h4>Select a country</h4>
            <Dropdown disabled={!Object.keys(countries).length} options={() => formatData(countries)} placeholder="Search country..." onChange={(e) => selectCountry(e.value)} />
        </div>

        <div style={{ margin: '20px 0' }}>
            <h4>Select a city</h4>
            <Dropdown disabled={!Object.keys(cities).length} options={() => formatData(cities)} placeholder="Search city..." onChange={(e) => setSelectedCity(e.value)} />
        </div>

        {message && <p style={{ width: 'inherit' }}>{message}</p>}

        {mesh && <button onClick={exportObject} style={{ marginTop: '10px', padding: "8px 16px", backgroundColor: "#a6a6a6ff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>Export as .obj</button>}

    </div>
}

export default CitySelector