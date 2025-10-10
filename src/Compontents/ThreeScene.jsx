import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { useData } from '../Context/DataContext'

const ThreeScene = () => {
    const mountRef = useRef(null)
    const sceneRef = useRef(null)
    const cameraRef = useRef(null)
    const rendererRef = useRef(null)

    const { buildings, setMesh } = useData()

    const createCity = (buildingsData) => {
        if (!buildingsData || buildingsData.length === 0) {
            return null
        }

        const geometries = []

        for (const buildingData of buildingsData) {
            if (!buildingData || !buildingData.nodes || buildingData.nodes.length < 3) {
                continue
            }

            const { elevation, height, nodes } = buildingData
            const shape = new THREE.Shape()
            shape.moveTo(nodes[0][0], nodes[0][1])
            for (let i = 1; i < nodes.length; i++) shape.lineTo(nodes[i][0], nodes[i][1])
            shape.lineTo(nodes[0][0], nodes[0][1])

            const extrudeSettings = { depth: height / 4, bevelEnabled: false }
            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
            geometry.rotateX(Math.PI / 2)
            geometry.translate(0, -elevation, 0)
            geometries.push(geometry)
        }

        if (geometries.length === 0) {
            return null
        }

        const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries, false)
        const material = new THREE.MeshStandardMaterial({
            color: '#F0F0F0',
            flatShading: true
        })
        const cityMesh = new THREE.Mesh(mergedGeometry, material)
        cityMesh.rotation.z = Math.PI

        setMesh(cityMesh)
        return cityMesh
    }

    useEffect(() => {
        const scene = new THREE.Scene()
        scene.background = new THREE.Color('#f0f0f0')
        sceneRef.current = scene

        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        )
        camera.position.set(200, 200, 200)
        camera.lookAt(0, 0, 0)
        cameraRef.current = camera

        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setPixelRatio(window.devicePixelRatio)
        mountRef.current.appendChild(renderer.domElement)
        rendererRef.current = renderer

        const cityMesh = createCity(buildings)
        scene.add(cityMesh)

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
        scene.add(ambientLight)

        const sunLight = new THREE.DirectionalLight(0xffffff, 1)
        sunLight.position.set(300, 500, 200)
        scene.add(sunLight)

        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.1
        controls.maxPolarAngle = Math.PI / 2

        const animate = () => {
            requestAnimationFrame(animate)
            controls.update()
            renderer.render(scene, camera)
        }
        animate()

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight
            camera.updateProjectionMatrix()
            renderer.setSize(window.innerWidth, window.innerHeight)
        }
        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)

            if (controls) {
                controls.dispose()
            }

            if (sceneRef.current) {
                sceneRef.current.traverse((object) => {
                    if (object.geometry) {
                        object.geometry.dispose()
                    }
                    if (object.material) {
                        if (Array.isArray(object.material)) {
                            object.material.forEach(material => material.dispose())
                        } else {
                            object.material.dispose()
                        }
                    }
                })
            }

            if (rendererRef.current) {
                rendererRef.current.dispose()
                if (mountRef.current && rendererRef.current.domElement) {
                    mountRef.current.removeChild(rendererRef.current.domElement)
                }
            }

            sceneRef.current = null
            cameraRef.current = null
            rendererRef.current = null
        }
    }, [buildings])

    return <div ref={mountRef} style={{ width: '100%', height: '100vh', margin: 0, padding: 0 }} />
}

export default ThreeScene
