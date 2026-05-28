<template>
  <div ref="rootRef" class="panel-viewer-root">
    <canvas ref="canvasRef" class="canvas-3d"></canvas>
    <div v-if="isLoading" class="spinner-overlay">
      <div class="spinner-badge">Loading 3D</div>
    </div>
    <div class="info-panel">
      <p class="status">{{ moving ? 'Walking to panel...' : 'Use Arrow Keys to walk' }}</p>
      <p class="coords">({{ camX }}, {{ camZ }})</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import gsap from 'gsap'
import { PANEL_DATA as SHARED_PANEL_DATA } from '../../data/panels'

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

interface Arrow {
  position: [number, number, number]
  target: [number, number, number]
}

interface Props {
  activePanelIds?: number[]
  sequenceId?: number
  isOperationActive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  activePanelIds: () => [],
  sequenceId: 0,
  isOperationActive: false,
})

const emit = defineEmits<{
  (e: 'cameraUpdate', position: { x: number; z: number; rotation: number }): void
  (e: 'sequenceDone'): void
}>()

const GLB_VERSION = 'v1.1'
const PANEL_DATA = SHARED_PANEL_DATA.reduce(
  (items, panel) => ({
    ...items,
    [panel.id]: { glbKey: panel.glbKey, unitId: panel.unitId, name: panel.name },
  }),
  {} as Record<number, PanelInfo>,
)

const rootRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()
const isLoading = ref(true)
const moving = ref(false)
const camX = ref(0)
const camZ = ref(0)
const blinkingIds = ref<number[]>([])

const activePanelKey = computed(() => props.activePanelIds.join(','))
const keys: Record<string, boolean> = {}
const modelMap = new Map<GlbKey | 'floor' | 'ceiling', THREE.Group>()
const boxMap = new Map<GlbKey | 'floor' | 'ceiling', THREE.Box3>()
const overlayMaterials: Array<{ panelId: number; material: THREE.MeshBasicMaterial }> = []
const arrowObjects: THREE.Object3D[] = []

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let target = new THREE.Vector3(40, 2.8, 0)
let animId = 0
let lastTime = 0
let disposed = false
let sequenceRunning = false
let lastSequenceId = 0
let cleanupSequence: (() => void) | null = null

function getInfo(panelId: number): PanelInfo {
  return PANEL_DATA[panelId] ?? {
    glbKey: 'A',
    unitId: String(panelId).padStart(2, '0'),
    name: `PANEL ${panelId}`,
  }
}

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms))
}

