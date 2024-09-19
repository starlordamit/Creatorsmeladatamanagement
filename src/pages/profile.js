// src/pages/profile.js

"use client";

import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import {
  Avatar,
  Box,
  Button,
  Center,
  Heading,
  Stack,
  Text,
  Badge,
  useColorModeValue,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Spinner,
  Alert,
  VStack,
} from "@chakra-ui/react";
import SidebarWithHeader from "../components/Navbar";
import { useEffect, useState, useCallback } from "react";
import { fetchUserProfile, updateUserProfile } from "../services/api";

const ProfilePage = () => {
  const router = useRouter();
  const { logout, authToken, loading } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const toast = useToast();

  // **1. Predefine all useColorModeValue calls at the top level**
  const bgBox = useColorModeValue("white", "gray.900");
  const badgeBg = useColorModeValue("gray.50", "gray.800");
  const badgeColor = useColorModeValue("gray.700", "white");
  const inputBg = useColorModeValue("gray.100", "gray.600");
  const inputFocusBg = useColorModeValue("white", "gray.500");
  const alertBgError = useColorModeValue("red.100", "red.600");
  const alertColorError = useColorModeValue("red.700", "white");
  const alertBgSuccess = useColorModeValue("green.100", "green.600");
  const alertColorSuccess = useColorModeValue("green.700", "white");

  // **2. Define loadProfileData with useCallback to avoid missing dependency**
  const loadProfileData = useCallback(async () => {
    try {
      const data = await fetchUserProfile(authToken);
      setProfileData(data);
      setFormData({
        name: data.name,
        phone: data.phone,
      });
    } catch (err) {
      setError("Failed to load profile data.");
    }
  }, [authToken]);

  // **3. useEffect to load profile data**
  useEffect(() => {
    if (!loading) {
      if (!authToken) {
        router.push("/auth/Login");
      } else {
        loadProfileData();
      }
    }
  }, [authToken, loading, router, loadProfileData]);

  // **4. Handle Logout**
  const handleLogout = () => {
    logout();
    router.push("/auth/Login");
  };

  // **5. Handle Input Changes**
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // **6. Handle Save Changes**
  const handleSaveChanges = async () => {
    try {
      await updateUserProfile(authToken, formData);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setEditMode(false);
      loadProfileData();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // **7. Loading and Error States with Chakra UI Components**
  if (loading || !profileData) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  return (
    <>
      {/* <SidebarWithHeader> */}
      <Center py={6}>
        <Box
          maxW={"320px"}
          w={"full"}
          bg={bgBox}
          boxShadow={"2xl"}
          rounded={"lg"}
          p={6}
          textAlign={"center"}
        >
          <Avatar
            size={"xl"}
            src={
              profileData.avatarUrl || "https://bit.ly/dan-abramov" // Use actual avatar URL or fallback
            }
            mb={4}
          />
          <Heading fontSize={"2xl"} fontFamily={"body"}>
            {profileData.name}
          </Heading>
          <Text fontWeight={600} color={"gray.500"} mb={4}>
            {profileData.email}
          </Text>

          <Stack align={"center"} justify={"center"} direction={"row"} mt={6}>
            <Badge
              px={2}
              py={1}
              bg={badgeBg}
              color={badgeColor}
              fontWeight={"400"}
            >
              {profileData.phone}
            </Badge>
            <Badge
              px={2}
              py={1}
              bg={badgeBg}
              color={badgeColor}
              fontWeight={"400"}
            >
              {profileData.role}
            </Badge>
            <Badge
              px={2}
              py={1}
              bg={badgeBg}
              color={badgeColor}
              fontWeight={"400"}
            >
              {profileData.is_suspended ? "Suspended" : "Active"}
            </Badge>
          </Stack>

          {editMode ? (
            <Stack spacing={4} mt={8}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  bg={inputBg}
                  border={0}
                  _focus={{
                    bg: inputFocusBg,
                    boxShadow: "outline",
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Phone</FormLabel>
                <Input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  bg={inputBg}
                  border={0}
                  _focus={{
                    bg: inputFocusBg,
                    boxShadow: "outline",
                  }}
                />
              </FormControl>
              <Stack direction={"row"} spacing={4}>
                <Button colorScheme="teal" onClick={handleSaveChanges}>
                  Save Changes
                </Button>
                <Button colorScheme="gray" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Stack mt={8} direction={"row"} spacing={4}>
              <Button
                flex={1}
                fontSize={"sm"}
                rounded={"full"}
                bg={"teal.400"}
                color={"white"}
                _hover={{
                  bg: "teal.500",
                }}
                _focus={{
                  bg: "teal.500",
                }}
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </Button>

              <Button
                flex={1}
                fontSize={"sm"}
                rounded={"full"}
                bg={"blue.400"}
                color={"white"}
                _hover={{
                  bg: "blue.500",
                }}
                _focus={{
                  bg: "blue.500",
                }}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Stack>
          )}
        </Box>
      </Center>
      {/* </SidebarWithHeader> */}

      {/* Display error message if any */}
      {error && (
        <Center mt={4}>
          <Alert
            status="error"
            borderRadius="md"
            bg={alertBgError}
            color={alertColorError}
          >
            {error}
          </Alert>
        </Center>
      )}
    </>
  );
};

export default ProfilePage;
