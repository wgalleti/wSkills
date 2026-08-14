# Setup — do zero até a primeira tela

Tudo aqui é copiável. Substitua `meuapp` pelo nome do projeto.

## 1. Scaffold e dependências

Node `^20.19 || >=22.12`. O portal usa **yarn 1.22** (`packageManager` no `package.json`);
npm/pnpm funcionam, mas então padronize o time num só.

```bash
yarn create vite meuapp --template vue
cd meuapp
yarn add primevue @primeuix/themes primeicons primelocale \
         @wgalleti/primevue-components \
         pinia pinia-plugin-persistedstate vue-router \
         axios dayjs
yarn add -D tailwindcss @tailwindcss/vite vite-plugin-vue-devtools \
            eslint @eslint/js eslint-plugin-vue vue-eslint-parser \
            prettier @vue/eslint-config-prettier
```

Scripts mínimos no `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --fix",
    "lint:check": "eslint .",
    "format": "prettier --write .",
    "quality": "yarn lint:check && prettier --check ."
  }
}
```

> ⚠️ **`format` / `quality:fix` repo-wide são armadilha.** Num projeto com histórico eles
> reescrevem centenas de arquivos (churn e risco de quebrar SFC). Formate só o que tocou.
> Para validar um PR: `lint:check` + `build`.

## 2. `vite.config.js`

```js
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: {
    // Sem dedupe, a suite e o app podem carregar DUAS instâncias de vue/primevue/dayjs —
    // sintoma clássico: injeção do plugin "some" dentro dos componentes W*.
    dedupe: ['vue', 'vue-router', 'primevue', '@primevue/core', '@primevue/icons', 'dayjs'],
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: 5173, strictPort: true },
  optimizeDeps: {
    // As rotas são todas lazy, então o Vite só DESCOBRE cada `primevue/*` ao abrir a tela
    // que o usa — e recarrega a página no meio da navegação ("new dependencies optimized").
    // Declarar aqui pré-bundla tudo na subida. Não afeta o build de produção.
    include: [
      '@wgalleti/primevue-components',
      'vue',
      'vue-router',
      'pinia',
      'axios',
      'dayjs',
      'primevue/config',
      'primevue/usetoast',
      'primevue/toastservice',
      'primevue/confirmationservice',
      'primevue/button',
      'primevue/inputtext',
      'primevue/select',
      'primevue/datatable',
      'primevue/column',
      'primevue/dialog',
      // acrescente conforme componentes novos aparecerem em rota lazy
    ],
  },
})
```

**Bundle grande demais? Só então** divida vendors em `build.rollupOptions.output.manualChunks`.
Regra que não pode ser quebrada: **um chunk manual só pode conter módulo que já era carregado
na partida** — agrupar um módulo lazy num vendor eager o promove a bloqueante, e a
"otimização" custa bytes na primeira pintura. E **não misture famílias que se importam de
volta**: um ciclo entre chunks quebra em silêncio só no build (nunca em `yarn dev`), com o
componente chegando `undefined` e o Vue renderizando a tag literal.

## 3. Estrutura de pastas

```
src/
  assets/css/     tokens.css · main.css · portal.css
  components/     {dominio}/*.vue  +  layout/ (AppBar, AppSidebar, navigation.js, breadcrumb-map.js)
  composable/     lógica por domínio (useAppCrud, useEnterNav, useAuth…)
  data/           dataProvider.js · endpoints.js · useResource.js · index.js
  layouts/        AppLayout.vue
  lib/            utilitários puros (formatadores, toast…)
  pages/          views de rota, espelhando a navegação
  plugins/        axios.js
  router/         index.js
  schemas/        {dominio}/{entidade}.js — ColumnDef[] / FieldDef[] / labels
  stores/         Pinia: auth · theme · contexto (só transversal)
```

## 4. Camada de dados

**`src/plugins/axios.js`** — instância única, token no request, 401 invalida a sessão.

```js
import axios from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
})

instance.interceptors.request.use((config) => {
  delete config.headers.Authorization
  try {
    const { token } = JSON.parse(localStorage.getItem('auth'))
    if (token) config.headers.Authorization = `Token ${token}`
  } catch {
    /* sem sessão */
  }
  return config
})