function getPlacements(): Placement[] {
  const items: Placement[] = []
  const startX = 11
  const colWidth = 2
  const rowZ: [number, number] = [-4.9, 4.9]

  for (let col = 0; col < 12; col += 1) {
    for (let floor = 0; floor < 2; floor += 1) {
      items.push({
        key: `right-${col}-${floor}`,
        position: [startX + col * colWidth, floor * 2.5, rowZ[1]],
        rotation: [0, Math.PI, 0],
        panelId: col * 2 + (floor === 1 ? 1 : 2),
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
      items.push({
        key: `left-${col}-${floor}`,
        position: [startX + col * colWidth, floor * 2.5, rowZ[0]],
        rotation: [0, 0, 0],
        panelId: 47 - col * 2 + (floor === 1 ? 0 : 1),
      })
    }
  }

  return items
}

function setupScene() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0a0a)

  camera = new THREE.PerspectiveCamera(22, 1, 0.1, 1000)
  camera.position.set(-6, 3.6, 0)
  camera.lookAt(target)

  renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value!, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.shadowMap.enabled = true
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1

  scene.add(new THREE.AmbientLight(0xffffff, 0.9))

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

async function loadModel(key: GlbKey | 'floor' | 'ceiling') {
  const loader = new GLTFLoader()
  const url = key === 'floor' || key === 'ceiling' ? `/${key}.glb?v=${GLB_VERSION}` : `/${key}.glb?v=${GLB_VERSION}`
  const gltf = await loader.loadAsync(url)
  gltf.scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  modelMap.set(key, gltf.scene)
  boxMap.set(key, new THREE.Box3().setFromObject(gltf.scene))
}

async function loadModels() {
  await Promise.all([
    loadModel('A'),
    loadModel('B'),
    loadModel('C'),
    loadModel('D'),
    loadModel('E'),
    loadModel('F'),
    loadModel('G'),
    loadModel('floor'),
    loadModel('ceiling'),
  ])
}

function addRoom() {
  const floorModel = modelMap.get('floor')
  const ceilingModel = modelMap.get('ceiling')
  const floorBox = boxMap.get('floor')
  const ceilingBox = boxMap.get('ceiling')

  if (floorModel && floorBox) {
    const floor = floorModel.clone(true)
    const size = floorBox.getSize(new THREE.Vector3())
    const center = floorBox.getCenter(new THREE.Vector3())
    const scale: [number, number, number] = [50 / size.x, 1, 10.4 / size.z]
    floor.scale.set(...scale)
    floor.position.set(10 - center.x * scale[0], -floorBox.min.y, -center.z * scale[2])
    scene.add(floor)
  }

  if (ceilingModel && ceilingBox) {
    const ceiling = ceilingModel.clone(true)
    const size = ceilingBox.getSize(new THREE.Vector3())
    const center = ceilingBox.getCenter(new THREE.Vector3())
    const scale: [number, number, number] = [50 / size.x, 1, 10.4 / size.z]
    ceiling.scale.set(...scale)
    ceiling.position.set(10 - center.x * scale[0], 6 - ceilingBox.min.y, -center.z * scale[2])
    scene.add(ceiling)
  }

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9, metalness: 0.1 })
  const walls = [
    { position: [10, 3, -5.2], rotation: [0, 0, 0], size: [50, 6] },
    { position: [10, 3, 5.2], rotation: [0, Math.PI, 0], size: [50, 6] },
    { position: [-15, 3, 0], rotation: [0, Math.PI / 2, 0], size: [10.4, 6] },
    { position: [35, 3, 0], rotation: [0, -Math.PI / 2, 0], size: [10.4, 6] },
  ]

  walls.forEach((wall) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(wall.size[0], wall.size[1]), wallMat)
    mesh.position.set(wall.position[0], wall.position[1], wall.position[2])
    mesh.rotation.set(wall.rotation[0], wall.rotation[1], wall.rotation[2])
    scene.add(mesh)
  })

  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    emissive: 0xf8fafc,
    emissiveIntensity: 0.8,
  })

  for (const x of [-5.1, 0.3, 5.7, 10.5, 15.3, 20.1, 24.9, 30.3]) {
    for (const z of [0.3, -0.3]) {
      const lightPanel = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), lightMat)
      lightPanel.position.set(x, 5.95, z)
      lightPanel.rotation.x = Math.PI / 2
      scene.add(lightPanel)
    }
  }
}

