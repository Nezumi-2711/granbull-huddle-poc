# Granbull Huddle — POC

POC cho core của Huddle: **camera + mic, chia sẻ màn hình, chat, reactions** trên LiveKit SFU self-host.
Không có auth, DB, recording — xem phạm vi đầy đủ trong `granbull-huddle-overview.md`.

```
apps/api              Fastify: POST /api/token (cấp LiveKit JWT), GET /healthz, serve SPA khi production
apps/web              Vite + React + @livekit/components-react
packages/shared-types DTO + hằng số dùng chung
infra/                compose.dev.yml (SFU local), compose.sfu.yml + livekit.yaml (SFU prod), Dockerfile.app
```

| Tính năng | Cách làm |
|---|---|
| Cam / mic | `PreJoin` (preview + chọn thiết bị) → `LiveKitRoom`; simulcast, dynacast, adaptive stream, Opus DTX |
| Screen share | 1080p @ 15 fps + tab audio; chỉ 1 người share/lúc (nút bị khoá khi người khác đang share); tự chuyển sang Focus layout |
| Chat | `useChat()` — LiveKit text streams (`lk.chat`), không lưu; người vào sau chỉ thấy tin mới |
| Reactions | Gom click trong 250 ms → 1 gói data lossy (topic `reactions`); emoji bay trên màn hình, tối đa 30 cùng lúc |

## Chạy local

Yêu cầu: Node 22 (`nvm use 22`), pnpm (`corepack enable`), Docker.

```bash
pnpm install
cp .env.example .env
pnpm dev:sfu          # LiveKit --dev (devkey/secret) trên 7880/7881/7882udp
pnpm dev              # api :3001 + web :5173 (Vite proxy /api → api)
```

Mở http://localhost:5173, tạo phòng, rồi mở thêm tab/trình duyệt khác cùng link `/r/<room>` để test nhiều người.
Localhost được coi là secure context nên camera/screen share chạy được không cần HTTPS.

## Deploy lên Dokploy

Cần: 2 bản ghi DNS A trỏ về server — `huddle.<domain>` và `livekit.<domain>`; mở firewall **7881/tcp** và **7882/udp**.

1. Tạo cặp key cho production:
   ```bash
   echo "LIVEKIT_API_KEY=API$(openssl rand -hex 6)"; echo "LIVEKIT_API_SECRET=$(openssl rand -base64 32)"
   ```
2. **SFU** — Dokploy → Create Service → *Compose*, nguồn là repo này, compose path `infra/compose.sfu.yml`.
   - Environment: `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`.
   - Domains: `livekit.<domain>` → service `livekit`, port `7880`, bật HTTPS (Let's Encrypt).
   - Kiểm tra: `curl https://livekit.<domain>` trả về `OK`.
3. **App** — Dokploy → Create Service → *Application*, build type *Dockerfile*, Dockerfile path `infra/Dockerfile.app`, context `.`.
   - Environment: `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` (giống bước 2), `LIVEKIT_URL=wss://livekit.<domain>`.
   - Domains: `huddle.<domain>` → port `3000`, bật HTTPS.
   - Kiểm tra: `curl https://huddle.<domain>/healthz` → `{"ok":true}`.
4. Test từ 2 mạng khác nhau (wifi + 4G). Trong `chrome://webrtc-internals`, candidate pair được chọn nên là UDP 7882; nếu UDP bị chặn, client tự rơi về TCP 7881.

## Giới hạn đã biết

- **Không có TURN/TLS 443**: mạng chặn cả UDP 7882 lẫn TCP 7881 sẽ không vào được. Cần một IP/port 443 riêng (Traefik đang giữ 443) — để giai đoạn MVP.
- **Không auth**: ai có link đều vào được. Đừng chia sẻ link rộng rãi.
- **Safari**: không hỗ trợ tab audio khi share màn hình; POC chỉ kiểm trên Chromium/Firefox.
- `room.max_participants: 50` trong `infra/livekit.yaml` là giới hạn an toàn cho POC.
