import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader'

function App() {
    const mountRef = useRef(null)


    useEffect(() => {
        // Scene setup
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        camera.position.z = 15
        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(window.innerWidth, window.innerHeight)
        mountRef.current.appendChild(renderer.domElement)

        const sphereGroup = new THREE.Group()
        const radius = 1.5

        const sphereGeometry = new THREE.SphereGeometry(radius / 5, 32, 32)
        const sphereMaterial = new THREE.MeshBasicMaterial({
            color: 0xc4c4c4,
            transparent: true,
            opacity: 0.8
        })
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
        sphereGroup.add(sphere)

        const axesHelper = new THREE.AxesHelper(radius)
        axesHelper.setColors(new THREE.Color(0xff0000), new THREE.Color(0x00ff00), new THREE.Color(0x0000ff))
        const negAxesHelper = new THREE.AxesHelper(-radius)
        negAxesHelper.setColors(new THREE.Color(0xff0000), new THREE.Color(0x00ff00), new THREE.Color(0x0000ff))
        sphereGroup.add(axesHelper)
        sphereGroup.add(negAxesHelper)

        function createCircleOutline(radius, rotationAxis, color) {
            const path = new THREE.Path()
            path.absarc(0, 0, radius, 0, Math.PI * 2)
            const points = path.getPoints(100)

            const geometry = new THREE.BufferGeometry().setFromPoints(points)
            const material = new THREE.LineBasicMaterial({ color: color })
            const line = new THREE.LineLoop(geometry, material)

            line.rotation[rotationAxis] = Math.PI / 2 // Rotate 90 degrees to be parallel to the axis

            return line
        }

        const circleXY = createCircleOutline(radius, 'x', 0x00ff00)
        const circleXZ = createCircleOutline(radius, 'z', 0x0000ff)
        const circleYZ = createCircleOutline(radius, 'y', 0xff0000)
        sphereGroup.add(circleXY)
        sphereGroup.add(circleXZ)
        sphereGroup.add(circleYZ)

        // Add the sphere group to the scene
        scene.add(sphereGroup)

        // OrbitControls
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.addEventListener('change', () => {
            sphereGroup.position.copy(controls.target)
            renderer.render(scene, camera)
        }) // Render only when controls change

        // Custom shader material
        let material = new THREE.PointsMaterial({
            size: 0.005,
            color: 0xffffff
        })

        const loader = new PLYLoader()
        loader.load(
            process.env.PUBLIC_URL + '/model.ply',
            (bufferGeometry) => {
                const points = new THREE.Points(bufferGeometry, material)
                scene.add(points)
                renderer.render(scene, camera)
            }
        )

        // Initial render
        renderer.render(scene, camera)

        // Handle window resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight
            camera.updateProjectionMatrix()
            renderer.setSize(window.innerWidth, window.innerHeight)
            renderer.render(scene, camera)
        }

        window.addEventListener('resize', handleResize)

        // Clean up on unmount
        return () => {
            window.removeEventListener('resize', handleResize)
            mountRef.current.removeChild(renderer.domElement)
            controls.dispose()
        }
    }, [])

    return (
        <div>
            <div ref={mountRef} />
        </div>
    )
}

export default App