function createLabelTexture(unitId: string, name: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#c2ccd5'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#08111e'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '700 54px Arial'
  ctx.fillText(unitId, 256, 86)
  ctx.fillStyle = '#243245'
  ctx.font = '700 30px Arial'
  ctx.fillText(name.slice(0, 28), 256, 160)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function addPanel(placement: Placement) {
  const info = getInfo(placement.panelId)
  const baseScene = modelMap.get(info.glbKey)
  const glbBox = boxMap.get(info.glbKey)
  if (!baseScene || !glbBox) return

  const group = new THREE.Group()
  group.name = placement.key
  group.position.set(...placement.position)
  group.rotation.set(...placement.rotation)

  const targetWidth = 2
  const targetHeight = placement.doubleHeight ? 5.18 : 2.5
  const targetDepth = placement.doubleHeight ? 0.96 : 1
  const size = glbBox.getSize(new THREE.Vector3())
  const center = glbBox.getCenter(new THREE.Vector3())
  const scale: [number, number, number] = [targetWidth / size.x, targetHeight / size.y, targetDepth / size.z]
  const model = baseScene.clone(true)
  model.scale.set(...scale)
  model.position.set(-center.x * scale[0], -glbBox.min.y * scale[1], -center.z * scale[2])
  group.add(model)

  const overlayMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  })
  const overlay = new THREE.Mesh(new THREE.PlaneGeometry(2.05, targetHeight + 0.05), overlayMat)
  overlay.position.set(0, targetHeight / 2, targetDepth / 2 + 0.015)
  group.add(overlay)
  overlayMaterials.push({ panelId: placement.panelId, material: overlayMat })

  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, targetHeight * 0.22),
    new THREE.MeshStandardMaterial({
      map: createLabelTexture(info.unitId, info.name),
      roughness: 0.18,
      metalness: 0.25,
    }),
  )
  label.position.set(0, targetHeight * 0.83, targetDepth / 2 + 0.02)
  group.add(label)

  scene.add(group)
}

function addPanels() {
  getPlacements().forEach(addPanel)
}

function addFallbackRoom() {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 10.4),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 }),
  )
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  const panelMat = new THREE.MeshStandardMaterial({ color: 0x2f3746, roughness: 0.7, metalness: 0.25 })
  getPlacements().forEach((placement) => {
    const height = placement.doubleHeight ? 5.18 : 2.5
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(2, height, 1), panelMat)
    mesh.position.set(...placement.position)
    mesh.rotation.set(...placement.rotation)
    mesh.castShadow = true
    mesh.receiveShadow = true
    scene.add(mesh)

    const overlayMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    })
    const overlay = new THREE.Mesh(new THREE.PlaneGeometry(2.05, height + 0.05), overlayMat)
    overlay.position.set(placement.position[0], placement.position[1] + height / 2, placement.position[2] + 0.52)
    overlay.rotation.set(...placement.rotation)
    scene.add(overlay)
    overlayMaterials.push({ panelId: placement.panelId, material: overlayMat })
  })
}

function clearArrows() {
  arrowObjects.forEach((arrow) => scene.remove(arrow))
  arrowObjects.length = 0
}

function createArrow(position: [number, number, number], targetPos: [number, number, number]) {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0.3)
  shape.lineTo(0.2, -0.1)
  shape.lineTo(0.08, -0.1)
  shape.lineTo(0.08, -0.4)
  shape.lineTo(-0.08, -0.4)
  shape.lineTo(-0.08, -0.1)
  shape.lineTo(-0.2, -0.1)
  shape.closePath()

  const mesh = new THREE.Mesh(
    new THREE.ShapeGeometry(shape),
    new THREE.MeshBasicMaterial({ color: 0xff3333, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }),
  )
  mesh.rotation.x = Math.PI / 2

  const group = new THREE.Group()
  group.position.set(...position)
  group.lookAt(...targetPos)
  group.add(mesh)
  return group
}

function computeArrows(startPos: THREE.Vector3, panelPos: [number, number, number]): Arrow[] {
  const aisleZ = 0
  const points = [
    startPos.clone().setY(0),
    new THREE.Vector3(startPos.x, 0, aisleZ),
    new THREE.Vector3(panelPos[0], 0, aisleZ),
    new THREE.Vector3(panelPos[0], 0, panelPos[2]),
  ]
  const clean = points.reduce<THREE.Vector3[]>((items, point) => {
    if (items.length === 0 || point.distanceTo(items[items.length - 1]) > 0.2) items.push(point)
    return items
  }, [])
  const curve = new THREE.CatmullRomCurve3(clean.length > 1 ? clean : [points[0], points[points.length - 1]], false, 'catmullrom', 0.1)
  const count = Math.max(3, Math.floor(curve.getLength() / 0.7))

  return Array.from({ length: count }, (_, index) => {
    const t = (index + 1) / (count + 1)
    const point = curve.getPoint(t)
    const ahead = curve.getPoint(Math.min(1, t + 0.05))
    return {
      position: [point.x, 0.02, point.z],
      target: [ahead.x, 0.02, ahead.z],
    }
  })
}

