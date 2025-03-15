// // Proxy
// export default defineEventHandler(async (event) => {
//   const { path } = getRouterParams(event);
//   const query = getQuery(event);
//   const baseUrl = process.env.NUXT_PUBLIC_BASE_URL as string;
//   const headers: any = getHeaders(event);

//   let body;

//   // Jika methodnya put/post
//   if (
//     event.method.toLowerCase() === "put" ||
//     event.method.toLowerCase() === "post"
//   ) {
//     body = await readBody(event);
//   }

//   // Set url
//   const urlBase: any = await $fetch(`${baseUrl}/${path}`, {
//     headers,
//     body,
//     query,
//     method: event.method,
//   });

//   return urlBase;
// });

import type { EventHandler } from "h3";

export default <EventHandler>(async (event) => {
  const { path } = getRouterParams(event);
  const query = getQuery(event);
  const rawHeaders = getHeaders(event);
  const headers: Record<string, string> = Object.fromEntries(
    Object.entries(rawHeaders).map(([key, value]) => [key, value ?? ""])
  );

  const config = useRuntimeConfig();

  console.log("Proxy Request:", { path, method: event.method });

  let body: Record<string, any> | null = null;
  if (["post", "put", "patch"].includes(event.method.toLowerCase())) {
    const parsedBody = await readBody(event);
    body =
      typeof parsedBody === "object" && parsedBody !== null ? parsedBody : null;
  }

  // **Menyesuaikan Header secara Dinamis**
  if (!headers["authorization"]) {
    headers["x-api-key"] = config.apiKey;
  }

  try {
    const response: unknown = await $fetch(`${config.public.baseUrl}/${path}`, {
      headers,
      body,
      query,
      method: event.method,
    });

    return response;
  } catch (error: any) {
    console.error("Error fetching API:", error);

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || "Internal Server Error",
      message: error.data?.message || "Terjadi kesalahan saat mengambil data.",
    });
  }
});

// import { H3Event } from "h3";

// export default defineEventHandler(async (event: H3Event): Promise<any> => {
//   const { path } = getRouterParams(event);
//   const query: Record<string, any> = getQuery(event);
//   const baseUrl: string | undefined = process.env.NUXT_PUBLIC_BASE_URL;
//   const apiKey: string | undefined = process.env.NUXT_PUBLIC_API_KEY; // Tambahkan API Key dari env

//   if (!baseUrl) {
//     throw createError({
//       statusCode: 500,
//       statusMessage: "Base URL tidak ditemukan dalam environment variables",
//     });
//   }

//   // Atur headers (bisa menyesuaikan kebutuhan API yang berbeda)
//   const headers: Record<string, string> = {};
//   const authHeader: string | undefined = getHeader(event, "Authorization");
//   const requestApiKey: string | undefined = getHeader(event, "x-api-key");

//   console.log(headers);

//   // Jika request menyertakan Authorization header, gunakan itu
//   if (authHeader) headers["Authorization"] = authHeader;

//   // Gunakan API key dari environment jika tidak ada API key dari request
//   headers["x-api-key"] = requestApiKey || apiKey || "";

//   let body: any;
//   if (["put", "post", "patch"].includes(event.method.toLowerCase())) {
//     body = await readBody(event);
//   }

//   // Fetch ke backend API dengan tipe eksplisit untuk responsenya
//   const response: any = await $fetch(`${baseUrl}/${path}`, {
//     headers,
//     method: event.method,
//     query,
//     ...(body ? { body } : {}), // Hanya tambahkan body jika ada
//   });

//   return response;
// });
// export default defineEventHandler(async (event) => {
//   const { path } = getRouterParams(event);
//   const query = getQuery(event);
//   const baseUrl = process.env.NUXT_PUBLIC_BASE_URL as string;
//   const headers: any = getHeaders(event);

//   let body;

//   if (
//     event.method.toLowerCase() === "put" ||
//     event.method.toLowerCase() === "post"
//   ) {
//     body = await readBody(event);
//   }

//   try {
//     const urlBase: any = await $fetch(`${baseUrl}/${path}`, {
//       headers,
//       body,
//       query,
//       method: event.method,
//     });

//     return urlBase;
//   } catch (error: any) {
//     // Log error
//     console.error("Proxy error:", error);

//     // Return error response
//     throw createError({
//       statusCode: error.response?.status || 500,
//       statusMessage: error.response?.statusText || "Internal Server Error",
//       data: error.response?.data,
//     });
//   }
// });

// export default defineEventHandler((event) => {
//   const config = useRuntimeConfig();

//   return {
//     console.log("configurasi", config.baseUrl);
//     console.log("configurasi", config.apiKey);
//   }
// });
