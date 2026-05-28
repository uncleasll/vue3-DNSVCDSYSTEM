<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, Suspense } from 'vue'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Float, Html, OrbitControls, Text, useGLTF } from '@react-three/drei'
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing'
import gsap from 'gsap'
import { ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'
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

interface CameraPosition {
  x: number
  z: number
  rotation: number
}

const GLB_VERSION = 'v1.1'

const PANEL_DATA: Record<number, PanelInfo> = SHARED_PANEL_DATA.reduce(
  (items, panel) => ({
    ...items,
    [panel.id]: { glbKey: panel.glbKey, unitId: panel.unitId, name: panel.name },
  }),
  {} as Record<number, PanelInfo>,
)

const FALLBACK_PANEL_DATA: Record<number, PanelInfo> = {
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

// Props
interface Props {
  activePanelIds?: number[]
  sequenceId?: number
  isOperationActive?: boolean
  onCameraUpdate?: (position: CameraPosition) => void
  onSequenceDone?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  activePanelIds: () => [],
  sequenceId: 0,
  isOperationActive: false,
})

const emit = defineEmits<{
  cameraUpdate: [position: CameraPosition]
  sequenceDone: []
}>()

// State
const pathArrows = ref<Arrow[]>([])
const blinkingIds = ref<number[]>([])
const moving = ref(false)
const keys = ref<Record<string, boolean>>({})
const controlsRef = ref<any>(null)
const cameraRef = ref<any>(null)

let sequenceRunning = false
let lastSequenceId = 0
const lastUpdatePos = ref(new THREE.Vector3())
const lastUpdateRot = ref(0)
let cancelled = false

// Helper functions
function getInfo(panelId: number): PanelInfo {
  return (
    PANEL_DATA[panelId] ??
    FALLBACK_PANEL_DATA[panelId] ?? {
      glbKey: 'A' as const,
      unitId: String(panelId).padStart(2, '0'),
      name: `PANEL ${panelId}`,
    }
  )
}

function wait(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
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

const placements = computed(() => getPlacements())
const defaultTarget = computed(() => new THREE.Vector3(40, 2.8, 0))
const activePanelKey = computed(() => props.activePanelIds.join(','))

// Functions
function computeArrows(
  startPos: THREE.Vector3,
  panelPos: [number, number, number],
): Arrow[] {
  const aisleZ = 0
  const points = [
    startPos.clone().setY(0),
    new THREE.Vector3(startPos.x, 0, aisleZ),
    new THREE.Vector3(panelPos[0], 0, aisleZ),
    new THREE.Vector3(panelPos[0], 0, panelPos[2]),
  ]
  const clean = points.reduce<THREE.Vector3[]>((items, point) => {
    if (items.length === 0 || point.distanceTo(items[items.length - 1]) > 0.2) {
      items.push(point)
    }
    return items
  }, [])
  const curve = new THREE.CatmullRomCurve3(
    clean.length > 1 ? clean : [points[0], points[points.length - 1]],
    false,
    'catmullrom',
    0.1,
  )
  const count = Math.max(3, Math.floor(curve.getLength() / 0.7))

  return Array.from({ length: count }, (_, index) => {
    const t = (index + 1) / (count + 1)
    const point = curve.getPoint(t)
    const ahead = curve.getPoint(Math.min(1, t + 0.05))
    let target: [number, number, number] = [ahead.x, 0.02, ahead.z]
    if (index === count - 1) target = [panelPos[0], 0.02, panelPos[2]]
    return { position: [point.x, 0.02, point.z] as [number, number, number], target }
  })
}

async function goHome(): Promise<void> {
  return new Promise<void>((resolve) => {
    if (!controlsRef.value) {
      moving.value = false
      resolve()
      return
    }

    moving.value = true
    const timeline = gsap.timeline({
      onComplete: () => {
        moving.value = false
        resolve()
      },
    })
    timeline.to(
      cameraRef.value.position,
      {
        duration: 3.5,
        ease: 'power2.inOut',
        x: -6,
        y: 3.6,
        z: 0,
        onUpdate: () => controlsRef.value?.update(),
      },
      0,
    )
    timeline.to(
      controlsRef.value.target,
      {
        duration: 3.5,
        ease: 'power2.inOut',
        x: 40,
        y: 2.8,
        z: 0,
        onUpdate: () => controlsRef.value?.update(),
      },
      0,
    )
  })
}

async function walkToPanel(target: {
  x: number
  y: number
  z: number
  camZ: number
}): Promise<void> {
  return new Promise<void>((resolve) => {
    if (!controlsRef.value) {
      resolve()
      return
    }

    moving.value = true
    const timeline = gsap.timeline({
      onComplete: () => window.setTimeout(resolve, 2000),
    })
    timeline.to(
      cameraRef.value.position,
      {
        duration: 4.5,
        ease: 'power2.inOut',
        x: target.x,
        y: target.y,
        z: target.camZ,
        onUpdate: () => controlsRef.value?.update(),
      },
      0,
    )
    timeline.to(
      controlsRef.value.target,
      {
        duration: 4.5,
        ease: 'power2.inOut',
        x: target.x,
        y: target.y,
        z: target.z,
        onUpdate: () => controlsRef.value?.update(),
      },
      0,
    )
  })
}

async function runSequence(): Promise<void> {
  if (cancelled) return

  const startX = 11
  const colWidth = 2
  const floorHeight = 2.5
  const rowZ: [number, number] = [-4.9, 4.9]

  let closestPanelId = props.activePanelIds[0]
  let minDistance = Infinity

  for (const panelId of props.activePanelIds) {
    let row: number
    let col: number

    if (panelId <= 24) {
      row = 1
      col = Math.floor((panelId - 1) / 2)
    } else if (panelId === 47) {
      row = 0
      col = 0
    } else {
      row = 0
      const startId = panelId % 2 === 1 ? panelId : panelId - 1
      col = (47 - startId) / 2
    }

    const exactX = startX + col * colWidth
    const exactZ = rowZ[row]
    const distance = Math.hypot(
      cameraRef.value.position.x - exactX,
      cameraRef.value.position.z - exactZ,
    )
    if (distance < minDistance) {
      minDistance = distance
      closestPanelId = panelId
    }
  }

  const panelId = closestPanelId
  let row: number
  let col: number
  let floor: number

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

  const exactX = startX + col * colWidth
  const exactY = floor * floorHeight + (panelId === 47 ? floorHeight : floorHeight / 2)
  const exactZ = rowZ[row]
  const camZ = row === 0 ? exactZ + 8 : exactZ - 8

  for (let cycle = 0; cycle < 2; cycle += 1) {
    await wait(1000)
    if (cancelled) return

    const arrows = computeArrows(cameraRef.value.position.clone(), [
      exactX,
      0,
      rowZ[row],
    ])
    for (let index = 0; index < 3; index += 1) {
      if (cancelled) return
      pathArrows.value = arrows
      await wait(350)
      pathArrows.value = []
      await wait(250)
    }

    if (cancelled) return
    pathArrows.value = arrows
    await wait(300)

    await walkToPanel({ x: exactX, y: exactY, z: exactZ, camZ })
    if (cancelled) return
    pathArrows.value = []

    await goHome()
    if (cancelled) return
  }

  await wait(5000)
  if (cancelled) return
  blinkingIds.value = []
  sequenceRunning = false
  emit('sequenceDone')
}

// Lifecycle
onMounted(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    keys.value[event.key] = true
  }
  const handleKeyUp = (event: KeyboardEvent) => {
    keys.value[event.key] = false
  }

  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)

  return () => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
  }
})

