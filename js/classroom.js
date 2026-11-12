import * as THREE from 'three';
import { todaysLesson } from '../data/lessons.js';

export function buildClassroom(scene) {
  const group = new THREE.Group();
  scene.add(group);

  // 재질
  const mFloor = new THREE.MeshStandardMaterial({ color: 0x98aab8, roughness: 0.6 });
  const mWall = new THREE.MeshStandardMaterial({ color: 0xded8cc, roughness: 0.8 });
  const mWood = new THREE.MeshStandardMaterial({ color: 0xa67449, roughness: 0.5 });
  const mDesk = new THREE.MeshStandardMaterial({ color: 0xb88858, roughness: 0.4 });
  const mLeg = new THREE.MeshStandardMaterial({ color: 0x3d4447, metalness: 0.5, roughness: 0.5 });
  const mBoard = new THREE.MeshStandardMaterial({ color: 0x1f4738, roughness: 0.6 });
  const mBoardFrame = new THREE.MeshStandardMaterial({ color: 0x8c9491, metalness: 0.6, roughness: 0.4 });

  // 조명
  const ambient = new THREE.AmbientLight(0xffffff, 0.75);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xfffaed, 1.1);
  sun.position.set(5, 8, 4);
  sun.castShadow = true;
  scene.add(sun);

  const W = 10, H = 3.4, D = 11;

  // 바닥/천장/벽
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mFloor);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mWall);
  ceil.position.y = H;
  ceil.rotation.x = Math.PI / 2;
  group.add(ceil);

  const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(W, H), mWall);
  frontWall.position.set(0, H / 2, -D / 2);
  group.add(frontWall);

  const backWall = frontWall.clone();
  backWall.position.set(0, H / 2, D / 2);
  backWall.rotation.y = Math.PI;
  group.add(backWall);

  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(D, H), mWall);
  leftWall.position.set(-W / 2, H / 2, 0);
  leftWall.rotation.y = Math.PI / 2;
  group.add(leftWall);

  const rightWall = leftWall.clone();
  rightWall.position.set(W / 2, H / 2, 0);
  rightWall.rotation.y = -Math.PI / 2;
  group.add(rightWall);

  // 칠판
  const bW = 5.2, bH = 1.6;
  const boardGroup = new THREE.Group();
  boardGroup.position.set(0, 1.7, -D / 2 + 0.05);

  const boardFrame = new THREE.Mesh(new THREE.BoxGeometry(bW + 0.12, bH + 0.12, 0.04), mBoardFrame);
  const boardFace = new THREE.Mesh(new THREE.BoxGeometry(bW, bH, 0.05), mBoard);
  boardGroup.add(boardFrame, boardFace);

  const tex = makeBlackboardTexture(todaysLesson.title, todaysLesson.sentences);
  const boardTextMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
  const boardText = new THREE.Mesh(new THREE.PlaneGeometry(bW - 0.2, bH - 0.2), boardTextMat);
  boardText.position.z = 0.03;
  boardGroup.add(boardText);

  boardFace.userData = {
    type: 'lesson',
    hintJa: '黒板 (こくばん)',
    hintKo: '칠판 · 학습 시작',
  };
  group.add(boardGroup);

  // 교탁
  const pod = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 0.7), mWood);
  pod.position.set(0, 0.5, -D / 2 + 1.4);
  group.add(pod);

  // 책상/의자
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const x = -2.2 + c * 2.2;
      const z = -1.8 + r * 2.2;
      const desk = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.72, 0.6), mDesk);
      desk.position.set(x, 0.36, z);
      group.add(desk);

      const chair = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.44, 0.45), mWood);
      chair.position.set(x, 0.22, z + 0.55);
      group.add(chair);
    }
  }

  // 교실 단어 물건
  spawnProp(group, {
    geo: new THREE.BoxGeometry(0.35, 0.04, 0.26),
    mat: new THREE.MeshStandardMaterial({ color: 0x305580 }),
    pos: [0, 1.03, -D / 2 + 1.4],
    wordId: 'book',
    hintJa: '本 (ほん)',
    hintKo: '책',
  });

  spawnProp(group, {
    geo: new THREE.CylinderGeometry(0.01, 0.01, 0.2),
    mat: new THREE.MeshStandardMaterial({ color: 0xcc3333 }),
    pos: [0.25, 1.05, -D / 2 + 1.35],
    rot: [0, 0, Math.PI / 2], // 수정된 오타 지점
    wordId: 'pen',
    hintJa: 'ペン',
    hintKo: '펜',
  });

  const bounds = { minX: -W / 2 + 0.4, maxX: W / 2 - 0.4, minZ: -D / 2 + 0.4, maxZ: D / 2 - 0.4 };
  const spawn = { x: 0, z: D / 2 - 1.8 };

  return { group, bounds, spawn };
}

function spawnProp(parent, { geo, mat, pos, rot, wordId, hintJa, hintKo }) {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(...pos);
  if (rot) mesh.rotation.set(...rot);
  mesh.userData = { type: 'word', wordId, hintJa, hintKo };
  parent.add(mesh);
}

function makeBlackboardTexture(title, sentences) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#1f4738';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f0f5f2';
  ctx.font = 'bold 38px sans-serif';
  ctx.fillText('日本語教室 — ' + title, 40, 60);

  let y = 140;
  sentences.forEach((s, idx) => {
    ctx.fillStyle = '#ffd966';
    ctx.font = '28px sans-serif';
    ctx.fillText(`${idx + 1}. ${s.ja}`, 40, y);
    y += 75;
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}