"use client"

import { useState, useEffect } from "react"

/**
 * Hook to detect if the user's operating system is macOS or iOS.
 * Used to display the appropriate keyboard shortcut hints (⌘K vs Ctrl+K).
 */
export function useIsMac() {
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      const nav = navigator as any
      const platform = nav.userAgentData?.platform || nav.platform || nav.userAgent || ""
      setIsMac(/mac|iphone|ipad|ipod/i.test(platform))
    }
  }, [])

  return isMac
}
