export const useNavScroll = () => {
  const { y } = useWindowScroll()

  const isVisible = ref(true)
  const isSolid = ref(false)
  const lastY = ref(0)

  watch(
    y,
    (currentY) => {
      const delta = currentY - lastY.value
      isSolid.value = currentY > 16

      if (currentY < 24) {
        isVisible.value = true
      }
      else if (delta > 6) {
        isVisible.value = false
      }
      else if (delta < -6) {
        isVisible.value = true
      }

      lastY.value = currentY
    },
    { immediate: true },
  )

  return {
    isVisible: readonly(isVisible),
    isSolid: readonly(isSolid),
  }
}
