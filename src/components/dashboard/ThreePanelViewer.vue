<template>
  <div class="panel-viewer-root">
    <canvas ref="canvasRef" class="canvas-3d"></canvas>
    <div v-if="isLoading" class="spinner-overlay">
      <div class="spinner-badge">🔄 Initializing...</div>
    </div>
    <div class="info-panel">
      <p class="status">{{ moving ? '👣 Walking...' : '⌨️ WASD / Arrows to move' }}</p>
      <p class="coords">📍 ({{ camX }}, {{ camZ }})</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import gsap from 'gsap'

// ===== TYPES =====
type GlbKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'

interface PanelInfo {
  glbKey: GlbKey
  unitId: string
  name: string
}

interface Placement {
  key: string
  position: [number, number, number]
  rotation: [number, number, number]
  panelId: number
  doubleHeight?: boolean
}

// ===== PROPS =====
interface Props {
  activePanelIds?: number[]
  sequenceId?: number
  isOperationActive?: boolean
  onCameraUpdate?: (position: { x: number; z: number; rotation: number }) => void
  onSequenceDone?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  activePanelIds: () => [],
  sequenceId: 0,
  isOperationActive: false,
})

// ===== CONSTANTS =====
const GLB_VERSION = 'v1.1'
const PANEL_DATA: Record<number, PanelInfo> = {
  1: { glbKey: 'A', unitId: 'UNIT-10E', name: 'PAF-C' },
  2: { glbKey: 'A', unitId: 'UNIT-10F', name: 'PAF-D' },
  3: { glbKey: 'A', unitId: 'UNIT-10C', name: 'PAF-A' },
  4: { glbKey: 'A', unitId: 'UNIT-10D', name: 'PAF-B' },
  5: { glbKey: 'F', unitId: 'UNIT-10A', name: 'BUS DUCT COMPARTMENT' },
  6: { glbKey: 'A', unitId: 'UNIT-10B', name: 'FDF-A' },
  7: { glbKey: 'B', unitId: 'UNIT-09A', name: 'PC TR UNIT-A' },
  8: { glbKey: 'B', unitId: 'UNIT-09B', name: 'IDF-A' },
  9: { glbKey: 'A', unitId: 'UNIT-08A', name: 'COP-A' },
  10: { glbKey: 'A', unitId: 'UNIT-08B', name: 'COP-B' },
  11: { glbKey: 'A', unitId: 'UNIT-07A', name: 'MTR SPARE' },
  12: { glbKey: 'A', unitId: 'UNIT-07B', name: 'STAGE 2 HAMMER MILL' },
  13: { glbKey: 'A', unitId: 'UNIT-06A', name: 'VERTICAL MILL C' },
  14: { glbKey: 'A', unitId: 'UNIT-06B', name: 'VERTICAL MILL D' },
  15: { glbKey: 'A', unitId: 'UNIT-05A', name: 'VERTICAL MILL A' },
  16: { glbKey: 'A', unitId: 'UNIT-05B', name: 'VERTICAL MILL B' },
  17: { glbKey: 'A', unitId: 'UNIT-04A', name: 'BFP-A' },
  18: { glbKey: 'A', unitId: 'UNIT-04B', name: 'BFP-B' },
  19: { glbKey: 'A', unitId: 'UNIT-03A', name: 'IDF-B' },
  20: { glbKey: 'A', unitId: 'UNIT-03B', name: 'FDF-B' },
  21: { glbKey: 'B', unitId: 'UNIT-02A', name: 'PC TR UNIT-B' },
  22: { glbKey: 'B', unitId: 'UNIT-02B', name: '#2 BIOMASS STORAGE BACK-UP TO DS' },
  23: { glbKey: 'E', unitId: 'UNIT-01A', name: 'AUX COMPARTMENT' },
  24: { glbKey: 'D', unitId: 'UNIT-01B', name: 'AUX TR INCOMING' },
  25: { glbKey: 'C', unitId: 'COM-20A', name: 'AUX COMPARTMENT' },
  26: { glbKey: 'D', unitId: 'COM-20B', name: 'START-UP TR INCOMING' },
  27: { glbKey: 'A', unitId: 'COM-19A', name: 'MOTOR SPARE' },
  28: { glbKey: 'B', unitId: 'COM-19B', name: 'INTAKE FEEDER' },
  29: { glbKey: 'B', unitId: 'COM-18A', name: 'PC TR COM-B' },
  30: { glbKey: 'B', unitId: 'COM-18B', name: 'FGD' },
  31: { glbKey: 'B', unitId: 'COM-17A', name: 'NO.2 2D BUS TIE' },
  32: { glbKey: 'B', unitId: 'COM-17B', name: 'NON MOTOR SPARE' },
  33: { glbKey: 'B', unitId: 'COM-16A', name: 'NO.2 2C BUS TIE' },
  34: { glbKey: 'B', unitId: 'COM-16B', name: 'PC TR COM-A' },
  35: { glbKey: 'A', unitId: 'COM-15A', name: '#1 NEW BUILDING TO DS' },
  36: { glbKey: 'A', unitId: 'COM-15B', name: 'BFP-C' },
  37: { glbKey: 'B', unitId: 'COM-14A', name: 'FLY ASH SYSTEM' },
  38: { glbKey: 'A', unitId: 'COM-14B', name: 'ASP-B' },
  39: { glbKey: 'B', unitId: 'COM-13A', name: '#3 BIOMASS STORAGE TO DS' },
  40: { glbKey: 'B', unitId: 'COM-13B', name: 'UNIT-COM BUS TIE' },
  41: { glbKey: 'A', unitId: 'UNIT-12A', name: 'MOTOR SPARE' },
  42: { glbKey: 'A', unitId: 'UNIT-12B', name: 'ASP-A' },
  43: { glbKey: 'F', unitId: 'UNIT-11A', name: 'BUS DUCT COMPARTMENT' },
  44: { glbKey: 'A', unitId: 'UNIT-11B', name: 'HGRF' },
  45: { glbKey: 'A', unitId: 'UNIT-10G', name: 'STAGE 1 HAMMER MILL' },
  46: { glbKey: 'B', unitId: 'UNIT-10H', name: 'NON MOTOR SPARE' },
  47: { glbKey: 'G', unitId: 'UNIT-10I', name: 'STAGE 1 HAMMER MILL VC' },
}

