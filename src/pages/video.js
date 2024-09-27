import { useState, useEffect, useCallback } from "react";
import Footer from "@/components/Footer";
import {
  Box,
  Badge,
  Table,
  Thead,
  Link,
  Tbody,
  Tr,
  Th,
  Td,
  Icon,
  CheckboxGroup,
  Checkbox,
  IconButton,
  Input,
  Button,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Grid,
  ModalFooter,
  useDisclosure,
  useToast,
  Flex,
  InputGroup,
  InputLeftElement,
  Stack,
  Collapse,
  useMediaQuery,
  useColorModeValue,
  Tooltip,
  SimpleGrid,
  FormControl,
  FormLabel,
  Switch,
  Text,
  RadioGroup,
  Radio,
  Spacer,
  Alert,
  AlertIcon,
  Divider,
  VStack,
  Heading,
} from "@chakra-ui/react";
import Loader from "./Loader";
import {
  FiEdit,
  FiTrash2,
  FiDownload,
  FiPlus,
  FiSearch,
  FiFilter,
  FiXCircle,
  FiChevronUp,
  FiChevronDown,
  FiEye,
  FiMail,
  FiInstagram,
  FiTwitter,
  FiYoutube,
} from "react-icons/fi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import SidebarWithHeader from "@/components/Navbar";
import {
  fetchAllVideos,
  createVideo,
  updateVideo,
  deleteVideo,
  fetchCampaigns,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function VideoManagementPage() {
  // Existing useDisclosure hooks
  const {
    isOpen: isMailModalOpen,
    onOpen: onMailModalOpen,
    onClose: onMailModalClose,
  } = useDisclosure();

  // **New useDisclosure for Summary Modal**
  const {
    isOpen: isSummaryModalOpen,
    onOpen: onSummaryModalOpen,
    onClose: onSummaryModalClose,
  } = useDisclosure();

  // State for Mail Form Data
  const [mailFormData, setMailFormData] = useState({
    videoid: "",
    platforms: [],
    deliverables: {
      videos: 0,
      posts: 0,
      promotionalLink: "",
    },
    price: "",
    creatorEmail: "",

    // is_already_sent: false,
  });

  // State to Manage Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);

  const predefinedRanges = [
    {
      label: "Today",
      value: [new Date(), new Date()],
    },
    {
      label: "This Week",
      value: [
        new Date(
          new Date().setDate(new Date().getDate() - new Date().getDay())
        ),
        new Date(
          new Date().setDate(new Date().getDate() + (6 - new Date().getDay()))
        ),
      ],
    },
    {
      label: "This Month",
      value: [
        new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      ],
    },
    {
      label: "Previous Month",
      value: [
        new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
        new Date(new Date().getFullYear(), new Date().getMonth(), 0),
      ],
    },
  ];

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDownloadModalOpen,
    onOpen: onDownloadModalOpen,
    onClose: onDownloadModalClose,
  } = useDisclosure();
  const toast = useToast();
  const [isEdit, setIsEdit] = useState(false);
  const { authToken, user } = useAuth();
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const modalSize = isMobile ? "full" : "lg";
  const bgColor = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const tableHeaderBg = useColorModeValue("gray.100", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const [isLoading, setIsLoading] = useState(false); // Loader state

  const [videos, setVideos] = useState([]);
  const [formData, setFormData] = useState({
    profile_url: "",
    video_url: "",
    campaign_id: "",
    brand: "",
    video_status: "",
    live_date: "",
    brand_price: "",
    // commission: "",
    creator_price: "",
    payment_status: "",
    crtrmail: "",
    platform: "",
  });
  const [campaigns, setCampaigns] = useState([]);
  const [filters, setFilters] = useState({
    profile_url: "",
    video_url: "",
    campaign: "",
    brand: "",
    video_status: "",
    payment_status: "",
    dateRange: [null, null],
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [sorting, setSorting] = useState({ field: null, direction: null });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState({
    video_id: true,
    profile_url: true,
    video_url: true,
    campaign_name: true,
    brand: true,
    video_status: true,
    live_date: true,
    payment_status: true,
    brand_price: true,
    // commission: true,
    creator_price: true,
  });
  const [visibleColumns, setVisibleColumns] = useState({
    video_id: true,
    profile_url: true,
    video_url: true,
    campaign_name: true,
    brand: true,
    video_status: true,
    live_date: true,
    payment_status: true,
    brand_price: true,
    // commission: true,
    creator_price: true,
  });
  const [downloadFormat, setDownloadFormat] = useState("excel");

  const columns = [
    { label: "Video ID", key: "video_id" },
    { label: "Profile URL", key: "profile_url" },
    { label: "Video URL", key: "video_url" },
    { label: "Campaign Name", key: "campaign_name" },
    { label: "Brand", key: "brand" },
    { label: "Video Status", key: "video_status" },
    { label: "Live Date", key: "live_date" },
    { label: "Payment Status", key: "payment_status" },
    { label: "Promotion Price", key: "brand_price" },
    // { label: "Commission", key: "commission" },
    { label: "Creator Price", key: "creator_price" },
  ];

  const loadVideos = useCallback(
    async (token) => {
      try {
        setIsLoading(true); // Show loader
        const data = await fetchAllVideos(token);
        setVideos(data);
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false); // Show loader
        toast({
          title: "Error fetching videos",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [toast]
  );

  const loadCampaigns = useCallback(
    async (token) => {
      try {
        const data = await fetchCampaigns(token);
        setCampaigns(data);
      } catch (err) {
        toast({
          title: "Error fetching campaigns",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false); // Hide loader
      }
    },
    [toast]
  );

  useEffect(() => {
    if (authToken) {
      loadVideos(authToken);
      loadCampaigns(authToken);
    }
  }, [authToken, loadVideos, loadCampaigns]);

  const handleSort = (field) => {
    const isAsc = sorting.field === field && sorting.direction === "asc";
    const direction = isAsc ? "desc" : "asc";
    const sortedData = [...videos].sort((a, b) => {
      if (a[field] < b[field]) return direction === "asc" ? -1 : 1;
      if (a[field] > b[field]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setVideos(sortedData);
    setSorting({ field, direction });
  };

  const handleRowSelect = (video_id) => {
    if (selectedRows.includes(video_id)) {
      setSelectedRows(selectedRows.filter((id) => id !== video_id));
    } else {
      setSelectedRows([...selectedRows, video_id]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateRangeChange = (dates) => {
    setFilters((prev) => ({ ...prev, dateRange: dates }));
  };

  const clearFilters = () => {
    setFilters({
      profile_url: "",
      video_url: "",
      campaign: "",
      brand: "",
      video_status: "",
      payment_status: "",
      dateRange: [null, null],
    });
  };

  const filteredVideos = videos.filter((video) => {
    const videoDate = new Date(video.live_date);
    let withinDateRange = true;
    if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
      const [startDate, endDate] = filters.dateRange;
      const start = new Date(startDate.setHours(0, 0, 0, 0));
      const end = new Date(endDate.setHours(23, 59, 59, 999));
      withinDateRange = videoDate >= start && videoDate <= end;
    }
    return (
      (!filters.profile_url ||
        video.profile_url
          .toLowerCase()
          .includes(filters.profile_url.toLowerCase())) &&
      (!filters.video_url ||
        video.video_url
          .toLowerCase()
          .includes(filters.video_url.toLowerCase())) &&
      (!filters.campaign || video.campaign_name === filters.campaign) &&
      (!filters.brand ||
        video.brand.toLowerCase().includes(filters.brand.toLowerCase())) &&
      (!filters.video_status || video.video_status === filters.video_status) &&
      (!filters.payment_status ||
        video.payment_status === filters.payment_status) &&
      withinDateRange
    );
  });

  const handleSave = async () => {
    if (!authToken) return;
    try {
      const videoData = {
        ...formData,
        user_id: user.user_id,
      };
      if (isEdit) {
        await updateVideo(selectedVideo.video_id, videoData, authToken);
        toast({
          title: "Video updated successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setVideos((prevVideos) =>
          prevVideos.map((video) =>
            video.video_id === selectedVideo.video_id
              ? { ...video, ...formData }
              : video
          )
        );
      } else {
        await createVideo(videoData, authToken);
        toast({
          title: "Video created successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        loadVideos(authToken);
      }
      onClose();
    } catch (err) {
      toast({
        title: "Error saving video",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (video_id) => {
    if (!authToken) return;
    try {
      setIsLoading(true);
      await deleteVideo(video_id, authToken);
      toast({
        title: "Video deleted successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setVideos((prevVideos) =>
        prevVideos.filter((video) => video.video_id !== video_id)
      );
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      toast({
        title: "Error deleting video",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDownload = (colorTheme) => {
    if (selectedRows.length === 0) {
      toast({
        title: "No video selected.",
        description: "Please select at least one video to download.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const selectedKeys = columns
      .filter((col) => selectedColumns[col.key])
      .map((col) => col.key);
    const selectedLabels = columns
      .filter((col) => selectedColumns[col.key])
      .map((col) => col.label);
    const dataToExport = filteredVideos.filter((video) =>
      selectedRows.includes(video.video_id)
    );
    const tableRows = dataToExport.map((video) =>
      selectedKeys.map((key) => video[key])
    );
    if (downloadFormat === "pdf") {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [selectedLabels],
        body: tableRows,
        theme: colorTheme,
        styles: {
          halign: "left",
          valign: "middle",
          fontSize: 10,
        },
      });
      doc.save("Report_" + Date.now() + ".pdf");
    } else if (downloadFormat === "excel") {
      const worksheetData = dataToExport.map((video) => {
        const rowData = {};
        selectedKeys.forEach((key, index) => {
          rowData[selectedLabels[index]] = video[key];
        });
        return rowData;
      });
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Videos");
      XLSX.writeFile(workbook, "Report_" + Date.now() + ".xlsx");
    }
    onDownloadModalClose();
  };

  // **Updated handleMailSubmit: Now can be called from Summary Modal**
  const handleMailSubmit = async () => {
    if (!authToken || !selectedVideo) return;
    setIsSubmitting(true);
    try {
      // Prepare the payload
      const payload = {
        video_id: selectedVideo.video_id,

        deliverables: mailFormData.deliverables,
        promotionalLink: mailFormData.promotionalLink,
      };

      // Send POST request to the API
      const response = await fetch(
        "https://winner51.online/api/campaigns/confirmation-mail",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to send confirmation email."
        );
      }

      // Optionally, handle the response data
      // const data = await response.json();

      // Show success toast
      toast({
        title: "Email sent successfully for Aproval!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Optionally, update the video state to indicate email was sent
      setVideos((prevVideos) =>
        prevVideos.map((video) =>
          video.video_id === selectedVideo.video_id
            ? { ...video, is_already_sent: true }
            : video
        )
      );

      // Close both Summary and Mail Modals
      onSummaryModalClose();
      onMailModalClose();
    } catch (error) {
      // Show error toast
      toast({
        title: "Error sending email",
        description: error.message || "Something went wrong.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyColumnChanges = () => {
    setVisibleColumns({ ...selectedColumns });
    onDownloadModalClose();
  };

  const openModal = (video = null) => {
    if (video) {
      setSelectedVideo(video);
      setFormData({
        profile_url: video.profile_url || "",
        video_url: video.video_url || "",
        campaign_id: video.campaign_id || "",
        brand: video.brand || "",
        video_status: video.video_status || "",
        live_date: video.live_date ? new Date(video.live_date) : "",
        brand_price: video.brand_price || "",
        // commission: video.commission || "",
        creator_price: video.creator_price || "",
        payment_status: video.payment_status || "",
        crtrmail: video.crtrmail || "",
        platform: video.platform || "",
      });
      setIsEdit(true);
    } else {
      setSelectedVideo(null);
      setFormData({
        profile_url: "",
        video_url: "",
        campaign_id: "",
        brand: "",
        video_status: "",
        live_date: "",
        brand_price: "",
        // commission: "",
        creator_price: "",
        payment_status: "",
      });
      setIsEdit(false);
    }
    onOpen();
  };

  const colorTheme = useColorModeValue("grid", "striped");
  const openMailModal = (video) => {
    setSelectedVideo(video);
    setMailFormData({
      deliverables: {
        videos: 1, // Default value as per your requirement
        posts: 0,
        promotionalLink: [],
      },
      videoid: selectedVideo?.video_id,
    });
    onMailModalOpen();
  };

  const [selectedVideo, setSelectedVideo] = useState(null);

  const openSummaryModal = (video) => {
    setSelectedVideo(video);
    onSummaryModalOpen();
  };

  // Function to handle confirmation and API call
  const handleConfirmSendMail = async () => {
    try {
      console.log("API Call Initiated");

      // Ensure authToken is available
      if (!authToken) {
        toast({
          title: "Authentication Error",
          description: "Please log in to perform this action.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      const res = await fetch(
        "https://winner51.online/api/campaigns/confirmsent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            video_id: selectedVideo?.video_id,
          }),
        }
      );

      // Parse the response body
      const data = await res.json();

      if (res.ok) {
        // Show success message
        toast({
          title: "Success",
          description: data.message || "Mail Sent.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        onSummaryModalClose();
      } else {
        // Handle specific status codes if needed
        if (res.status === 401) {
          toast({
            title: "Unauthorized",
            description: "Your session has expired. Please log in again.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        } else {
          // Show error message from response
          toast({
            title: "Failed",
            description:
              data.message || `Error ${res.status}: ${res.statusText}`,
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      // Show error message
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  if (isLoading) {
    return <Loader />; // Show the loader while fetching data
  }
  return (
    <>
      {/* Header with Add Video and Actions */}
      <Box bg={cardBg} pl={2} pt={2} mb={2} borderRadius="md" shadow="md">
        <Flex justify="space-between" align="center" mb={4} flexWrap="wrap">
          <Flex
            direction={{ base: "row", md: "row" }}
            align={{ base: "center", md: "center" }}
            wrap="wrap"
            justifyContent={{ base: "space-between", md: "flex-start" }}
          >
            {isMobile ? (
              <Tooltip label="Column Visibility" aria-label="Column Visibility">
                <IconButton
                  icon={<FiEye />}
                  colorScheme="blue"
                  onClick={onDownloadModalOpen}
                  mr={{ base: 2, md: 2 }}
                  mb={2}
                  variant="outline"
                  aria-label="Column Visibility"
                />
              </Tooltip>
            ) : (
              <Button
                leftIcon={<FiEye />}
                colorScheme="blue"
                variant="outline"
                size="sm"
                onClick={onDownloadModalOpen}
                mb={2}
                ml={{ base: 0, md: 2 }}
              >
                Column Visibility
              </Button>
            )}
            {isMobile ? (
              <Tooltip label="Download" aria-label="Download">
                <IconButton
                  icon={<FiDownload />}
                  colorScheme="blue"
                  onClick={() => handleDownload(colorTheme)}
                  mr={{ base: 2, md: 2 }}
                  mb={2}
                  variant="outline"
                  aria-label="Download"
                />
              </Tooltip>
            ) : (
              <Button
                leftIcon={<FiDownload />}
                colorScheme="blue"
                variant="outline"
                size="sm"
                onClick={() => handleDownload(colorTheme)}
                mb={2}
                ml={{ base: 0, md: 2 }}
              >
                Export
              </Button>
            )}
            {isMobile ? (
              <Tooltip label="Filter" aria-label="Filter">
                <IconButton
                  icon={<FiFilter />}
                  colorScheme="blue"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  mr={{ base: 2, md: 2 }}
                  mb={2}
                  variant="outline"
                  aria-label="Filter"
                />
              </Tooltip>
            ) : (
              <Button
                leftIcon={<FiFilter />}
                colorScheme="blue"
                variant="outline"
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                mb={2.1}
                ml={{ base: 0, md: 2 }}
              >
                Filter
              </Button>
            )}
            {isMobile ? (
              <Tooltip label="Add New Video" aria-label="Add New Video">
                <Button
                  leftIcon={<FiPlus />}
                  variant={"outline"}
                  colorScheme="teal"
                  onClick={() => openModal()}
                  mb={2}
                  ml={2}
                  aria-label="Add New Video"
                >
                  Add New Video
                </Button>
              </Tooltip>
            ) : (
              <Button
                leftIcon={<FiPlus />}
                variant={"outline"}
                size={"sm"}
                colorScheme="teal"
                onClick={() => openModal()}
                mb={2}
                ml={{ base: 0, md: 2 }}
                mr={{ base: 0, md: 2 }}
                aria-label="Add New Video"
              >
                Add New Video
              </Button>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* Filters Section */}
      <Collapse in={isFilterOpen} animateOpacity>
        <Box
          bg={cardBg}
          p={4}
          borderRadius="md"
          shadow="sm"
          width="100%"
          mb={6}
          border={`1px solid ${borderColor}`}
        >
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Profile URL"
                name="profile_url"
                value={filters.profile_url}
                onChange={handleFilterChange}
                bg={useColorModeValue("gray.50", "gray.600")}
              />
            </InputGroup>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Video URL"
                name="video_url"
                value={filters.video_url}
                onChange={handleFilterChange}
                bg={useColorModeValue("gray.50", "gray.600")}
              />
            </InputGroup>
            <Select
              placeholder="Select Campaign"
              name="campaign"
              value={filters.campaign}
              onChange={handleFilterChange}
              bg={useColorModeValue("gray.50", "gray.600")}
            >
              {campaigns.map((campaign) => (
                <option key={campaign.campaign_id} value={campaign.name}>
                  {campaign.name}
                </option>
              ))}
            </Select>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Brand"
                name="brand"
                value={filters.brand}
                onChange={handleFilterChange}
                bg={useColorModeValue("gray.50", "gray.600")}
              />
            </InputGroup>
            <Select
              placeholder="Video Status"
              name="video_status"
              value={filters.video_status}
              onChange={handleFilterChange}
              bg={useColorModeValue("gray.50", "gray.600")}
            >
              <option value="live">Live</option>
              <option value="progress">In Progress</option>
              <option value="cancelled">Cancelled</option>
            </Select>
            <Select
              placeholder="Payment Status"
              name="payment_status"
              value={filters.payment_status}
              onChange={handleFilterChange}
              bg={useColorModeValue("gray.50", "gray.600")}
            >
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </Select>
            <Box>
              <FormLabel fontSize="sm" mb={1}>
                Select Date Range
              </FormLabel>
              <DatePicker
                selectsRange
                startDate={filters.dateRange[0]}
                endDate={filters.dateRange[1]}
                onChange={handleDateRangeChange}
                isClearable={true}
                placeholderText="Select Date Range"
                customInput={
                  <Button
                    variant="outline"
                    leftIcon={<FiSearch />}
                    width="100%"
                    textAlign="left"
                    bg={useColorModeValue("gray.50", "gray.600")}
                  >
                    {filters.dateRange[0] && filters.dateRange[1]
                      ? `${filters.dateRange[0].toLocaleDateString()} - ${filters.dateRange[1].toLocaleDateString()}`
                      : "Select Date Range"}
                  </Button>
                }
              />
            </Box>
          </SimpleGrid>
          <Flex mt={4} justify="flex-end">
            <Button
              leftIcon={<FiXCircle />}
              colorScheme="red"
              variant="outline"
              size="sm"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          </Flex>
        </Box>
      </Collapse>

      {/* Scrollable Table */}
      <Box width="100%" overflowX="auto">
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
                <Th width="40px">
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
                {columns.slice(1).map(
                  (col) =>
                    visibleColumns[col.key] && (
                      <Th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        cursor="pointer"
                        whiteSpace="nowrap"
                      >
                        <Flex align="center">
                          {col.label}
                          {sorting.field === col.key ? (
                            sorting.direction === "asc" ? (
                              <FiChevronUp style={{ marginLeft: "4px" }} />
                            ) : (
                              <FiChevronDown style={{ marginLeft: "4px" }} />
                            )
                          ) : null}
                        </Flex>
                      </Th>
                    )
                )}
                <Th width="80px">Actions</Th>
              </Tr>
            </Thead>

            <Tbody>
              {filteredVideos.map((video) => (
                <Tr key={video.video_id}>
                  <Td>
                    <Checkbox
                      isChecked={selectedRows.includes(video.video_id)}
                      onChange={() => handleRowSelect(video.video_id)}
                    />
                  </Td>
                  {columns.slice(1).map(
                    (col) =>
                      visibleColumns[col.key] && (
                        <Td key={col.key}>
                          {col.key === "profile_url" ||
                          col.key === "video_url" ? (
                            <Box
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              maxWidth={{ base: "150px", md: "none" }}
                            >
                              <a
                                href={video[col.key]}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {video[col.key]}
                              </a>
                            </Box>
                          ) : col.key === "video_status" ||
                            col.key === "payment_status" ? (
                            <Badge
                              colorScheme={
                                video[col.key] === "live" ||
                                video[col.key] === "done"
                                  ? "green"
                                  : video[col.key] === "progress" ||
                                      video[col.key] === "request"
                                    ? "yellow"
                                    : "red"
                              }
                            >
                              {video[col.key].charAt(0).toUpperCase() +
                                video[col.key].slice(1)}
                            </Badge>
                          ) : col.key === "live_date" ? (
                            new Date(video[col.key]).toLocaleDateString()
                          ) : col.key === "brand_price" ||
                            col.key === "commission" ||
                            col.key === "creator_price" ? (
                            <Text isTruncated>{video[col.key]}</Text>
                          ) : (
                            video[col.key]
                          )}
                        </Td>
                      )
                  )}

                  <Td>
                    <Flex>
                      <IconButton
                        icon={<FiEdit />}
                        size="sm"
                        colorScheme="teal"
                        onClick={() => openModal(video)}
                        aria-label="Edit"
                        mr={2}
                      />
                      <IconButton
                        isDisabled={video.mail_aproval}
                        icon={<FiMail />}
                        size="sm"
                        colorScheme="purple"
                        onClick={() => openMailModal(video)}
                        aria-label="Send Mail"
                        mr={2}
                      />
                      <IconButton
                        // isDisabled={video.mail_aproval}
                        icon={<FiEye />}
                        size="sm"
                        colorScheme={video.is_already_sent ? "green" : "red"}
                        onClick={() => openSummaryModal(video)}
                        aria-label="Send Mail"
                        mr={2}
                      />

                      <IconButton
                        icon={<FiTrash2 />}
                        size="sm"
                        ml={3}
                        colorScheme="red"
                        onClick={() => handleDelete(video.video_id)}
                        // onClick={}
                        aria-label="Delete"
                      />
                      {/* New "Send Mail" Button */}
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Add/Edit Video Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size={modalSize} isCentered>
        <ModalOverlay />
        <ModalContent bg={bgColor}>
          <ModalHeader>{isEdit ? "Edit Video" : "Add New Video"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl id="profile_url" isRequired>
                <FormLabel>Profile URL</FormLabel>
                <Input
                  placeholder="Profile URL"
                  name="profile_url"
                  value={formData.profile_url}
                  onChange={handleInputChange}
                  bg={useColorModeValue("gray.50", "gray.600")}
                />
              </FormControl>
              <FormControl id="video_url" isRequired>
                <FormLabel>Video URL</FormLabel>
                <Input
                  placeholder="Video URL"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleInputChange}
                  bg={useColorModeValue("gray.50", "gray.600")}
                />
              </FormControl>
              <FormControl id="campaign_id" isRequired>
                <FormLabel>Select Campaign</FormLabel>
                <Select
                  placeholder="Select Campaign"
                  name="campaign_id"
                  value={formData.campaign_id}
                  onChange={(e) => {
                    const selectedCampaignId = e.target.value;
                    const selectedCampaign = campaigns.find(
                      (campaign) =>
                        campaign.campaign_id === parseInt(selectedCampaignId)
                    );
                    setFormData((prev) => ({
                      ...prev,
                      campaign_id: selectedCampaignId,
                      brand: selectedCampaign ? selectedCampaign.brand : "",
                    }));
                  }}
                  bg={useColorModeValue("gray.50", "gray.600")}
                >
                  {campaigns.map((campaign) => (
                    <option
                      key={campaign.campaign_id}
                      value={campaign.campaign_id}
                    >
                      {campaign.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl id="brand" isRequired>
                <FormLabel>Brand</FormLabel>
                <Input
                  placeholder="Brand"
                  name="brand"
                  disabled
                  value={formData.brand}
                  bg={useColorModeValue("gray.100", "gray.500")}
                />
              </FormControl>
              <FormControl id="video_status" isRequired hidden={!isEdit}>
                <FormLabel>Select Video Status</FormLabel>
                <Select
                  placeholder="Select Video Status"
                  name="video_status"
                  hidden={!isEdit}
                  value={formData.video_status}
                  onChange={handleInputChange}
                  bg={useColorModeValue("gray.50", "gray.600")}
                >
                  <option value="live">Live</option>
                  <option value="progress">In Progress</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </FormControl>
              <FormControl id="live_date" isRequired>
                <FormLabel>Live Date</FormLabel>
                <DatePicker
                  selected={
                    formData.live_date ? new Date(formData.live_date) : null
                  }
                  onChange={(date) =>
                    setFormData((prev) => ({ ...prev, live_date: date }))
                  }
                  dateFormat="yyyy-MM-dd"
                  customInput={
                    <Button
                      variant="outline"
                      leftIcon={<FiSearch />}
                      width="100%"
                      textAlign="left"
                      bg={useColorModeValue("gray.50", "gray.600")}
                    >
                      {formData.live_date
                        ? new Date(formData.live_date).toLocaleDateString()
                        : "Select Live Date"}
                    </Button>
                  }
                />
              </FormControl>
              <FormControl id="brand_price" isRequired>
                <FormLabel>Brand Price</FormLabel>
                <Input
                  placeholder="Brand Price"
                  name="brand_price"
                  type="number"
                  value={formData.brand_price}
                  onChange={handleInputChange}
                  bg={useColorModeValue("gray.50", "gray.600")}
                />
              </FormControl>
              <FormControl id="creator_price" isRequired>
                <FormLabel>Creator Price</FormLabel>
                <Input
                  placeholder="Creator Price"
                  name="creator_price"
                  type="number"
                  value={formData.creator_price}
                  onChange={handleInputChange}
                  bg={useColorModeValue("gray.50", "gray.600")}
                />
              </FormControl>
              <FormControl id="crtrmail" isRequired>
                <FormLabel>Creator Mail</FormLabel>
                <Input
                  placeholder="Creator Mail"
                  name="crtrmail"
                  type="email"
                  value={formData.crtrmail}
                  onChange={handleInputChange}
                  bg={useColorModeValue("gray.50", "gray.600")}
                />
              </FormControl>
              <FormControl id="platform" isRequired hidden={isEdit}>
                <FormLabel>Platform</FormLabel>
                <Select
                  placeholder="Select Platform"
                  name="platform"
                  hidden={isEdit}
                  value={formData.platform}
                  onChange={handleInputChange}
                  bg={useColorModeValue("gray.50", "gray.600")}
                >
                  <option value="youtube">Youtube</option>
                  <option value="instagram">Instagram</option>
                  <option value="other">Other</option>
                </Select>
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="teal" onClick={handleSave}>
              {isEdit ? "Update Video" : "Add Video"}
            </Button>
            <Button ml={3} onClick={onClose} variant="outline">
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Download Options Modal */}
      <Modal
        isOpen={isDownloadModalOpen}
        onClose={onDownloadModalClose}
        size={isMobile ? "full" : "md"}
        isCentered
      >
        <ModalOverlay />
        <ModalContent bg={bgColor}>
          <ModalHeader>Select Columns to Include</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={6}>
              <FormControl as="fieldset">
                <Stack spacing={4} overflowY="auto">
                  {columns.map((col) => (
                    <Flex
                      key={col.key}
                      align="center"
                      justify="space-between"
                      borderBottom={`1px solid ${borderColor}`}
                      pb={2}
                    >
                      <Text fontSize="md">{col.label}</Text>
                      <Switch
                        colorScheme="teal"
                        size="lg"
                        isChecked={selectedColumns[col.key]}
                        onChange={(e) =>
                          setSelectedColumns((prev) => ({
                            ...prev,
                            [col.key]: e.target.checked,
                          }))
                        }
                      />
                    </Flex>
                  ))}
                </Stack>
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={applyColumnChanges}>
              Apply
            </Button>
            <Button onClick={onDownloadModalClose} variant="outline">
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* **Updated Send Mail Modal with "View Summary" Button** */}
      <Modal
        isOpen={isMailModalOpen}
        onClose={onMailModalClose}
        size={{ base: "md", md: "xl" }} // Responsive modal size
        isCentered
      >
        <ModalOverlay />
        <ModalContent bg={bgColor}>
          <ModalHeader>Send Confirmation Email</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Box>
                {/* Platform and Mail Status */}
                <Flex alignItems="center" mb={2}>
                  {selectedVideo && (
                    <Badge
                      colorScheme={
                        selectedVideo.platform === "youtube"
                          ? "red"
                          : selectedVideo.platform === "instagram"
                            ? "pink"
                            : "blue"
                      } // Customize colors based on platform
                      // fontSize="md"
                      mr={2} // Add some margin to the right
                    >
                      <Icon
                        as={
                          selectedVideo.platform === "youtube"
                            ? FiYoutube
                            : selectedVideo.platform === "instagram"
                              ? FiInstagram
                              : FiTwitter
                        }
                        mr={1}
                      />{" "}
                      {/* Add platform icon */}
                      {selectedVideo.platform}
                    </Badge>
                  )}
                  <Spacer />
                  <Badge
                    colorScheme={
                      selectedVideo?.is_already_sent ? "orange" : "gray"
                    }
                  >
                    Mail Status:{" "}
                    {selectedVideo
                      ? selectedVideo.is_already_sent
                        ? "Sent"
                        : "Not Sent"
                      : ""}
                  </Badge>
                </Flex>

                {/* Alert for Already Sent Email */}
                {selectedVideo?.is_already_sent ? (
                  <Alert status="warning" mb={4}>
                    <AlertIcon />
                    This email has already been sent. Sending again may result
                    in duplicate notifications.
                  </Alert>
                ) : (
                  <></>
                )}

                {/* Deliverables Section */}
                <Stack spacing={3}>
                  <FormControl id="videos" isRequired>
                    <FormLabel>
                      {selectedVideo
                        ? selectedVideo.platform === "youtube"
                          ? "Video"
                          : selectedVideo.platform === "instagram"
                            ? "Reel"
                            : "Promotion"
                        : ""}
                    </FormLabel>
                    <Input
                      type="number"
                      name="videos"
                      value={mailFormData.deliverables.videos}
                      onChange={(e) =>
                        setMailFormData((prev) => ({
                          ...prev,
                          deliverables: {
                            ...prev.deliverables,
                            videos: e.target.value,
                          },
                        }))
                      }
                      bg={useColorModeValue("gray.50", "gray.600")}
                    />
                  </FormControl>
                  <FormControl id="posts" isRequired>
                    <FormLabel>
                      {selectedVideo
                        ? selectedVideo.platform === "youtube"
                          ? "Community Post"
                          : selectedVideo.platform === "instagram"
                            ? "Story"
                            : "Promotion"
                        : ""}
                    </FormLabel>
                    <Input
                      type="number"
                      name="posts"
                      value={mailFormData.deliverables.posts}
                      onChange={(e) =>
                        setMailFormData((prev) => ({
                          ...prev,
                          deliverables: {
                            ...prev.deliverables,
                            posts: e.target.value,
                          },
                        }))
                      }
                      bg={useColorModeValue("gray.50", "gray.600")}
                    />
                  </FormControl>

                  {/* Promotional Link Options - Improved UI */}
                  <FormControl id="promotionalLink" mt={4}>
                    <FormLabel>Promotional Link Options</FormLabel>
                    <CheckboxGroup
                      colorScheme="green"
                      value={mailFormData.deliverables.promotionalLink || []}
                      onChange={(values) =>
                        setMailFormData((prev) => ({
                          ...prev,
                          deliverables: {
                            ...prev.deliverables,
                            promotionalLink: values,
                          },
                        }))
                      }
                    >
                      <Grid
                        templateColumns={{
                          base: "repeat(1, 1fr)",
                          md: "repeat(2, 1fr)",
                        }}
                        gap={2}
                      >
                        {/* Responsive grid for checkboxes */}
                        <Checkbox
                          hidden={
                            selectedVideo
                              ? selectedVideo.platform === "youtube"
                                ? false
                                : selectedVideo.platform === "instagram"
                                  ? true
                                  : false
                              : false
                          }
                          value="1"
                        >
                          Link in Description
                        </Checkbox>
                        <Checkbox
                          hidden={
                            selectedVideo
                              ? selectedVideo.platform === "youtube"
                                ? false
                                : selectedVideo.platform === "instagram"
                                  ? true
                                  : false
                              : false
                          }
                          value="2"
                        >
                          Link in Pinned Comment
                        </Checkbox>
                        <Checkbox
                          hidden={
                            selectedVideo
                              ? selectedVideo.platform === "youtube"
                                ? false
                                : selectedVideo.platform === "instagram"
                                  ? true
                                  : false
                              : false
                          }
                          value="3"
                        >
                          Link in About Section
                        </Checkbox>
                        <Checkbox
                          hidden={
                            selectedVideo
                              ? selectedVideo.platform === "youtube"
                                ? true
                                : selectedVideo.platform === "instagram"
                                  ? false
                                  : false
                              : false
                          }
                          value="4"
                        >
                          Link in Bio
                        </Checkbox>
                        <Checkbox
                          hidden={
                            selectedVideo
                              ? selectedVideo.platform === "youtube"
                                ? true
                                : selectedVideo.platform === "instagram"
                                  ? false
                                  : false
                              : false
                          }
                          value="5"
                        >
                          Link in Story
                        </Checkbox>
                      </Grid>
                    </CheckboxGroup>
                  </FormControl>
                </Stack>
              </Box>

              {/* View Summary Button */}
              <Button
                colorScheme="blue"
                onClick={handleMailSubmit}
                alignSelf="flex-end"
              >
                Send For Approval
              </Button>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onMailModalClose} variant="outline">
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* **New Summary Confirmation Modal** */}

      <Modal
        isOpen={isSummaryModalOpen}
        onClose={onSummaryModalClose}
        size="md"
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Send Mail</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Summary Details in List Format with Enhanced Visibility */}
            <Stack spacing={5}>
              <Text fontWeight="bold" fontSize="lg">
                Please review before sending:
              </Text>

              <VStack align="stretch" spacing={4}>
                {/* Video Details */}
                <Box
                  borderWidth="1px"
                  borderRadius="md"
                  p={4}
                  boxShadow="md"
                  bg="gray.50"
                >
                  <Heading size="sm" mb={2} color="gray.700">
                    Video Details
                  </Heading>
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Text color="gray.600">ID:</Text>
                    <Text>
                      {selectedVideo ? selectedVideo.video_id || "N/A" : "N/A"}
                    </Text>
                  </Flex>
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Text color="gray.600">Profile:</Text>
                    <Link
                      href={selectedVideo?.profile_url || "#"}
                      isExternal
                      color="teal.500"
                    >
                      View Profile
                    </Link>
                  </Flex>
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Text color="gray.600">Video URL:</Text>
                    <Link
                      href={selectedVideo?.video_url || "#"}
                      isExternal
                      color="teal.500"
                    >
                      Watch Video
                    </Link>
                  </Flex>
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Text color="gray.600">Video Status:</Text>
                    <Text>{selectedVideo?.video_status || "N/A"}</Text>
                  </Flex>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text color="gray.600">Live Date:</Text>
                    <Text>{selectedVideo?.live_date || "N/A"}</Text>
                  </Flex>
                </Box>

                {/* Campaign Details */}
                <Box
                  borderWidth="1px"
                  borderRadius="md"
                  p={4}
                  boxShadow="md"
                  bg="gray.50"
                >
                  <Heading size="sm" mb={2} color="gray.700">
                    Campaign Details
                  </Heading>
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Text color="gray.600">ID:</Text>
                    <Text>{selectedVideo?.campaign_id || "N/A"}</Text>
                  </Flex>
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Text color="gray.600">Name:</Text>
                    <Text>{selectedVideo?.campaign_name || "N/A"}</Text>
                  </Flex>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text color="gray.600">Brand:</Text>
                    <Text>{selectedVideo?.brand || "N/A"}</Text>
                  </Flex>
                </Box>

                {/* Creator & Payment */}
                <Box
                  borderWidth="1px"
                  borderRadius="md"
                  p={4}
                  boxShadow="md"
                  bg="gray.50"
                >
                  <Heading size="sm" mb={2} color="gray.700">
                    Creator & Payment
                  </Heading>
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Text color="gray.600">Creator Email:</Text>
                    <Text>{selectedVideo?.crtrmail || "N/A"}</Text>
                  </Flex>
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Text color="gray.600">Creator Price:</Text>
                    <Text>{selectedVideo?.creator_price || "N/A"}</Text>
                  </Flex>
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Text color="gray.600">Brand Price:</Text>
                    <Text>{selectedVideo?.brand_price || "N/A"}</Text>
                  </Flex>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text color="gray.600">Payment Status:</Text>
                    <Badge
                      colorScheme={
                        selectedVideo?.payment_status === "Paid"
                          ? "green"
                          : "red"
                      }
                    >
                      {selectedVideo?.payment_status || "N/A"}
                    </Badge>
                  </Flex>
                </Box>

                {/* Deliverables */}
                <Box
                  borderWidth="1px"
                  borderRadius="md"
                  p={4}
                  boxShadow="md"
                  bg="gray.50"
                >
                  <Heading size="sm" mb={2} color="gray.700">
                    Deliverables
                  </Heading>
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Text color="gray.600">Videos:</Text>
                    <Text>
                      {selectedVideo
                        ? selectedVideo.deliverables?.videos || 0
                        : 0}
                    </Text>
                  </Flex>
                  <Flex
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Text color="gray.600">Posts:</Text>
                    <Text>
                      {selectedVideo
                        ? selectedVideo.deliverables?.posts || 0
                        : 0}
                    </Text>
                  </Flex>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text color="gray.600">Promotional Links:</Text>
                    <Text>
                      {selectedVideo
                        ? selectedVideo.deliverables?.promotionalLink || 0
                        : 0}
                    </Text>
                  </Flex>
                </Box>

                {/* Mail Status */}
                <Box
                  borderWidth="1px"
                  borderRadius="md"
                  p={4}
                  boxShadow="md"
                  bg="gray.50"
                >
                  <Heading size="sm" mb={2} color="gray.700">
                    Mail Status
                  </Heading>
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text color="gray.600">Already Sent:</Text>
                    <Badge
                      colorScheme={
                        selectedVideo?.is_already_sent ? "orange" : "green"
                      }
                    >
                      {selectedVideo?.is_already_sent ? "Yes" : "No"}
                    </Badge>
                  </Flex>
                  {/* Conditionally show the alert */}
                  {selectedVideo?.is_already_sent && (
                    <Alert status="warning" mt={3}>
                      <AlertIcon />
                      This email has already been sent. Sending again may result
                      in duplicate notifications.
                    </Alert>
                  )}
                </Box>
              </VStack>
            </Stack>
          </ModalBody>

          {/* <ModalFooter>
            <Button
              onClick={onSummaryModalClose}
              variant="outline"
              mr={3}
              colorScheme="gray"
            >
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleConfirmSendMail}
              isDisabled={selectedVideo?.is_already_sent}
            >
              Confirm & Send
            </Button>
          </ModalFooter> */}
        </ModalContent>
      </Modal>
    </>
  );
}
