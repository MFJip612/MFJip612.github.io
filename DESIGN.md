---
name: Cybernetic Terminal
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c1c6d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8b90a0'
  outline-variant: '#414754'
  surface-tint: '#adc7ff'
  primary: '#adc7ff'
  on-primary: '#002e68'
  primary-container: '#4a8eff'
  on-primary-container: '#00285b'
  inverse-primary: '#005bc0'
  secondary: '#d3fbff'
  on-secondary: '#00363a'
  secondary-container: '#00eefc'
  on-secondary-container: '#00686f'
  tertiary: '#bcc7de'
  on-tertiary: '#263143'
  tertiary-container: '#8691a7'
  on-tertiary-container: '#1f2a3c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc7ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#7df4ff'
  secondary-fixed-dim: '#00dbe9'
  on-secondary-fixed: '#002022'
  on-secondary-fixed-variant: '#004f54'
  tertiary-fixed: '#d8e3fb'
  tertiary-fixed-dim: '#bcc7de'
  on-tertiary-fixed: '#111c2d'
  on-tertiary-fixed-variant: '#3c475a'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-lg:
    fontFamily: JetBrains Mono
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-sm:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.0'
  code-inline:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  max-width: 1280px
---

## Brand & Style
The design system is engineered for a "Geek Tech" aesthetic, moving away from soft organic forms toward a high-precision, technical interface. It targets developers, engineers, and tech enthusiasts who value efficiency and structural clarity. 

The style is **Corporate Modern with subtle Brutalist influences**, characterized by high-contrast accents and a systematic layout. The interface should feel like a premium command center—sophisticated, responsive, and data-driven. Expect sharp edges, monospaced accents, and a digital-first hierarchy that prioritizes information density without sacrificing legibility.

## Colors
The palette is built on a "Deep Space" foundation to emphasize the vibrant tech accents.

- **Primary (Tech Blue):** A high-energy #007BFF used for critical actions, active states, and primary branding.
- **Secondary (Cyan):** A bright #00F0FF used sparingly for highlights, data visualization, and "glow" effects.
- **Surface Tiers:** The background utilizes #0F172A (Deep Slate), while UI containers use #1E293B to create subtle depth.
- **Accents:** Borders and dividers use a medium slate (#334155) to maintain a technical, "wireframe" feel.

## Typography
Typography is the primary driver of the "Geek Tech" identity. This design system pairs a technical monospace with a high-performance sans-serif.

- **Headlines & Labels:** Uses **JetBrains Mono**. The fixed-width nature evokes terminal windows and code editors. Use uppercase for labels and small headers to enhance the "system readout" feel.
- **Body Text:** Uses **Geist**. This provides a clean, neutral balance to the technicality of the monospace, ensuring long-form content remains readable.
- **Styling:** Maintain tight letter spacing for headlines to keep the tech look "dense" and professional.

## Layout & Spacing
The layout follows a **Rigid Grid System**. Everything is aligned to a 4px baseline to ensure mathematical precision.

- **Grid:** A 12-column fluid grid on desktop, collapsing to 4 columns on mobile. 
- **Patterning:** Backgrounds may feature a subtle 24px dot-grid or line-grid pattern in 5% opacity primary color to reinforce the "blueprint" aesthetic.
- **Margins:** Generous outer margins on desktop create a "windowed" feel, as if the UI is a dedicated application rather than a traditional webpage.

## Elevation & Depth
In this design system, depth is communicated through **Tonal Layering and Border Accents** rather than soft shadows.

- **Stacking:** Use darker surfaces for the background and lighter slates for foreground elements (cards, modals).
- **Outer Glow:** Instead of traditional shadows, use a subtle 2px-4px "Cyan Glow" (low-opacity secondary color) for hovered interactive elements or active states.
- **Lines over Shadows:** Use 1px solid borders (#334155) to define shapes. For high-priority elements, use a double-border or a primary-colored accent line on the left side of the container.

## Shapes
Shapes are predominantly **Sharp and Geometric**. 

- **Corners:** Use 0.25rem (4px) rounding as the maximum for standard components (buttons, cards). This "Soft" setting is just enough to prevent the UI from feeling aggressive while maintaining a precision-machined look.
- **Angles:** Use 45-degree clipped corners for specialized "Status" chips or "Section" headers to mimic hardware aesthetics.

## Components
- **Buttons:** Rectangular with a 1px solid border. The primary button is solid Tech Blue with white text; ghost buttons use a Tech Blue border and monospace labels. Use a "scan-line" hover effect (a subtle moving horizontal gradient).
- **Input Fields:** Dark background (#0F172A) with a sharp border. Focus state changes the border to Tech Blue and adds a small "pixel" indicator in the corner.
- **Cards:** No shadows. Use a 1px border. Card headers should have a slightly different background color (#1E293B) than the body to delineate sections.
- **Chips/Tags:** Use a monospaced font, all-caps, with a background that looks like a terminal highlight.
- **Code Blocks:** Styled to look like a high-end IDE. Use custom scrollbars that are thin and Tech Blue. Include a "Copy" button that uses a terminal-style icon.
- **Progress Bars:** Blocky segments rather than a smooth continuous fill to simulate retro loading bars.