// ===== STATE =====
const canvasRef = ref<HTMLCanvasElement>()
const isLoading = ref(true)
const moving = ref(false)
const camX = ref(0)
const camZ = ref(0)
const keys = ref<Record<string, boolean>>({})

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let animId: number | null = null

// ===== HELPERS =====
function getInfo(panelId: number): PanelInfo {
  return PANEL_DATA[panelId] ?? {
    glbKey: 'A' as const,
    unitId: String(panelId).padStart(2, '0'),
    name: `PANEL ${panelId}`,
  }
}

function getPlacements(): Placement[] {
  const items: Placement[] = []
  const startX = 11
  const colWidth = 2
  const rowZ: [number, number] = [-4.9, 4.9]

  for (let col = 0; col < 12; col += 1) {
    for (let floor = 0; floor < 2; floor += 1) {
      const panelId = col * 2 + (floor === 1 ? 1 : 2)
      items.push({
        key: `right-${col}-${floor}`,
        position: [startX + col * colWidth, floor * 2.5, rowZ[1]],
        rotation: [0, Math.PI, 0],
        panelId,
      })
    }
  }

  for (let col = 0; col < 12; col += 1) {
    if (col === 0) {
      items.push({
        key: 'left-0-merged',
        position: [startX, 0, rowZ[0]],
        rotation: [0, 0, 0],
        panelId: 47,
        doubleHeight: true,
      })
      continue
    }

    for (let floor = 0; floor < 2; floor += 1) {
      const panelId = 47 - col * 2 + (floor === 1 ? 0 : 1)
      items.push({
        key: `left-${col}-${floor}`,
        position: [startX + col * colWidth, floor * 2.5, rowZ[0]],
        rotation: [0, 0, 0],
        panelId,
      })
    }
  }

  return items
}

function setupScene() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0a0a)

  camera = new THREE.PerspectiveCamera(22, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(-6, 3.6, 0)

  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value!,
    antialias: true,
    alpha: false,
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.shadowMap.enabled = true

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8)
  directionalLight.position.set(10, 15, 0)
  directionalLight.castShadow = true
  scene.add(directionalLight)

  const pointLight1 = new THREE.PointLight(0xe2e8f0, 1.5)
  pointLight1.position.set(10, 5.8, 0)
  scene.add(pointLight1)

  const pointLight2 = new THREE.PointLight(0xe2e8f0, 1.5)
  pointLight2.position.set(30, 5.8, 0)
  scene.add(pointLight2)

  const spotLight = new THREE.SpotLight(0xffffff, 3)
  spotLight.position.set(0, 8, 0)
  spotLight.angle = 0.6
  spotLight.penumbra = 1
  spotLight.castShadow = true
  scene.add(spotLight)
}

