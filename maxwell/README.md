# 춤추는 맥스웰 고양이 😸

<p align="center">
  <img src="https://github.com/GitHWS/three.js-toys/assets/96808980/c9012975-cf73-499d-bc68-cf695a7e779a" alt="춤추는 맥스웰 고양이">
</p>

**외국 밈**인 맥스웰 고양이(Maxwell Cat)을 춤추게 만드는 토이프로젝트입니다.

데모 : https://three-js-toys.vercel.app/

## 구현 기능 🛠️

```
1. 사용자 마우스 액션으로 카메라 시점 변경(OrbitControls)
2. 버튼 클릭으로 BGM 재생
3. BGM 재생 시 오브젝트 동작
```

## 구현 화면

<p align="center">
  <img src="https://github.com/GitHWS/three.js-toys/assets/96808980/66c39b6f-d4de-47d6-830a-43fe18ee6b11" alt="구현 동작">
</p>

## 기능 설명

- **OrbitControls을 이용한 카메라 시점 변경**

```js
import { OrbitControls } from 'three/addons/controls/OrbitControls';

const controls = new OrbitControls(camera, canvas);
// 자연스러운 시점 변경
controls.enableDamping = true;
// 스크롤 거리 제한
controls.minDistance = 6;
controls.maxDistance = 10;
```

`OrbitControls`을 이용하여 사용자 마우스 액션(드래그, 스크롤) 등에 따라 카메라의 시점을 변경할 수 있습니다.

그 외 `OrbitControls` 옵션을 적용하여 최소/최대 스크롤 거리(`minDistance`, `maxDistance`)를 제한하고, 자연스러운 카메라 시점 변경(`enableDamping`)을 적용했습니다.

<br/>

- **BGM 재생 및 리셋**

```html
<body>
  <canvas id="canvas"></canvas>
  <button class="music-button">🔇</button>
  <script type="module" src="/main.js"></script>
</body>
```

```js
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
```

HTML `button` 태그를 사용하여 BGM의 재생을 컨트롤할 수 있습니다.

BGM 재생 상태에 따라 🔉/🔇 이모지로 변경되도록 하였으며 BGM 재생 중 버튼을 클릭한 경우 재생을 중단하고 BGM의 시작을 처음으로 되돌릴 수 있습니다.

<br/>

- **BGM 재생에 따른 오브젝트 동작**

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';

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
```

`GLTFLoader`를 사용하여 3D 모델 파일(.glb)을 로드하였습니다.

```js
// 춤추는 맥스웰 고양이 animation
if (maxwell) {
  if (bgmStatus) {
    maxwell.rotation.z = Math.sin(Date.now() * 0.007) * 0.7;
  } else {
    maxwell.rotation.z = 0;
  }
}
```

3D 모델을 로드하는 과정은 비동기적으로 처리가 되기 때문에 `maxwell`을 확인합니다.

3D 모델이 정상적으로 로드되었다면 `bgmStatus`를 확인했을 때 재생(true)일 때, z축을 기준으로 회전하도록 합니다.
`Math.sin()`을 사용하여 양쪽 방향으로 동작을 회전을 반복하게 합니다.

<br/>

- **텍스쳐 적용**

```js
// 텍스쳐 로드
const textureLoader = new THREE.TextureLoader();
const milkywayTexture = textureLoader.load('/textures/milky_way.png');

// 은하수 Geometry, Material
const milkywayGeometry = new THREE.PlaneGeometry(50, 50);
const milkywayMaterial = new THREE.MeshStandardMaterial({
  transparent: true,
  opacity: 0.4,
  alphaMap: milkywayTexture,
  side: THREE.DoubleSide,
});

// 은하수 Object
const milkyway = new THREE.Mesh(milkywayGeometry, milkywayMaterial);
milkyway.position.set(0, -10, 0);
milkyway.rotation.set(-2, 0, 0);

scene.add(milkyway);
```

`TextureLoader`를 사용하여 텍스쳐 파일을 로드 후 적용합니다.
