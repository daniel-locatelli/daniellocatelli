import * as THREE from "three";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";

// ─────────────────────────────────────────────────────────────────────────
// Buckminster Fuller geodesic construction:
//   1. Start with an icosahedron.
//   2. Subdivide each triangular face N times (each step ×4 triangles).
//   3. Project every vertex onto the sphere.
//   4. Take the dual graph: each original vertex becomes a polygon face.
//      - The 12 original icosahedron vertices → pentagons (degree 5).
//      - Every other vertex                   → hexagons  (degree 6).
// ─────────────────────────────────────────────────────────────────────────

interface FaceData {
  normal: THREE.Vector3;
  meshStart: number; // float-index start in mesh position array
  meshCount: number; // number of floats belonging to this face
  edgeStart: number; // float-index start in wireframe position array
  edgeCount: number;
}

function buildGeodesicPolyhedron(
  radius: number,
  subdivisions: number,
): {
  meshPositions: Float32Array;
  edgePositions: Float32Array;
  faceData: FaceData[];
} {
  // ── Icosahedron base vertices ──
  const phi = (1 + Math.sqrt(5)) / 2;

  // Project (x,y,z) onto the sphere of given radius
  const project = (
    x: number,
    y: number,
    z: number,
  ): [number, number, number] => {
    const len = Math.sqrt(x * x + y * y + z * z);
    return [(x / len) * radius, (y / len) * radius, (z / len) * radius];
  };

  let verts: [number, number, number][] = [
    project(-1, phi, 0),
    project(1, phi, 0),
    project(-1, -phi, 0),
    project(1, -phi, 0),
    project(0, -1, phi),
    project(0, 1, phi),
    project(0, -1, -phi),
    project(0, 1, -phi),
    project(phi, 0, -1),
    project(phi, 0, 1),
    project(-phi, 0, -1),
    project(-phi, 0, 1),
  ];

  let tris: [number, number, number][] = [
    [0, 11, 5],
    [0, 5, 1],
    [0, 1, 7],
    [0, 7, 10],
    [0, 10, 11],
    [1, 5, 9],
    [5, 11, 4],
    [11, 10, 2],
    [10, 7, 6],
    [7, 1, 8],
    [3, 9, 4],
    [3, 4, 2],
    [3, 2, 6],
    [3, 6, 8],
    [3, 8, 9],
    [4, 9, 5],
    [2, 4, 11],
    [6, 2, 10],
    [8, 6, 7],
    [9, 8, 1],
  ];

  // ── Subdivision ──
  for (let s = 0; s < subdivisions; s++) {
    const newTris: [number, number, number][] = [];
    const midMap = new Map<string, number>();

    const mid = (a: number, b: number): number => {
      const k = a < b ? `${a}_${b}` : `${b}_${a}`;
      if (midMap.has(k)) return midMap.get(k)!;
      const va = verts[a],
        vb = verts[b];
      const idx = verts.length;
      verts.push(
        project((va[0] + vb[0]) / 2, (va[1] + vb[1]) / 2, (va[2] + vb[2]) / 2),
      );
      midMap.set(k, idx);
      return idx;
    };

    for (const [a, b, c] of tris) {
      const ab = mid(a, b),
        bc = mid(b, c),
        ca = mid(c, a);
      newTris.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    }
    tris = newTris;
  }

  // ── Vertex-to-triangle adjacency ──
  const v2f: number[][] = Array.from({ length: verts.length }, () => []);
  for (let fi = 0; fi < tris.length; fi++) {
    for (const vi of tris[fi]) v2f[vi].push(fi);
  }

  // ── Triangle face centres projected onto sphere ──
  const triCenters: [number, number, number][] = tris.map(([a, b, c]) => {
    const va = verts[a],
      vb = verts[b],
      vc = verts[c];
    return project(
      (va[0] + vb[0] + vc[0]) / 3,
      (va[1] + vb[1] + vc[1]) / 3,
      (va[2] + vb[2] + vc[2]) / 3,
    );
  });

  // ── Build dual polygon faces (pentagons & hexagons) ──
  const meshArr: number[] = [];
  const edgeArr: number[] = [];
  const faceData: FaceData[] = [];

  for (let vi = 0; vi < verts.length; vi++) {
    const surrounding = v2f[vi];
    if (surrounding.length < 3) continue;

    const v = verts[vi];
    // Outward normal = vertex direction on sphere
    const normal = new THREE.Vector3(v[0], v[1], v[2]).normalize();

    // Build tangent frame for consistent angular sorting
    let axisU = new THREE.Vector3(0, 1, 0);
    if (Math.abs(normal.dot(axisU)) > 0.9) axisU.set(1, 0, 0);
    axisU.sub(normal.clone().multiplyScalar(normal.dot(axisU))).normalize();
    const axisV = new THREE.Vector3().crossVectors(normal, axisU);

    // Sort surrounding triangle faces by angle → ordered polygon vertices
    const sorted = surrounding
      .map((fi) => {
        const fc = triCenters[fi];
        const p = new THREE.Vector3(fc[0], fc[1], fc[2]);
        return { fi, angle: Math.atan2(p.dot(axisV), p.dot(axisU)) };
      })
      .sort((a, b) => a.angle - b.angle)
      .map((w) => w.fi);

    // Polygon vertex positions = triangle face centres in angular order
    const pverts = sorted.map((fi) => {
      const fc = triCenters[fi];
      return new THREE.Vector3(fc[0], fc[1], fc[2]);
    });

    // Polygon centroid
    const center = pverts
      .reduce((acc, p) => acc.add(p), new THREE.Vector3())
      .divideScalar(pverts.length);

    const meshStart = meshArr.length;
    const edgeStart = edgeArr.length;

    // Fan triangulation from centroid → renderable mesh triangles
    for (let i = 0; i < pverts.length; i++) {
      const a = pverts[i],
        b = pverts[(i + 1) % pverts.length];
      meshArr.push(center.x, center.y, center.z, a.x, a.y, a.z, b.x, b.y, b.z);
    }

    // Polygon boundary edges → wireframe line segments
    for (let i = 0; i < pverts.length; i++) {
      const a = pverts[i],
        b = pverts[(i + 1) % pverts.length];
      edgeArr.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }

    faceData.push({
      normal,
      meshStart,
      meshCount: meshArr.length - meshStart,
      edgeStart,
      edgeCount: edgeArr.length - edgeStart,
    });
  }

  return {
    meshPositions: new Float32Array(meshArr),
    edgePositions: new Float32Array(edgeArr),
    faceData,
  };
}

