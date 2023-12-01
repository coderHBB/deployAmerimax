import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap'

/**
 * Loaders
 */
const loadingBarElement = document.querySelector('.loading-bar')

let sceneReady = false
const loadingManager = new THREE.LoadingManager(
    // Loaded
    () =>
    {
        // Wait a little
        window.setTimeout(() =>
        {
            // Animate overlay
            gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0, delay: 1 })

            // Update loadingBarElement
            loadingBarElement.classList.add('ended')
            loadingBarElement.style.transform = ''
        }, 500)

        window.setTimeout(() =>
        {
            sceneReady = true
        }, 2000)
    },

    // Progress
    (itemUrl, itemsLoaded, itemsTotal) =>
    {
        // Calculate the progress and update the loadingBarElement
        const progressRatio = itemsLoaded / itemsTotal
        loadingBarElement.style.transform = `scaleX(${progressRatio})`
    }
)
const gltfLoader = new GLTFLoader(loadingManager)
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager)

/**
 * Base
 */
// Debug
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Cube
// const geo = new THREE.BoxGeometry(1,1,1)
// const matrl = new THREE.MeshBasicMaterial('0xff0000')
// const mesh1 = new THREE.Mesh(geo,matrl)
// scene.add(mesh1)

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    // wireframe: true,
    transparent: true,
    uniforms:
    {
        uAlpha: { value: 1 }
    },
    vertexShader: `
        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uAlpha;

        void main()
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `
})
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)

/**
 * Update all materials
 */
const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        {
            // child.material.envMap = environmentMap
            child.material.envMapIntensity = debugObject.envMapIntensity
            child.material.needsUpdate = true
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/5/px.jpg',
    '/textures/environmentMaps/5/nx.jpg',
    '/textures/environmentMaps/5/py.jpg',
    '/textures/environmentMaps/5/ny.jpg',
    '/textures/environmentMaps/5/pz.jpg',
    '/textures/environmentMaps/5/nz.jpg'
])

environmentMap.colorSpace = THREE.SRGBColorSpace

scene.background = '#ffffff'
scene.environment = environmentMap

debugObject.envMapIntensity = 2

/**
 * Models
 */
gltfLoader.load(
    // '/models/DamagedHelmet/glTF/DamagedHelmet.gltf',
    '/models/Amerimax2.glb',
    (gltf) =>
    {
        gltf.scene.scale.set(1, 1, 1)
        gltf.scene.position.set(0,-2,0)
        // gltf.scene.rotation.y = Math.PI * 0.5
        scene.add(gltf.scene)

        updateAllMaterials()
    }
)

/**
 * Points of interest
 */
