import { ReactComponent as Scroll } from '../Svgs/scroll.svg'
import { ReactComponent as LeftClick } from '../Svgs/left-click.svg'
import { ReactComponent as RightClick } from '../Svgs/right-click.svg'
import { ReactComponent as Times } from '../Svgs/times.svg'

const Welcome = ({ close }) => {
    return <div style={{ backgroundColor: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', padding: '30px', borderRadius: '15px', boxShadow: '0 8px 20px rgba(0,0,0,0.3)', fontFamily: 'Arial, sans-serif' }}>
        <h2 style={{ fontSize: '36px', margin: '10px 0 15px 0', fontWeight: 'bold' }}>Welcome to OSM Map Builder</h2>
        <p style={{ fontSize: '20px', margin: '0 0 10px 0' }}>Please select a country and its city to generate a 3D model.</p>
        <div style={{ marginTop: '30px' }}>
            <h2 style={{ paddingBottom: '5px' }}>Navigation</h2>
            <ul style={{ listStyle: 'none', width: 'auto', paddingRight: '30px' }}>
                <li style={{ display: 'flex', alignItems: 'center', marginTop: '10px', width: '100%' }}>
                    <Scroll style={{ height: '30px', width: '30px', marginRight: '10px' }} />
                    Scroll - zoom in/out
                </li>
                <li style={{ display: 'flex', alignItems: 'center', marginTop: '10px', width: '100%' }}>
                    <LeftClick style={{ height: '30px', width: '30px', marginRight: '10px' }} />
                    Left click & hold - rotate
                </li>
                <li style={{ display: 'flex', alignItems: 'center', marginTop: '10px', width: '100%' }}>
                    <RightClick style={{ height: '30px', width: '30px', marginRight: '10px' }} />
                    Right Click - Move
                </li>
            </ul>
        </div>
        <Times onClick={close} style={{ height: '30px', width: '30px', position: 'absolute', top: '10px', right: '10px', cursor: 'pointer' }} />
    </div>
}

export default Welcome;