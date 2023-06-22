# 도망쳐! 🦊🐰

<p align="center">
  <img src="https://github.com/GitHWS/three.js-toys/assets/96808980/4c6b3243-31d9-4c00-b2d8-2456653524f8" alt="도망쳐!">
</p>

카메라 위치 이동을 이용한 애니메이션입니다.

데모 : [run-away-three.vercel.app](https://run-away-three.vercel.app/)

## 구현 기능 🛠️

```
1. 페이지 로드 시 카메라 애니메이션 재생(GreenSock 사용)
2. 3D 모델 애니메이션 재생(AnimationMixer 사용)
3. 3D 모델 그림자 설정
```

## 구현 화면

<p align="center">
  <img src="https://github.com/GitHWS/three.js-toys/assets/96808980/d9eab8ea-8503-4015-8446-862132eb9822" alt="구현 동작">
</p>

## 기능 설명

- **페이지 로드 시 카메라 애니메이션 재생**

```js
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
```

JavaScript 애니메이션 라이브러리 `GreenSock(gsap)`를 사용해서 페이지가 로드될 때 카메라가 이동하는 것을 구현했습니다.

GreenSock 라이브러리의 `timeline`을 사용하여 카메라의 이동을 순차적으로 자연스럽게 연결되도록 했습니다.

애니메이션 중 카메라의 시점이 항상 (0,0,0) 좌표를 바라보게 설정했습니다.

<br/>

- **3D 모델 애니메이션 재생**

```js
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
```

3D 모델인 여우와 토끼의 애니메이션을 재생하도록 설정했습니다.

각각의 모델의 `AnimationMixer`를 통해 모델의 `ClipAction`을 가져와 특정 애니메이션을 재생하였습니다.

```js
// Models Animation Update
const tick = () => {
  //...

  if (fox1Mixer && fox2Mixer && fox3Mixer) {
    fox1Mixer.update(deltaTime * 2);
    fox2Mixer.update(deltaTime * 3.5);
    fox3Mixer.update(deltaTime * 3);
  }

  //...
};
```

`tick` 함수에서 3D 모델의 `AnimationMixer`가 로드될 때까지 확인하여 해당 조건문이 `true`가 된다면 모델을 대상으로 애니메이션 동작을 업데이트합니다.

<br/>

- **3D 모델 그림자 설정**

```js
// Light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.normalBias = 0.05;
scene.add(directionalLight);
```

햇빛 효과를 주기위해 `DirectionalLight`를 사용하였고 이 Light의 영향으로 그림자를 생성하기 위해 `castShadow`를 활성화했습니다.

모든 모델의 그림자의 품질을 올리기 위해 `LightShadow`의 `mapSize`를 크게 설정했습니다.

또한 `normalBias`를 일정 수치를 설정하여 그림자가 흩어지는 효과를 조절했습니다.

```js
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

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 500),
  new THREE.MeshStandardMaterial({ color: 0x036635 })
);
floor.rotation.x = THREE.MathUtils.degToRad(-90);
floor.position.y = -0.6;
floor.receiveShadow = true;
scene.add(floor);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.shadowMap.enabled = true;
```

그림자를 렌더링하기 위해 renderer의 shadowMap 사용을 활성화했습니다.

각 모델에 대한 그림자를 생성하고 모델의 그림자를 `floor`(Mesh) 위에 표현하기 위해 `receiveShadow`를 활성화했습니다.

`updateAllMaterials` 함수를 생성하고 호출하여 `Scene` 내 모든 자식 요소를 순회(traverse 메서드)하여 `Mesh` 인스턴스인 동시에 Material이 `MeshStandardMaterial` 인스턴스인 자식 요소에게만 그림자를 활성화하였습니다.

<br/>
