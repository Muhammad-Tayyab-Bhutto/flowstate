/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#6366F1',
                secondary: '#8B5CF6',
                accent: '#22C55E',
                'bg-light': '#F8FAFC',
                'bg-dark': '#0F172A',
                'text-primary': '#0F172A',
                'text-secondary': '#64748B'
            },
            fontFamily: {
                heading: ['Inter', 'Roboto', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
            },
            borderRadius: {
                'xl': '12px',
            }
        },
    },
    plugins: [],
}
