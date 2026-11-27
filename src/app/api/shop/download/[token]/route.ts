import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { join } from "node:path";
import { Readable } from "node:stream";
import { sql } from "@/lib/db";
import { SHOP_PRODUCTS, SHOP_RULES, isFree, type ProductId } from "@/content/shop";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!/^[0-9a-f]{64}$/.test(token)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const since = new Date(Date.now() - SHOP_RULES.downloadDays * 86_400_000).toISOString();

  // Check and count in one statement, so two parallel requests cannot both
  // take the last download. Never says which limit ran out.
  let row: { product_id: string } | undefined;
  try {
    [row] = await sql<{ product_id: string }[]>`
      update shop_orders set downloads = downloads + 1
      where download_token_hash = ${tokenHash} and status = 'paid'
        and downloads < ${SHOP_RULES.maxDownloads} and paid_at >= ${since}
      returning product_id
    `;
  } catch (error) {
    console.error("shop download lookup failed", error);
    return NextResponse.json({ error: "server" }, { status: 503 });
  }
  const product = row && SHOP_PRODUCTS[row.product_id as ProductId];
  if (!product || isFree(product)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Outside public/ on purpose: nothing here is reachable without a token.
  const path = join(process.cwd(), "private", "shop", product.file);
  let size: number;
  try {
    ({ size } = await stat(path));
  } catch (error) {
    console.error("shop file missing", path, error);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }

  return new Response(Readable.toWeb(createReadStream(path)) as ReadableStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Length": String(size),
      "Content-Disposition": `attachment; filename="${product.file}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
