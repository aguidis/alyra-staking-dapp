module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {},
    },
    variants: {
        backgroundColor: ({ after }) => after(['disabled']),
    },
    plugins: [],
}