/*
  O handler é REGISTRADO, não importado: o store de auth importa este módulo, e importar o
  store de volta fecharia um ciclo. Quem liga as pontas é o main.js, depois do Pinia.
*/
let aoPerderSessao = null
export const registrarHandlerSessaoInvalida = (fn) => (aoPerderSessao = fn)

instance.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response?.status === 401) aoPerderSessao?.()
    return Promise.reject(error)
  }
)

export default instance
```

**`src/data/endpoints.js`** — mapa único de URLs. Nenhum caminho literal fora daqui.

```js
export const ENDPOINTS = {
  fornecedores: '/v1/core/fornecedores/',
  produtos: '/v1/core/produtos/',
}
```

**`src/data/dataProvider.js`** — **a única camada que conhece o formato do servidor.**
Traduz a paginação da suite (`page`/`page_size`) para a do backend e normaliza a resposta.
Ajuste os dois lados ao seu backend; o resto do app não muda.

```js
import api from '@/plugins/axios'

function normalizeList(data, page, pageSize) {
  // envelope { data, total, extras } (o do portal)
  if (Array.isArray(data?.data)) {
    return {
      data: data.data,
      page,
      page_size: pageSize,
      rows: Number(data.total ?? data.data.length) || 0,
      extras: data.extras ?? {},
    }
  }
  // DRF padrão { count, results }
  if (Array.isArray(data?.results)) {
    return { data: data.results, page, page_size: pageSize, rows: Number(data.count) || 0 }
  }
  // lista crua
  const arr = Array.isArray(data) ? data : []
  return { data: arr, page, page_size: pageSize, rows: arr.length }
}

export function createDataProvider(axios) {
  return {
    async list(endpoint, { page = 1, page_size = 20, sort, order, filters = {} } = {}) {
      const params = { take: page_size, skip: (page - 1) * page_size, ...filters }
      if (sort) params.ordering = `${order === 'desc' ? '-' : ''}${sort}`
      const { data } = await axios.get(endpoint, { params })
      return normalizeList(data, page, page_size)
    },
    get: (e, id) => axios.get(`${e}${id}/`).then((r) => r.data),
    create: (e, payload) => axios.post(e, payload).then((r) => r.data),
    update: (e, id, payload) => axios.patch(`${e}${id}/`, payload).then((r) => r.data),
    delete: (e, id) => axios.delete(`${e}${id}/`).then(() => true),
    request: (config) => axios(config).then((r) => r.data),
  }
}

export const dataProvider = createDataProvider(api)
```

**`src/data/index.js`** reexporta `ENDPOINTS`, `dataProvider` e `useResource` — os imports do
app apontam sempre para `@/data`.

`useResource.js` (opcional, mas vale cedo): cache reativo global **por endpoint** para
alimentar dropdown e FK sem refazer a mesma chamada em cinco telas.

## 5. `main.js`

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Tooltip from 'primevue/tooltip'
import Ripple from 'primevue/ripple'
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import ptBR from 'primelocale/pt-BR.json' // o wrapper tem a chave "pt-BR"; passe o objeto interno
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import { WPrimeVuePlugin } from '@wgalleti/primevue-components'

import App from '@/App.vue'
import router from '@/router'
import api, { registrarHandlerSessaoInvalida } from '@/plugins/axios'
import { dataProvider } from '@/data'
import { authStore } from '@/stores/auth'

import '@/assets/css/main.css'
import '@wgalleti/primevue-components/style.css'

dayjs.locale('pt-br') // a suite usa esta instância no calendário e no parse

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// Escala primária = a cor da marca. Escala surface = slate FRIO derivada dos tokens:
// sem ela o Aura cai no zinc neutro e destoa do shell no tema escuro.
const primary = {
  50: '#eef4fb',
  100: '#d7e6f6',
  200: '#b0cdec',
  300: '#7eaadd',
  400: '#4a82c7',
  500: '#2864ac',
  600: '#1f5092',
  700: '#1c4179',
  800: '#1b3763',
  900: '#182d50',
  950: '#101f38',
}
const surface = {
  0: '#ffffff',
  50: '#f4f6f9',
  100: '#eef2f7',
  200: '#e2e8f0',
  300: '#cdd6e2',
  400: '#93a3b8',
  500: '#64748b',
  600: '#42536b',
  700: '#2c3949',
  800: '#1a232f',
  900: '#131b25',
  950: '#0c1219',
}

const Theme = definePreset(Aura, {
  semantic: { primary, colorScheme: { light: { surface }, dark: { surface } } },
})

app.use(PrimeVue, {
  theme: {
    preset: Theme,
    options: {
      darkModeSelector: '.dark',
      cssLayer: { name: 'primevue', order: 'tailwind-base, primevue, tailwind-utilities' },
    },
  },
  locale: ptBR['pt-BR'],
  ripple: true,
})
app.use(ToastService)
app.use(ConfirmationService)

app.use(WPrimeVuePlugin, {
  axios: api,
  dataProvider,
  defaultPageSize: 20,
  dateFormat: 'DD/MM/YYYY',
  dateTimeFormat: 'DD/MM/YYYY HH:mm',
  locale: 'pt-BR',
  currency: 'BRL',
})

app.directive('tooltip', Tooltip)
app.directive('ripple', Ripple)
app.use(pinia)

registrarHandlerSessaoInvalida(() => authStore().descartarDadosDaSessao())

app.use(router)
app.mount('#app')
```

