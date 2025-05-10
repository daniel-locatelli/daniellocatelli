import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/**/*.{astro,html,js,jsx,md,svelte,ts,tsx,vue}",
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
        title: [...defaultTheme.fontFamily.sans],
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
      typography: (theme) => ({
        DEFAULT: {
          css: {
            a: {
              "@apply cactus-link": "",
            },
            strong: {
              fontWeight: "300",
            },
            code: {
              border: "1px dotted #666",
              borderRadius: "2px",
            },
            blockquote: {
              borderLeftWidth: "0",
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
              borderBottom: "1px dashed #666",
            },
            "tbody tr": {
              borderBottomWidth: "none",
            },
            tfoot: {
              borderTop: "1px dashed #666",
            },
            sup: {
              "@apply ms-0.5": "",
              a: {
                "@apply bg-none": "",
                "&:hover": {
                  "@apply text-link no-underline bg-none": "",
                },
                "&:before": {
                  content: "'['",
                },
                "&:after": {
                  content: "']'",
                },
              },
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
