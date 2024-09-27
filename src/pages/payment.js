import { useState, useEffect } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Badge,
  useToast,
  Flex,
  Input,
  Checkbox,
  useColorModeValue,
  ButtonGroup,
  Button,
  Link,
  Spinner,
  useMediaQuery,
  Icon,
} from "@chakra-ui/react";
import { fetchAllVideos, updatePaymentStatus } from "../services/api"; // API functions
import { useAuth } from "../context/AuthContext"; // Auth context
import {
  FiYoutube,
  FiInstagram,
  FiTwitter,
  FiExternalLink,
} from "react-icons/fi";

export default function PaymentsPage() {
  const { authToken } = useAuth(); // Using the useAuth hook to get token and user info
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // State for loader
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [uploaderFilter, setUploaderFilter] = useState(""); // Filter by uploader
  const [paymentStatusMap, setPaymentStatusMap] = useState({}); // State to track individual statuses
  const [selectedRows, setSelectedRows] = useState([]); // Selected rows for potential batch operations
  const toast = useToast();

  const bgColor = useColorModeValue("white", "gray.800");

  // Theme-aware colors
  const tableHeaderBg = useColorModeValue("gray.100", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const selectBg = useColorModeValue("gray.50", "gray.700");
  const selectHoverBg = useColorModeValue("gray.100", "gray.600");
  const selectBorderColor = useColorModeValue("gray.300", "gray.600");

  // Fetch videos on component mount
  useEffect(() => {
    if (authToken) {
      loadVideos(authToken);
    }
  }, [authToken]);

  const loadVideos = async (token) => {
    setIsLoading(true); // Show loader
    try {
      const data = await fetchAllVideos(token); // Fetch videos using token
      setVideos(data);
    } catch (err) {
      toast({
        title: "Error fetching videos",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false); // Hide loader after fetching data
    }
  };

  // Handle Payment Status Update
  const handlePaymentUpdate = async (videoId, status) => {
    try {
      await updatePaymentStatus(videoId, status, authToken); // Pass token to API
      toast({
        title: "Payment status updated successfully!",
        status: "success",
        duration: 3000,
      });
      loadVideos(authToken); // Reload videos after update
    } catch (err) {
      toast({
        title: "Error updating payment status",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Track individual payment status changes and trigger update
  const handleStatusChange = (videoId, status) => {
    setPaymentStatusMap((prev) => ({ ...prev, [videoId]: status }));
    handlePaymentUpdate(videoId, status);
  };

  // Handle row selection
  const handleRowSelect = (videoId) => {
    if (selectedRows.includes(videoId)) {
      setSelectedRows(selectedRows.filter((id) => id !== videoId));
    } else {
      setSelectedRows([...selectedRows, videoId]);
    }
  };

  // Filter videos based on selected payment status and uploader
  const filteredVideos = videos.filter((video) => {
    const matchesPaymentStatus = paymentStatusFilter
      ? video.payment_status === paymentStatusFilter
      : true;

    const matchesUploader = uploaderFilter
      ? video.uploader.toLowerCase().includes(uploaderFilter.toLowerCase())
      : true;

    return matchesPaymentStatus && matchesUploader;
  });
  function extractUsername(url) {
    try {
      // Add protocol if missing
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }

      const { hostname, pathname } = new URL(url);

      // Helper function to clean username
      const cleanUsername = (path) => {
        // Remove trailing slashes and query parameters
        return path.replace(/\/$/, "").split("/").pop().split("?")[0];
      };

      // Handle Instagram URLs
      if (hostname.includes("instagram.com")) {
        const username = cleanUsername(pathname);
        return `@${username}`;
      }

      // Handle YouTube URLs
      if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
        const username = pathname.includes("@")
          ? pathname.split("@")[1].split("/")[0] // For YouTube handles
          : pathname.split("/").filter(Boolean).pop(); // For YouTube channel/user URLs
        return `@${username}`;
      }

      // Handle Twitter URLs
      if (hostname.includes("twitter.com")) {
        const username = cleanUsername(pathname);
        return `@${username}`;
      }

      // Handle TikTok URLs
      if (hostname.includes("tiktok.com")) {
        const username = cleanUsername(pathname);
        return `@${username}`;
      }

      // Generic handler for other platforms with similar URL structures
      const username = cleanUsername(pathname);
      return `@${username}`;
    } catch (error) {
      return null; // Handle invalid URL or error case
    }
  }

  const renderPlatformIcon = (platform) => {
    switch (platform) {
      case "youtube":
        return <FiYoutube size={20} color="red" />;
      case "instagram":
        return <FiInstagram size={20} color="Pink" />;
      case "twitter":
        return <FiTwitter color="blue" size={20} />;
      default:
        return <span>{platform}</span>;
    }
  };

  const renderDeliverables = (deliverables) => {
    const colorSchemes = ["purple", "blue", "green", "yellow", "pink"];
    const deliverableLabels = {
      1: "Description",
      2: "About Section",
      3: "Pinned Comment",
      4: "Bio",
      5: "Story",
    };

    if (Array.isArray(deliverables)) {
      return deliverables.map((deliverable, index) => (
        <Badge
          key={index}
          colorScheme={colorSchemes[index % colorSchemes.length]}
          mx={1}
          mb={1}
        >
          {deliverableLabels[deliverable] || "Unknown Deliverable"}
        </Badge>
      ));
    }
    return null;
  };

  return (
    <>
      {/* Navbar included */}
      <Box
        borderWidth="1px"
        borderRadius="md"
        overflow="auto"
        shadow="sm"
        bg={cardBg}
        mt={4}
        mb={4}
        p={{ base: 2, md: 4 }} // Responsive padding for mobile and desktop
      >
        <Flex
          direction={{ base: "column", md: "row" }} // Stack filters vertically on mobile, horizontally on desktop
          alignItems="center"
          justifyContent="space-between"
          wrap="wrap"
          gap={2} // Adds gap between elements for better spacing on mobile
          mb={2}
        >
          {/* Payment Status Filter Buttons */}
          <ButtonGroup size="sm" variant="outline" wrap="wrap" mb={1}>
            <Button
              colorScheme="green"
              variant={paymentStatusFilter === "done" ? "solid" : "outline"}
              onClick={() => setPaymentStatusFilter("done")}
            >
              Paid
            </Button>
            <Button
              colorScheme="yellow"
              variant={paymentStatusFilter === "request" ? "solid" : "outline"}
              onClick={() => setPaymentStatusFilter("request")}
            >
              Unpaid
            </Button>
            <Button
              colorScheme="red"
              variant={paymentStatusFilter === "reject" ? "solid" : "outline"}
              onClick={() => setPaymentStatusFilter("reject")}
            >
              Rejected
            </Button>
            <Button
              colorScheme="teal"
              variant={paymentStatusFilter === "" ? "solid" : "outline"}
              onClick={() => setPaymentStatusFilter("")}
            >
              All
            </Button>
          </ButtonGroup>

          {/* Uploader Filter */}
          <Input
            placeholder="Search by Uploader"
            value={uploaderFilter}
            onChange={(e) => setUploaderFilter(e.target.value)}
            size="sm"
            width={{ base: "100%", md: "200px" }}
            mb={{ base: 1, md: 0 }} // Add margin bottom for better mobile spacing
          />
        </Flex>
      </Box>

      {/* Loader while fetching videos */}
      {isLoading ? (
        <Flex justify="center" align="center" height="50vh">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <Box overflowX="auto">
          <Box
            borderWidth="1px"
            borderRadius="md"
            overflow="auto"
            bg={cardBg}
            shadow="sm"
            maxHeight="74vh"
          >
            <Table variant="simple" size="sm" colorScheme="blackAlpha">
              <Thead bg={tableHeaderBg}>
                <Tr>
                  <Th>
                    <Checkbox
                      isChecked={
                        selectedRows.length === filteredVideos.length &&
                        filteredVideos.length > 0
                      }
                      onChange={() =>
                        setSelectedRows(
                          selectedRows.length === filteredVideos.length
                            ? []
                            : filteredVideos.map((video) => video.video_id)
                        )
                      }
                    />
                  </Th>
                  <Th>Video ID</Th>
                  <Th>P</Th>
                  <Th>Profile URL</Th>
                  <Th>Video URL</Th>
                  <Th>Campaign</Th>
                  <Th>Brand</Th>
                  <Th>Uploader</Th>

                  <Th>Deliverables</Th>
                  <Th>Creator Price</Th>
                  <Th>Brand Price</Th>
                  <Th>Status</Th>
                  <Th>Live Date</Th>
                  <Th>Payment Status</Th>
                  <Th>Update Payment Status</Th>
                </Tr>
              </Thead>
              <Tbody bg={bgColor}>
                {filteredVideos.map((video) => (
                  <Tr key={video.video_id}>
                    <Td>
                      <Checkbox
                        isChecked={selectedRows.includes(video.video_id)}
                        onChange={() => handleRowSelect(video.video_id)}
                      />
                    </Td>
                    <Td>{video.video_id}</Td>
                    <Td>{renderPlatformIcon(video.platform)}</Td>
                    <Td>
                      <Link
                        href={video.profile_url}
                        isExternal
                        fontSize="sm"
                        color="teal.500"
                        // textDecoration="underline"
                      >
                        {extractUsername(video.profile_url)}
                      </Link>
                    </Td>
                    <Td>
                      <Link
                        href={video.video_url}
                        isExternal
                        fontSize="sm"
                        color="teal.500"
                        textDecoration="underline"
                      >
                        <Icon as={FiExternalLink}></Icon>
                      </Link>
                    </Td>
                    <Td>{video.campaign_name}</Td>
                    <Td>{video.brand}</Td>
                    <Td>{video.uploader}</Td>
                    <Td>
                      {renderDeliverables(video.deliverables.promotionalLink)}
                    </Td>
                    <Td>{video.creator_price}</Td>{" "}
                    {/* Displaying creator price */}
                    <Td>{video.brand_price}</Td> {/* Displaying brand price */}
                    <Td>
                      <Badge
                        colorScheme={
                          video.video_status === "live"
                            ? "green"
                            : video.video_status === "progress"
                              ? "yellow"
                              : "red"
                        }
                      >
                        {video.video_status}
                      </Badge>
                    </Td>
                    <Td>{video.live_date}</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          video.payment_status === "done"
                            ? "green"
                            : video.payment_status === "request"
                              ? "yellow"
                              : "red"
                        }
                      >
                        {video.payment_status}
                      </Badge>
                    </Td>
                    <Td>
                      {/* Update Payment Status Dropdown */}
                      <Select
                        placeholder="Update Payment Status"
                        value={
                          paymentStatusMap[video.video_id] ||
                          video.payment_status
                        }
                        onChange={(e) =>
                          handleStatusChange(video.video_id, e.target.value)
                        }
                        size="sm"
                        variant="filled" // Changed variant to 'filled'
                        bg={selectBg}
                        borderColor={selectBorderColor}
                        focusBorderColor="teal.500"
                        _hover={{ bg: selectHoverBg }}
                        _focus={{ bg: selectHoverBg }}
                      >
                        <option value="done">Paid</option>
                        <option value="request">Unpaid</option>
                        <option value="reject">Rejected</option>
                      </Select>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}
    </>
  );
}
