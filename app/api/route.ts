export async function GET() {
  const url =
    "https://api.coinmarketcap.com/data-api/v3/cryptocurrency/listing?start=1&limit=1";

  const res = await fetch(url);
  const json = await res.json();

  const btc = json.data.cryptoCurrencyList.find((c: any) => c.id === 1);

  if (!btc) {
    return Response.json({ error: "BTC no encontrado" }, { status: 404 });
  }

  return Response.json({
    id: btc.id,
    name: btc.name,
    symbol: btc.symbol,
    price: btc.quotes[0].price,
    marketCap: btc.quotes[0].marketCap,
    volume24h: btc.quotes[0].volume24h,
    percentChange1h: btc.quotes[0].percentChange1h,
    percentChange24h: btc.quotes[0].percentChange24h,
    percentChange7d: btc.quotes[0].percentChange7d,
    lastUpdated: btc.lastUpdated,
  });
}
