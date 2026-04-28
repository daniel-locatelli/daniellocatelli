import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
    "!./src/pages/og-image/[slug].png.ts",
  ],
  theme: {
    extend: {
      spacing: {
        "128": "32rem",
      },
      fontFamily: {
        // Add any custom fonts here
        sans: [...defaultTheme.fontFamily.sans],
        serif: [...defaultTheme.fontFamily.serif],
        title: ["Montserrat", ...defaultTheme.fontFamily.sans],
        body: ["Poppins Light", ...defaultTheme.fontFamily.sans],
      },
      transitionProperty: {
        height: "height",
      },
      // that is animation class
      animation: {
        fade: "fadeIn 500ms ease-in",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // Remove above once tailwindcss exposes theme type
      typography: () => ({
        DEFAULT: {
          css: {
            // Override prose CSS custom properties for dark theme
            "--tw-prose-body": "var(--color-zinc-200)",
            "--tw-prose-headings": "var(--color-zinc-100)",
            "--tw-prose-lead": "var(--color-zinc-300)",
            "--tw-prose-links": "var(--color-green-500)",
            "--tw-prose-bold": "var(--color-zinc-100)",
            "--tw-prose-counters": "var(--color-zinc-400)",
            "--tw-prose-bullets": "var(--color-zinc-400)",
            "--tw-prose-hr": "var(--color-zinc-700)",
            "--tw-prose-quotes": "var(--color-zinc-400)",
            "--tw-prose-quote-borders": "var(--color-zinc-700)",
            "--tw-prose-captions": "var(--color-zinc-400)",
            "--tw-prose-code": "var(--color-green-200)",
            "--tw-prose-pre-code": "var(--color-zinc-300)",
            "--tw-prose-pre-bg": "var(--color-zinc-900)",
            "--tw-prose-th-borders": "var(--color-zinc-600)",
            "--tw-prose-td-borders": "var(--color-zinc-700)",
            // Element-specific overrides
            h2: {
              marginBottom: "0.3333em",
            },
            h4: {
              color: "var(--color-zinc-200)",
            },
            a: {
              textDecoration: "none",
              transition: "color 300ms",
              "&:hover": {
                color: "var(--color-green-400)",
              },
            },
            strong: {
              fontWeight: "700",
            },
            blockquote: {
              borderLeftWidth: "2px",
              borderLeftColor: "var(--color-green-600)",
              paddingLeft: "1rem",
              fontStyle: "italic",
              color: "var(--color-zinc-300)",
              marginBottom: "0.8em",
            },
            figure: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            },
            img: {
              borderRadius: "0.5rem",
            },
            code: {
              backgroundColor: "var(--color-zinc-800)",
              color: "var(--color-zinc-200)",
              padding: "0.2em 0.4em",
              borderRadius: "6px",
              fontSize: "85%",
              fontWeight: "400",
            },
            "code::before": {
              content: "none",
            },
            "code::after": {
              content: "none",
            },
            hr: {
              borderTopStyle: "dashed",
            },
            th: {
              fontWeight: "light",
            },
            thead: {
              borderBottomWidth: "none",
            },
            "thead th": {
              fontWeight: "300",
              borderBottomWidth: "1px",
              borderBottomStyle: "dashed",
              borderBottomColor: "var(--color-zinc-600)",
            },
            "tbody tr": {
              borderBottomWidth: "none",
            },
            tfoot: {
              borderTopWidth: "1px",
              borderTopStyle: "dashed",
              borderTopColor: "var(--color-zinc-600)",
            },
            // Footnote markers (sup > a.footnote-ref) are styled as pills via
            // the rules in src/styles/global.css; keep this block lean so it
            // doesn't fight that pill design with brackets or color overrides.
            sup: {
              marginInlineStart: "0.125rem",
            },
          },
        },
      }),
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
} satisfies Config;
// corePlugins: {
//   // disable aspect ratio as per docs -> @tailwindcss/aspect-ratio
//   aspectRatio: false,
//   // disable some core plugins as they are included in the css, even when unused
//   touchAction: false,
//   ringOffsetWidth: false,
//   ringOffsetColor: false,
//   scrollSnapType: false,
//   borderOpacity: false,
//   textOpacity: false,
//   fontVariantNumeric: false,
// },
