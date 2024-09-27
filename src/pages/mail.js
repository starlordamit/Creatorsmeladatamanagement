import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Checkbox,
  ButtonGroup,
  Button,
  Spinner,
  Flex,
  useToast,
  useMediaQuery,
  useColorModeValue,
  Badge,
  Icon,
  Stack,
} from "@chakra-ui/react";
import { FiYoutube, FiInstagram, FiTwitter } from "react-icons/fi";
import { fetchAllVideos, updatePaymentStatus } from "../services/api"; // API functions
import { useAuth } from "../context/AuthContext"; // Auth context
import axios from "axios"; // Axios for API calls

export default function PaymentsPage() {
  const { authToken } = useAuth();
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sendingMail, setSendingMail] = useState({});
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [uploaderFilter, setUploaderFilter] = useState("");
  const [mailStatusFilter, setMailStatusFilter] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const toast = useToast();

  // Moved useColorModeValue calls to the top
  const bgColor = useColorModeValue("white", "gray.800");
  const tableHeaderBg = useColorModeValue("gray.100", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Memoized loadVideos function to prevent unnecessary re-renders
  const loadVideos = useCallback(
    async (token) => {
      setIsLoading(true);
      try {
        const data = await fetchAllVideos(token);
        setVideos(data);
      } catch (err) {
        toast({
          title: "Error fetching videos",
          status: "error",
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (authToken) {
      loadVideos(authToken);
    }
  }, [authToken, loadVideos]);

  // Handle Send Mail Button
  const handleSendMail = async (videoId) => {
    setSendingMail((prev) => ({ ...prev, [videoId]: true }));
    try {
      await axios.post(
        "https://winner51.online/api/campaigns/confirmsent",
        { video_id: videoId },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      toast({
        title: "Mail sent successfully!",
        status: "success",
        duration: 3000,
      });

      loadVideos(authToken);
    } catch (err) {
      toast({
        title: "Error sending mail",
        status: "error",
        duration: 3000,
      });
    } finally {
      setSendingMail((prev) => ({ ...prev, [videoId]: false }));
    }
  };

  // Get Button Label and Color Scheme
  const getButtonLabel = (video) => {
    if (video.is_already_sent === 1 && video.mail_aproval === 1) {
      return "Approved";
    } else if (video.is_already_sent === 1) {
      return "Sent";
    } else if (sendingMail[video.video_id]) {
      return "Sending...";
    } else {
      return "Send Mail";
    }
  };

  const getButtonColorScheme = (video) => {
    if (video.is_already_sent === 1 && video.mail_aproval === 1) {
      return "green";
    } else if (video.is_already_sent === 1) {
      return "blue";
    } else {
      return "gray";
    }
  };

  // Get platform icon based on the platform type
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case "youtube":
        return <Icon as={FiYoutube} color="red.500" />;
      case "instagram":
        return <Icon as={FiInstagram} color="pink.500" />;
      case "twitter":
        return <Icon as={FiTwitter} color="blue.500" />;
      default:
        return null;
    }
  };

  // Render Deliverables as Chips
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
          colorScheme={colorSchemes[deliverable]}
          mx={1}
          mb={1}
        >
          {deliverableLabels[deliverable] || "Unknown Deliverable"}
        </Badge>
      ));
    }
    return null;
  };

  // Filter videos based on selected mail status, uploader, and payment status
  const filteredVideos = videos.filter((video) => {
    const matchesPaymentStatus = paymentStatusFilter
      ? video.payment_status === paymentStatusFilter
      : true;

    const matchesUploader = uploaderFilter
      ? video.uploader.toLowerCase().includes(uploaderFilter.toLowerCase())
      : true;

    const matchesMailStatus =
      mailStatusFilter === "mail_sent"
        ? video.is_already_sent === 1 && video.mail_aproval === 1
        : mailStatusFilter === "for_approval"
          ? video.is_already_sent === 0 && video.mail_aproval === 1
          : true;

    return matchesPaymentStatus && matchesUploader && matchesMailStatus;
  });

  return (
    <>
      {/* Filters */}
      <Box
        borderWidth="1px"
        borderRadius="md"
        shadow="sm"
        bg={bgColor}
        borderColor={borderColor}
        mt={4}
        mb={4}
        p={{ base: 2, md: 4 }}
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          alignItems="center"
          justifyContent="space-between"
          wrap="wrap"
          gap={2}
          mb={2}
        >
          <ButtonGroup
            size="sm"
            variant="outline"
            mb={1}
            isFullWidth={isMobile}
          >
            <Button
              colorScheme="green"
              variant={mailStatusFilter === "mail_sent" ? "solid" : "outline"}
              onClick={() => setMailStatusFilter("mail_sent")}
              width="100%"
            >
              Sent
            </Button>
            <Button
              colorScheme="yellow"
              variant={
                mailStatusFilter === "for_approval" ? "solid" : "outline"
              }
              onClick={() => setMailStatusFilter("for_approval")}
              width="100%"
            >
              Draft
            </Button>
            <Button
              colorScheme="teal"
              variant={mailStatusFilter === "" ? "solid" : "outline"}
              onClick={() => setMailStatusFilter("")}
              width="100%"
            >
              All
            </Button>
          </ButtonGroup>

          <Input
            placeholder="Search by Uploader"
            value={uploaderFilter}
            onChange={(e) => setUploaderFilter(e.target.value)}
            size="sm"
            width={{ base: "100%", md: "200px" }}
            mb={{ base: 1, md: 0 }}
          />
        </Flex>
      </Box>

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
            bg={bgColor}
            shadow="sm"
            maxHeight="74vh"
            border={`1px solid ${borderColor}`}
          >
            <Table variant="simple" size="sm" colorScheme="blackAlpha">
              <Thead bg={tableHeaderBg}>
                <Tr>
                  <Th>Video ID</Th>
                  <Th>Profile</Th>
                  <Th>Uploader</Th>
                  <Th>Brand Price</Th>
                  <Th>Creator Price</Th>
                  <Th>Campaign Name</Th>
                  <Th>Deliverables</Th>
                  <Th>-</Th>
                  <Th>Approval Status</Th>
                  <Th>Mail</Th>
                </Tr>
              </Thead>
              <Tbody bg={useColorModeValue("white", "gray.700")}>
                {filteredVideos.map((video) => (
                  <Tr key={video.video_id}>
                    <Td>{video.video_id}</Td>
                    <Td>{video.profile_url}</Td>
                    <Td>{video.uploader}</Td>
                    <Td>{video.brand_price}</Td>
                    <Td>{video.creator_price}</Td>
                    <Td>{video.campaign_name}</Td>
                    <Td>
                      {renderDeliverables(video.deliverables.promotionalLink)}
                    </Td>
                    <Td>{getPlatformIcon(video.platform)}</Td>
                    <Td>
                      <Badge colorScheme={video.mail_aproval ? "green" : "red"}>
                        {video.mail_aproval ? "Approved" : "Not Approved"}
                      </Badge>
                    </Td>
                    <Td>
                      <Button
                        colorScheme={getButtonColorScheme(video)}
                        size="sm"
                        onClick={() => handleSendMail(video.video_id)}
                        isDisabled={
                          video.is_already_sent === 1 ||
                          sendingMail[video.video_id]
                        }
                      >
                        {sendingMail[video.video_id] ? (
                          <Spinner size="xs" />
                        ) : (
                          getButtonLabel(video)
                        )}
                      </Button>
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
