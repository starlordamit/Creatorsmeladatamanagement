// src/pages/auth/ForgotPassword.js
'use client'

import { useState } from 'react'
import { useRouter } from 'next/router'
import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Alert,
  InputGroup,
  InputLeftElement,
  IconButton,
  useBreakpointValue,
  ScaleFade,
} from '@chakra-ui/react'
import { AtSignIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [showEmail, setShowEmail] = useState(false) // For toggling email visibility if needed
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Toggle email visibility if needed (optional)
  const handleShowClick = () => setShowEmail(!showEmail)

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccessMessage('')
    try {
      const response = await fetch('https://winner51.online/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage(data.message)
        // Optionally, redirect or perform other actions
      } else {
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bgGradient={useColorModeValue(
        'linear(to-r, gray.50, gray.100)',
        'linear(to-r, gray.800, gray.900)'
      )}
      px={4}
    >
      <ScaleFade initialScale={0.9} in={true}>
        <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6} width="100%">
          <Stack align={'center'}>
            <Heading
              fontSize={{ base: '3xl', sm: '4xl', md: '5xl' }}
              bgGradient="linear(to-r, blue.400, purple.400)"
              bgClip="text"
              fontWeight="extrabold"
            >
              Forgot Your Password?
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} color={'gray.600'}>
              Enter your email address below and we'll send you a link to reset your password.{' '}
              <Text as="span" color={'blue.400'}>
                It's quick and easy!
              </Text>
            </Text>
          </Stack>
          <Box
            rounded={'2xl'}
            bg={useColorModeValue('white', 'gray.700')}
            boxShadow={'2xl'}
            p={8}
            border="1px"
            borderColor={useColorModeValue('gray.200', 'gray.600')}
          >
            <Stack spacing={4}>
              {error && (
                <Alert status="error" borderRadius="md">
                  {error}
                </Alert>
              )}
              {successMessage && (
                <Alert status="success" borderRadius="md">
                  {successMessage}
                </Alert>
              )}
              <form onSubmit={handleForgotPassword}>
                <FormControl id="email" isRequired>
                  <FormLabel>Email address</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <AtSignIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type={showEmail ? 'text' : 'email'}
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      bg={useColorModeValue('gray.100', 'gray.600')}
                      border={0}
                      _focus={{
                        bg: useColorModeValue('white', 'gray.500'),
                        boxShadow: 'outline',
                      }}
                    />
                    {/* Optional: Toggle Email Visibility */}
                    {/* <InputRightElement>
                      <IconButton
                        icon={showEmail ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={handleShowClick}
                        variant="ghost"
                        aria-label="Toggle Email Visibility"
                      />
                    </InputRightElement> */}
                  </InputGroup>
                </FormControl>
                <Stack spacing={6} mt={6}>
                  <Button
                    type="submit"
                    bg={'blue.400'}
                    color={'white'}
                    size={useBreakpointValue({ base: 'md', md: 'lg' })}
                    fontWeight="bold"
                    _hover={{
                      bg: 'blue.500',
                    }}
                    _active={{
                      bg: 'blue.600',
                    }}
                    width="100%"
                    isLoading={isLoading}
                    loadingText="Sending..."
                    transition="background-color 0.2s"
                  >
                    Send Reset Link
                  </Button>
                </Stack>
              </form>
              <Text align="center" mt={4} color={'gray.500'}>
                Remember your password?{' '}
                <Text
                  as="span"
                  color={'blue.400'}
                  cursor="pointer"
                  onClick={() => router.push('/auth/Login')}
                >
                  Sign In
                </Text>
              </Text>
            </Stack>
          </Box>
        </Stack>
      </ScaleFade>
    </Flex>
  )
}
