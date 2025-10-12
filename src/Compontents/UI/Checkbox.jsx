import { useState } from 'react'

const Checkbox = ({ label, onChange = () => {} }) => {
    const [checked, setChecked] = useState(false)

    const handleChange = (e) => {
        const newValue = e.target.checked
        setChecked(newValue)
        onChange(newValue)
    }

    return (
        <label
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                userSelect: 'none',
                background: 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(5px)',
                padding: '8px 12px',
                borderRadius: '6px',
                transition: '.3s all'
            }}
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={handleChange}
                style={{
                    appearance: 'none',
                    width: '18px',
                    height: '18px',
                    borderRadius: '4px',
                    border: '2px solid rgba(0,0,0,0.3)',
                    background: checked
                        ? 'rgba(0,150,255,0.6)'
                        : 'rgba(255,255,255,0.8)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: '.3s all'
                }}
            />
            <span style={{ fontSize: '15px', color: '#333' }}>{label}</span>
        </label>
    )
}

export default Checkbox
