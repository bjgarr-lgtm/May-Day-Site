export async function onRequestGet(context) {
  return new Response(JSON.stringify({ items: [] }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
