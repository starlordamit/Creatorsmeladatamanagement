// src/pages/auth/Signup.js
'use client'

import { useState, useEffect } from 'react'
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
  InputRightElement
} from '@chakra-ui/react'
import { AtSignIcon, LockIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons' // Added icons
import { signup } from '../../services/api' // Import the signup API function

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false) // For toggling password visibility
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const router = useRouter()

  // Client-side rendering state
  const [isMounted, setIsMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Trigger the animation after mount
    setIsOpen(true)
  }, [])

  const handleSignup = async (e) => {
    e.preventDefault()
    try {
      // Call signup API to create the user
      await signup(name, email, password)
      setSuccessMessage('Signup successful! Redirecting to login...')
      setTimeout(() => {
        router.push('/auth/Login') // Redirect to login after successful signup
      }, 2000)
    } catch (err) {
      setError(err)
    }
  }

  // Toggle password visibility
  const handleShowClick = () => setShowPassword(!showPassword)

  // Prevent rendering until the client is mounted
  if (!isMounted) {
    return null
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
      <ScaleFade initialScale={0.9} in={isOpen}>
        <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6} width="100%">
          <Stack align={'center'}>
            <Heading
              fontSize={{ base: '3xl', sm: '4xl', md: '5xl' }}
              bgGradient="linear(to-r, blue.400, purple.400)"
              bgClip="text"
              fontWeight="extrabold"
            >
              Create Your Account
            </Heading>
            {/* <Text fontSize={{ base: 'md', md: 'lg' }} color={'gray.600'}>
              Join us and enjoy all of our cool{' '}
              <Text as="span" color={'blue.400'}>
                features
              </Text>{' '}
              ✌️
            </Text> */}
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
              <form onSubmit={handleSignup}>
                <FormControl id="name" isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <AtSignIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      bg={useColorModeValue('gray.100', 'gray.600')}
                      border={0}
                      _focus={{
                        bg: useColorModeValue('white', 'gray.500'),
                        boxShadow: 'outline',
                      }}
                    />
                  </InputGroup>
                </FormControl>
                <FormControl id="email" isRequired mt={4}>
                  <FormLabel>Email address</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <AtSignIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="email"
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
                  </InputGroup>
                </FormControl>
                <FormControl id="password" isRequired mt={4}>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <LockIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      bg={useColorModeValue('gray.100', 'gray.600')}
                      border={0}
                      _focus={{
                        bg: useColorModeValue('white', 'gray.500'),
                        boxShadow: 'outline',
                      }}
                    />
                    <InputRightElement>
                      <IconButton
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={handleShowClick}
                        variant="ghost"
                        aria-label="Toggle Password Visibility"
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
                <Stack spacing={6} mt={6}>
                  <Button
                    type="submit"
                    bg={'blue.400'}
                    color={'white'}
                    size={{ base: 'md', md: 'lg' }} // Responsive size
                    fontWeight="bold"
                    _hover={{
                      bg: 'blue.500',
                    }}
                    _active={{
                      bg: 'blue.600',
                    }}
                    width="100%"
                    transition="background-color 0.2s"
                  >
                    Sign Up
                  </Button>
                </Stack>
              </form>
              <Text align="center" mt={4} color={'gray.500'}>
                Already have an account?{' '}
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