function setupRoom() {
  // Floor
  const floorGeo = new THREE.PlaneGeometry(50, 10.4)
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a2332, roughness: 0.8 })
  const floor = new THREE.Mesh(floorGeo, floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  // Walls
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9, metalness: 0.1 })

  const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(50, 6), wallMat)
  frontWall.position.set(10, 3, -5.2)
  scene.add(frontWall)

  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(50, 6), wallMat)
  backWall.position.set(10, 3, 5.2)
  backWall.rotation.y = Math.PI
  scene.add(backWall)

  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(10.4, 6), wallMat)
  leftWall.position.set(-15, 3, 0)
  leftWall.rotation.y = Math.PI / 2
  scene.add(leftWall)

  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(10.4, 6), wallMat)
  rightWall.position.set(35, 3, 0)
  rightWall.rotation.y = -Math.PI / 2
  scene.add(rightWall)

  // Ceiling lights
  const lightPositions = [-5.1, 0.3, 5.7, 10.5, 15.3, 20.1, 24.9, 30.3]
  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    emissive: 0xf8fafc,
    emissiveIntensity: 0.8,
  })

  for (const x of lightPositions) {
    const l1 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), lightMat)
    l1.position.set(x, 5.95, 0.3)
    l1.rotation.x = Math.PI / 2
    scene.add(l1)

    const l2 = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), lightMat)
    l2.position.set(x, 5.95, -0.3)
    l2.rotation.x = Math.PI / 2
    scene.add(l2)
  }
}

function addPanels() {
  const placements = getPlacements()
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    roughness: 0.7,
    metalness: 0.3,
  })

  for (const p of placements) {
    const h = p.doubleHeight ? 5.18 : 2.5
    const geo = new THREE.BoxGeometry(2, h, 1)
    const mesh = new THREE.Mesh(geo, panelMat)
    mesh.position.set(...p.position)
    mesh.rotation.set(...p.rotation)
    mesh.castShadow = true
    mesh.receiveShadow = true
    scene.add(mesh)
  }
}

function updateCam(dt: number) {
  if (moving.value || !props.isOperationActive) return

  const dir = new THREE.Vector3()
  const front = new THREE.Vector3()
  const side = new THREE.Vector3()

  camera.getWorldDirection(front)
  front.y = 0
  front.normalize()
  side.copy(front).cross(camera.up).normalize()

  if (keys.value['ArrowUp'] || keys.value['w'] || keys.value['W']) dir.add(front)
  if (keys.value['ArrowDown'] || keys.value['s'] || keys.value['S']) dir.add(front.clone().negate())
  if (keys.value['ArrowLeft'] || keys.value['a'] || keys.value['A']) dir.add(side.clone().negate())
  if (keys.value['ArrowRight'] || keys.value['d'] || keys.value['D']) dir.add(side)

  if (dir.length() > 0) {
    dir.normalize().multiplyScalar(0.75 * dt)
    camera.position.add(dir)
  }

  camX.value = Math.round(camera.position.x * 100) / 100
  camZ.value = Math.round(camera.position.z * 100) / 100
}

function animate(now: number, then: number) {
  const dt = (now - then) / 1000
  updateCam(dt)
  renderer.render(scene, camera)
}

// ===== LIFECYCLE =====
onMounted(() => {
  if (!canvasRef.value) return

  setupScene()
  setupRoom()
  addPanels()
  isLoading.value = false

  const handleKey = (e: KeyboardEvent) => {
    keys.value[e.key] = e.type === 'keydown'
  }

  window.addEventListener('keydown', handleKey)
  window.addEventListener('keyup', handleKey)

  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  window.addEventListener('resize', handleResize)

  let lastTime = performance.now()
  const loop = (now: number) => {
    animate(now, lastTime)
    lastTime = now
    animId = requestAnimationFrame(loop)
  }

  animId = requestAnimationFrame(loop)

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKey)
    window.removeEventListener('keyup', handleKey)
    window.removeEventListener('resize', handleResize)
    if (animId) cancelAnimationFrame(animId)
    renderer.dispose()
  })
})
</script>

<style scoped>
.panel-viewer-root {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #0a0a0a;
  margin: 0;
  padding: 0;
}

.canvas-3d {
  display: block;
  width: 100%;
  height: 100%;
  background: #0a0a0a;
}

.spinner-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 10, 10, 0.95);
  z-index: 50;
}

.spinner-badge {
  padding: 1rem 2rem;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 0.5rem;
  color: #10b981;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
}

.info-panel {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 10;
  pointer-events: none;
}

.status {
  color: #94a3b8;
  font-size: 0.875rem;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.coords {
  color: #475569;
  font-family: monospace;
  font-size: 0.75rem;
}
</style>