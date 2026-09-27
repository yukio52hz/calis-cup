import { Archivo_Black, Inter } from "next/font/google";

export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Titulares gruesos en mayúsculas, como en los diseños de docs/ui
export const fontDisplay = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo-black",
});
