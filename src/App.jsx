import { useState } from 'react';
import ThreeScene from './Compontents/ThreeScene';
import './Styles/App.css'
import CitySelector from './Compontents/CitySelector';
import { useData } from './Context/DataContext';
import Welcome from './Compontents/Welcome';

const App = () => {
    const [welcomeOpen, setWelcomeOpen] = useState(true)
    const { buildings } = useData()

    return <div>
        {
            (buildings?.length === 0 && welcomeOpen) && <Welcome close={() => setWelcomeOpen(false)} />
        }
        <CitySelector />
        <ThreeScene />
    </div>
}

export default App;