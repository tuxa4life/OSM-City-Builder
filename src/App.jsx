import { useState } from 'react';
import { useData } from './Context/DataContext';
import Welcome from './Compontents/Welcome';
import CitySelector from './Compontents/CitySelector';
import ThreeScene from './Compontents/ThreeScene';
import Message from './Compontents/Message';
import { useError } from './Context/ErrorContext';
import Loading from './Compontents/Loading';
import './Styles/App.css'

const App = () => {
    const [welcomeOpen, setWelcomeOpen] = useState(true)
    const { buildings } = useData()
    const { error, loaderState } = useError()

    return <div>
        { (buildings?.length === 0 && welcomeOpen) && <Welcome close={() => setWelcomeOpen(false)} /> }
        { error && <Message /> }
        { loaderState && <Loading /> }

        <CitySelector />
        <ThreeScene />
    </div>
}

export default App;