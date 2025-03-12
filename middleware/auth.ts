export default defineNuxtRouteMiddleware(() => {
  const token = useCookie("session/token");

  if (!token.value) {
    return navigateTo("/login");
  }
});