function showArrows(arrows: Arrow[]) {
  clearArrows()
  arrows.forEach((arrow) => {
    const item = createArrow(arrow.position, arrow.target)
    arrowObjects.push(item)
    scene.add(item)
  })
}

function updateSize() {
  const rect = rootRef.value?.getBoundingClientRect()
  const width = Math.max(1, rect?.width ?? window.innerWidth)
  const height = Math.max(1, rect?.height ?? window.innerHeight)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height, false)
}

function updateCamera(delta: number) {
  if (moving.value || sequenceRunning || !props.isOperationActive) return

  const direction = new THREE.Vector3()
  const front = new THREE.Vector3()
  const side = new THREE.Vector3()

  camera.getWorldDirection(front)
  front.y = 0
  front.normalize()
  side.copy(front).cross(camera.up).normalize()

  if (keys.ArrowUp || keys.w || keys.W) direction.add(front)
  if (keys.ArrowDown || keys.s || keys.S) direction.add(front.clone().negate())
  if (keys.ArrowLeft || keys.a || keys.A) direction.add(side.clone().negate())
  if (keys.ArrowRight || keys.d || keys.D) direction.add(side)

  if (direction.length() === 0) return

  clearArrows()
  direction.normalize().multiplyScalar(0.75 * delta)
  const nextPos = camera.position.clone().add(direction)
  const isOutsideRoom = nextPos.x < -24 || nextPos.x > 35 || Math.abs(nextPos.z) > 4.2

  if (!isOutsideRoom) {
    camera.position.add(direction)
    target.add(direction)
    camera.lookAt(target)
  }
}

function updateOverlay(elapsed: number) {
  const active = new Set(blinkingIds.value)
  overlayMaterials.forEach(({ panelId, material }) => {
    material.opacity = active.has(panelId) ? 0.22 + 0.18 * Math.sin(elapsed * 5) : 0
  })
}

function animate(now: number) {
  if (disposed) return
  const delta = lastTime === 0 ? 0 : (now - lastTime) / 1000
  lastTime = now

  updateCamera(delta)
  updateOverlay(now / 1000)
  camera.lookAt(target)
  renderer.render(scene, camera)

  camX.value = Math.round(camera.position.x * 100) / 100
  camZ.value = Math.round(camera.position.z * 100) / 100
  emit('cameraUpdate', {
    x: camX.value,
    z: camZ.value,
    rotation: Math.round(camera.rotation.y * 1000) / 1000,
  })

  animId = requestAnimationFrame(animate)
}

function panelLocation(panelId: number) {
  const startX = 11
  const colWidth = 2
  const floorHeight = 2.5
  const rowZ: [number, number] = [-4.9, 4.9]
  let row = 0
  let col = 0
  let floor = 0

  if (panelId <= 24) {
    row = 1
    col = Math.floor((panelId - 1) / 2)
    floor = panelId % 2 === 1 ? 1 : 0
  } else if (panelId === 47) {
    row = 0
    col = 0
    floor = 1
  } else {
    row = 0
    const startId = panelId % 2 === 1 ? panelId : panelId - 1
    col = (47 - startId) / 2
    floor = panelId % 2 === 1 ? 1 : 0
  }

  const x = startX + col * colWidth
  const y = floor * floorHeight + (panelId === 47 ? floorHeight : floorHeight / 2)
  const z = rowZ[row]
  return { x, y, z, camZ: row === 0 ? z + 8 : z - 8 }
}

