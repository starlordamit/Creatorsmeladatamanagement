"use client";

import {
  Box,
  Text,
  useColorModeValue,
  Stack,
  HStack,
  Link,
  Icon,
} from "@chakra-ui/react";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <Box
      bg={useColorModeValue("gray.100", "gray.900")}
      color={useColorModeValue("gray.700", "gray.200")}
      py={4}
      mt="auto"
    >
      <Stack
        align={"center"}
        direction={{ base: "column", md: "row" }}
        spacing={4}
        justify={"space-between"}
      >
        <Text>
          © {new Date().getFullYear()} CreatorsMela. All rights reserved.
        </Text>

        <HStack spacing={4}>
          <Text>Follow us on</Text>
          <Link href="#" isExternal>
            <Icon as={FaFacebook} boxSize={5} />
          </Link>
          <Link href="#" isExternal>
            <Icon as={FaTwitter} boxSize={5} />
          </Link>
          <Link href="#" isExternal>
            <Icon as={FaInstagram} boxSize={5} />
          </Link>
        </HStack>
      </Stack>
    </Box>
  );
}
