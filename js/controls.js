// ============================================================
// 이동과 시점 조작
//  - 마우스 시점: Three.js 제공 PointerLockControls 사용
//  - WASD 이동: 직접 계산 (벽과 책상에 부딪히는 간단한 충돌 포함)
// ============================================================

import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export class PlayerControls {
  /**
   * @param camera     플레이어의 눈 역할을 하는 카메라
   * @param domElement 마우스를 붙잡을 요소 (캔버스)
   * @param world      { bounds, obstacles } 이동 가능 범위와 부딪히는 물건들
   */
  constructor(camera, domElement, world) {
    this.camera = camera;
    this.controls = new PointerLockControls(camera, domElement);
    this.bounds = world.bounds;
    this.obstacles = world.obstacles;

    this.speed = 3.0;   // 걷는 속도 (미터/초)
    this.radius = 0.3;  // 플레이어 몸 반지름 (벽에서 이만큼 떨어짐)
    this.keys = {};

    this._forward = new THREE.Vector3();
    this._right = new THREE.Vector3();
    this._move = new THREE.Vector3();

    // e.code는 "물리적 키 위치"라서 한글 자판 상태에서도 WASD가 동작합니다.
    window.addEventListener('keydown', (e) => { this.keys[e.code] = true; });
    window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    window.addEventListener('blur', () => this.clearKeys());
    this.controls.addEventListener('unlock', () => this.clearKeys());
  }

  get isLocked() { return this.controls.isLocked; }
  lock() { this.controls.lock(); }
  unlock() { this.controls.unlock(); }
  clearKeys() { this.keys = {}; }

  // 이 좌표로 가면 벽이나 가구에 부딪히는가?
  isBlocked(x, z) {
    const r = this.radius;
    const b = this.bounds;
    if (x < b.minX + r || x > b.maxX - r || z < b.minZ + r || z > b.maxZ - r) return true;

    return this.obstacles.some((o) =>
      x > o.minX - r && x < o.maxX + r && z > o.minZ - r && z < o.maxZ + r
    );
  }

  // 매 프레임 호출. delta = 지난 프레임 이후 흐른 시간(초)
  update(delta) {
    if (!this.isLocked) return;

    const k = this.keys;
    const forward = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0);
    const right = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0);
    if (forward === 0 && right === 0) return;

    // 카메라가 보는 방향을 바닥 평면(y=0)으로 눌러서 "앞"과 "오른쪽"을 구합니다.
    this.camera.getWorldDirection(this._forward);
    this._forward.y = 0;
    this._forward.normalize();
    this._right.set(-this._forward.z, 0, this._forward.x);

    this._move.set(0, 0, 0)
      .addScaledVector(this._forward, forward)
      .addScaledVector(this._right, right);
    if (this._move.lengthSq() > 0) this._move.normalize();

    const run = k.ShiftLeft || k.ShiftRight ? 1.7 : 1;
    const distance = this.speed * run * delta;
    const pos = this.camera.position;

    // x와 z를 따로 검사하면 벽에 닿아도 옆으로 미끄러져 이동할 수 있어요.
    const nextX = pos.x + this._move.x * distance;
    if (!this.isBlocked(nextX, pos.z)) pos.x = nextX;
    const nextZ = pos.z + this._move.z * distance;
    if (!this.isBlocked(pos.x, nextZ)) pos.z = nextZ;
  }
}
