import { createContext, useContext, useEffect, useState } from "react";

const ErrorContext = createContext()
const ErrorProvider = ({ children }) => {
    const [errorMessage, setErrorMessage] = useState('')
    const [error, setError] = useState(false)
    const [errorAnimation, setErrorAnimation] = useState(false)

    const clearError = () => {
        setErrorAnimation(false)
        setTimeout(() => setError(false), 500)
    }

    const showError = (text, duration = 3000) => {
        setErrorMessage(text)
        setError(true)
        setErrorAnimation(true)

        setTimeout(clearError, duration)
    }

    const data = { errorMessage, setErrorMessage, error, clearError, showError, errorAnimation }
    return <ErrorContext.Provider value={data}>
        {children}
    </ErrorContext.Provider>
}

export const useError = () => {
    const context = useContext(ErrorContext)
    if (!context) {
        throw new Error('useContext must be used within a ErrorProvider')
    }
    return context
}
export { ErrorProvider }
export default ErrorContext