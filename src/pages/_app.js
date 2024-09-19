// src/pages/_app.js

"use client";

import { AuthProvider } from "../context/AuthContext";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { ColorModeScript } from "@chakra-ui/react";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";
import { useEffect } from "react";

// Define the configuration for Chakra UI
const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

// Extend the Chakra UI theme with the configuration
const theme = extendTheme({ config });

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Define the routes where Navbar should be hidden
  const noNavbarRoutes = [
    "/auth/login",
    "/auth/signup",
    "/auth/forgotpassword",
    "/auth/reset",
    "/",
  ];

  // Determine if the current route is in the excluded list
  const hideNavbar = noNavbarRoutes.includes(router.pathname.toLowerCase());

  // Optional: Redirect authenticated users from Login/Signup to Dashboard
  // (Assuming you have authentication logic in AuthContext)
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token && noNavbarRoutes.includes(router.pathname.toLowerCase())) {
      router.push("/dashboard"); // Redirect to dashboard or any other page
    }
  }, [router]);

  return (
    <AuthProvider>
      <ChakraProvider theme={theme}>
        {/* Ensure the initial color mode matches the theme */}
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />

        {/* Conditionally render Navbar */}
        {!hideNavbar ? (
          <Navbar>
            {/* Render the page component */}
            <Component {...pageProps} />
          </Navbar>
        ) : (
          <Component {...pageProps} />
        )}
      </ChakraProvider>
    </AuthProvider>
  );
}

export default MyApp;
