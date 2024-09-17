'use client'

import { Box, Button, Heading, Stack, Text, useColorModeValue, Flex, useBreakpointValue, Link } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  // Responsive settings for heading and subtext
  const headingSize = useBreakpointValue({ base: '4xl', md: '7xl' }) // Larger on desktop, medium on mobile
  const subTextSize = useBreakpointValue({ base: 'md', md: 'xl' })

  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      direction="column"
      bgGradient={useColorModeValue('linear(to-r, gray.50, gray.100)', 'linear(to-r, gray.800, gray.900)')}
      px={4}
      textAlign="center"
    >
      <Heading
        as={motion.h1}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        fontSize={headingSize}
        bgGradient="linear(to-r, blue.400, purple.400)"
        bgClip="text"
        fontWeight="extrabold"
        mb={4}
      >
        Welcome to CreatorsMela
      </Heading>
      <Text
        fontSize={subTextSize}
        mb={6}
        color={useColorModeValue('gray.600', 'gray.300')}
        as={motion.p}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        The platform for creators and brands to collaborate and grow.
      </Text>
      <Stack direction="row" spacing={4} align="center">
        <Button
          size="lg"
          bgGradient="linear(to-r, teal.400, blue.400)"
          color="white"
          _hover={{
            bgGradient: 'linear(to-r, teal.500, blue.500)',
            boxShadow: 'xl',
          }}
          as={motion.button}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/auth/Signup')}
        >
          Get Started
        </Button>
        <Button
          size="lg"
          bgGradient="linear(to-r, teal.400, blue.400)"
          color="white"
          _hover={{
            bgGradient: 'linear(to-r, teal.500, blue.500)',
            boxShadow: 'xl',
          }}
          as={motion.button}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/auth/Login')}
        >
          Login
        </Button>
       
      </Stack>
      <Link
      mt={4}
          href="https://creatorsmela.com"
          isExternal
          fontSize={subTextSize}
          color={useColorModeValue('blue.500', 'blue.300')}
          _hover={{
            textDecoration: 'underline',
          }}
        >
          Visit creatorsmela.com
        </Link>
    </Flex>
  )
}
