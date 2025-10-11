import { useError } from "../Context/ErrorContext"

const Loading = () => {
    const cardStyle = { zIndex: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '18px 22px', borderRadius: '12px', boxShadow: '0 6px 20px rgba(20,20,20,0.08)', backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.04)', transform: 'translate(-50%, -50%)', position: 'fixed', top: '50%', left: '50%' }
    const spinnerStyle = { width: '56px', height: '56px', borderRadius: '50%', border: '6px solid rgba(0,0,0,0.08)', borderTop: '6px solid rgba(34,34,34,0.85)', animation: 'spin 1s linear infinite', boxSizing: 'border-box' }
    const textStyle = { fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial', fontSize: '14px', color: '#222', margin: 0, letterSpacing: '0.2px', textAlign: 'center' }

    const { loaderMessage } = useError()

    return (
        <>
            <style>{`@keyframes spin {0% { transform: rotate(0deg) } 100% { transform: rotate(360deg) }}`}</style>
            <div style={cardStyle}>
                <div style={spinnerStyle} />
                <p style={textStyle}>{loaderMessage}</p>
            </div>
        </>
    )
}

export default Loading;