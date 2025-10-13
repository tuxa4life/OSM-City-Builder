import { useState, useRef, useEffect } from 'react';

const Dropdown = ({ options, placeholder = "Search...", onChange, disabled }) => {
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [resolvedOptions, setResolvedOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const wrapperRef = useRef(null);

    useEffect(() => {
        const resolveOptions = async () => {
            if (!options) {
                setResolvedOptions([]);
                return;
            }

            if (options instanceof Promise) {
                setIsLoading(true);
                try {
                    const resolved = await options;
                    setResolvedOptions(resolved || []);
                } catch (error) {
                    console.error('Error resolving options:', error);
                    setResolvedOptions([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setResolvedOptions(options);
            }
        };

        resolveOptions();
    }, [options]);

    useEffect(() => {
        const filtered = resolvedOptions?.filter(option =>
            option.text.toLowerCase().includes(inputValue.toLowerCase())
        ) || [];
        setFilteredOptions(filtered);
    }, [inputValue, resolvedOptions]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        setInputValue(option.text);
        setIsOpen(false);
        if (onChange) onChange(option);
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value?.id || e.target.value);
        setIsOpen(true);
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '300px', maxWidth: '100%' }}>
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
                placeholder={disabled ? 'Select country first' : placeholder}
                disabled={isLoading || disabled}
                style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid rgba(228, 228, 228, 1)',
                    borderRadius: '6px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                    opacity: isLoading ? 0.6 : 1,
                    cursor: isLoading ? 'wait' : 'text',
                    backgroundColor: 'rgba(255, 255, 255, .75)'
                }}
                onMouseEnter={(e) => !isLoading && (e.target.style.borderColor = '#999')}
                onMouseLeave={(e) => e.target.style.borderColor = '#ddd'}
            />

            {isOpen && (isLoading || disabled) && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    fontSize: '14px',
                    color: '#999',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}>
                    Loading...
                </div>
            )}

            {isOpen && !isLoading && filteredOptions.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000,
                }}>
                    {filteredOptions.map((option) => (
                        <div
                            key={option.value?.id || option.value}
                            onClick={() => handleSelect(option)}
                            style={{
                                padding: '10px 12px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                transition: 'background-color 0.15s',
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            {option.text}
                        </div>
                    ))}
                </div>
            )}

            {isOpen && !isLoading && inputValue && filteredOptions.length === 0 && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    fontSize: '14px',
                    color: '#999',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}>
                    No results found
                </div>
            )}
        </div>
    );
};

export default Dropdown;