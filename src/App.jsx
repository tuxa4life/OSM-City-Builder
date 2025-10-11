import { useState } from 'react';
import { useData } from './Context/DataContext';
import Welcome from './Compontents/Welcome';
import CitySelector from './Compontents/CitySelector';
import ThreeScene from './Compontents/ThreeScene';
import Message from './Compontents/Message';
import './Styles/App.css'
import { useError } from './Context/ErrorContext';

const App = () => {
    const [welcomeOpen, setWelcomeOpen] = useState(true)
    const { buildings } = useData()
    const { error } = useError()

    return <div>
        {
            (buildings?.length === 0 && welcomeOpen) && <Welcome close={() => setWelcomeOpen(false)} />
        }
        <CitySelector />
        <ThreeScene />

        { error && <Message /> }
    </div>
}

export default App;