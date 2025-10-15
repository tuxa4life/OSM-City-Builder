const Button = ({ label, onClick = () => { }, styles = {}, type = 'basic' }) => (
    <button
        onClick={onClick}
        style={{ color: type === 'primary' ? 'white' : 'black', marginTop: '10px', width: '100%', padding: '10px 15px', border: 'none', borderRadius: '6px', background: type === 'primary' ? 'rgba(0, 123, 255, 1)' : 'rgba(255,255,255,0.6)', backdropFilter: 'blur(5px)', cursor: 'pointer', fontSize: '15px', fontWeight: '500', transition: '.3s all', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', ...styles }}
        onMouseEnter={e => e.currentTarget.style.background = type === 'primary' ? 'rgba(0, 123, 255, 0.6)' : 'rgba(255, 255, 255, 1)'}
        onMouseLeave={e => e.currentTarget.style.background = type === 'primary' ? 'rgba(0, 123, 255, 1)' : 'rgba(255, 255, 255, 0.6)'}
    >
        {label}
    </button>
)

export default Button
