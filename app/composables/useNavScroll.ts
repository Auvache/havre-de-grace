export const useNavScroll = () => {
  const { y } = useWindowScroll()
  const isSolid = computed(() => y.value > 16)

  return {
    isSolid: readonly(isSolid),
  }
}
