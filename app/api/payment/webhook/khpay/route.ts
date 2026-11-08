import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

import { verifyWebhook, PaymentMethod } from "@/lib/payment";
import { notifyTelegram, escapeHtml } from "@/lib/telegram";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { method: string } }
) {
  const method = params.method.toUpperCase() as PaymentMethod;

  if (method !== "KHPAY") {
    return NextResponse.json({ error: "Invalid method" }, { status: 400 });
  }

  const rawBody = await req.text();
  const headers: Record<string, string> = {};
  req.headers.forEach((v, k) => {
    headers[k.toLowerCase()] = v;
  });

  const valid = verifyWebhook(method, rawBody, headers);
  if (!valid) {
    console.warn(`[webhook] Invalid signature from ${method}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event: string = payload.event || "";
  const data = payload.data || {};
  const transactionId: string | undefined = data.transaction_id;
  const orderNumber: string | undefined =
    data.metadata?.order_number || data.metadata?.orderNumber;

  if (!orderNumber && !transactionId) {
    return NextResponse.json({ error: "Missing identifier" }, { status: 400 });
  }

  const order = orderNumber
    ? await prisma.order.findUnique({ where: { orderNumber } })
    : await prisma.order.findFirst({ where: { paymentRef: transactionId! } });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status !== "PENDING") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  if (event === "payment.paid") {
    const paidAmount = parseFloat(String(data.amount ?? "0"));
    if (!Number.isFinite(paidAmount) || Math.abs(paidAmount - order.amountUsd) > 0.01) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "FAILED",
          failureReason: `Amount mismatch: got ${paidAmount}, expected ${order.amountUsd}`,
        },
      });
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        paymentRef: transactionId || order.paymentRef,
      },
    });

    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { game: true, product: true },
    });
    
    if (fullOrder) {
      const baseUrl = process.env.PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
      const link = baseUrl ? `\n<a href="${baseUrl}/admin/orders/${fullOrder.orderNumber}">Open in admin</a>` : "";
      
      // កែសម្រួល Emoji នៅទីនេះឱ្យត្រូវជា 💰
      await notifyTelegram(
        `💰 <b>New paid order</b>\n` +
          `<b>#${escapeHtml(fullOrder.orderNumber)}</b>\n` +
          `${escapeHtml(fullOrder.game.name)} — ${escapeHtml(fullOrder.product.name)}\n` +
          `UID: <code>${escapeHtml(fullOrder.playerUid)}</code>\n` +
          `Amount: $${fullOrder.amountUsd.toFixed(2)}${link}`
      );
    }
  } else if (event === "payment.expired" || event === "payment.failed") {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "FAILED",
        failureReason: `KHPay: ${event}`,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
