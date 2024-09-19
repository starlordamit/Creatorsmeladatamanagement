// pages/video-management.jsx

import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import {
  Box,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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

  Menu, MenuButton, MenuList, MenuItem

} from "@chakra-ui/react";
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
  FiEye
} from "react-icons/fi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx"; // Import for Excel export
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

  // State Variables
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [formData, setFormData] = useState({
    profile_url: "",
    video_url: "",
    campaign_id: "",
    brand: "",
    video_status: "",
    live_date: "",
    brand_price: "",
    commission: "",
    creator_price: "",
    payment_status: "",
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

  // Columns for download/print
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
    commission: true,
    creator_price: true,
  });

  // State for managing column visibility
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
    commission: true,
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
    { label: "Commission", key: "commission" },
    { label: "Creator Price", key: "creator_price" },
  ];

  useEffect(() => {
    if (authToken) {
      loadVideos(authToken);
      loadCampaigns(authToken);
    }
  }, [authToken]);

  const loadVideos = async (token) => {
    try {
      const data = await fetchAllVideos(token);
      setVideos(data);
    } catch (err) {
      toast({
        title: "Error fetching videos",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const loadCampaigns = async (token) => {
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
    }
  };

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

  // Filtered Videos
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
    } catch (err) {
      toast({
        title: "Error deleting video",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle Download with Selected Columns
//   const handleDownload = () => {
//     const selectedKeys = columns
//       .filter((col) => selectedColumns[col.key])
//       .map((col) => col.key);
//     const selectedLabels = columns
//       .filter((col) => selectedColumns[col.key])
//       .map((col) => col.label);

//     const dataToExport =
//       selectedRows.length > 0
//         ? filteredVideos.filter((video) => selectedRows.includes(video.video_id))
//         : filteredVideos;

//     const tableRows = dataToExport.map((video) =>
//       selectedKeys.map((key) => video[key])
//     );

//     if (downloadFormat === "pdf") {
//       const doc = new jsPDF();
//       autoTable(doc, {
//         head: [selectedLabels],
//         body: tableRows,
//         theme: useColorModeValue("grid", "striped"),
//         styles: {
//           halign: "left",
//           valign: "middle",
//           fontSize: 10,
//         },
//       });
//       doc.save("Report_" + Date.now() + ".pdf");
//     } else if (downloadFormat === "excel") {
//       const worksheetData = dataToExport.map((video) => {
//         const rowData = {};
//         selectedKeys.forEach((key, index) => {
//           rowData[selectedLabels[index]] = video[key];
//         });
//         return rowData;
//       });
//       const worksheet = XLSX.utils.json_to_sheet(worksheetData);
//       const workbook = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(workbook, worksheet, "Videos");
//       XLSX.writeFile(workbook, "Report_" + Date.now() + ".xlsx");
//     }
//     onDownloadModalClose();
//   };

const handleDownload = () => {
    // const toast = useToast();
  
    // Check if no rows are selected
    if (selectedRows.length === 0) {
      toast({
        title: "No video selected.",
        description: "Please select at least one video to download.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return; // Stop the function if no rows are selected
    }
  
    const selectedKeys = columns
      .filter((col) => selectedColumns[col.key])
      .map((col) => col.key);
    const selectedLabels = columns
      .filter((col) => selectedColumns[col.key])
      .map((col) => col.label);
  
    const dataToExport =
      selectedRows.length > 0
        ? filteredVideos.filter((video) => selectedRows.includes(video.video_id))
        : toast("Plese Select some videos to download.");
  
    const tableRows = dataToExport.map((video) =>
      selectedKeys.map((key) => video[key])
    );
  
    if (downloadFormat === "pdf") {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [selectedLabels],
        body: tableRows,
        theme: useColorModeValue("grid", "striped"),
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




  // Apply column changes
  const applyColumnChanges = () => {
    setVisibleColumns({ ...selectedColumns }); // Update visibleColumns based on selectedColumns
    onDownloadModalClose(); // Close the modal after applying changes
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
        commission: video.commission || "",
        creator_price: video.creator_price || "",
        payment_status: video.payment_status || "",
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
        commission: "",
        creator_price: "",
        payment_status: "",
      });
      setIsEdit(false);
    }
    onOpen();
  };

  return (
    <>
   
      {/* Header with Add Video and Actions */}

<Box bg={cardBg} pl={2} pt={2} mb={2}  borderRadius="md" shadow="md">

      <Flex justify="space-between" align="center" mb={4} flexWrap="wrap"
>
        {/* Left-aligned Actions (Mobile-first, Single Row on Mobile) */}
        <Flex 
          direction={{ base: 'row', md: 'row' }}
          align={{ base: 'center', md: 'center' }}
          wrap="wrap"
          justifyContent={{ base: 'space-between', md: 'flex-start' }} 
        > 
          {/* Column Visibility */}
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

          {/* Download */}
          {isMobile ? (
            <Tooltip label="Download" aria-label="Download">
              <IconButton
                icon={<FiDownload />}
                colorScheme="blue"
                onClick={handleDownload} 
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
              onClick={handleDownload}
              mb={2}
              ml={{ base: 0, md: 2 }}
            >
              Export
            </Button>
          )} 

         

          {/* Filter (Responsive Button/Icon) - Keep the existing code */}
          {isMobile ? (
            <Tooltip label={isFilterOpen ? "Hide Filters" : "Show Filters"} aria-label="Filter">
              <IconButton
                icon={<FiFilter />}
                colorScheme="teal"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                mb={2}
                mr={{ base: 0, md: 2 }} 
                variant="outline"
                aria-label="Filter"
              />
            </Tooltip>
          ) : (
            <Button
              leftIcon={<FiFilter />}
              colorScheme="teal"
              variant="outline"
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              mb={2}
              ml={{ base: 0, md: 2 }}
            >
              {isFilterOpen ? "Hide Filters" : "Show Filters"}
            </Button>
          )} 

           {/* Add New Video (Responsive Button/Icon) */}
           {isMobile ? (
            <Tooltip label="Add New Video" aria-label="Add New Video">
              <Button
               leftIcon={<FiPlus />}
               variant={"outline"}
                colorScheme="teal"
                onClick={() => openModal()}
                mb={2}
                // ml={{ base: 0, md: 2 }}
                // mr={{ base: 0, md: 2 }} 
               
                ml={2}
                aria-label="Add New Video"
              >Add New Video
                </Button>
            </Tooltip>
           ): <Button
           leftIcon={<FiPlus />}
           variant={"outline"}
           size={"sm"}
            colorScheme="teal"
            onClick={() => openModal()}
            mb={2}
            ml={{ base: 0, md: 2 }}
            mr={{ base: 0, md: 2 }} 
            aria-label="Add New Video"
          >Add New Video
            </Button>}
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
                <option
                  key={campaign.campaign_id}
                  value={campaign.name}
                >
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
          maxHeight={{ base: "400px", md: "600px" }}
          border={`1px solid ${borderColor}`}
        >
          <Table variant="simple" size="sm" colorScheme={useColorModeValue("blackAlpha", "whiteAlpha")}>
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
                {columns.slice(1).map((col) => (
                  visibleColumns[col.key] && ( // Conditionally render Th based on visibility
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
                ))}
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
                  {columns.slice(1).map((col) => 
                    visibleColumns[col.key] && ( // Conditionally render Td based on visibility
                      <Td key={col.key}>
                        {col.key === "profile_url" || col.key === "video_url" ? (
                          <Box
                            whiteSpace="nowrap"
                            overflow="hidden"
                            textOverflow="ellipsis"
                            maxWidth={{ base: "150px", md: "none" }}
                          >
                            <a href={video[col.key]} target="_blank" rel="noopener noreferrer">
                              {video[col.key]}
                            </a>
                          </Box>
                        ) : col.key === "video_status" || col.key === "payment_status" ? (
                          <Badge
                            colorScheme={
                              video[col.key] === "live" || video[col.key] === "paid"
                                ? "green"
                                : video[col.key] === "progress" || video[col.key] === "pending"
                                ? "yellow"
                                : "red"
                            }
                          >
                            {video[col.key].charAt(0).toUpperCase() + video[col.key].slice(1)}
                          </Badge>
                        ) : col.key === "live_date" ? (
                          new Date(video[col.key]).toLocaleDateString()
                        ) : col.key === "brand_price" || col.key === "commission" || col.key === "creator_price" ? (
                          <Td isNumeric>{video[col.key]}</Td>
                        ) : (video[col.key]) 
                        }
                      </Td>
                    )
                  )}
                  <Td>
                    <Flex>
                      {/* Edit Button */}
                      <IconButton
                        icon={<FiEdit />}
                        size="sm"
                        colorScheme="teal"
                        onClick={() => openModal(video)}
                        aria-label="Edit"
                        mr={2}
                      />

                      {/* Delete Button */}
                      <IconButton
                        icon={<FiTrash2 />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDelete(video.video_id)}
                        aria-label="Delete"
                      />
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
              <FormControl id="video_status" isRequired   hidden={!isEdit}>
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
                  selected={formData.live_date ? new Date(formData.live_date) : null}
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
              {/* <FormControl id="commission" isRequired>
                <FormLabel>Commission</FormLabel>
                <Input
                  placeholder="Commission"
                  name="commission"
                  type="number"
                  value={formData.commission}
                  onChange={handleInputChange}
                  bg={useColorModeValue("gray.50", "gray.600")}
                />
              </FormControl> */}
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
              {/* <FormControl id="payment_status" isRequired>
                <FormLabel>Payment Status</FormLabel>
                <Select
                  placeholder="Select Payment Status"
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={handleInputChange}
                  bg={useColorModeValue("gray.50", "gray.600")}
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </Select>
              </FormControl> */}
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
              {/* Enhanced Toggle Switches for Columns */}
              <FormControl as="fieldset">
                {/* <FormLabel as="legend" fontWeight="semibold" fontSize="lg">
                  Select Columns to Include
                </FormLabel> */}
                <Stack spacing={4}  overflowY="auto">
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
              {/* Download Format Selection */}
              {/* <FormControl as="fieldset">
                <FormLabel as="legend" fontWeight="semibold" fontSize="lg">
                  Select Download Format
                </FormLabel>
                <RadioGroup
                  value={downloadFormat}
                  onChange={(value) => setDownloadFormat(value)}
                >
                  <Stack direction="row" spacing={6} justify="center">
                    <Button
                      as="label"
                      htmlFor="pdf"
                      leftIcon={<FiDownload />}
                      variant={downloadFormat === "pdf" ? "solid" : "outline"}
                      colorScheme="blue"
                      size="md"
                      cursor="pointer"
                    >
                      PDF
                      <Radio
                        value="pdf"
                        id="pdf"
                        display="none"
                        readOnly
                      />
                    </Button>
                    <Button
                      as="label"
                      htmlFor="excel"
                      leftIcon={<FiDownload />}
                      variant={downloadFormat === "excel" ? "solid" : "outline"}
                      colorScheme="blue"
                      size="md"
                      cursor="pointer"
                    >
                      Excel
                      <Radio
                        value="excel"
                        id="excel"
                        display="none"
                        readOnly
                      />
                    </Button>
                  </Stack>
                </RadioGroup>
              </FormControl> */}
            </Stack>
          </ModalBody>
          <ModalFooter>
            {/* Apply Button for Column Visibility */}
            <Button colorScheme="teal" mr={3} onClick={applyColumnChanges}>
              Apply
            </Button>

            {/* <Button colorScheme="blue" mr={3} onClick={handleDownload}>
              Download / Export
            </Button> */}
            <Button onClick={onDownloadModalClose} variant="outline">
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
   </>
 
  );
}