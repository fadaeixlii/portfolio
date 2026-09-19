/**
 * Mounted once per document. Defines the displacement map that
 * `variant="glass-refracted"` references. Inert everywhere it is unsupported.
 */
export function GlassFilter() {
  return (
    <svg
      aria-hidden
      focusable="false"
      className="pointer-events-none absolute size-0"
    >
      <filter
        id="glass-refraction"
        x="0%"
        y="0%"
        width="100%"
        height="100%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.008 0.008"
          numOctaves={2}
          seed={7}
          result="noise"
        />
        <feGaussianBlur in="noise" stdDeviation="2" result="soft" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="soft"
          scale={12}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}
