# 코끼리와 숫자 친구들

만 3~5세 아이가 동물 친구들과 1부터 10까지 수를 익히는 가로형 웹 앱(PWA)입니다.
광고·결제·로그인이 없고, 진행 기록은 이 기기의 브라우저에만 저장됩니다.

## 들어 있는 것
- 사바나 마을 게임 3종: 반짝 무늬 보기(바로 알기), 과일 세기(하나씩 세기), 물웅덩이 채우기(수만큼 옮기기)
- 스티커(동물 9마리) · 스티커북 · 특별 친구(유니콘) · 숲속 마을 열기
- 하루 놀이 시간(기본 15분, 1분 전 알림, 잠금 화면) · 부모님 메뉴(자물쇠 3초 누르기)
- 홈 화면에 설치, 한 번 열면 인터넷 없이도 실행

## 개발
```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 규칙 자동 검사 (Vitest)
npm run test:e2e   # 브라우저 자동 검사 (Playwright: 개발 서버 + 빌드본)
npm run build      # dist/ 에 완성본
```

## 바꿔 끼우기
- **그림**: `public/images/` 안의 파일을 같은 이름으로 바꾸면 됩니다. 앱 아이콘은 코끼리 그림을 바꾼 뒤 `npm run icons`.
- **목소리**: `docs/음성 목록.md`의 파일 이름대로 녹음해서 `public/audio/voice/`에 mp3로 넣습니다. 없는 문장은 브라우저 기본 음성으로 읽습니다. 대사를 바꾸면 `npm run voice:list`로 목록을 다시 만듭니다.

## 배포
`main` 브랜치에 올리면 GitHub Actions가 검사·빌드 후 GitHub Pages에 반영합니다
(저장소 Settings → Pages → Source를 "GitHub Actions"로 한 번 설정).
