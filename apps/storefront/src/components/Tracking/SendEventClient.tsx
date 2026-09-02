"use client";

import { useEffect, useRef } from "react";
import { sendBehaviorEvent } from "@/lib/behavior";
import { getCustomerId } from "@/lib/session";

type Props = {
  eventType: string;
  productId?: string;
  variantId?: string;
  properties?: Record<string, unknown>;
};

export function SendEventClient({
  eventType,
  productId,
  variantId,
  properties,
}: Props) {
  const lastSentKeyRef = useRef<string | null>(null);
 console.log("[Behavior] COMPONENT RENDERED");

  useEffect(() => {
    console.log("[Behavior] Component mounted/effect", {
      eventType,
      productId,
      variantId,
      properties,
    });

    const key = `${eventType}:${productId ?? ""}:${variantId ?? ""}`;

    console.log("[Behavior] Event key:", key);

    if (lastSentKeyRef.current === key) {
      console.log("[Behavior] Duplicate event, skipped:", key);
      return;
    }

    function doSend() {
      if (lastSentKeyRef.current === key) {
        console.log("[Behavior] Duplicate event inside doSend, skipped");
        return;
      }

      lastSentKeyRef.current = key;

      const envelope = {
        eventId:
          typeof crypto !== "undefined" &&
          typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`,
        eventType,
        version: 1,
        occurredAt: new Date().toISOString(),
        productId: productId ?? null,
        variantId: variantId ?? null,
        properties: properties ?? {},
      };

      console.log("[Behavior] Sending event:", envelope);

      void sendBehaviorEvent(envelope)
        .then((result) => {
          console.log("[Behavior] Event sent successfully:", result);
        })
        .catch((error) => {
          console.error("[Behavior] Failed to send event:", error);
        });
    }

    const customerId = getCustomerId();

    console.log("[Behavior] Customer ID:", customerId);

    if (customerId) {
      console.log("[Behavior] Customer found → sending event");
      doSend();
      return;
    }

    console.log("[Behavior] No customer → waiting for login");

    const onStorage = (ev: StorageEvent) => {
      console.log("[Behavior] Storage event:", {
        key: ev.key,
        newValue: ev.newValue,
      });

      if (ev.key === "customerId" && ev.newValue) {
        console.log("[Behavior] Customer logged in → sending event");
        doSend();
      }
    };

    window.addEventListener("storage", onStorage);

    const pollInterval = 500;
    let elapsed = 0;
    const maxWait = 30_000;

    const timer = window.setInterval(() => {
      const cid = getCustomerId();

      console.log("[Behavior] Checking customer:", cid);

      if (cid) {
        console.log("[Behavior] Customer found by polling → sending event");
        doSend();

        clearInterval(timer);
        window.removeEventListener("storage", onStorage);
      }

      elapsed += pollInterval;

      if (elapsed >= maxWait) {
        console.log("[Behavior] Timeout waiting for customer");

        clearInterval(timer);
        window.removeEventListener("storage", onStorage);
      }
    }, pollInterval);

    return () => {
      console.log("[Behavior] Cleanup");

      clearInterval(timer);
      window.removeEventListener("storage", onStorage);
    };
  }, [eventType, productId, variantId, properties]);

  return null;
}