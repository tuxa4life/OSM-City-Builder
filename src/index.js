import { createRoot } from 'react-dom/client'
import App from './App'
import { DataProvider } from './Context/DataContext'

const root = createRoot(document.getElementById('root'))
root.render(
    <DataProvider>
        <App />
    </DataProvider>
)
