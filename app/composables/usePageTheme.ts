import { resolvePageThemeConfig, type PageGradient, type PageTheme } from '~/config/pageThemeConfig'

export const usePageTheme = () => {
  const route = useRoute()
  const theme = useState<PageTheme>('page-theme', () => 'light')
  const gradient = useState<PageGradient>('page-gradient', () => 'light-fjord')

  useHead(() => ({
    htmlAttrs: {
      'data-theme': theme.value,
      'data-page-gradient': gradient.value,
    },
  }))

  const applyRouteTheme = () => {
    const config = resolvePageThemeConfig(route.path)
    theme.value = config.theme
    gradient.value = config.gradient
  }

  const setTheme = (nextTheme?: PageTheme, nextGradient?: PageGradient) => {
    if (!nextTheme && !nextGradient) {
      applyRouteTheme()
      return
    }

    if (nextTheme) {
      theme.value = nextTheme
    }

    if (nextGradient) {
      gradient.value = nextGradient
    }
  }

  watch(
    () => route.path,
    applyRouteTheme,
    { immediate: true },
  )

  return {
    theme: readonly(theme),
    gradient: readonly(gradient),
    isDark: computed(() => theme.value === 'dark'),
    setTheme,
  }
}
