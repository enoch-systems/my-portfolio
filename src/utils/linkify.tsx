import React from "react";

/**
 * Converts URLs in text to clickable anchor tags.
 * Handles http, https, and protocol-relative URLs.
 */
export function linkifyText(text: string): React.ReactNode {
  // Match URLs: http, https, or protocol-relative (//)
  const urlRegex = /(https?:\/\/[^\s<]+)/gi;
  const parts = text.split(urlRegex);

  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 decoration-1 hover:decoration-2 transition-all"
          style={{ color: "#25D366", textDecorationColor: "rgba(37,211,102,0.4)" }}
        >
          {part}
        </a>
      );
    }
    return part;
  });
}