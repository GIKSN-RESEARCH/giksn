"use client";

/**
 * BinaryMultiplexer
 *
 * Monochrome data-flow animation: three mixed-binary streams feed three bright
 * nodes, straight non-overlapping line fans carry particles into a full-height
 * dotted wall, and a dense uniform binary grid reshuffles to the right of it.
 *
 * Single file, no @react-three/fiber and no framer-motion. Only dependency:
 *   npm i three
 * Types ship with three (r150+). Drop this component into any Next.js app and
 * render it inside a parent that has a real width and height.
 *
 *   <div style={{ width: "100vw", height: "100vh" }}>
 *     <BinaryMultiplexer />
 *   </div>
 *
 * Everything visual is in CONFIG below.
 */

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const VIEW_HEIGHT = 10; // world units mapped to the full viewport height

const CONFIG = {
  colors: {
    background: "#000000",
    glyph: "#EDEAE2",
    line: "#EDEAE2",
    dot: "#EDEAE2",
    node: "#D8D6D0",
    particle: "#F2F0E8",
  },
  nodes: {
    opacity: 0.38,
    scaleMul: 9.5,
    pulse: 0.03,
  },
  layout: {
    nodeXPct: -0.3, // node x, fraction of total width from center
    wallXPct: 0.185, // wall center x
    gridStartPct: 0.215,
    gridEndPct: 0.49,
    contentHeightPct: 0.86, // full height span for wall, grid, and fan
  },
  inputs: {
    count: 3,
    speed: 3.2,
    glyphSpacing: 0.55,
    glyphSize: 0.05, // fraction of height
    fadeFrac: 0.14,
  },
  connections: {
    linesPerNode: 90,
    lineOpacity: 0.16,
    particleCount: 340,
    particleSpeedRange: [0.1, 0.24], // t units per second
    particleSizeWorld: 0.05,
    particleOpacity: 0.95,
  },
  wall: {
    widthPct: 0.02,
    dotCols: 4,
    dotRows: 140,
    dotScale: 1.7,
    idleShimmer: 0.3,
    pulseIntensity: 1.0,
  },
  grid: {
    glyphSize: 0.03, // fraction of height, small and dense
    colSpacingScale: 1.45,
    rowSpacingScale: 1.3,
    baseOpacity: 0.88,
    edgeFloor: 0.72, // mild dimming toward the right edge, mostly uniform
    flipRatePerSec: 0.6,
    flicker: 0.07,
  },
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface GlyphState {
  x: number;
  y: number;
  ch: 0 | 1;
  speed: number;
  x0: number;
  x1: number;
  laneLen: number;
  seed: number;
}

interface Layout {
  nodeX: number;
  wallX: number;
  gridStartX: number;
  gridEndX: number;
  contentH: number;
  bands: { low: number; high: number }[];
  nodeYs: number[];
}

interface InputsBuilt {
  mesh: THREE.InstancedMesh;
  state: GlyphState[];
  aGlyph: Float32Array;
  aOpacity: Float32Array;
  glyphAttr: THREE.InstancedBufferAttribute;
  opacityAttr: THREE.InstancedBufferAttribute;
  size: number;
}

interface ConnectionsBuilt {
  lineObj: THREE.LineSegments;
  pObj: THREE.Points;
  pMat: THREE.ShaderMaterial;
  ppos: Float32Array;
  palpha: Float32Array;
  pIndex: Int32Array;
  pT: Float32Array;
  pSpeed: Float32Array;
  posAttr: THREE.BufferAttribute;
  alphaAttr: THREE.BufferAttribute;
  linesSE: Float32Array;
  total: number;
  nodeSprites: THREE.Sprite[];
  nodeBase: number[];
}

interface WallBuilt {
  mesh: THREE.InstancedMesh;
  mat: THREE.ShaderMaterial;
}

interface GridBuilt {
  mesh: THREE.InstancedMesh;
  aGlyph: Float32Array;
  aOpacity: Float32Array;
  glyphAttr: THREE.InstancedBufferAttribute;
  opacityAttr: THREE.InstancedBufferAttribute;
  cellX: Float32Array;
  seed: Float32Array;
  timer: Float32Array;
  count: number;
  x0: number;
  x1: number;
}

interface Built {
  L: Layout;
  inputs: InputsBuilt;
  conn: ConnectionsBuilt;
  wall: WallBuilt;
  grid: GridBuilt;
}

export interface BinaryMultiplexerProps {
  className?: string;
  // Small monospace caption in the top left. Pass null to hide.
  caption?: string | null;
}

// ---------------------------------------------------------------------------
// Math helpers
// ---------------------------------------------------------------------------
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
const mod = (n: number, m: number) => ((n % m) + m) % m;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const randInt = (n: number) => (Math.random() * n) | 0;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function BinaryMultiplexer({
  className,
  caption = "binary multiplexer",
}: BinaryMultiplexerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ---- textures, created per mount and disposed on cleanup ----
    function makeGlyphAtlas(): THREE.CanvasTexture {
      const cell = 128;
      const c = document.createElement("canvas");
      c.width = cell * 2;
      c.height = cell;
      const ctx = c.getContext("2d")!;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.fillStyle = "#ffffff";
      ctx.font = `600 ${Math.floor(cell * 0.78)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("0", cell * 0.5, cell * 0.54);
      ctx.fillText("1", cell * 1.5, cell * 0.54);
      const tex = new THREE.CanvasTexture(c);
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      tex.needsUpdate = true;
      return tex;
    }
    function makeGlow(): THREE.CanvasTexture {
      const s = 128;
      const c = document.createElement("canvas");
      c.width = s;
      c.height = s;
      const ctx = c.getContext("2d")!;
      const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      g.addColorStop(0.0, "rgba(255,255,255,0.55)");
      g.addColorStop(0.22, "rgba(255,255,255,0.28)");
      g.addColorStop(0.55, "rgba(255,255,255,0.08)");
      g.addColorStop(1.0, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, s, s);
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    }

    const ATLAS = makeGlyphAtlas();
    const GLOW = makeGlow();

    // ---- materials ----
    const glyphVertex = `
      attribute float aGlyph;
      attribute float aOpacity;
      varying vec2 vUv;
      varying float vOpacity;
      void main(){
        vUv = vec2(uv.x * 0.5 + aGlyph * 0.5, uv.y);
        vOpacity = aOpacity;
        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
      }
    `;
    const glyphFragment = `
      uniform sampler2D uAtlas;
      uniform vec3 uColor;
      varying vec2 vUv;
      varying float vOpacity;
      void main(){
        float mask = texture2D(uAtlas, vUv).a;
        float alpha = mask * vOpacity;
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(uColor, alpha);
      }
    `;
    const makeGlyphMaterial = () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uAtlas: { value: ATLAS },
          uColor: { value: new THREE.Color(CONFIG.colors.glyph) },
        },
        vertexShader: glyphVertex,
        fragmentShader: glyphFragment,
        transparent: true,
        depthWrite: false,
        depthTest: false,
      });

    const wallVertex = `
      attribute float aYNorm;
      attribute float aRand;
      varying vec2 vUv;
      varying float vBright;
      uniform float uTime;
      uniform float uIdle;
      uniform float uPulse;
      void main(){
        vUv = uv;
        float sweep = fract(uTime * 0.32);
        float band = smoothstep(0.08, 0.0, abs(aYNorm - sweep));
        float sweep2 = fract(0.5 - uTime * 0.17);
        float band2 = smoothstep(0.14, 0.0, abs(aYNorm - sweep2)) * 0.5;
        float shimmer = uIdle * (0.6 + 0.4 * sin(uTime * 3.0 + aRand * 6.2831));
        vBright = clamp(shimmer + uPulse * (band + band2), 0.0, 1.4);
        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
      }
    `;
    const wallFragment = `
      uniform vec3 uColor;
      varying vec2 vUv;
      varying float vBright;
      void main(){
        float d = distance(vUv, vec2(0.5));
        float circle = smoothstep(0.5, 0.34, d);
        float alpha = circle * vBright;
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(uColor, alpha);
      }
    `;
    const makeWallMaterial = () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(CONFIG.colors.dot) },
          uIdle: { value: CONFIG.wall.idleShimmer },
          uPulse: { value: CONFIG.wall.pulseIntensity },
        },
        vertexShader: wallVertex,
        fragmentShader: wallFragment,
        transparent: true,
        depthWrite: false,
        depthTest: false,
      });

    const partVertex = `
      attribute float aAlpha;
      varying float vA;
      uniform float uSize;
      void main(){
        vA = aAlpha;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = uSize;
      }
    `;
    const partFragment = `
      uniform vec3 uColor;
      varying float vA;
      void main(){
        vec2 c = gl_PointCoord - vec2(0.5);
        float d = length(c);
        float a = smoothstep(0.5, 0.0, d) * vA;
        if (a < 0.01) discard;
        gl_FragColor = vec4(uColor, a);
      }
    `;
    const makeParticleMaterial = () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(CONFIG.colors.particle) },
          uSize: { value: 4.0 },
        },
        vertexShader: partVertex,
        fragmentShader: partFragment,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      });

    // ---- renderer, scene, camera ----
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const canvas = renderer.domElement;
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.display = "block";
    canvas.style.zIndex = "0";
    container.appendChild(canvas);

    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    camera.position.set(0, 0, 10);

    const worldHeight = VIEW_HEIGHT;
    let worldWidth = VIEW_HEIGHT;
    const dummy = new THREE.Object3D();

    let root: THREE.Group | null = null;
    let built: Built | null = null;

    function computeLayout(W: number, H: number): Layout {
      const nodeX = CONFIG.layout.nodeXPct * W;
      const wallX = CONFIG.layout.wallXPct * W;
      const gridStartX = CONFIG.layout.gridStartPct * W;
      const gridEndX = CONFIG.layout.gridEndPct * W;
      const contentH = CONFIG.layout.contentHeightPct * H;
      const halfC = contentH / 2;
      const n = CONFIG.inputs.count;
      const bandH = contentH / n;

      const bands: { low: number; high: number }[] = [];
      const nodeYs: number[] = [];
      for (let k = 0; k < n; k++) {
        const yHigh = halfC - k * bandH; // index 0 is the top band
        const yLow = halfC - (k + 1) * bandH;
        bands.push({ low: yLow, high: yHigh });
        nodeYs.push((yLow + yHigh) / 2); // node sits at the center of its band
      }
      return { nodeX, wallX, gridStartX, gridEndX, contentH, bands, nodeYs };
    }

    // ---- input streams: mixed binary feeding the nodes ----
    function buildInputs(L: Layout, W: number, H: number): InputsBuilt {
      const spacing = CONFIG.inputs.glyphSpacing;
      const x0 = -W / 2 - 1.5;
      const x1 = L.nodeX;
      const laneLen = x1 - x0;
      const perLane = Math.ceil(laneLen / spacing) + 2;

      const state: GlyphState[] = [];
      for (let k = 0; k < L.nodeYs.length; k++) {
        const phase = Math.random() * laneLen;
        for (let i = 0; i < perLane; i++) {
          state.push({
            x: x0 + mod(i * spacing + phase, laneLen),
            y: L.nodeYs[k],
            ch: Math.random() < 0.5 ? 0 : 1,
            speed: CONFIG.inputs.speed,
            x0,
            x1,
            laneLen,
            seed: Math.random() * 100,
          });
        }
      }

      const count = state.length;
      const geo = new THREE.PlaneGeometry(1, 1);
      const aGlyph = new Float32Array(count);
      const aOpacity = new Float32Array(count);
      const glyphAttr = new THREE.InstancedBufferAttribute(aGlyph, 1);
      const opacityAttr = new THREE.InstancedBufferAttribute(aOpacity, 1);
      geo.setAttribute("aGlyph", glyphAttr);
      geo.setAttribute("aOpacity", opacityAttr);
      const mesh = new THREE.InstancedMesh(geo, makeGlyphMaterial(), count);
      mesh.frustumCulled = false;
      mesh.renderOrder = 2;

      return {
        mesh,
        state,
        aGlyph,
        aOpacity,
        glyphAttr,
        opacityAttr,
        size: CONFIG.inputs.glyphSize * H,
      };
    }

    // ---- connections: straight non overlapping line fans plus particles ----
    function buildConnections(L: Layout, _W: number, H: number): ConnectionsBuilt {
      const linesPerNode = CONFIG.connections.linesPerNode;
      const lines: number[][] = []; // each [sx, sy, ex, ey]
      for (let k = 0; k < L.nodeYs.length; k++) {
        const b = L.bands[k];
        const ny = L.nodeYs[k];
        for (let j = 0; j < linesPerNode; j++) {
          const t = (j + 0.5) / linesPerNode;
          const ty = b.low + t * (b.high - b.low);
          lines.push([L.nodeX, ny, L.wallX, ty]);
        }
      }
      const total = lines.length;

      const pos = new Float32Array(total * 2 * 3);
      const linesSE = new Float32Array(total * 4);
      for (let i = 0; i < total; i++) {
        const ln = lines[i];
        pos[i * 6 + 0] = ln[0];
        pos[i * 6 + 1] = ln[1];
        pos[i * 6 + 2] = 0;
        pos[i * 6 + 3] = ln[2];
        pos[i * 6 + 4] = ln[3];
        pos[i * 6 + 5] = 0;
        linesSE[i * 4 + 0] = ln[0];
        linesSE[i * 4 + 1] = ln[1];
        linesSE[i * 4 + 2] = ln[2];
        linesSE[i * 4 + 3] = ln[3];
      }
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const lineMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(CONFIG.colors.line),
        transparent: true,
        opacity: CONFIG.connections.lineOpacity,
        depthTest: false,
        depthWrite: false,
      });
      const lineObj = new THREE.LineSegments(lineGeo, lineMat);
      lineObj.frustumCulled = false;
      lineObj.renderOrder = 0;

      const pcount = CONFIG.connections.particleCount;
      const ppos = new Float32Array(pcount * 3);
      const palpha = new Float32Array(pcount);
      const pIndex = new Int32Array(pcount);
      const pT = new Float32Array(pcount);
      const pSpeed = new Float32Array(pcount);
      const sMin = CONFIG.connections.particleSpeedRange[0];
      const sMax = CONFIG.connections.particleSpeedRange[1];
      for (let p = 0; p < pcount; p++) {
        pIndex[p] = randInt(total);
        pT[p] = Math.random();
        pSpeed[p] = sMin + Math.random() * (sMax - sMin);
      }
      const pGeo = new THREE.BufferGeometry();
      const posAttr = new THREE.BufferAttribute(ppos, 3);
      const alphaAttr = new THREE.BufferAttribute(palpha, 1);
      pGeo.setAttribute("position", posAttr);
      pGeo.setAttribute("aAlpha", alphaAttr);
      const pMat = makeParticleMaterial();
      const pObj = new THREE.Points(pGeo, pMat);
      pObj.frustumCulled = false;
      pObj.renderOrder = 3;

      const nodeSprites: THREE.Sprite[] = [];
      const nodeBase: number[] = [];
      for (let n = 0; n < L.nodeYs.length; n++) {
        const sm = new THREE.SpriteMaterial({
          map: GLOW,
          color: new THREE.Color(CONFIG.colors.node),
          opacity: CONFIG.nodes.opacity,
          transparent: true,
          depthTest: false,
          depthWrite: false,
          blending: THREE.NormalBlending,
        });
        const sp = new THREE.Sprite(sm);
        const base = CONFIG.inputs.glyphSize * H * CONFIG.nodes.scaleMul;
        sp.scale.set(base, base, 1);
        sp.position.set(L.nodeX, L.nodeYs[n], 0);
        sp.renderOrder = 4;
        nodeSprites.push(sp);
        nodeBase.push(base);
      }

      return {
        lineObj,
        pObj,
        pMat,
        ppos,
        palpha,
        pIndex,
        pT,
        pSpeed,
        posAttr,
        alphaAttr,
        linesSE,
        total,
        nodeSprites,
        nodeBase,
      };
    }

    // ---- wall: narrow full height dotted column ----
    function buildWall(L: Layout, W: number): WallBuilt {
      const wallW = CONFIG.wall.widthPct * W;
      const wallH = L.contentH;
      const cx = L.wallX;
      const rows = CONFIG.wall.dotRows;
      const cols = CONFIG.wall.dotCols;
      const count = rows * cols;
      const rowSpacing = rows > 1 ? wallH / (rows - 1) : wallH;
      const colSpacing = cols > 1 ? wallW / (cols - 1) : wallW;
      const dotDiameter = Math.max(rowSpacing, colSpacing) * CONFIG.wall.dotScale;

      const geo = new THREE.PlaneGeometry(1, 1);
      const yNorm = new Float32Array(count);
      const rand = new Float32Array(count);
      geo.setAttribute("aYNorm", new THREE.InstancedBufferAttribute(yNorm, 1));
      geo.setAttribute("aRand", new THREE.InstancedBufferAttribute(rand, 1));
      const mat = makeWallMaterial();
      const mesh = new THREE.InstancedMesh(geo, mat, count);
      mesh.frustumCulled = false;
      mesh.renderOrder = 1;

      let i = 0;
      for (let r = 0; r < rows; r++) {
        const y = -wallH / 2 + (rows > 1 ? r * rowSpacing : 0);
        for (let c = 0; c < cols; c++) {
          const x = cx - wallW / 2 + (cols > 1 ? c * colSpacing : 0);
          dummy.position.set(x, y, 0);
          dummy.scale.set(dotDiameter, dotDiameter, 1);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
          yNorm[i] = rows > 1 ? r / (rows - 1) : 0.5;
          rand[i] = Math.random();
          i++;
        }
      }
      mesh.instanceMatrix.needsUpdate = true;
      return { mesh, mat };
    }

    // ---- output grid: dense uniform binary that reshuffles in place ----
    function buildGrid(L: Layout, _W: number, H: number): GridBuilt {
      const gw = L.gridEndX - L.gridStartX;
      const gh = L.contentH;
      const glyphSize = CONFIG.grid.glyphSize * H;
      const colSpacing = glyphSize * CONFIG.grid.colSpacingScale;
      const rowSpacing = glyphSize * CONFIG.grid.rowSpacingScale;
      const cols = Math.max(1, Math.floor(gw / colSpacing));
      const rows = Math.max(1, Math.floor(gh / rowSpacing));
      const count = rows * cols;

      const usedW = (cols - 1) * colSpacing;
      const usedH = (rows - 1) * rowSpacing;
      const startX = L.gridStartX + (gw - usedW) / 2;
      const topY = usedH / 2;

      const geo = new THREE.PlaneGeometry(1, 1);
      const aGlyph = new Float32Array(count);
      const aOpacity = new Float32Array(count);
      const glyphAttr = new THREE.InstancedBufferAttribute(aGlyph, 1);
      const opacityAttr = new THREE.InstancedBufferAttribute(aOpacity, 1);
      geo.setAttribute("aGlyph", glyphAttr);
      geo.setAttribute("aOpacity", opacityAttr);
      const mat = makeGlyphMaterial();
      const mesh = new THREE.InstancedMesh(geo, mat, count);
      mesh.frustumCulled = false;
      mesh.renderOrder = 2;

      const cellX = new Float32Array(count);
      const seed = new Float32Array(count);
      const timer = new Float32Array(count);
      const rate = CONFIG.grid.flipRatePerSec;

      let i = 0;
      for (let r = 0; r < rows; r++) {
        const y = topY - r * rowSpacing;
        for (let c = 0; c < cols; c++) {
          const x = startX + c * colSpacing;
          dummy.position.set(x, y, 0);
          dummy.scale.set(glyphSize, glyphSize, 1);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
          aGlyph[i] = Math.random() < 0.5 ? 0 : 1;
          cellX[i] = x;
          seed[i] = Math.random() * 100;
          timer[i] = (0.4 + Math.random()) / rate;
          i++;
        }
      }
      mesh.instanceMatrix.needsUpdate = true;

      return {
        mesh,
        aGlyph,
        aOpacity,
        glyphAttr,
        opacityAttr,
        cellX,
        seed,
        timer,
        count,
        x0: L.gridStartX,
        x1: L.gridEndX,
      };
    }

    function disposeRoot() {
      if (!root) return;
      root.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = (mesh as unknown as { material?: THREE.Material }).material;
        if (mat) mat.dispose(); // shared ATLAS and GLOW are disposed in cleanup
      });
      scene.remove(root);
      root = null;
      built = null;
    }

    function rebuild() {
      disposeRoot();
      const L = computeLayout(worldWidth, worldHeight);
      const group = new THREE.Group();

      const inputs = buildInputs(L, worldWidth, worldHeight);
      const conn = buildConnections(L, worldWidth, worldHeight);
      const wall = buildWall(L, worldWidth);
      const grid = buildGrid(L, worldWidth, worldHeight);

      group.add(conn.lineObj);
      group.add(wall.mesh);
      group.add(grid.mesh);
      group.add(inputs.mesh);
      group.add(conn.pObj);
      for (const sp of conn.nodeSprites) group.add(sp);
      scene.add(group);

      root = group;
      built = { L, inputs, conn, wall, grid };
      updateParticleSize();
    }

    function updateParticleSize() {
      if (!built) return;
      const pr = renderer.getPixelRatio();
      const ph = (container!.clientHeight || 1) * pr;
      built.conn.pMat.uniforms.uSize.value =
        CONFIG.connections.particleSizeWorld * (ph / VIEW_HEIGHT);
    }

    function resize() {
      const w = container!.clientWidth || 1;
      const h = container!.clientHeight || 1;
      renderer.setSize(w, h);
      worldWidth = VIEW_HEIGHT * (w / h);
      camera.left = -worldWidth / 2;
      camera.right = worldWidth / 2;
      camera.top = worldHeight / 2;
      camera.bottom = -worldHeight / 2;
      camera.updateProjectionMatrix();
      rebuild();
    }

    // ---- per frame updates ----
    function updateInputs(b: Built, dt: number, time: number) {
      const s = b.inputs;
      const f = CONFIG.inputs.fadeFrac;
      for (let i = 0; i < s.state.length; i++) {
        const g = s.state[i];
        g.x += g.speed * dt;
        if (g.x > g.x1) {
          g.x -= g.laneLen;
          g.ch = Math.random() < 0.5 ? 0 : 1;
        }
        const travel = (g.x - g.x0) / g.laneLen;
        const fadeIn = smoothstep(0, f, travel);
        const fadeOut = 1 - smoothstep(1 - f, 1, travel);
        const flick = 0.9 + 0.1 * Math.sin(time * 5 + g.seed);
        dummy.position.set(g.x, g.y, 0);
        dummy.scale.set(s.size, s.size, 1);
        dummy.updateMatrix();
        s.mesh.setMatrixAt(i, dummy.matrix);
        s.aGlyph[i] = g.ch;
        s.aOpacity[i] = fadeIn * fadeOut * flick;
      }
      s.mesh.instanceMatrix.needsUpdate = true;
      s.glyphAttr.needsUpdate = true;
      s.opacityAttr.needsUpdate = true;
    }

    function updateParticles(b: Built, dt: number, time: number) {
      const c = b.conn;
      const pop = CONFIG.connections.particleOpacity;
      for (let p = 0; p < c.pT.length; p++) {
        c.pT[p] += c.pSpeed[p] * dt;
        if (c.pT[p] > 1) {
          c.pT[p] -= 1;
          c.pIndex[p] = randInt(c.total);
        }
        const k = c.pIndex[p] * 4;
        const sx = c.linesSE[k];
        const sy = c.linesSE[k + 1];
        const ex = c.linesSE[k + 2];
        const ey = c.linesSE[k + 3];
        const t = c.pT[p];
        c.ppos[p * 3 + 0] = lerp(sx, ex, t);
        c.ppos[p * 3 + 1] = lerp(sy, ey, t);
        c.ppos[p * 3 + 2] = 0;
        const fade = smoothstep(0, 0.08, t) * (1 - smoothstep(0.92, 1, t));
        c.palpha[p] = fade * pop;
      }
      c.posAttr.needsUpdate = true;
      c.alphaAttr.needsUpdate = true;

      for (let n = 0; n < c.nodeSprites.length; n++) {
        const sc =
          c.nodeBase[n] *
          (1 + CONFIG.nodes.pulse * Math.sin(time * 2.0 + n * 1.7));
        c.nodeSprites[n].scale.set(sc, sc, 1);
      }
    }

    function updateGrid(b: Built, dt: number, time: number) {
      const g = b.grid;
      const base = CONFIG.grid.baseOpacity;
      const floor = CONFIG.grid.edgeFloor;
      const flick = CONFIG.grid.flicker;
      const rate = CONFIG.grid.flipRatePerSec;
      let flipped = false;
      for (let i = 0; i < g.count; i++) {
        g.timer[i] -= dt;
        if (g.timer[i] <= 0) {
          g.aGlyph[i] = g.aGlyph[i] < 0.5 ? 1 : 0;
          g.timer[i] = (0.4 + Math.random() * 1.2) / rate;
          flipped = true;
        }
        const tx = (g.cellX[i] - g.x0) / (g.x1 - g.x0);
        const depth = lerp(1.0, floor, clamp(tx, 0, 1));
        const fl = 1 - flick + flick * (0.5 + 0.5 * Math.sin(time * 4 + g.seed[i]));
        g.aOpacity[i] = base * depth * fl;
      }
      if (flipped) g.glyphAttr.needsUpdate = true;
      g.opacityAttr.needsUpdate = true;
    }

    const clock = new THREE.Clock();
    let rafId = 0;
    function animate() {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const time = clock.elapsedTime;
      const b = built;
      if (b) {
        updateInputs(b, dt, time);
        updateParticles(b, dt, time);
        updateGrid(b, dt, time);
        b.wall.mat.uniforms.uTime.value = time;
      }
      renderer.render(scene, camera);
    }

    const ro = new ResizeObserver(() => resize());
    ro.observe(container);
    resize();
    animate();

    const showTimer = window.setTimeout(() => setReady(true), 30);

    return () => {
      window.clearTimeout(showTimer);
      cancelAnimationFrame(rafId);
      ro.disconnect();
      disposeRoot();
      ATLAS.dispose();
      GLOW.dispose();
      renderer.dispose();
      if (canvas.parentNode === container) container.removeChild(canvas);
    };
  }, []);

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "transparent",
        overflow: "hidden",
        opacity: ready ? 1 : 0,
        transition: "opacity 1.1s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />
      {caption ? (
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 28,
            zIndex: 2,
            color: CONFIG.colors.glyph,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 12,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            opacity: ready ? 0.55 : 0,
            transition: "opacity 1.2s ease 0.4s",
            pointerEvents: "none",
          }}
        >
          {caption}
        </div>
      ) : null}
    </div>
  );
}