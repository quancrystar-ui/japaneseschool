# 日本語教室 3D (일본어 어학 교실 메타버스) — 프로토타입 v0.1

Three.js로 만든 3D 일본어 교실입니다. 브라우저에서 WASD로 걷고, 칠판과 물건을 클릭해 일본어를 듣고 배웁니다.

## 폴더 구조

```
japanese-metaverse/
├─ index.html                 화면의 뼈대 (시작 화면, 패널 등)
├─ css/style.css              색, 글꼴, 패널 디자인
├─ package.json               로컬 실행 명령 (선택)
└─ js/
   ├─ main.js                 시작점: 모든 부품을 만들고 연결
   ├─ scenes/classroom.js     3D 교실 (바닥, 벽, 책상, 의자, 칠판 …)
   ├─ systems/controls.js     WASD 이동, 마우스 시점, 충돌
   ├─ systems/interaction.js  화면 중앙 클릭 감지
   ├─ systems/speech.js       일본어 음성 재생
   ├─ ui/ui.js                시작 화면, 이름표, 단어 카드, 학습 패널
   └─ data/lessons.js         수업 문장과 교실 단어 (여기만 고쳐도 내용이 바뀜)
```

## 로컬에서 실행

`index.html`을 더블클릭하면 **동작하지 않습니다** (브라우저 보안 때문에 모듈을 못 불러옴). 아래 중 하나로 실행하세요.

- **VS Code Live Server**: 확장 프로그램 `Live Server` 설치 → `index.html` 우클릭 → `Open with Live Server`
- **터미널** (Node.js 설치 필요): `npm start` 후 http://localhost:3000
- **Python**: `python -m http.server 3000` 후 http://localhost:3000

## GitHub에 올리기

```bash
git init
git add .
git commit -m "첫 번째 프로토타입: 3D 교실"
git branch -M main
git remote add origin https://github.com/내아이디/japanese-metaverse.git
git push -u origin main
```

## Render에 배포하기 (Static Site)

1. https://render.com 로그인 → **New +** → **Static Site**
2. GitHub 저장소 `japanese-metaverse` 연결
3. 설정
   - **Build Command**: 비워 둠
   - **Publish Directory**: `.`
4. **Create Static Site** → 배포가 끝나면 `https://○○○.onrender.com` 주소가 생깁니다.
5. 이후 `git push`만 하면 자동으로 다시 배포됩니다.

## 알아 둘 점

- 데스크톱의 Chrome / Edge 기준으로 만들었습니다. (마우스 잠금 기능이 필요해서 스마트폰은 아직 미지원)
- 음성은 브라우저 내장 기능을 쓰므로 기기에 일본어 음성이 설치되어 있어야 합니다.
