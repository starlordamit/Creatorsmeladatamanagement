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
  useMediaQuery,
} from "@chakra-ui/react";
import SidebarWithHeader from "@/components/Navbar"; // Navbar component
import { fetchAllVideos, updatePaymentStatus } from "../services/api"; // API functions
import { useAuth } from "../context/AuthContext"; // Auth context

export default function PaymentsPage() {
  const { authToken } = useAuth(); // Using the useAuth hook to get token and user info
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const [videos, setVideos] = useState([]);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [uploaderFilter, setUploaderFilter] = useState(""); // Filter by uploader
  const [paymentStatusMap, setPaymentStatusMap] = useState({}); // State to track individual statuses
  const [selectedRows, setSelectedRows] = useState([]); // Selected rows for potential batch operations
  const toast = useToast();

  const modalSize = isMobile ? "full" : "lg";
  const bgColor = useColorModeValue("white", "gray.800");

  // Theme-aware colors
  const tableHeaderBg = useColorModeValue("gray.100", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.700");
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
    try {
      const data = await fetchAllVideos(token); // Fetch videos using token
      setVideos(data);
    } catch (err) {
      toast({
        title: "Error fetching videos",
        status: "error",
        duration: 3000,
      });
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

  return (
    <>
      {/* Navbar included */}
      <Box
        borderWidth="1px"
        borderRadius="md"
        overflow="auto"
        shadow="sm"
        bg={cardBg}
        borderColor={borderColor}
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
          <ButtonGroup
            size={isMobile ? "sm" : "sm"}
            variant="outline"
            wrap="wrap"
            mb={1} // Add margin bottom for better mobile spacing
          >
            <Button
              colorScheme="green"
              variant={paymentStatusFilter === "done" ? "solid" : "outline"}
              onClick={() => setPaymentStatusFilter("done")}
              width={{ base: "100%", md: "auto" }} // Full width on mobile, auto on desktop
            >
              Paid
            </Button>
            <Button
              colorScheme="yellow"
              variant={paymentStatusFilter === "request" ? "solid" : "outline"}
              onClick={() => setPaymentStatusFilter("request")}
              width={{ base: "100%", md: "auto" }} // Full width on mobile, auto on desktop
            >
              Unpaid
            </Button>
            <Button
              colorScheme="red"
              variant={paymentStatusFilter === "reject" ? "solid" : "outline"}
              onClick={() => setPaymentStatusFilter("reject")}
              width={{ base: "100%", md: "auto" }} // Full width on mobile, auto on desktop
            >
              Rejected
            </Button>
            <Button
              colorScheme="teal"
              variant={paymentStatusFilter === "" ? "solid" : "outline"}
              onClick={() => setPaymentStatusFilter("")}
              width={{ base: "100%", md: "auto" }} // Full width on mobile, auto on desktop
            >
              All
            </Button>
          </ButtonGroup>

          {/* Uploader Filter */}
          <Input
            placeholder="Search by Uploader"
            value={uploaderFilter}
            onChange={(e) => setUploaderFilter(e.target.value)}
            size={isMobile ? "sm" : "sm"}
            width={{ base: "100%", md: "200px" }} // Full width on mobile, fixed width on desktop
            mb={{ base: 1, md: 0 }} // Add margin bottom for better mobile spacing
          />
        </Flex>
      </Box>

      {/* Videos Table */}
      <Box overflowX="auto">
        <Box
          borderWidth="1px"
          borderRadius="md"
          overflow="auto"
          bg={cardBg}
          shadow="sm"
          maxHeight="74vh"
          border={`1px solid ${borderColor}`}
        >
          <Table
            variant="simple"
            size="sm"
            colorScheme={useColorModeValue("blackAlpha", "whiteAlpha")}
          >
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
                <Th>Profile URL</Th>
                <Th>Video URL</Th>
                <Th>Campaign</Th>
                <Th>Brand</Th>
                <Th>Uploader</Th> {/* Uploader Column */}
                <Th>Status</Th>
                <Th>Live Date</Th>
                <Th>Payment Status</Th>
                <Th>Update Payment Status</Th>
              </Tr>
            </Thead>
            <Tbody bg={useColorModeValue("white", "gray.700")}>
              {filteredVideos.map((video) => (
                <Tr key={video.video_id}>
                  <Td>
                    <Checkbox
                      isChecked={selectedRows.includes(video.video_id)}
                      onChange={() => handleRowSelect(video.video_id)}
                    />
                  </Td>
                  <Td>{video.video_id}</Td>
                  <Td>
                    <Box
                      whiteSpace="nowrap"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      maxWidth={{ base: "150px", md: "none" }}
                    >
                      {video.profile_url}
                    </Box>
                  </Td>
                  <Td>
                    <Box
                      whiteSpace="nowrap"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      maxWidth={{ base: "150px", md: "none" }}
                    >
                      {video.video_url}
                    </Box>
                  </Td>
                  <Td>{video.campaign_name}</Td>
                  <Td>{video.brand}</Td>
                  <Td>{video.uploader}</Td> {/* Display uploader */}
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
                        paymentStatusMap[video.video_id] || video.payment_status
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
    </>
  );
}
