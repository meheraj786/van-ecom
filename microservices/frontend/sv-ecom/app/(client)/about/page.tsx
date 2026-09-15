"use client";

import React from "react";
import { useTheme } from "@/hooks/useTheme";
import {
  About1,
  About2,
  About3,
} from "@/components/clientComponents/AboutVariants";

export default function AboutPage() {
  const { data: themeData } = useTheme();

  const layout = themeData?.aboutPage?.layout || 1;

  if (layout === 2) {
    return <About2 />;
  }

  if (layout === 3) {
    return <About3 />;
  }

  return <About1 />;
}