function tweenCamera(position: THREE.Vector3, targetVector: THREE.Vector3, duration: number) {
  return new Promise<void>((resolve) => {
    moving.value = true
    const timeline = gsap.timeline({
      onComplete: () => {
        moving.value = false
        resolve()
      },
    })
    timeline.to(camera.position, { duration, ease: 'power2.inOut', x: position.x, y: position.y, z: position.z }, 0)
    timeline.to(target, { duration, ease: 'power2.inOut', x: targetVector.x, y: targetVector.y, z: targetVector.z }, 0)
  })
}

async function runSequence() {
  cleanupSequence?.()

  if (props.sequenceId === 0 || props.sequenceId === lastSequenceId || props.activePanelIds.length === 0) return
  lastSequenceId = props.sequenceId

  let cancelled = false
  cleanupSequence = () => {
    cancelled = true
    sequenceRunning = false
    moving.value = false
    blinkingIds.value = []
    clearArrows()
    gsap.killTweensOf(camera.position)
    gsap.killTweensOf(target)
  }

  blinkingIds.value = [...props.activePanelIds]

  if (props.activePanelIds.length > 1) {
    window.setTimeout(() => {
      if (cancelled) return
      blinkingIds.value = []
      emit('sequenceDone')
    }, 5000)
    return
  }

  sequenceRunning = true
  const panelId = props.activePanelIds[0]
  const location = panelLocation(panelId)

  for (let cycle = 0; cycle < 2; cycle += 1) {
    await wait(1000)
    if (cancelled) return

    const arrows = computeArrows(camera.position.clone(), [location.x, 0, location.z])
    for (let index = 0; index < 3; index += 1) {
      showArrows(arrows)
      await wait(350)
      clearArrows()
      await wait(250)
      if (cancelled) return
    }

    showArrows(arrows)
    await wait(300)
    await tweenCamera(new THREE.Vector3(location.x, location.y, location.camZ), new THREE.Vector3(location.x, location.y, location.z), 4.5)
    if (cancelled) return
    clearArrows()
    await wait(2000)
    await tweenCamera(new THREE.Vector3(-6, 3.6, 0), new THREE.Vector3(40, 2.8, 0), 3.5)
    if (cancelled) return
  }

  await wait(5000)
  if (cancelled) return
  blinkingIds.value = []
  sequenceRunning = false
  emit('sequenceDone')
}

const handleKey = (event: KeyboardEvent) => {
  keys[event.key] = event.type === 'keydown'
}

onMounted(async () => {
  if (!canvasRef.value) return

  setupScene()
  await nextTick()
  updateSize()

  try {
    await loadModels()
    addRoom()
    addPanels()
  } catch (error) {
    console.error('3D model loading failed, using fallback room:', error)
    addFallbackRoom()
  } finally {
    isLoading.value = false
  }

  window.addEventListener('resize', updateSize)
  window.addEventListener('keydown', handleKey)
  window.addEventListener('keyup', handleKey)
  animId = requestAnimationFrame(animate)
})

onBeforeUnmount(() => {
  disposed = true
  cleanupSequence?.()
  cancelAnimationFrame(animId)
  window.removeEventListener('resize', updateSize)
  window.removeEventListener('keydown', handleKey)
  window.removeEventListener('keyup', handleKey)
  renderer?.dispose()
})

watch([() => props.sequenceId, activePanelKey], () => {
  void runSequence()
})
</script>

<style scoped>
.panel-viewer-root {
  width: 100%;
  height: 100%;
  min-height: 0;
  position: relative;
  overflow: hidden;
  background: #0a0a0a;
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
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 0.5rem;
  color: #6ee7b7;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.info-panel {
  position: absolute;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 10;
  pointer-events: none;
}

.status {
  color: #94a3b8;
  font-size: 0.75rem;
  text-transform: uppercase;
  margin-bottom: 0.4rem;
}

.coords {
  color: #64748b;
  font-family: monospace;
  font-size: 0.75rem;
}
</style>
