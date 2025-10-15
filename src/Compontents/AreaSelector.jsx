import { useState } from "react"
import { Rectangle, useMap, useMapEvents } from "react-leaflet"

const AreaSelector = ({ onAreaSelected, isSelecting, selectedArea, setSelectedArea, setIsSelecting }) => {
    const [startPoint, setStartPoint] = useState(null)
    const [tempEndPoint, setTempEndPoint] = useState(null)
    const map = useMap()

    useMapEvents({
        mousedown: (e) => {
            if (isSelecting) {
                map.dragging.disable()
                setStartPoint(e.latlng)
                setTempEndPoint(e.latlng)
            }
        },
        mousemove: (e) => {
            if (isSelecting && startPoint) setTempEndPoint(e.latlng)
        },
        mouseup: (e) => {
            if (isSelecting && startPoint) {
                const bounds = [
                    [startPoint.lat, startPoint.lng],
                    [e.latlng.lat, e.latlng.lng]
                ]
                setSelectedArea(bounds)
                onAreaSelected(bounds)
                setStartPoint(null)
                setTempEndPoint(null)
                setIsSelecting(false)
                map.dragging.enable()
            }
        }
    })

    const bounds = tempEndPoint
        ? [[startPoint?.lat, startPoint?.lng], [tempEndPoint.lat, tempEndPoint.lng]]
        : selectedArea

    if (!bounds) return null

    return <Rectangle bounds={bounds} pathOptions={{ color: 'black', weight: 2, fillOpacity: 0.2 }} />
}

export default AreaSelector;