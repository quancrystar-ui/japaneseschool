// ============================================================
// 프로그램의 시작점
// 각 부품(장면, 이동, 클릭, UI, 음성)을 만들고 서로 연결합니다.
// 새 기능을 추가할 때 이 파일에서 "연결"만 해 주면 됩니다.
// ============================================================

import * as THREE from 'three';
import { buildClassroom } from './scenes/classroom.js';
import { PlayerControls } from './systems/controls.js';
import { Interaction } from './systems/interaction.js';
import { initSpeech } from './systems/speech.js';
import { UI } from './ui/ui.js';
import { todaysLesson } from './data/lessons.js';

// 칠판 글자를 그리기 전에 일본어 글꼴이 준비되도록 잠깐 기다립니다. (최대 2.5초)
async function waitForFonts() {
  const sample = todaysLesson.sentences.map((s) => s.ja).join('') + '今日の授業第課自己紹介月日曜クリックして学習スタートひらがな';
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load('400 48px "Noto Sans JP"', sample),
        document.fonts.load('700 48px "Noto Sans JP"', sample),
      ]),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]);
  } catch (error) {
    // 글꼴을 못 불러와도 시스템 글꼴로 계속 진행합니다.
  }
}

async function start() {
  await waitForFonts();
  initSpeech();

  // 1) 렌더러 / 장면 / 카메라
  const canvas = document.getElementById('scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdde5e8);

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 50);

  // 2) 교실 만들기 (나중에 다른 장소를 만들면 여기만 바꾸면 됩니다)
  const world = buildClassroom(scene);
  camera.position.set(world.spawn.x, 1.6, world.spawn.z); // 눈높이 1.6m, 앞(-z)을 바라봄

  // 3) 이동 / UI / 클릭
  const player = new PlayerControls(camera, canvas, world);
  const ui = new UI();

  const interaction = new Interaction({
    camera,
    root: world.group,
    // 마우스가 잠겼을 때뿐만 아니라 패널이 닫혀 있을 때도 상호작용 가능하도록 보완
    isActive: () => player.isLocked || !ui.isPanelOpen,
    onSelect: (target) => {
      if (target.type === 'lesson') {
        ui.openPanel();
        player.unlock(); // 마우스를 풀어 줘야 패널의 문장을 클릭할 수 있어요
      } else if (target.type === 'word') {
        ui.showWordCard(target.wordId);
      }
    },
  });

  // 마우스가 교실에 붙잡혔을 때 / 풀렸을 때
  player.controls.addEventListener('lock', () => {
    ui.hideOverlay();
    ui.showCrosshair(true);
  });

  player.controls.addEventListener('unlock', () => {
    ui.showCrosshair(false);
    if (!ui.isPanelOpen) ui.showOverlay('resume');
  });

  // 시작 화면 클릭 → 오버레이 즉시 숨기고 교실 입장
  ui.onEnter(() => {
    ui.hideOverlay(); // PointerLock 실패 시에도 화면 막힘 방지
    ui.showCrosshair(true);
    try {
      player.lock();
    } catch (err) {
      console.warn('PointerLock 제한 환경:', err);
    }
  });

  // 캔버스 직접 클릭 시 마우스 잠금이 풀려있다면 다시 잠금 시도
  canvas.addEventListener('click', () => {
    if (!player.isLocked && !ui.isPanelOpen) {
      ui.hideOverlay();
      try {
        player.lock();
      } catch (err) {
        // 무시
      }
    }
  });

  // 패널 닫기 버튼 → 다시 교실로
  ui.onPanelClose(() => {
    ui.closePanel();
    ui.hideOverlay();
    try {
      player.lock();
    } catch (err) {
      // 무시
    }
    // 브라우저가 바로 잠금을 허용하지 않으면 "계속하기" 화면을 보여 줍니다.
    setTimeout(() => {
      if (!player.isLocked) ui.showOverlay('resume');
    }, 300);
  });

  // 패널이 열린 상태에서 Esc → 패널 닫고 일시정지 화면
  window.addEventListener('keydown', (event) => {
    if (event.code === 'Escape' && ui.isPanelOpen) {
      ui.closePanel();
      ui.showOverlay('resume');
    }
  });

  // 창 크기가 바뀔 때
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // 4) 매 프레임 반복 (게임 루프)
  const timer = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const delta = Math.min(timer.getDelta(), 0.1);
    player.update(delta);
    ui.setHint(interaction.update());
    renderer.render(scene, camera);
  }
  animate();
}

start();