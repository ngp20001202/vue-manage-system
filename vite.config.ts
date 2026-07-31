import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import VueSetupExtend from 'vite-plugin-vue-setup-extend';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { DEV_TARGET } from './src/utils/devTarget.js';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
export default defineConfig(({ mode }) => ({
	base: mode === 'production' ? './' : '/',
	server: {
		host: '0.0.0.0',
		port: 5173,
		strictPort: true,
		open: false,
		proxy: {
			'/api1': {
				target: DEV_TARGET,
				changeOrigin: true,
				secure: false,
				rewrite: (path) => path.replace(/^\/api1/, ''),
			}
		}
	},
	plugins: [
		vue(),
		VueSetupExtend(),
		AutoImport({
			resolvers: [ElementPlusResolver()]
		}),
		Components({
			resolvers: [ElementPlusResolver()]
		})
	],
	optimizeDeps: {
		include: [
			'schart.js',
			'element-plus',
			'element-plus/es/locale/lang/zh-cn',
			'echarts',
			'echarts-wordcloud',
			'vue-echarts',
			'@wangeditor/editor',
			'@wangeditor/editor-for-vue',
			'md-editor-v3',
			'vue-cropper',
			'xlsx',
			'file-saver',
			'moment',
			'countup.js',
		],
	},
	css: {
		preprocessorOptions: {
			scss: {
				silenceDeprecations: ['legacy-js-api', 'import'],
			},
		},
	},
	resolve: {
		alias: {
			'@': '/src',
			'~': '/src/assets'
		}
	},
	define: {
		__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "true",
	},
	build: {
		rollupOptions: {
			output: {
				entryFileNames: 'js/[name]-[hash].js',
				chunkFileNames: 'js/[name]-[hash].js',
				assetFileNames: (assetInfo) => {
					const name = assetInfo.name ?? '';
					const ext = name.match(/\.(png|jpe?g|gif|svg|webp|avif|ico)$/i)
						? 'images'
						: name.match(/\.(css)$/i)
							? 'css'
							: name.match(/\.(woff2?|ttf|otf|eot)$/i)
								? 'fonts'
								: 'assets';
					return `${ext}/[name]-[hash][extname]`;
				},
			},
		},
	},
}));
