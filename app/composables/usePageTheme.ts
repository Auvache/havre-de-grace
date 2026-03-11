type PageTheme = 'light' | 'dark'

const isTheme = (value: unknown): value is PageTheme => value === 'light' || value === 'dark'

export const usePageTheme = () => {
  const route = useRoute()
  const theme = useState<PageTheme>('page-theme', () => 'light')

  useHead(() => ({
    htmlAttrs: {
      'data-theme': theme.value,
    },
  }))

  const resolveRouteTheme = () => {
    const routeTheme = route.meta.theme
    if (isTheme(routeTheme)) {
      return routeTheme
    }

    return route.meta.layout === 'dark' ? 'dark' : 'light'
  }

  const setTheme = (nextTheme?: PageTheme) => {
    theme.value = nextTheme ?? resolveRouteTheme()
  }

  watch(
    () => [route.path, route.meta.theme, route.meta.layout],
    () => setTheme(),
    { immediate: true },
  )

  return {
    theme: readonly(theme),
    isDark: computed(() => theme.value === 'dark'),
    setTheme,
  }
}
