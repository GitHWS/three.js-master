import './style.css';
import * as THREE from 'three';
import gsap from 'gsap';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader';

const canvas = document.getElementById('webgl');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x00c9d9);

// Setting Model Shadows in Scene
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      child.material.needsUpdate = true;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};

// Resize Event
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

// Light
const auxLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(auxLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.x = 5;
directionalLight.position.y = 10;
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.normalBias = 0.05;
scene.add(directionalLight);

// Camera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 4);
scene.add(camera);

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 500),
  new THREE.MeshStandardMaterial({ color: 0x036635 })
);
floor.rotation.x = THREE.MathUtils.degToRad(-90);
floor.position.y = -0.6;
floor.receiveShadow = true;
scene.add(floor);

// Models
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// Fox
let foxGroup;
let fox1Mixer;
let fox2Mixer;
let fox3Mixer;

gltfLoader.load('/models/Fox/glTF/Fox.gltf', (gltf) => {
  let fox1, fox2, fox3;

  const foxModel = gltf.scene;

  fox1 = foxModel;
  fox2 = SkeletonUtils.clone(foxModel);
  fox3 = SkeletonUtils.clone(foxModel);

  fox1.position.set(0, 0, 0);
  fox1.scale.set(0.015, 0.015, 0.015);

  fox2.position.set(-0.6, 0, -0.5);
  fox2.scale.set(0.008, 0.008, 0.008);

  fox3.position.set(0.6, 0, -0.4);
  fox3.scale.set(0.01, 0.01, 0.01);

  // Foxs group
  const foxs = new THREE.Group();
  foxGroup = foxs;
  foxs.rotation.y = THREE.MathUtils.degToRad(90);
  foxs.position.set(-3, -0.5, 0);
  foxs.add(fox1, fox2, fox3);

  scene.add(foxs);

  // Fox Animation
  fox1Mixer = new THREE.AnimationMixer(fox1);
  fox2Mixer = new THREE.AnimationMixer(fox2);
  fox3Mixer = new THREE.AnimationMixer(fox3);

  const clips = gltf.animations;
  const clip = THREE.AnimationClip.findByName(clips, 'Run');

  const fox1Action = fox1Mixer.clipAction(clip);
  const fox2Action = fox2Mixer.clipAction(clip);
  const fox3Action = fox3Mixer.clipAction(clip);

  fox1Action.play();
  fox1Action.timeScale = 0.5;

  fox2Action.play();
  fox2Action.startAt(0.3);
  fox2Action.timeScale = 0.6;

  fox3Action.play();
  fox2Action.startAt(0.45);
  fox3Action.timeScale = 0.7;

  updateAllMaterials();
});

// Rabbit
let rabbit;
let rabbitMixer;

gltfLoader.load('/models/Rabbit/glTF/scene.gltf', (gltf) => {
  rabbit = gltf.scene;
  rabbit.scale.set(0.2, 0.2, 0.2);
  rabbit.position.y = -0.6;
  rabbit.rotation.y = THREE.MathUtils.degToRad(90);
  scene.add(rabbit);

  // Rabbit Animation
  rabbitMixer = new THREE.AnimationMixer(rabbit);
  const clips = gltf.animations;
  console.log(clips);
  const clip = THREE.AnimationClip.findByName(clips, 'Armature.001|Run');

  const rabbitAction = rabbitMixer.clipAction(clip);
  rabbitAction.play();
  rabbitAction.timeScale = 0.5;
});

const timeline = gsap.timeline();
const duration = 3;
const ease = 'none';
let animationIsFinshed = false;

const cameraAnimation = () => {
  if (!animationIsFinshed) {
    animationIsFinshed = true;

    // Camera Move
    timeline
      .to(camera.position, {
        x: 4,
        duration,
        ease,
        onUpdate: () => {
          camera.lookAt(0, 0, 0);
        },
      })
      .to(camera.position, {
        x: 6,
        duration,
        ease,
        onUpdate: () => {
          camera.lookAt(0, 0, 0);
        },
      })
      .to(camera.position, {
        y: 8,
        z: 5,
        duration,
        ease,
        onUpdate: () => {
          camera.lookAt(0, 0, 0);
        },
      });
  }
};

// Load Event
window.addEventListener('load', cameraAnimation);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(sizes.width, sizes.height);

// Tick
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Models Animation Update
  if (fox1Mixer && fox2Mixer && fox3Mixer) {
    fox1Mixer.update(deltaTime * 2);
    fox2Mixer.update(deltaTime * 3.5);
    fox3Mixer.update(deltaTime * 3);
  }

  if (rabbitMixer) {
    rabbitMixer.update(deltaTime * 4);
  }

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
