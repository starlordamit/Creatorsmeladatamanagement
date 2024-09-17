// src/pages/_app.js
import { ChakraProvider } from '@chakra-ui/react'
import { AuthProvider } from '../context/AuthContext'
// import 'react-dates/initialize';
// import 'react-dates/lib/css/_datepicker.css';


function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider> {/* Wrap the app with AuthProvider */}
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </AuthProvider>
  )
}

export default MyApp
