/** @type {import('tailwindcss').Config} */
module.exports = {
   content: ["./src/**/*.{js,jsx,ts,tsx}"],
   theme: {

    extend: {
      colors: {
        primary: 'hsl(0, 0%, 9%)',
        primaryForeground: 'hsl(0, 0%, 98%)',
        secondary: 'hsl(0, 0%, 96.1%)',
        secondaryForeground: 'hsl(0, 0%, 9%)',
        background: 'hsl(0, 0%, 100%)',
        foreground: 'hsl(0, 0%, 3.9%)',
        card: 'hsl(0, 0%, 100%)',
        cardForeground: 'hsl(0, 0%, 3.9%)',
        popover: 'hsl(0, 0%, 100%)',
        popoverForeground: 'hsl(0, 0%, 3.9%)',
        muted: 'hsl(0, 0%, 96.1%)',
        mutedForeground: 'hsl(0, 0%, 45.1%)',
        accent: 'hsl(0, 0%, 96.1%)',
        accentForeground: 'hsl(0, 0%, 9%)',
        destructive: 'hsl(0, 84.2%, 60.2%)',
        destructiveForeground: 'hsl(0, 0%, 98%)',
        border: 'hsl(0, 0%, 89.8%)',
        input: 'hsl(0, 0%, 89.8%)',
        ring: 'hsl(0, 0%, 3.9%)',

        primaryDark: 'hsl(0, 0%, 98%)',
        primaryForegroundDark: 'hsl(0, 0%, 9%)',
        secondaryDark: 'hsl(0, 0%, 14.9%)',
        secondaryForegroundDark: 'hsl(0, 0%, 98%)',
        backgroundDark: 'hsl(0, 0%, 3.9%)',
        foregroundDark: 'hsl(0, 0%, 98%)',
        cardDark: 'hsl(0, 0%, 3.9%)',
        cardForegroundDark: 'hsl(0, 0%, 98%)',
        popoverDark: 'hsl(0, 0%, 3.9%)',
        popoverForegroundDark: 'hsl(0, 0%, 98%)',
        mutedDark: 'hsl(0, 0%, 14.9%)',
        mutedForegroundDark: 'hsl(0, 0%, 63.9%)',
        accentDark: 'hsl(0, 0%, 14.9%)',
        accentForegroundDark: 'hsl(0, 0%, 98%)',
        destructiveDark: 'hsl(0, 62.8%, 30.6%)',
        destructiveForegroundDark: 'hsl(0, 0%, 98%)',
        borderDark: 'hsl(0, 0%, 14.9%)',
        inputDark: 'hsl(0, 0%, 14.9%)',
        ringDark: 'hsl(0, 0%, 83.1%)',
      },
       
        borderRadius: {
          DEFAULT: '16px',
          inputRadius: '12px',
        },
  
    },
  },
  plugins: [],
}

