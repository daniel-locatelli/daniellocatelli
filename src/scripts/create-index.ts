import "dotenv/config";
import axios from "axios";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const INDEX_NAME = "daniel-portfolio";

async function main() {
  if (!ACCOUNT_ID || !API_TOKEN) {
    console.error(
      "Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN in .env",
    );
    console.log("Please add them to your .env file.");
    process.exit(1);
  }

  console.log(`Creating Vectorize index: ${INDEX_NAME}...`);

  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/vectorize/v1/indexes`;
    const response = await axios.post(
      url,
      {
        name: INDEX_NAME,
        config: {
          dimensions: 768,
          metric: "cosine",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Success! Index created:", response.data.result);
  } catch (err: any) {
    if (err.response?.data?.errors?.[0]?.code === 10001) {
      console.log("Index already exists! Moving on...");
    } else {
      console.error("Error creating index:", err.response?.data || err.message);
    }
  }
}

main().catch(console.error);
