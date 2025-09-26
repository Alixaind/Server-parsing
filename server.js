import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

const app = express();
app.use(bodyParser.json());

async function scrapeShopee(url) {
  try {
    const response = await fetch(url, { redirect: "follow" });
    const html = await response.text();
    const $ = cheerio.load(html);

    const raw = $("script#__NEXT_DATA__").html();
    if (!raw) return { error: "Gagal ambil data produk" };

    const json = JSON.parse(raw);
    const product = json.props?.pageProps?.initialState?.product?.item;
    if (!product) return { error: "Produk tidak ditemukan" };

    const title = product.name;
    const price = product.price_min / 100000;
    return { title, price: `Rp${price.toLocaleString()}` };
  } catch (e) {
    return { error: e.message };
  }
}

app.post("/parse", async (req, res) => {
  const { link } = req.body;
  if (!link) return res.json({ error: "No link provided" });

  if (link.includes("shopee")) {
    const result = await scrapeShopee(link);
    return res.json(result);
  }

  res.json({ error: "Marketplace belum didukung" });
});

// untuk test di browser
app.get("/", (req, res) => {
  res.send("API Scraper jalan 🚀");
});

app.listen(3000, () => console.log("Server jalan di port 3000"));
