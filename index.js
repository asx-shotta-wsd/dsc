import * as THREE from 'https://cdn.skypack.dev/three';
import { GLTFLoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer, cube;
let isDragging = false;
let previousTouch = { x: 0, y: 0 };
let previousMousePosition = { x: 0, y: 0 };
let models = [];

function init() {
  // シーンの作成
  scene = new THREE.Scene();

  // カメラの設定
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  // レンダラーの作成
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xffffff); // 背景をグレーに

  // if (document.body.querySelector('canvas')) {
  //   // 既存のcanvasタグを削除
  //   const existingCanvas = document.body.querySelector('canvas');
  //   existingCanvas.remove();
  // }

  document.body.appendChild(renderer.domElement);

  // const light = new THREE.DirectionalLight(0xffffff, 1);
  // light.position.set(0, 1, 1);
  // scene.add(light);

  // // 環境光も追加
  // const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  // scene.add(ambientLight);

  // 環境光を強化
  // const ambientLight = new THREE.AmbientLight(0xffffff, 3.0); // 強さを1.0に設定
  // scene.add(ambientLight);

  // 方向光を強化
  // const directionalLight = new THREE.DirectionalLight(0xffffff, 5); // 強さを2に設定
  // directionalLight.position.set(0, 1, 1).normalize(); // 光源の位置
  // scene.add(directionalLight);

  // GLTFモデルの読み込み
  const loader = new GLTFLoader();
  // const url = 'assets/3d/sneakers/scene.gltf';
  // camera.position.set(0, 0.1, 0.5); // 少し高めに配置

  // const url = 'assets/3d/cake/scene.gltf';
  // camera.position.set(0, 0.1, 0.3); // 少し高めに配置

  // const url = 'assets/3d/cake2/scene.gltf';
  // camera.position.set(0, 0, 0.4); // 少し高めに配置

  const url = 'assets/3d/cake3/scene.gltf';
  camera.position.set(0, -3, 15); // 少し高めに配置
  camera.rotation.set(-0.3, 0, 0);

  loader.load(url, function (gltf) {
    console.log('GLTF Loaded:', gltf.scene);
    cube = gltf.scene; // cube を GLTFモデルに置き換え

    // cube.scale.set(1, 1, 1); // モデルのサイズ調整
    // cube.scale.set(3, 3, 3); // モデルのサイズ調整
    cube.scale.set(0.15, 0.15, 0.15); // モデルのサイズ調整

    // モデル内の全てのメッシュを検索
    cube.traverse((child) => {
      if (child.isMesh) {
        // 元のマテリアルを変更しないように、プロパティのみ調整
        const material = child.material;

        if (material instanceof THREE.MeshStandardMaterial) {
          material.metalness = 1.0; // 反射率を強調
          material.roughness = 0.2;  // 粗さを調整
        }
      }
    });

    scene.add(cube);

    // モデルごとの回転軸を設定
    models.push({
      model: cube,
      rotationAxis: new THREE.Vector3(0, 1, 0), // 初期回転軸はY軸
      previousTouch: { x: 0, y: 0 }
    });
  }, undefined, function (error) {
    console.error('GLTFモデルの読み込みに失敗:', error);
  });

  // 立方体の作成
  // const geometry = new THREE.BoxGeometry();
  // const material = new THREE.MeshBasicMaterial({ color: 0x0077ff, wireframe: true });
  // cube = new THREE.Mesh(geometry, material);
  // scene.add(cube);

  // タッチイベントの設定
  renderer.domElement.addEventListener('touchstart', onTouchStart, false);
  renderer.domElement.addEventListener('touchmove', onTouchMove, false);
  renderer.domElement.addEventListener('touchend', () => { isDragging = false; }, false);
  // マウスイベント (PC用)
  renderer.domElement.addEventListener('mousedown', onMouseDown, false);
  renderer.domElement.addEventListener('mousemove', onMouseMove, false);
  renderer.domElement.addEventListener('mouseup', () => { isDragging = false; }, false);
  animate();
}
function onTouchStart(event) {
  if (event.touches.length === 1) {
    isDragging = true;
    previousTouch.x = event.touches[0].clientX;
    previousTouch.y = event.touches[0].clientY;

    // 回転軸をタッチ位置に基づいて変更
    const touchPos = new THREE.Vector2(
      (event.touches[0].clientX / window.innerWidth) * 2 - 1,
      -(event.touches[0].clientY / window.innerHeight) * 2 + 1
    );
    const touchVector = new THREE.Vector3(touchPos.x, touchPos.y, 0.5); // 中心から放射されたベクトル
    // models[0].rotationAxis = touchVector.normalize(); // タッチ位置に基づいて回転軸を設定
  }
}

function onTouchMove(event) {
  if (isDragging && event.touches.length === 1) {
    const deltaX = event.touches[0].clientX - previousTouch.x;
    const deltaY = event.touches[0].clientY - previousTouch.y;

    // 回転軸に沿ってモデルを回転
    models.forEach(item => {
      item.model.rotateOnAxis(item.rotationAxis, deltaX * 0.01); // 左右の回転
      item.model.rotateOnAxis(item.rotationAxis, deltaY * 0.01); // 上下の回転
    });

    // タッチ位置を更新
    previousTouch.x = event.touches[0].clientX;
    previousTouch.y = event.touches[0].clientY;
  }
}

// マウス押下時（ドラッグ開始）
function onMouseDown(event) {
  isDragging = true;
  previousMousePosition = { x: event.clientX, y: event.clientY };

  // マウス位置に基づいて回転軸を変更
  const mousePos = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );
  const mouseVector = new THREE.Vector3(mousePos.x, mousePos.y, 0.5); // 中心から放射されたベクトル
  // models[0].rotationAxis = mouseVector.normalize(); // マウス位置に基づいて回転軸を設定
}

// マウス移動時（ドラッグ中）
function onMouseMove(event) {
  if (!isDragging) return;

  const deltaX = event.clientX - previousMousePosition.x;
  const deltaY = event.clientY - previousMousePosition.y;

  // 回転軸に沿ってモデルを回転
  models.forEach(item => {
    item.model.rotateOnAxis(item.rotationAxis, deltaX * 0.01); // 左右の回転
    item.model.rotateOnAxis(item.rotationAxis, deltaY * 0.01); // 上下の回転
  });

  // マウス位置を更新
  previousMousePosition = { x: event.clientX, y: event.clientY };
}

function animate() {
  // requestAnimationFrame(animate);
  // renderer.render(scene, camera);

  requestAnimationFrame(animate);

  // モデルごとの回転
  models.forEach(item => {
    // 回転軸を使って回転を行う
    item.model.rotateOnAxis(item.rotationAxis, 0.005);  // 回転速度は0.01
  });

  renderer.render(scene, camera);
}

const fullscreenBtn = document.getElementById('fullscreen-btn');

// フルスクリーン切り替え
fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    // フルスクリーンにする
    const elem = document.documentElement; // `<html>` をフルスクリーン化
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { // Safari対応
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { // IE対応
      elem.msRequestFullscreen();
    }
    fullscreenBtn.textContent = "全画面解除"; // ボタンのテキスト変更
  } else {
    // フルスクリーン解除
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { // Safari対応
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // IE対応
      document.msExitFullscreen();
    }
    fullscreenBtn.textContent = "全画面"; // ボタンのテキスト変更
  }
});

// ウィンドウサイズ変更時にリサイズ処理
window.addEventListener('resize', () => {
  setCanvasSize();
});

// canvasサイズの設定
function setCanvasSize() {
  if (renderer) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
}

init();
