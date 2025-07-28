"use client";
import { useEffect } from "react";

export default function HydrationCleanup() {
  useEffect(() => {
    const allowed = ["style", "class", "id", "suppresshydrationwarning"];
    Array.from(document.body.attributes).forEach((attr) => {
      if (!allowed.includes(attr.name.toLowerCase())) {
        document.body.removeAttribute(attr.name);
      }
    });
  }, []);
  return null;
}
