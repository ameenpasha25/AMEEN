"scripts": {
  "start": "node index.js"
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running");
});
// /lib/supplier.js
import axios from "axios";

export async function createSupplierOrder({ product, customer }) {
  const response = await axios.post("https://supplier-api.com/orders", {
    product_id: product.supplierProductId,
    quantity: 1,
    shipping_address: customer.address,
  }, {
    headers: {
      Authorization: `Bearer ${process.env.SUPPLIER_API_KEY}`,
    },
  });

  return response.data;
}

// Modify Stripe webhook to auto-order after payment success:
// Inside webhook after "checkout.session.completed"
/*
const order = await Order.create({...});
await createSupplierOrder({
  product,
  customer: session.customer_details
});
*/

// Add supplierProductId to Product model:
// supplierProductId: String

// ============================================================================
// 2️⃣ CUSTOM DOMAINS PER STORE
// Multi-tenant architecture using domain detection
// ============================================================================

// Add to User model:
// customDomain: String
// subdomain: String

// /middleware.js (Next.js middleware for domain routing)
import { NextResponse } from "next/server";

export function middleware(req) {
  const host = req.headers.get("host");

  // Example: john.yourplatform.com
  const subdomain = host.split(".")[0];

  if (subdomain && subdomain !== "www" && subdomain !== "yourplatform") {
    return NextResponse.rewrite(new URL(`/store/${subdomain}`, req.url));
  }
}

// DNS Setup Required:
// Users must point their domain CNAME to:
// cname.yourplatform.com

// You must verify domain ownership before activation.

// ============================================================================
// 3️⃣ SELLER ANALYTICS DASHBOARD
// ============================================================================

// Add fields to Order model:
// createdAt: { type: Date, default: Date.now }

// /app/api/analytics/route.js
import { Order } from "@/models/Order";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const sellerId = searchParams.get("sellerId");

  const orders = await Order.find({ sellerId, status: "paid" });

  const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
  const totalOrders = orders.length;

  return Response.json({ totalRevenue, totalOrders });
}

// Example frontend dashboard logic:
/*
useEffect(() => {
 fetch(`/api/analytics?sellerId=${user._id}`)
  .then(res => res.json())
  .then(data => setStats(data));
}, []);
*/

// Advanced metrics you can add:
// - Conversion rate
// - Revenue by day (group by date)
// - Top-selling products
// - Refund rate

// ============================================================================
// 4️⃣ FULL PRODUCTION SECURITY HARDENING
// ============================================================================

// A) Rate Limiting (Protect APIs)
// Example using express-rate-limit (if custom server)
/*
const rateLimit = require("express-rate-limit");
app.use(rateLimit({
 windowMs: 15 * 60 * 1000,
 max: 100
}));
*/

// B) Secure Headers
// Use Helmet if custom Node server
/*
const helmet = require("helmet");
app.use(helmet());
*/

// C) JWT Verification Middleware
// /lib/auth.js
import jwt from "jsonwebtoken";

export function verifyToken(req) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) throw new Error("Unauthorized");
  return jwt.verify(token, process.env.JWT_SECRET);
}

// D) Validate All Inputs
// Use schema validation (zod or joi recommended)

// E) Secure Webhooks Properly
// Ensure raw body parsing only for Stripe endpoint
// Never expose secret keys to frontend

// F) HTTPS Only in Production
// Enforce secure cookies

// G) Environment Separation
// - Development keys
// - Production keys

// H) Database Indexing
// Add indexes on:
// sellerId
// createdAt

// I) Logging + Monitoring
// Use services like:
// - Sentry (error tracking)
// - Logtail / Datadog (logs)


 