const raycaster = new THREE.Raycaster()
const points = [
    {
        position: new THREE.Vector3(-5.9,1.2,5),
        element: document.querySelector('.point-0')
    },
    {
        position: new THREE.Vector3(-7.1,0.25,6.20),
        element: document.querySelector('.point-1')
    },
    {
        position: new THREE.Vector3(-4.1,0.25,6.20),
        element: document.querySelector('.point-2')
    },
    {
        position: new THREE.Vector3(-2.35,-1,5.8),
        element: document.querySelector('.point-3')
    },
    {
        position: new THREE.Vector3(-2.289,1.95,3.558),
        element: document.querySelector('.point-4')
    },
    {
        position: new THREE.Vector3(-2.3,3,4.1),
        element: document.querySelector('.point-5')
    },
    {
        position: new THREE.Vector3(-2.1,2,6.1),
        element: document.querySelector('.point-6')
    },
    {
        position: new THREE.Vector3(-1.1,0.45,8.7),
        element: document.querySelector('.point-7')
    }
]

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 3, - 2.25)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 15)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.maxDistance = 15
controls.minDistance = 15
controls.minAzimuthAngle = -1
controls.maxAzimuthAngle = 1
controls.minPolarAngle = 1
controls.maxPolarAngle = 1.5

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 3
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const tick = () =>
{
    // Update controls
    controls.update()

    // Update points only when the scene is ready
    if(sceneReady)
    {
        // Go through each point
        for(const point of points)
        {
            // Get 2D screen position
            const screenPosition = point.position.clone()
            screenPosition.project(camera)
    
            // Set the raycaster
            raycaster.setFromCamera(screenPosition, camera)
            const intersects = raycaster.intersectObjects(scene.children, true)
    
            // No intersect found
            if(intersects.length === 0)
            {
                // Show
                point.element.classList.add('visible')
            }

            // Intersect found
            else
            {
                // Get the distance of the intersection and the distance of the point
                const intersectionDistance = intersects[0].distance
                const pointDistance = point.position.distanceTo(camera.position)
    
                // Intersection is close than the point
                if(intersectionDistance < pointDistance)
                {
                    // Hide
                    point.element.classList.remove('visible')
                }
                // Intersection is further than the point
                else
                {
                    // Show
                    point.element.classList.add('visible')
                }
            }
    
            const translateX = screenPosition.x * sizes.width * 0.5
            const translateY = - screenPosition.y * sizes.height * 0.5
            point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
        }
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

// point 0
const point0 = document.getElementById('point0')
const card0 = document.getElementById('card0')
const closebtn0 = document.getElementById('close-btn0')

point0.addEventListener('click',() => {hotspotClicked0()})
closebtn0.addEventListener('click',() => {closeCard0()})

function hotspotClicked0()
{
    closeAllards()
    disablePoints()
    card0.style.visibility = 'visible'
}

function closeCard0()
{
    closeAllards()
}

// point 1
const point1 = document.getElementById('point1')
const card1 = document.getElementById('card1')
const closebtn1 = document.getElementById('close-btn1')

point1.addEventListener('click',() => {hotspotClicked1()})
closebtn1.addEventListener('click',() => {closeCard1()})

function hotspotClicked1()
{
    closeAllards()
    disablePoints()
    card1.style.visibility = 'visible'
}

function closeCard1()
{
    
    closeAllards()
}

// point 2
const point2 = document.getElementById('point2')
const card2 = document.getElementById('card2')
const closebtn2 = document.getElementById('close-btn2')

point2.addEventListener('click',() => {hotspotClicked2()})
closebtn2.addEventListener('click',() => {closeCard2()})

function hotspotClicked2()
{
    closeAllards()
    disablePoints()
    card2.style.visibility = 'visible'
}

function closeCard2()
{
    closeAllards()
}

// point 3
const point3 = document.getElementById('point3')
const card3 = document.getElementById('card3')
const closebtn3 = document.getElementById('close-btn3')

point3.addEventListener('click',() => {hotspotClicked3()})
closebtn3.addEventListener('click',() => {closeCard3()})

function hotspotClicked3()
{
    closeAllards()
    disablePoints()
    card3.style.visibility = 'visible'
}

function closeCard3()
{
    closeAllards()
}

// point 4
const point4 = document.getElementById('point4')
const card4 = document.getElementById('card4')
const closebtn4 = document.getElementById('close-btn4')

point4.addEventListener('click',() => {hotspotClicked4()})
closebtn4.addEventListener('click',() => {closeCard4()})

function hotspotClicked4()
{
    closeAllards()
    disablePoints()
    card4.style.visibility = 'visible'
}

function closeCard4()
{
    closeAllards()
}

// point 5
const point5 = document.getElementById('point5')
const card5 = document.getElementById('card5')
const closebtn5 = document.getElementById('close-btn5')

point5.addEventListener('click',() => {hotspotClicked5()})
closebtn5.addEventListener('click',() => {closeCard5()})

function hotspotClicked5()
{
    closeAllards()
    disablePoints()
    card5.style.visibility = 'visible'
}

function closeCard5()
{
    closeAllards()
}

// point 6
const point6 = document.getElementById('point6')
const card6 = document.getElementById('card6')
const closebtn6 = document.getElementById('close-btn6')

point6.addEventListener('click',() => {hotspotClicked6()})
closebtn6.addEventListener('click',() => {closeCard6()})

function hotspotClicked6()
{
    closeAllards()
    disablePoints()
    card6.style.visibility = 'visible'
}

function closeCard6()
{
    closeAllards()
}

// point 7
const point7 = document.getElementById('point7')
const card7 = document.getElementById('card7')
const closebtn7 = document.getElementById('close-btn7')

point7.addEventListener('click',() => {hotspotClicked7()})
closebtn7.addEventListener('click',() => {closeCard7()})

function hotspotClicked7()
{
    closeAllards()
    disablePoints()
    card7.style.visibility = 'visible'
}

function closeCard7()
{
    closeAllards()
}

// close all cards
function closeAllards ()
{
    card0.style.visibility = 'hidden'
    card1.style.visibility = 'hidden'
    card2.style.visibility = 'hidden'
    card3.style.visibility = 'hidden'
    card4.style.visibility = 'hidden'
    card5.style.visibility = 'hidden'
    card6.style.visibility = 'hidden'
    card7.style.visibility = 'hidden'
    enabelPoints()
}

// disable points
function disablePoints()
{
    point0.style.visibility = 'hidden'
    point1.style.visibility = 'hidden'
    point2.style.visibility = 'hidden'
    point3.style.visibility = 'hidden'
    point4.style.visibility = 'hidden'
    point5.style.visibility = 'hidden'
    point6.style.visibility = 'hidden'
    point7.style.visibility = 'hidden'
}

// enable points
function enabelPoints()
{
    point0.style.visibility = 'visible'
    point1.style.visibility = 'visible'
    point2.style.visibility = 'visible'
    point3.style.visibility = 'visible'
    point4.style.visibility = 'visible'
    point5.style.visibility = 'visible'
    point6.style.visibility = 'visible'
    point7.style.visibility = 'visible'
}

