import test from "node:test";
import assert from "node:assert/strict";
import {
  generateWriteUp,
  seoTitle,
  seoDescription,
  productJsonLd,
  jsonLd,
  writeUpFor,
} from "../src/lib/seo";

const ctx = { siteName: "Luxury Time Namibia", location: "Windhoek, Namibia" };
const sub = {
  slug: "rolex-submariner-date-ab12",
  brand: "Rolex",
  model: "Submariner Date",
  reference: "126610LN",
  year: 2021,
  condition: "Excellent",
  price: 189900,
  currency: "NAD",
  box: true,
  papers: true,
  diameter: "41mm",
  movement: "Automatic calibre 3235",
  caseMaterial: "Oystersteel",
  dial: "Black",
  bracelet: "Oyster",
  waterResistance: "300 m",
  defects: "",
  sellerType: "STORE" as const,
  availability: "AVAILABLE" as const,
  images: ["https://cdn.example/1.webp"],
};

test("write-up uses only the listing's facts", () => {
  const text = generateWriteUp(sub, ctx);
  for (const fact of [
    "Rolex Submariner Date",
    "126610LN",
    "2021",
    "excellent",
    "a 41mm Oystersteel case",
    "a black dial",
    "an Oyster bracelet",
    "runs on an automatic calibre 3235.",
    "calibre 3235",
    "300 m",
    "box and papers",
    "N$ 189,900",
    "Windhoek",
  ])
    assert.ok(text.toLowerCase().includes(fact.toLowerCase()), fact);
  for (const claim of ["authentic", "warranty", "serviced", "delivery"])
    assert.ok(!text.toLowerCase().includes(claim), "no claim: " + claim);
  assert.ok(text.split("\n\n").length >= 4);
});

test("write-up handles sparse listings and private sellers", () => {
  const text = generateWriteUp(
    {
      ...sub,
      slug: "x",
      reference: null,
      year: null,
      diameter: null,
      movement: null,
      caseMaterial: null,
      dial: null,
      bracelet: null,
      waterResistance: null,
      box: false,
      papers: false,
      defects: "Light scratches on the clasp",
      sellerType: "THIRD_PARTY",
      availability: "RESERVED",
    },
    ctx,
  );
  assert.ok(!/null|undefined/.test(text));
  assert.match(text, /without the original box or papers/);
  assert.match(text, /condition notes/);
  assert.match(text, /private seller/);
  assert.match(text, /currently reserved/);
  assert.ok(!text.includes("N$"));
});

test("wording varies between listings but is stable per listing", () => {
  const a = generateWriteUp(sub, ctx);
  assert.equal(a, generateWriteUp(sub, ctx));
  const variants = new Set(
    Array.from(
      { length: 12 },
      (_, i) => generateWriteUp({ ...sub, slug: "s" + i }, ctx).split(".")[0],
    ),
  );
  assert.ok(variants.size > 1);
});

test("titles and descriptions fit search limits; overrides win", () => {
  assert.ok(seoTitle(sub).length <= 60);
  assert.match(seoTitle(sub), /Rolex Submariner Date/);
  const d = seoDescription(sub, ctx);
  assert.ok(d.length <= 158, String(d.length));
  assert.match(d, /N\$ 189,900/);
  assert.equal(seoTitle({ ...sub, seoTitle: "Custom" }), "Custom");
  assert.equal(writeUpFor({ ...sub, writeUp: "Mine" }, ctx), "Mine");
});

test("product structured data", () => {
  const data = productJsonLd(sub, "https://x.test/watches/a", ctx);
  assert.equal(data.offers.priceCurrency, "NAD");
  assert.equal(data.offers.price, "189900.00");
  assert.equal(data.mpn, "126610LN");
  assert.equal(data.offers.itemCondition, "https://schema.org/UsedCondition");
  assert.ok(!jsonLd({ a: "</script>" }).includes("</script>"));
});