**Sessão antes do mount.** Assim que houver login, resolva quem é o usuário **uma vez, antes
de montar** (`prepararSessao().finally(() => app.mount('#app'))`), pulando rotas públicas.
Custa ~40 ms e evita o menu completo piscando antes de virar menu filtrado. A função nunca
pode rejeitar — token expirado precisa cair no login, não em tela branca.

## 6. CSS

```css
/* src/assets/css/main.css */
@import 'tailwindcss';
@import './tokens.css';
@import './portal.css';
@custom-variant dark (&:where(.dark, .dark *));
```

Copie `assets/tokens.css` desta skill para `src/assets/css/tokens.css` e **troque só a escala
de marca** (`design.md` §1). `portal.css` guarda o shell (topbar, sidebar, palette).

Preferências do usuário precisam ser aplicadas **antes da primeira pintura**, com um script
inline no `index.html` que lê `localStorage['theme-preference']` e escreve `class="dark"` e
`data-density` / `data-fontsize` / `data-font` no `<html>` — senão o app pisca claro e
"pula" de densidade ao montar.

## 7. Roteamento e guarda

```js
// src/router/index.js — todas as rotas lazy
const routes = [
  { path: '/login', name: 'login', component: () => import('@/pages/auth/login.vue') },
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/pages/dashboard/index.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'cadastros/fornecedores',
        name: 'fornecedores',
        component: () => import('@/pages/cadastros/fornecedores/index.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
]

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true
  return (await useAuth().checkAuth()) || { name: 'login', query: { next: to.fullPath } }
})
```

## 8. Primeira tela (o piso de qualidade)

Schema puro + página de 10 linhas — receita completa e comentada em `arquitetura.md` §3.

## 9. CLAUDE.md do projeto novo

Crie um `CLAUDE.md` na raiz do frontend com, no mínimo:

```markdown
# CLAUDE.md — <projeto> (web)

Regra, não prosa. Se um número aparecer aqui e no código, o código ganha.

1. Stack e comandos (dev/build/lint) + o aviso de não formatar repo-wide
2. Arquitetura em camadas + as proibições (arquitetura.md §1-2)
3. Árvore de decisão de tela nova + receitas (arquitetura.md §3)
4. Estilo: tabela "precisa de X → use token Y, nunca Z" (design.md §2)
5. Quando não existe componente da suite (arquitetura.md §5)
6. Shell e navegação + checklist de módulo novo
7. Convenções de nome
8. Checklist de PR (SKILL.md)
```

Aponte a skill `frontend-kickstart` nele enquanto o projeto for novo; quando as regras locais
divergirem, o `CLAUDE.md` do projeto passa a mandar.
