import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
	plugins: [react()],
	server: {
		// Обработчик формы (`npm run server`, server/contact.js на 127.0.0.1:3721) — тот же путь /api/contact,
		// что и на боевом сервере за nginx. Обработчик не запущен → Vite ответит 500, форма покажет ошибку отправки.
		// changeOrigin: false — заголовок Host остаётся адресом dev-сервера (как `proxy_set_header Host $host` у nginx):
		// обработчик сверяет с ним Origin запроса (server/lib.js isAllowedOrigin), иначе заявки с dev получали бы 403
		proxy: { '/api': { target: 'http://127.0.0.1:3721', changeOrigin: false } },
	},
})
