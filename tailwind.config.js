/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FAB800",
        secondary: "#404854",
        primaryBackground: "#FAFCFF",
        secondaryBackground: "#f9fafb ",
        chipColor: "#E5E7EB",
        buttonColor: "#FAB800",
        stepperGreenColor: "#56D28F",
        textGrayColor: "#404854",
        iconColor: "#404854",
        buttonTextColor: "#5F6B7C",
        textLightGrayColor: "#738091",
        dividerBackground: "#FAB80080",
        textYellowColor: "#F1AE34",
        borderColor: "#C5CBD3",
        deleteButtonColor: "#dc2626",
        iconPannelColor: "#1f2937",
        toolTipColor: "#1f2937",
      },
    },
  },
  plugins: [],
};
