import { ReactComponent as Scroll } from '../Svgs/scroll.svg'
import { ReactComponent as LeftClick } from '../Svgs/left-click.svg'
import { ReactComponent as RightClick } from '../Svgs/right-click.svg'
import { ReactComponent as Times } from '../Svgs/times.svg'

const ContextMenu = ({ close }) => {
    return <div style={{position: 'absolute', top: '10px', left: '10px', padding: '10px 20px', backgroundColor: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(5px)', borderRadius: '7px', boxShadow: '0px 0px 7px 0px rgba(0,0,0,0.4)'}}>
        <Times onClick={close} style={{position: 'absolute', top: '10px', right: '10px', width: '30px', height: '30px', cursor: 'pointer'}} />
        
        <h2 style={{paddingBottom: '5px'}}>Navigation</h2>
        <ul style={{listStyle: 'none', width: 'auto', paddingRight: '30px'}}>
            <li style={{ display: 'flex', alignItems: 'center', marginTop: '10px', width: '100%'}}>
                <Scroll style={{height: '30px', width: '30px', marginRight: '10px'}} />
                Scroll - zoom in/out
            </li>
            <li style={{ display: 'flex', alignItems: 'center', marginTop: '10px', width: '100%'}}>
                <LeftClick style={{height: '30px', width: '30px', marginRight: '10px'}} />
                Left click & hold - rotate
            </li>
            <li style={{ display: 'flex', alignItems: 'center', marginTop: '10px', width: '100%'}}>
                <RightClick style={{height: '30px', width: '30px', marginRight: '10px'}} />
                Right Click - Move
            </li>
        </ul>
    </div>
}

export default ContextMenu