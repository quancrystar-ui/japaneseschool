
const hiragana = [
  ["あ", "아"], ["い", "이"], ["う", "우"], ["え", "에"], ["お", "오"],
  ["か", "카"], ["き", "키"], ["く", "쿠"], ["け", "케"], ["こ", "코"],
  ["さ", "사"], ["し", "시"], ["す", "스"], ["せ", "세"], ["そ", "소"],
  ["た", "타"], ["ち", "치"], ["つ", "츠"], ["て", "테"], ["と", "토"],
  ["な", "나"], ["に", "니"], ["ぬ", "누"], ["ね", "네"], ["の", "노"],
  ["は", "하"], ["ひ", "히"], ["ふ", "후"], ["へ", "헤"], ["ほ", "호"],
  ["ま", "마"], ["み", "미"], ["む", "무"], ["め", "메"], ["も", "모"],
  ["や", "야"], ["ゆ", "유"], ["よ", "요"],
  ["ら", "라"], ["り", "리"], ["る", "루"], ["れ", "레"], ["ろ", "로"],
  ["わ", "와"], ["を", "오"], ["ん", "응"]
];

let selectedIndex = 0;

function speakHiragana(character) {
  if (!("speechSynthesis" in window)) {
    alert("이 브라우저에서는 음성을 지원하지 않습니다.");
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(character);
  utterance.lang = "ja-JP";
  utterance.rate = 0.8;

  window.speechSynthesis.speak(utterance);
}

function renderHiragana(container) {
  container.innerHTML = `
    <div class="hiragana-learning">
      <h2>ひらがな · 히라가나</h2>
      <p>글자를 선택하고 일본어 원음을 들어보세요.</p>

      <div class="hiragana-selected">
        <div id="hiragana-character">あ</div>
        <div id="hiragana-reading">아</div>
        <button id="hiragana-speak">🔊 원음 듣기</button>
      </div>

      <div class="hiragana-grid" id="hiragana-grid"></div>
    </div>
  `;

  const grid = container.querySelector("#hiragana-grid");

  hiragana.forEach(([character, reading], index) => {
    const button = document.createElement("button");
    button.className = "hiragana-letter";
    button.textContent = character;

    button.addEventListener("click", () => {
      selectedIndex = index;
      container.querySelector("#hiragana-character").textContent = character;
      container.querySelector("#hiragana-reading").textContent = reading;
      speakHiragana(character);
    });

    grid.appendChild(button);
  });

  container.querySelector("#hiragana-speak").addEventListener("click", () => {
    speakHiragana(hiragana[selectedIndex][0]);
  });
}

export { renderHiragana };
