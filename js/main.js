import * as THREE from 'three';
import { buildClassroom } from './scenes/classroom.js';
import { PlayerControls } from './systems/controls.js';
import { Interaction } from './systems/interaction.js';
import { initSpeech } from './systems/speech.js';
import { UI } from './ui/ui.js';
import { todaysLesson } from './data/lessons.js';

async function start() {
  initSpeech();

  const canvas = document.getElementById('scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdde5e8);

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 50);

  const world = buildClassroom(scene);
  camera.position.set(world.spawn.x, 1.6, world.spawn.z);

  const player = new PlayerControls(camera, canvas, world);
  const ui = new UI();

  const interaction = new Interaction({
    camera,
    root: world.group,
    isActive: () => player.isLocked || !ui.isPanelOpen,
    onSelect: (target) => {
      if (target.type === 'lesson') {
        ui.openPanel();
        player.unlock();
      } else if (target.type === 'word') {
        ui.showWordCard(target.wordId);
      }
    },
  });

  player.controls.addEventListener('lock', () => {
    ui.hideOverlay();
    ui.showCrosshair(true);
  });

  player.controls.addEventListener('unlock', () => {
    ui.showCrosshair(false);
    if (!ui.isPanelOpen) ui.showOverlay('resume');
  });

  // 버튼 클릭 시 마우스 잠금 여부와 무관하게 무조건 화면을 지움
  ui.onEnter(() => {
    ui.hideOverlay();
    ui.showCrosshair(true);
    try {
      player.lock();
    } catch (e) {
      console.warn(e);
    }
  });

  ui.onPanelClose(() => {
    ui.closePanel();
    ui.hideOverlay();
    try {
      player.lock();
    } catch (e) {}
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

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
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = 'https://jxcjqzjywixzgaiqzymj.supabase.co'

const SUPABASE_KEY = '여기에_네_Publishable_Key'

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
)

console.log('Supabase 연결 준비 완료!')
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://jxcjqzjywixzgaiqzymj.supabase.co';
const SUPABASE_KEY = '여기에_네_Publishable_Key';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);