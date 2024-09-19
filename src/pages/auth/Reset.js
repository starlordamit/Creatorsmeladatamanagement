// src/pages/auth/ResetPassword.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { resetPassword } from "@/services/api"; // Import the resetPassword function
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
  InputRightElement,
  IconButton,
  useBreakpointValue,
  ScaleFade,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { token } = router.query; // Get the token from the URL query

  useEffect(() => {
    if (!token) {
      <></>;
      // setError('Token is missing or invalid.')
    }
  }, [token]);

  const handleShowClick = () => setShowPassword(!showPassword);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const data = await resetPassword(token, password); // Call the resetPassword function
      setSuccessMessage(data.message);
      setTimeout(() => {
        router.push("/auth/Login");
      }, 3000); // Redirect to login after 3 seconds
    } catch (err) {
      setError(
        err.response?.data?.error || "Token Expired try Again with new link"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex
      minH={"100vh"}
      align={"center"}
      justify={"center"}
      bgGradient={useColorModeValue(
        "linear(to-r, gray.50, gray.100)",
        "linear(to-r, gray.800, gray.900)"
      )}
      px={4}
    >
      <ScaleFade initialScale={0.9} in={true}>
        <Stack
          spacing={8}
          mx={"auto"}
          maxW={{ base: "sm", md: "lg" }} // Adjust width for mobile (small) and desktop (large)
          py={{ base: 6, md: 12 }} // Adjust padding for mobile and desktop
          px={{ base: 4, md: 6 }}
          width="100%"
        >
          <Stack align={"center"}>
            <Heading
              fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }} // Adjust font size for mobile screens
              bgGradient="linear(to-r, blue.400, purple.400)"
              bgClip="text"
              fontWeight="extrabold"
            >
              Reset Your Password
            </Heading>
            <Text fontSize={{ base: "sm", md: "lg" }} color={"gray.600"}>
              Enter your new password below to reset it.{" "}
              <Text as="span" color={"blue.400"}>
                Make it secure!
              </Text>
            </Text>
          </Stack>
          <Box
            rounded={"2xl"}
            bg={useColorModeValue("white", "gray.700")}
            boxShadow={"2xl"}
            p={8}
            border="1px"
            borderColor={useColorModeValue("gray.200", "gray.600")}
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
              <form onSubmit={handleResetPassword}>
                <FormControl id="password" isRequired>
                  <FormLabel>New Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      bg={useColorModeValue("gray.100", "gray.600")}
                      border={0}
                      _focus={{
                        bg: useColorModeValue("white", "gray.500"),
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

                <FormControl id="confirmPassword" isRequired>
                  <FormLabel>Confirm New Password</FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      bg={useColorModeValue("gray.100", "gray.600")}
                      border={0}
                      _focus={{
                        bg: useColorModeValue("white", "gray.500"),
                        boxShadow: "outline",
                      }}
                    />
                  </InputGroup>
                </FormControl>

                <Stack spacing={6} mt={6}>
                  <Button
                    type="submit"
                    bg={"blue.400"}
                    color={"white"}
                    size={useBreakpointValue({ base: "md", md: "lg" })}
                    fontWeight="bold"
                    _hover={{
                      bg: "blue.500",
                    }}
                    _active={{
                      bg: "blue.600",
                    }}
                    width="100%"
                    isLoading={isLoading}
                    loadingText="Resetting..."
                    transition="background-color 0.2s"
                  >
                    Reset Password
                  </Button>
                </Stack>
              </form>
            </Stack>
          </Box>
        </Stack>
      </ScaleFade>
    </Flex>
  );
}
