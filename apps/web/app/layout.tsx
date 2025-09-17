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
      <body >
        <TRPCprovider  >{children}</TRPCprovider>
      </body>
    </html>
  );
}
