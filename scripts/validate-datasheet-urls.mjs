import productsData from "../data/products.json" with { type: "json" };

const requiredIds = new Set(["Y4825"]);
const bannedUrlPatterns = [
  /vhb-tape-specialty-tapes/i,
  /multilingual/i,
  /catalog/i,
  /brochure/i,
  /flyer/i,
  /MSDS_.*_AIS/i,
];

const allowedDocumentTypes = new Set(["テクニカルペーパー", "Technical Paper"]);

const errors = [];

for (const product of productsData.products) {
  if (!requiredIds.has(product.id)) continue;

  if (!product.datasheetUrl) {
    errors.push(`${product.id}: datasheetUrl is required.`);
    continue;
  }

  if (!product.datasheetSourcePageUrl?.includes("3mcompany.jp/3M/ja_JP/")) {
    errors.push(`${product.id}: source page must be a 3M Japan page.`);
  }

  if (product.datasheetLanguage !== "ja-JP") {
    errors.push(`${product.id}: datasheetLanguage must be ja-JP.`);
  }

  if (!allowedDocumentTypes.has(product.datasheetDocumentType)) {
    errors.push(`${product.id}: datasheetDocumentType must be a 3M Japan technical paper.`);
  }

  if (product.datasheetSourceSection !== "参考資料 > テクニカルペーパー") {
    errors.push(`${product.id}: source section must be 参考資料 > テクニカルペーパー.`);
  }

  if (bannedUrlPatterns.some((pattern) => pattern.test(product.datasheetUrl))) {
    errors.push(`${product.id}: datasheetUrl points to a banned English/catalog/brochure resource.`);
  }

  if (!product.datasheetTitle?.includes(product.id.replace("Y4825", "Y-4825"))) {
    errors.push(`${product.id}: datasheetTitle should identify the product.`);
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Datasheet URL validation passed.");
