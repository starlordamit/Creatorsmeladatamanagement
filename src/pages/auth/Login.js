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
  Alert,
  InputGroup,
  InputRightElement,
  IconButton,
  useBreakpointValue,
  ScaleFade,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon, AtSignIcon, MoonIcon, SunIcon } from '@chakra-ui/icons'
import { login } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login: loginUser } = useAuth()
  const router = useRouter()

  const { colorMode, toggleColorMode } = useColorMode() // For light/dark mode toggle

  // Client-side rendering state
  const [isMounted, setIsMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Trigger the animation after mount
    setIsOpen(true)
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const data = await login(email, password)
      loginUser(data.token)
      router.push('/dashboard')
    } catch (err) {
      setError('Invalid credentials. Please try again.')
    }
  }

  const handleShowClick = () => setShowPassword(!showPassword)

  if (!isMounted) {
    return null
  }

  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bgGradient={useColorModeValue('linear(to-r, gray.50, gray.100)', 'linear(to-r, gray.800, gray.900)')}
      px={4}
    >
      <ScaleFade initialScale={0.9} in={isOpen}>
        <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6} width="100%">
          <Stack align={'center'}>
            <Heading
              fontSize={{ base: '3xl', sm: '4xl', md: '5xl' }}
              bgGradient='linear(to-r, blue.400, purple.400)'
              bgClip='text'
              fontWeight='extrabold'
            >
              Welcome Back!
            </Heading>
            <IconButton
              aria-label="Toggle dark mode"
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode} // Toggles between light and dark modes
              variant="ghost"
              size="lg"
              alignSelf="center"
            />
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
              {error && <Alert status="error" borderRadius="md">{error}</Alert>}
              <form onSubmit={handleLogin}>
                <FormControl id="email" isRequired>
                  <FormLabel>Email address</FormLabel>
                  <InputGroup>
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
                    <InputRightElement pointerEvents="none">
                      <AtSignIcon color="gray.400" />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
                <FormControl id="password" isRequired mt={4}>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
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
                    size={{ base: 'md', md: 'lg' }}
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
                    Sign in
                  </Button>
                </Stack>
              </form>
              <Stack direction="row" justify="space-between" align="center" mt={4}>
                <Text
                  as="span"
                  color={'blue.400'}
                  cursor="pointer"
                  onClick={() => router.push('/auth/ForgotPassword')}
                >
                  Forgot Password?
                </Text>
                <Text align="center" color={'gray.500'}>
                  Don't have an account?{' '}
                  <Text as="span" color={'blue.400'} cursor="pointer" onClick={() => router.push('/auth/Signup')}>
                    Sign Up
                  </Text>
                </Text>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </ScaleFade>
    </Flex>
  )
}
