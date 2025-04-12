// server/middleware/storage.ts
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  const config = useRuntimeConfig();

  if (url.pathname.startsWith("/storage")) {
    const targetUrl = `${config.public.baseUrlStorage}${url.pathname}`;

    const response = await $fetch(targetUrl, {
      method: event.method,
      headers: getHeaders(event),
    });

    return response;
  }
});
