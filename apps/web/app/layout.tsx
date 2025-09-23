'use client'
import TRPCprovider from "../providers/TRPCProvider";
import "./global.css"
  
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Anek+Latin:wght@300;400;500;600;700&family=Fira+Code:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <TRPCprovider  >{children}</TRPCprovider>
      </body>
    </html>
  );
}
