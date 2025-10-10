import { useEffect, useState } from 'react';
import ContextMenu from './Compontents/ContextMenu';
import ThreeScene from './Compontents/ThreeScene';
import './Styles/App.css'
import CitySelector from './Compontents/CitySelector';
import { useData } from './Context/DataContext';

const App = () => {
    const [contextOpen, setContextOpen] = useState(true)
    const { mesh } = useData()

    useEffect(() => {
        if (window.innerWidth < 650) {
            setContextOpen(false)
        }
    }, [])

    return <div>
        {
            !mesh && <div style={{ backgroundColor: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', padding: '30px', borderRadius: '15px', boxShadow: '0 8px 20px rgba(0,0,0,0.3)', fontFamily: 'Arial, sans-serif' }}>
                <h2 style={{ fontSize: '36px', margin: '0 0 15px 0', fontWeight: 'bold' }}>Welcome to OSM Map Builder</h2>
                <p style={{ fontSize: '20px', margin: '0 0 10px 0' }}>Please select a country and its city to generate a 3D model.</p>
                <i style={{color: 'gray'}}>Some of the city data is not available or is too large to be rendered</i>
            </div>

        }
        {contextOpen && <ContextMenu close={() => setContextOpen(false)} />}
        <CitySelector />
        <ThreeScene />
    </div>
}

export default App;