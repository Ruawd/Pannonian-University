const legacyRoutes = new Map([
  ["/index.html", "/"],
  ["/academics.html", "/academics/"],
  ["/curriculum.html", "/curriculum/"],
  ["/admissions.html", "/admissions/"],
  ["/research.html", "/research/"],
  ["/campus.html", "/campus/"],
  ["/contact.html", "/contact/"]
]);

const directoryIndex = "index.html";

export default {
  fetch(request, env) {
    const redirectUrl = getRedirectUrl(request.url);
    if (redirectUrl && (request.method === "GET" || request.method === "HEAD")) {
      return Response.redirect(redirectUrl, 301);
    }

    return env.ASSETS.fetch(request);
  }
};

function getRedirectUrl(value) {
  const url = new URL(value);
  let pathname = url.pathname;

  if (legacyRoutes.has(pathname)) {
    pathname = legacyRoutes.get(pathname);
  } else if (pathname.endsWith(`/${directoryIndex}`)) {
    pathname = pathname.slice(0, -directoryIndex.length);
  } else if (pathname !== "/404.html" && pathname.endsWith(".html") && !pathname.startsWith("/assets/")) {
    pathname = pathname.slice(0, -5);
    if (!pathname.endsWith("/")) pathname = `${pathname}/`;
  } else if (pathname !== "/" && !pathname.endsWith("/") && !pathname.split("/").pop().includes(".")) {
    pathname = `${pathname}/`;
  } else {
    return null;
  }

  if (pathname === url.pathname) return null;

  url.pathname = pathname;
  return url.toString();
}
