export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === "VERIFY_TOKEN") {
    return new Response(challenge);
  }

  return new Response("Forbidden", { status: 403 });
}

export async function onRequestPost() {
  return new Response("ok");
}