// ─────────────────────────────────────────────────────────────────────────

class GeodesicDomeComponent {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private domeGroup: THREE.Group | null = null;
  private domeMesh: THREE.Mesh | null = null;
  private wireframe: LineSegments2 | null = null;
  private edgeMaterial: LineMaterial | null = null;
  private edgePositions: Float32Array | null = null;
  private animationId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private scrollHandler: (() => void) | null = null;

  private originalMeshPositions: Float32Array | null = null;
  private originalEdgePositions: Float32Array | null = null;
  private faceData: FaceData[] = [];

  // Spring-inertia state
  private targetExplosion = 0;
  private currentExplosion = 0;
  private targetRotation = 0;
  private currentRotation = 0;
  private velocityExplosion = 0;
  private velocityRotation = 0;

  constructor(container: HTMLElement) {
    this.container = container;
    const rect = container.getBoundingClientRect();
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      rect.width / rect.height,
      0.1,
      1000,
    );
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.init();
    // Compile shaders off the main thread where the driver supports it
    // (KHR_parallel_shader_compile) instead of blocking on the first frame.
    this.renderer
      .compileAsync(this.scene, this.camera)
      .catch(() => undefined)
      .then(() => this.requestRender());
  }

  private init(): void {
    const rect = this.container.getBoundingClientRect();
    this.camera.position.set(0, 0, 7.5);
    // Linear fog to the page background (always black) so faces and edges
    // fade with distance. Camera sits at z=7.5, so the front of the sphere is
    // ~4.5 away, the middle plane 7.5 and the back ~10.5 (up to 12 exploded).
    // Starting well in front of the sphere puts the front face at ~15%, the
    // middle plane at ~40% and the back at ~65%, a gentle overall gradient.
    this.scene.fog = new THREE.Fog(0x000000, 3, 14.5);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0.0);
    this.renderer.setSize(rect.width, rect.height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x111111, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(12, 10, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024);
    directionalLight.shadow.radius = 10;
    this.scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
    pointLight.position.set(-5, 5, -5);
    this.scene.add(pointLight);

    this.createDome();
    this.setupScrollAnimation();

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.container);
  }

  private createDome(): void {
    if (this.domeGroup) {
      this.scene.remove(this.domeGroup);
      this.domeMesh?.geometry.dispose();
      this.wireframe?.geometry.dispose();
    }

    // subdivisions=2 → 162 dual faces: 12 pentagons + 150 hexagons
    const { meshPositions, edgePositions, faceData } = buildGeodesicPolyhedron(
      3,
      2,
    );

    this.originalMeshPositions = new Float32Array(meshPositions);
    this.originalEdgePositions = new Float32Array(edgePositions);
    this.faceData = faceData;

    // Solid mesh
    const meshGeometry = new THREE.BufferGeometry();
    meshGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(meshPositions), 3),
    );
    meshGeometry.computeVertexNormals();

    const meshMaterial = new THREE.MeshPhongMaterial({
      color: 0x444444,
      side: THREE.DoubleSide,
      // Push faces back in depth so the coplanar edge lines win the depth
      // test cleanly instead of z-fighting with the surface.
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
      fog: true,
    });

    this.domeMesh = new THREE.Mesh(meshGeometry, meshMaterial);
    this.domeMesh.castShadow = true;
    this.domeMesh.receiveShadow = true;

    // Wireframe showing only pentagon/hexagon polygon edges (not triangulation edges)
    // Drawn with the fat-lines addon: each segment becomes a screen-space
    // quad, so MSAA applies (raw GL_LINES are not antialiased on most
    // browsers) and the width is in CSS pixels instead of 1 device pixel.
    this.edgePositions = new Float32Array(edgePositions);
    const edgeGeometry = new LineSegmentsGeometry();
    edgeGeometry.setPositions(this.edgePositions);
    const rect = this.container.getBoundingClientRect();
    this.edgeMaterial = new LineMaterial({
      color: 0x05df72,
      linewidth: 1.5,
      fog: true,
      resolution: new THREE.Vector2(rect.width, rect.height),
    });
    this.wireframe = new LineSegments2(edgeGeometry, this.edgeMaterial);

    this.domeGroup = new THREE.Group();
    this.domeGroup.add(this.domeMesh);
    this.domeGroup.add(this.wireframe);
    this.scene.add(this.domeGroup);
  }

  private explodeGeometry(amount: number): void {
    if (
      !this.domeMesh ||
      !this.wireframe ||
      !this.originalMeshPositions ||
      !this.originalEdgePositions ||
      !this.edgePositions
    )
      return;

    const meshPos = this.domeMesh.geometry.attributes.position
      .array as Float32Array;
    const edgePos = this.edgePositions;

    // Reset to original positions
    meshPos.set(this.originalMeshPositions);
    edgePos.set(this.originalEdgePositions);

    // Displace each pentagon/hexagon face along its outward normal
    for (const { normal, meshStart, meshCount, edgeStart, edgeCount } of this
      .faceData) {
      const dx = normal.x * amount;
      const dy = normal.y * amount;
      const dz = normal.z * amount;

      for (let i = meshStart; i < meshStart + meshCount; i += 3) {
        meshPos[i] += dx;
        meshPos[i + 1] += dy;
        meshPos[i + 2] += dz;
      }
      for (let i = edgeStart; i < edgeStart + edgeCount; i += 3) {
        edgePos[i] += dx;
        edgePos[i + 1] += dy;
        edgePos[i + 2] += dz;
      }
    }

    this.domeMesh.geometry.attributes.position.needsUpdate = true;
    this.domeMesh.geometry.computeVertexNormals();
    // LineSegmentsGeometry stores instanced start/end attributes, so the
    // buffer is re-uploaded rather than flagged with needsUpdate.
    this.wireframe.geometry.setPositions(edgePos);
  }

  private onResize(): void {
    const rect = this.container.getBoundingClientRect();
    this.camera.aspect = rect.width / rect.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(rect.width, rect.height);
    this.edgeMaterial?.resolution.set(rect.width, rect.height);
    this.requestRender();
  }

  private setupScrollAnimation(): void {
    this.scrollHandler = () => {
      const rect = this.container.getBoundingClientRect();
      const windowHeight =
        window.innerHeight || document.documentElement.clientHeight;
      // percent: 0 when dome top is at viewport bottom, 1 when dome bottom is at viewport top
      let percent = 1 - Math.max(0, Math.min(rect.bottom / windowHeight, 1));
      // 1.5 keeps the fully exploded sphere (radius 3 + 1.5) inside the 75°
      // vertical frustum at camera distance 7.5, so nothing gets clipped.
      this.targetExplosion = percent * 1.5;
      this.targetRotation = percent * Math.PI;
      this.requestRender();
    };
    window.addEventListener("scroll", this.scrollHandler, { passive: true });
    // Sync with the current scroll position before the first frame.
    this.scrollHandler();
  }

  // Render on demand: the loop keeps running only while the spring is still
  // moving. Once it settles the loop stops, and any change to the targets
  // (scroll, resize) wakes it up again via requestRender().
  private requestRender(): void {
    if (this.animationId === null) {
      this.animationId = requestAnimationFrame(() => this.animate());
    }
  }

  private animate(): void {
    this.animationId = null;

    const spring = 0.005;
    const damping = 0.9;

    this.velocityExplosion =
      this.velocityExplosion * damping +
      (this.targetExplosion - this.currentExplosion) * spring;
    this.currentExplosion += this.velocityExplosion;

    this.velocityRotation =
      this.velocityRotation * damping +
      (this.targetRotation - this.currentRotation) * spring;
    this.currentRotation += this.velocityRotation;

    if (this.domeGroup) {
      this.domeGroup.rotation.y = this.currentRotation;
    }

    this.explodeGeometry(this.currentExplosion);
    this.renderer.render(this.scene, this.camera);

    const settled =
      Math.abs(this.velocityExplosion) < 1e-4 &&
      Math.abs(this.velocityRotation) < 1e-4 &&
      Math.abs(this.targetExplosion - this.currentExplosion) < 1e-3 &&
      Math.abs(this.targetRotation - this.currentRotation) < 1e-3;

    if (!settled) this.requestRender();
  }

  public dispose(): void {
    if (this.animationId !== null) cancelAnimationFrame(this.animationId);
    this.animationId = null;
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.scrollHandler)
      window.removeEventListener("scroll", this.scrollHandler);
    this.edgeMaterial?.dispose();
    if (this.renderer) this.renderer.dispose();
  }
}

// ── Bootstrap ──
// Track the active instance so we can dispose it before navigating away.
let activeInstance: GeodesicDomeComponent | null = null;

export function initGeodesicDome(container: HTMLElement): void {
  disposeGeodesicDome();
  activeInstance = new GeodesicDomeComponent(container);
}

export function disposeGeodesicDome(): void {
  if (activeInstance) {
    activeInstance.dispose();
    activeInstance = null;
  }
}