// Watchers
watch(
  () => props.sequenceId,
  async (newSequenceId) => {
    pathArrows.value = []

    if (
      newSequenceId === 0 ||
      newSequenceId === lastSequenceId ||
      props.activePanelIds.length === 0
    ) {
      return
    }
    lastSequenceId = newSequenceId

    if (props.activePanelIds.length > 1) {
      blinkingIds.value = props.activePanelIds
      await wait(5000)
      blinkingIds.value = []
      emit('sequenceDone')
      return
    }

    cancelled = false
    sequenceRunning = true
    blinkingIds.value = props.activePanelIds
    await runSequence()
  },
)

watch(
  activePanelKey,
  () => {
    cancelled = true
    sequenceRunning = false
    moving.value = false
    blinkingIds.value = []
    pathArrows.value = []
    gsap.killTweensOf(cameraRef.value?.position)
    if (controlsRef.value?.target) {
      gsap.killTweensOf(controlsRef.value.target)
      controlsRef.value.update()
    }
  },
)
</script>

<template>
  <div class="h-full w-full">
    <!-- Canvas orqa uchun placeholder -->
    <div class="absolute inset-0">
      <!-- Three.js Canvas bu yerga kiradi -->
      <!-- React-lik canvas o'rniga, VueGL yoki Babylon.js ishlatish kerak -->
    </div>
  </div>
</template>

<style scoped>
/* Canvas uchun container stillar */
</style>