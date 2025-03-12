// Proxy
export default defineEventHandler(async (event) => {
  const { path } = getRouterParams(event);
  const query = getQuery(event);
  const baseUrl = process.env.NUXT_PUBLIC_BASE_URL as string;
  const headers: any = getHeaders(event);

  let body;

  // Jika methodnya put/post
  if (
    event.method.toLowerCase() === "put" ||
    event.method.toLowerCase() === "post"
  ) {
    body = await readBody(event);
  }

  // Set url
  const urlBase: any = await $fetch(`${baseUrl}/${path}`, {
    headers,
    body,
    query,
    method: event.method,
  });

  return urlBase;
});
