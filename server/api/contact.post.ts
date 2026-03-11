export default defineEventHandler(() => {
  throw createError({
    statusCode: 501,
    statusMessage: 'Contact form handler is scheduled for Sprint 7.',
  })
})
