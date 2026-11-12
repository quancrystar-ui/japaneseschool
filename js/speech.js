// ============================================================
// 음성 재생 (브라우저 내장 Web Speech API 사용)
// 별도 서버나 mp3 파일 없이 일본어를 읽어 줍니다.
// 나중에 녹음된 mp3로 바꾸고 싶다면 이 파일만 고치면 돼요.
// ============================================================

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
let japaneseVoice = null;

function pickVoice() {
  const voices = window.speechSynthesis.getVoices();
  japaneseVoice =
    voices.find((v) => v.lang === 'ja-JP') ||
    voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('ja')) ||
    null;
}

// 음성 목록은 브라우저가 나중에 불러오는 경우가 많아서, 변경 이벤트를 기다립니다.
export function initSpeech() {
  if (!supported) return;
  pickVoice();
  window.speechSynthesis.addEventListener('voiceschanged', pickVoice);
}

export function isSpeechSupported() {
  return supported;
}

export function hasJapaneseVoice() {
  return japaneseVoice !== null;
}

export function stopSpeaking() {
  if (supported) window.speechSynthesis.cancel();
}

// texts: 문자열 하나 또는 문자열 배열(순서대로 읽음)
export function speak(texts, { rate = 0.9, onEnd } = {}) {
  if (!supported) return false;

  const list = Array.isArray(texts) ? texts : [texts];
  window.speechSynthesis.cancel(); // 이전 음성은 끊고 새로 시작

  list.forEach((text, index) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    if (japaneseVoice) utterance.voice = japaneseVoice;
    utterance.rate = rate;
    if (index === list.length - 1 && onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }
    window.speechSynthesis.speak(utterance);
  });
  return true;
}
