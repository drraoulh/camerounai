/** SVG flags — emoji flags don't render on Windows. */
export function LangFlag({ code }: { code: "fr" | "en" }) {
  if (code === "fr") {
    return (
      <svg
        className="lang-flag"
        viewBox="0 0 9 6"
        width="22"
        height="15"
        aria-hidden
        focusable="false"
      >
        <rect width="3" height="6" fill="#002395" />
        <rect x="3" width="3" height="6" fill="#fff" />
        <rect x="6" width="3" height="6" fill="#ED2939" />
      </svg>
    );
  }

  return (
    <svg
      className="lang-flag"
      viewBox="0 0 60 30"
      width="22"
      height="15"
      aria-hidden
      focusable="false"
    >
      <rect width="60" height="30" fill="#012169" />
      <path d="M0 0 L60 30 M60 0 L0 30" stroke="#fff" strokeWidth="6" />
      <path d="M0 0 L60 30 M60 0 L0 30" stroke="#C8102E" strokeWidth="4" />
      <path d="M30 0 V30 M0 15 H60" stroke="#fff" strokeWidth="10" />
      <path d="M30 0 V30 M0 15 H60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}
