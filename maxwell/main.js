import * as THREE from 'three';
import { AdditiveBlending } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';

// Canvas
const canvas = document.getElementById('canvas');

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 3, 10);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

renderer.setClearColor(0x111111);
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.minDistance = 6;
controls.maxDistance = 10;

// Light
const auxLight = new THREE.AmbientLight(0xffffff, 0.5);
auxLight.position.set(0, 5, 0);
scene.add(auxLight);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(-1, 5, 0);
light.target.position.set(0, 0, 0);
scene.add(light);
scene.add(light.target);

// BGM
const bgm = new Audio('/bgm/Maxwell-the-Cat-Theme.mp3');
const bgmButton = document.querySelector('.music-button');
// bgm 재생 여부
let bgmStatus = false;

// bgm이 종료 시 발생하는 이벤트
bgm.addEventListener('ended', () => {
  bgmButton.classList.remove('active');
  bgmButton.textContent = '🔇';
});

//
let currentTime;
bgm.addEventListener('timeupdate', () => {
  currentTime = bgm.currentTime;
  console.log(currentTime);
});

// bgm 버튼 클릭 시 재생/중단 이벤트
bgmButton.addEventListener('click', (event) => {
  bgmButton.classList.toggle('active');

  if (bgmButton.classList.contains('active')) {
    bgmStatus = true;
    event.target.textContent = '🔉';
    bgm.play();
  } else {
    bgmStatus = false;
    event.target.textContent = '🔇';
    bgm.pause();
    bgm.currentTime = 0;
  }
});

// Texture Loader
const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load('/textures/star.png');
const milkywayTexture = textureLoader.load('/textures/milky_way.png');

// Model Loader
const loader = new GLTFLoader();

let maxwell;

loader.load(
  '/models/maxwell.glb',
  (gltf) => {
    maxwell = gltf.scene;

    scene.add(maxwell);
  },
  undefined,
  (error) => {
    console.error(error);
  }
);

// Particle
const particlesCount = 4000;
const particlesPos = new Float32Array(particlesCount * 3);

const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(particlesPos, 3)
);

const particleMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  sizeAttenuation: true,
  size: 0.5,
  transparent: true,
  depthWrite: true,
  alphaMap: particleTexture,
  blending: THREE.AdditiveBlending,
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

for (let i = 0; i < particlesCount; i++) {
  particlesPos[i * 3] = THREE.MathUtils.randFloat(-30, 30);
  particlesPos[i * 3 + 1] = THREE.MathUtils.randFloat(-30, 30) + 2;
  particlesPos[i * 3 + 2] = THREE.MathUtils.randFloat(-100, 100);
}

// Milkyway
const milkywayGeometry = new THREE.PlaneGeometry(50, 50);
const milkywayMaterial = new THREE.MeshStandardMaterial({
  transparent: true,
  opacity: 0.5,
  alphaMap: milkywayTexture,
  depthWrite: true,
  blending: AdditiveBlending,
  side: THREE.DoubleSide,
});

const milkyway = new THREE.Mesh(milkywayGeometry, milkywayMaterial);
milkyway.position.set(0, -10, 0);
milkyway.rotation.set(-2, 0, 0);

scene.add(milkyway);

// Animation
const animate = () => {
  requestAnimationFrame(animate);

  controls.update();

  // 춤추는 maxwell
  if (maxwell) {
    if (bgmStatus) {
      maxwell.rotation.z = Math.sin(Date.now() * 0.007) * 0.7;
    } else {
      maxwell.rotation.z = 0;
    }
  }

  // Particle y축 회전
  particles.rotation.y += 0.0002;
  milkyway.rotation.z += 0.0005;

  renderer.render(scene, camera);
};

animate();

// Grid-Helper
const size = 10;
const divisions = 10;

const gridHelper = new THREE.GridHelper(size, divisions);
scene.add(gridHelper);
