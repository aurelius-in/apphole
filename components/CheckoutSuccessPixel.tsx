"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

export function CheckoutSuccessPixel() {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    try {
      if (sessionStorage.getItem("ah_pixel_subscribe")) return;
      sessionStorage.setItem("ah_pixel_subscribe", "1");
    } catch {
      /* ignore */
    }
    sent.current = true;
    track("ah_subscription_started");
  }, []);

  return null;
}
