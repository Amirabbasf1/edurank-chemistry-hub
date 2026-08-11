import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await (supabaseAdmin.from("products") as any).select("*").eq("is_active", true);
  return (data as any[]) ?? [];
});

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => 
    z.object({
      productId: z.string().uuid(),
      couponCode: z.string().optional()
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    const { data: product } = await (supabaseAdmin.from("products") as any).select("*").eq("id", data.productId).single();
    if (!product) throw new Error("Product not found");

    const { data: order, error } = await (supabaseAdmin.from("orders") as any).insert({
      user_id: userId,
      total_amount: (product as any).price,
      status: 'pending',
    }).select().single();

    if (error) throw error;
    return order;
  });
