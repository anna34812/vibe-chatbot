# n8n 웹훅 채팅 프런트엔드

Vite + React(TypeScript)로 만든 채팅 UI입니다. 메시지는 n8n **Production Webhook** URL로 `POST`되며, 본문은 `{ "message": "...", "sessionId": "..." }` 형식의 JSON입니다.

## 설정

1. [`.env.example`](.env.example)을 복사해 `.env.local`을 만듭니다.
2. `VITE_N8N_WEBHOOK_URL`에 **Webhook 노드의 Production URL** 전체를 넣습니다.
   - n8n 편집기에서 워크플로를 연 뒤 **Webhook** 노드를 클릭하고, 표시되는 **Production URL**을 복사합니다. 경로에 보통 `/webhook/`이 포함됩니다.
   - 브라우저 주소창의 `.../workflow/워크플로ID` 는 웹훅 주소가 **아닙니다**. 그대로 넣으면 `404 Cannot POST /workflow/...` 가 납니다.

프로덕션 빌드 시에도 동일한 변수 이름으로 빌드 환경(예: 호스팅 시크릿, `.env.production`)에 설정해야 합니다.

## 실행

```bash
npm install
npm run dev
```

## GitHub Pages (`username.github.io` 저장소)

저장소 **루트**를 그대로 올리면 `index.html`이 `/src/main.tsx`를 가리켜 **사이트가 뜨지 않습니다.** 아래 둘 중 하나만 쓰면 됩니다.

### A. GitHub Actions로 배포 (권장)

저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 두고, `.github/workflows/pages.yml`이 성공하도록 푸시합니다. (빌드 결과는 `dist`를 artifact로만 쓰고, 루트 소스와 섞이지 않습니다.)

### B. “Deploy from a branch”만 쓰는 경우

1. 로컬에서 `npm run build:docs` 실행 → **`docs/`** 폴더에 정적 파일이 생성됩니다.
2. **`docs/` 변경분을 커밋·푸시**합니다.
3. **Settings → Pages**에서 Branch는 **main**(또는 기본 브랜치), 폴더는 **`/docs`** 를 선택합니다. (루트 `/`가 아닙니다.)

코드를 수정한 뒤에는 다시 `npm run build:docs` 후 커밋해야 합니다.

## CORS

로컬(`npm run dev`)에서는 Vite가 `/n8n-webhook`으로 들어온 요청을 `VITE_N8N_WEBHOOK_URL` 호스트로 넘겨 주므로, 브라우저 입장에서는 같은 출처로만 통신해 **Failed to fetch(CORS)** 를 피할 수 있습니다.

`npm run build`로 배포한 정적 사이트에서는 이 프록시가 없으므로, n8n이 CORS를 허용하거나 호스팅 앞단(nginx 등)에서 웹훅으로 역프록시하는 방식이 필요할 수 있습니다.

## 응답 형식

기본적으로 응답 JSON에서 문자열 필드 `reply`, `output`, `message`, `text` 순으로 찾아 표시합니다. 워크플로 출력이 다르면 [`src/lib/parseN8nResponse.ts`](src/lib/parseN8nResponse.ts)만 수정하면 됩니다.
