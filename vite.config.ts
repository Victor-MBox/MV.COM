import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
	plugins: [react()],
	server: {
		// Обработчик формы (`npm run server`, server/contact.js на 127.0.0.1:3001) — тот же путь /api/contact,
		// что и на боевом сервере за nginx. Обработчик не запущен → Vite ответит 500, форма покажет ошибку отправки
		proxy: { '/api': 'http://127.0.0.1:3001' },
	},
})
