// ============================================================
// 클릭 상호작용
// 화면 정중앙(조준점)에서 앞으로 보이지 않는 광선(Raycaster)을 쏴서
// 처음 맞은 물건이 "클릭 가능한 물건"인지 확인합니다.
//
// 클릭 가능한 물건은 scenes/classroom.js에서 이렇게 표시해 둡니다.
//   object.userData.clickable = { type: 'word', wordId: 'desk', maxDistance: 5 }
//   object.userData.clickable = { type: 'lesson', maxDistance: 14 }
// ============================================================

import * as THREE from 'three';

export class Interaction {
  /**
   * @param camera     플레이어 카메라
   * @param root       광선을 맞출 대상 (교실 그룹)
   * @param isActive   지금 상호작용이 가능한 상태인지 알려 주는 함수
   * @param onSelect   클릭 가능한 물건을 클릭했을 때 실행할 함수
   */
  constructor({ camera, root, isActive, onSelect }) {
    this.camera = camera;
    this.root = root;
    this.isActive = isActive;
    this.onSelect = onSelect;

    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 20;
    this.center = new THREE.Vector2(0, 0); // 화면 정중앙
    this.current = null;                   // 지금 바라보는 클릭 가능 대상

    window.addEventListener('click', () => {
      if (this.isActive() && this.current) this.onSelect(this.current);
    });
  }

  // 매 프레임 호출
  update() {
    this.current = null;
    if (!this.isActive()) return null;

    this.raycaster.setFromCamera(this.center, this.camera);
    const hits = this.raycaster.intersectObjects(this.root.children, true);
    if (hits.length === 0) return null;

    // 가장 가까이 맞은 물건 하나만 봅니다. (벽 뒤의 물건은 선택되지 않아요)
    const hit = hits[0];
    let object = hit.object;
    while (object && !object.userData.clickable) object = object.parent;

    if (object) {
      const target = object.userData.clickable;
      if (hit.distance <= (target.maxDistance ?? 5)) this.current = target;
    }
    return this.current;
  }
}
