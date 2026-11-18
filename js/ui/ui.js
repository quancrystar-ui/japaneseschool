import { todaysLesson, classroomWords } from '../data/lessons.js';
import { speakJa } from '../systems/speech.js';

export class UI {
  constructor() {
    this.crosshair = document.getElementById('crosshair');
    this.hint = document.getElementById('hint');
    this.wordCard = document.getElementById('word-card');
    this.overlay = document.getElementById('start-overlay');
    this.overlayLead = document.getElementById('overlay-lead');
    this.enterButton = document.getElementById('enter-button');
    this.panel = document.getElementById('lesson-panel');
    this.panelClose = document.getElementById('panel-close');
    this.speechNote = document.getElementById('speech-note');
    this.slowToggle = document.getElementById('slow-toggle');
    this.sentenceList = document.getElementById('sentence-list');
    this.wordList = document.getElementById('word-list');

    this.isPanelOpen = false;
    this.wordCardTimer = null;

    this.renderLessonData();
  }

  showCrosshair(show) {
    this.crosshair.hidden = !show;
  }

  setHint(data) {
    if (!data) {
      this.hint.hidden = true;
      this.crosshair.classList.remove('is-active');
      return;
    }
    this.hint.hidden = false;
    this.crosshair.classList.add('is-active');
    this.hint.innerHTML = `<span class="hint-ja">${data.hintJa}</span> <span class="hint-ko">${data.hintKo}</span>`;
  }

  showWordCard(wordId) {
    const word = classroomWords[wordId];
    if (!word) return;

    speakJa(word.ja);

    this.wordCard.innerHTML = `
      <div class="card-ja">${word.ja}</div>
      <div class="card-reading">${word.reading}</div>
      <div class="card-ko">${word.ko}</div>
      <div class="card-example">
        <span class="ex-ja">${word.exampleJa}</span>
        <span class="ex-ko">${word.exampleKo}</span>
      </div>
    `;
    this.wordCard.hidden = false;

    clearTimeout(this.wordCardTimer);
    this.wordCardTimer = setTimeout(() => {
      this.wordCard.hidden = true;
    }, 4500);
  }

  showOverlay(mode = 'start') {
    if (mode === 'resume') {
      this.overlayLead.textContent = '일시정지됨. 계속하려면 버튼을 누르거나 클릭하세요.';
      this.enterButton.textContent = '수업 계속하기';
    } else {
      this.overlayLead.textContent = '3D 일본어 교실 프로토타입';
      this.enterButton.textContent = '교실에 들어가기';
    }
    this.overlay.removeAttribute('hidden');
  }

  hideOverlay() {
    this.overlay.setAttribute('hidden', '');
  }

  onEnter(callback) {
    this.enterButton.addEventListener('click', (e) => {
      e.stopPropagation();
      callback();
    });
    // 오버레이 어두운 배경 클릭 시에도 작동
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        callback();
      }
    });
  }

  openPanel() {
    this.isPanelOpen = true;
    this.panel.removeAttribute('hidden');
    this.showCrosshair(false);
  }

  closePanel() {
    this.isPanelOpen = false;
    this.panel.setAttribute('hidden', '');
  }

  onPanelClose(callback) {
    this.panelClose.addEventListener('click', callback);
  }

  renderLessonData() {
    this.sentenceList.innerHTML = '';
    todaysLesson.sentences.forEach((s) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.className = 'sentence';
      btn.type = 'button';
      btn.innerHTML = `
        <span class="sentence-ja">${s.ja}</span>
        <span class="sentence-reading">${s.reading}</span>
        <span class="sentence-ko">${s.ko}</span>
      `;
      btn.addEventListener('click', () => {
        const slow = this.slowToggle.checked;
        speakJa(s.ja, slow ? 0.75 : 1.0);
      });
      li.appendChild(btn);
      this.sentenceList.appendChild(li);
    });

    this.wordList.innerHTML = '';
    todaysLesson.words.forEach((w) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.className = 'word-item';
      btn.type = 'button';
      btn.innerHTML = `
        <span class="word-ja">${w.ja}</span>
        <span class="word-reading">${w.reading}</span>
        <span class="word-ko">${w.ko}</span>
      `;
      btn.addEventListener('click', () => {
        const slow = this.slowToggle.checked;
        speakJa(w.ja, slow ? 0.75 : 1.0);
      });
      li.appendChild(btn);
      this.wordList.appendChild(li);
    });
  }
}