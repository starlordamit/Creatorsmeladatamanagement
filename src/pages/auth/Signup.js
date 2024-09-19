// src/pages/auth/Signup.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
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
  InputLeftElement,
  IconButton,
  useBreakpointValue,
  ScaleFade,
  useColorMode,
  useColorModeValue,
  InputRightElement,
} from "@chakra-ui/react";
import { AtSignIcon, LockIcon, ViewIcon, ViewOffIcon } from "@chakra-ui/icons"; // Added icons
import { signup } from "../../services/api"; // Import the signup API function

export default function Signup() {
  // **State Management**
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // For toggling password visibility
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  // **Color Mode Hooks**
  const { colorMode, toggleColorMode } = useColorMode();

  // **Predefine all useColorModeValue calls at the top level**
  const bgGradient = useColorModeValue(
    "linear(to-r, gray.50, gray.100)",
    "linear(to-r, gray.800, gray.900)"
  );
  const bgBox = useColorModeValue("white", "gray.700");
  const borderColorBox = useColorModeValue("gray.200", "gray.600");
  const bgInput = useColorModeValue("gray.100", "gray.600");
  const bgInputFocus = useColorModeValue("white", "gray.500");
  const iconColor = useColorModeValue("gray.400", "gray.400");
  const alertBgError = useColorModeValue("red.100", "red.600");
  const alertColorError = useColorModeValue("red.700", "white");
  const alertBgSuccess = useColorModeValue("green.100", "green.600");
  const alertColorSuccess = useColorModeValue("green.700", "white");
  const btnBg = useColorModeValue("blue.400", "blue.600");
  const btnHoverBg = useColorModeValue("blue.500", "blue.700");
  const btnActiveBg = useColorModeValue("blue.600", "blue.800");
  const textColorGray = useColorModeValue("gray.500", "gray.300");
  const textColorBlue = useColorModeValue("blue.400", "blue.300");

  // **Client-side rendering state**
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // **Effect to Handle Mounting and Animation**
  useEffect(() => {
    setIsMounted(true);
    // Trigger the animation after mount
    setIsOpen(true);
  }, []);

  // **Handle Signup Submission**
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      // Call signup API to create the user
      await signup(name, email, password);
      setSuccessMessage("Signup successful! Redirecting to login...");
      setTimeout(() => {
        router.push("/auth/Login"); // Redirect to login after successful signup
      }, 2000);
    } catch (err) {
      setError("Signup failed. Please try again.");
    }
  };

  // **Toggle Password Visibility**
  const handleShowClick = () => setShowPassword(!showPassword);

  // **Prevent Rendering Until Mounted to Avoid Hydration Mismatch**
  if (!isMounted) {
    return null; // Or a loading spinner if preferred
  }

  return (
    <Flex
      minH={"100vh"}
      align={"center"}
      justify={"center"}
      bgGradient={bgGradient}
      // px={4}
    >
      <ScaleFade initialScale={0.9} in={isOpen}>
        <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6} width="100%">
          <Stack align={"center"}>
            <Heading
              fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}
              bgGradient="linear(to-r, blue.400, purple.400)"
              bgClip="text"
              fontWeight="extrabold"
            >
              Create Your Account
            </Heading>
            {/* Optional: Additional Text */}
            {/* <Text fontSize={{ base: 'md', md: 'lg' }} color={'gray.600'}>
              Join us and enjoy all of our cool{' '}
              <Text as="span" color={'blue.400'}>
                features
              </Text>{' '}
              ✌️
            </Text> */}
          </Stack>
          <Box
            rounded={"2xl"}
            bg={bgBox}
            boxShadow={"2xl"}
            p={8}
            border="1px"
            borderColor={borderColorBox}
          >
            <Stack spacing={4}>
              {error && (
                <Alert
                  status="error"
                  borderRadius="md"
                  bg={alertBgError}
                  color={alertColorError}
                >
                  {error}
                </Alert>
              )}
              {successMessage && (
                <Alert
                  status="success"
                  borderRadius="md"
                  bg={alertBgSuccess}
                  color={alertColorSuccess}
                >
                  {successMessage}
                </Alert>
              )}
              <form onSubmit={handleSignup}>
                <FormControl id="name" isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <AtSignIcon color={iconColor} />
                    </InputLeftElement>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      bg={bgInput}
                      border={0}
                      _focus={{
                        bg: bgInputFocus,
                        boxShadow: "outline",
                      }}
                    />
                  </InputGroup>
                </FormControl>
                <FormControl id="email" isRequired mt={4}>
                  <FormLabel>Email address</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <AtSignIcon color={iconColor} />
                    </InputLeftElement>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      bg={bgInput}
                      border={0}
                      _focus={{
                        bg: bgInputFocus,
                        boxShadow: "outline",
                      }}
                    />
                  </InputGroup>
                </FormControl>
                <FormControl id="password" isRequired mt={4}>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <LockIcon color={iconColor} />
                    </InputLeftElement>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      bg={bgInput}
                      border={0}
                      _focus={{
                        bg: bgInputFocus,
                        boxShadow: "outline",
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
                    bg={btnBg}
                    color={"white"}
                    // size={useBreakpointValue({ base: 'md', md: 'lg' })}
                    fontWeight="bold"
                    _hover={{
                      bg: btnHoverBg,
                    }}
                    _active={{
                      bg: btnActiveBg,
                    }}
                    width="100%"
                    transition="background-color 0.2s"
                  >
                    Sign Up
                  </Button>
                </Stack>
              </form>
              <Text align="center" mt={4} color={textColorGray}>
                Already have an account?{" "}
                <Text
                  as="span"
                  color={textColorBlue}
                  cursor="pointer"
                  onClick={() => router.push("/auth/Login")}
                >
                  Sign In
                </Text>
              </Text>
            </Stack>
          </Box>
        </Stack>
      </ScaleFade>
    </Flex>
  );
}
