"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function OrderCancelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tranId = searchParams.get("tran_id");

  return (
    <div className="bg-white min-h-screen pt-20 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto text-center space-y-6 animate-in zoom-in-95 duration-500">
        <div className="flex justify-center text-amber-500">
          <AlertTriangle size={88} strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-gray-900">
            Payment Cancelled
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            You cancelled the payment transaction. No charges were made.
          </p>
        </div>

        {tranId && (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs font-mono text-gray-600">
            Transaction Reference:{" "}
            <span className="font-bold text-gray-900">{tranId}</span>
          </div>
        )}

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => router.push("/checkout")}
            className="h-12 px-8 rounded-xl font-bold text-xs uppercase tracking-wider bg-gray-900 text-white hover:bg-gray-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Checkout
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push("/shop")}
            className="h-12 px-8 rounded-xl font-bold text-xs uppercase tracking-wider"
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Browse Products
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OrderCancelPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      }
    >
      <OrderCancelContent />
    </React.Suspense>
  );
}
