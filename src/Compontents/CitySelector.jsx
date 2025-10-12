import { useData } from "../Context/DataContext"
import Dropdown from "./Dropdown"
import { ReactComponent as Tab } from '../Svgs/tab.svg'
import { useState } from "react"

const CitySelector = () => {
    const { countries, cities, selectCountry, setSelectedCity } = useData()
    const [open, setOpen] = useState(true)

    const formatData = (data) => {
        return Object.entries(data).map(([name, code]) => ({
            text: name.charAt(0).toUpperCase() + name.slice(1),
            value: code,
        }))
    }

    return <div style={{ zIndex: 1, position: 'absolute', top: '10px', right: '10px', padding: '10px 20px', backgroundColor: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(5px)', borderRadius: '3px 7px 7px 7px', maxWidth: '80vw', transform: `translateX(${open ? '0px' : '101%'})`, transition: '.3s all' }}>
        <div onClick={() => setOpen(prev => !prev)} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)'} 
            style={{ transition: '.5s all', width: '30px', height: '30px', left: '-35px', position: 'absolute', top: '0', backgroundColor: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(5px)', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Tab style={{ width: '20px', height: '20px', scale: open ? '1' : '-1' }} />
        </div>

        <div style={{ margin: '20px 0' }}>
            <h4>Select a country</h4>
            <Dropdown disabled={!Object.keys(countries).length} options={() => formatData(countries)} placeholder="Search country..." onChange={(e) => selectCountry(e.value)} />
        </div>

        <div style={{ margin: '20px 0 10px 0' }}>
            <h4>Select a city</h4>
            <Dropdown disabled={!Object.keys(cities).length} options={() => formatData(cities)} placeholder="Search city..." onChange={(e) => setSelectedCity(e.value)} />
        </div>
    </div>
}

export default CitySelector