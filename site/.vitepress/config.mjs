import { defineConfig } from 'vitepress'

const skillItems = (ids) => ids.map((id) => ({ text: id, link: `/skills/${id}` }))

export default defineConfig({
  lang: 'pt-BR',
  title: 'wSkills',
  description:
    'Skills reutilizáveis de Claude Code para o stack Vue 3 + PrimeVue 4 + Django REST — e o kit de worktrees paralelos no Orca.',
  base: '/wSkills/',
  cleanUrls: true,
  lastUpdated: true,
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/wSkills/logo.svg' }]],

  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Guia', link: '/guia/comecando' },
      { text: 'Skills', link: '/skills/' },
      { text: 'Orca', link: '/orca/' },
      {
        text: 'npm',
        link: 'https://www.npmjs.com/package/@wgalleti/wskills',
      },
    ],

    sidebar: {
      '/guia/': [
        {
          text: 'Guia',
          items: [
            { text: 'Começando', link: '/guia/comecando' },
            { text: 'Claude Code do zero', link: '/guia/claude-code' },
            { text: 'Criar um sistema (novo-projeto)', link: '/guia/novo-projeto' },
            { text: 'Usar no Lovable e afins', link: '/guia/lovable' },
            { text: 'Contribuir e publicar', link: '/guia/contribuir' },
          ],
        },
      ],
      '/skills/': [
        { text: 'Catálogo', link: '/skills/' },
        {
          text: 'Começar um projeto',
          items: skillItems(['novo-projeto', 'sdd']),
        },
        {
          text: 'Frontend',
          items: skillItems(['frontend-kickstart', 'portal-frontend', 'wpvc', 'ui-rica']),
        },
        {
          text: 'Protótipos',
          items: skillItems(['prototipo-api', 'prototipo-portal']),
        },
        {
          text: 'Processo e documentação',
          items: skillItems(['mr', 'documento', 'projeto', 'manual-doc']),
        },
        {
          text: 'Dados e mapa',
          items: skillItems(['geojson']),
        },
      ],
      '/orca/': [
        {
          text: 'Worktrees com Orca',
          items: [{ text: 'O kit completo', link: '/orca/' }],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/wgalleti/wSkills' }],

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: 'Buscar', buttonAriaLabel: 'Buscar na documentação' },
          modal: {
            displayDetails: 'Mostrar detalhes',
            resetButtonTitle: 'Limpar busca',
            backButtonTitle: 'Fechar',
            noResultsText: 'Nada encontrado para',
            footer: {
              selectText: 'abrir',
              navigateText: 'navegar',
              closeText: 'fechar',
            },
          },
        },
      },
    },

    outline: { label: 'Nesta página' },
    docFooter: { prev: 'Anterior', next: 'Próxima' },
    lastUpdatedText: 'Atualizado em',
    darkModeSwitchLabel: 'Tema',
    returnToTopLabel: 'Voltar ao topo',
    sidebarMenuLabel: 'Menu',

    footer: {
      message: 'MIT · feito a partir de um portal em produção, anonimizado para reuso.',
      copyright: '© wgalleti',
    },

    editLink: {
      pattern: ({ filePath }) => {
        // Páginas geradas apontam para a fonte real no repositório.
        if (filePath.startsWith('skills/') && !filePath.endsWith('index.md')) {
          const id = filePath.replace('skills/', '').replace('.md', '')
          return `https://github.com/wgalleti/wSkills/edit/main/skills/${id}/SKILL.md`
        }
        if (filePath === 'orca/index.md')
          return 'https://github.com/wgalleti/wSkills/edit/main/docs/orca-worktrees.md'
        if (filePath === 'guia/claude-code.md')
          return 'https://github.com/wgalleti/wSkills/edit/main/docs/claude-code.md'
        if (filePath === 'guia/novo-projeto.md')
          return 'https://github.com/wgalleti/wSkills/edit/main/docs/novo-projeto.md'
        return `https://github.com/wgalleti/wSkills/edit/main/site/${filePath}`
      },
      text: 'Sugerir mudança nesta página',
    },
  },
})
