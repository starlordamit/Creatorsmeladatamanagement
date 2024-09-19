import { useState, useEffect } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
  useToast,
  Select,
  IconButton,
  useBreakpointValue,
  useColorModeValue,
  Flex,
  Collapse,
} from "@chakra-ui/react";
import {
  fetchCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "../services/api";
import { useRouter } from "next/router";
import { FiTrash2, FiEdit, FiFilter } from "react-icons/fi";
import SidebarWithHeader from "../components/Navbar";

export default function CampaignPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    budget: "",
    brand: "",
    status: "",
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEdit, setIsEdit] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ name: "", brand: "", status: "" });
  const { push } = useRouter();
  const toast = useToast();
  const modalSize = useBreakpointValue({ base: "full", md: "lg" });
  const cardBg = useColorModeValue("white", "gray.700");
  const tableHeaderBg = useColorModeValue("gray.100", "gray.900");

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (!storedToken) {
      push("/auth/Login");
    } else {
      loadCampaigns(storedToken);
    }
  }, [push]);

  const loadCampaigns = async (token) => {
    try {
      const data = await fetchCampaigns(token);
      setCampaigns(data);
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    }
  };

  const openModal = (campaign = null) => {
    if (campaign) {
      setSelectedCampaign(campaign);
      setFormData(campaign);
      setIsEdit(true);
    } else {
      setSelectedCampaign(null);
      setFormData({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        budget: "",
        brand: "",
        status: "",
      });
      setIsEdit(false);
    }
    onOpen();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      if (isEdit) {
        await updateCampaign(selectedCampaign.campaign_id, formData, token);
        toast({
          title: "Campaign updated successfully!",
          status: "success",
          duration: 3000,
        });
      } else {
        await createCampaign(formData, token);
        toast({
          title: "Campaign created successfully!",
          status: "success",
          duration: 3000,
        });
      }
      onClose();
      loadCampaigns(token);
    } catch (err) {
      console.error("Failed to save campaign:", err);
      toast({
        title: "Failed to save campaign.",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDelete = async (campaignId) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      await deleteCampaign(campaignId, token);
      toast({
        title: "Campaign deleted successfully!",
        status: "success",
        duration: 3000,
      });
      loadCampaigns(token);
    } catch (err) {
      console.error("Failed to delete campaign:", err);
      toast({
        title: "Failed to delete campaign.",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ name: "", brand: "", status: "" });
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    return (
      (!filters.name ||
        campaign.name.toLowerCase().includes(filters.name.toLowerCase())) &&
      (!filters.brand ||
        campaign.brand.toLowerCase().includes(filters.brand.toLowerCase())) &&
      (!filters.status || campaign.status === filters.status)
    );
  });

  return (
    <>
      <Flex justify="space-between" align="center" mb={4}>
        <Button
          leftIcon={<FiFilter />}
          colorScheme="teal"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          {isFilterOpen ? "Hide Filters" : "Show Filters"}
        </Button>
        <Button colorScheme="blue" onClick={() => openModal()}>
          Add New Campaign
        </Button>
      </Flex>

      <Collapse in={isFilterOpen} animateOpacity>
        <Box bg={cardBg} p={4} mb={6} borderRadius="md" shadow="sm">
          <Flex flexWrap="wrap" justify="space-between">
            <Input
              placeholder="Campaign Name"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              mb={3}
              width={{ base: "100%", md: "30%" }}
            />
            <Input
              placeholder="Brand"
              name="brand"
              value={filters.brand}
              onChange={handleFilterChange}
              mb={3}
              width={{ base: "100%", md: "30%" }}
            />
            <Select
              placeholder="Select Status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              mb={3}
              width={{ base: "100%", md: "30%" }}
            >
              <option value="upcoming">Upcoming</option>
              <option value="Active">Active</option>
              <option value="done">Done</option>
            </Select>
          </Flex>

          <Flex justify="flex-end">
            <Button
              onClick={clearFilters}
              colorScheme="red"
              variant="outline"
              size="sm"
            >
              Clear Filters
            </Button>
          </Flex>
        </Box>
      </Collapse>

      <Box overflowX="auto">
        <Box
          borderWidth="1px"
          borderRadius="md"
          overflow="auto"
          bg={cardBg}
          shadow="sm"
          maxHeight={{ base: "400px", md: "600px" }}
        >
          <Table variant="simple" size="sm" minWidth="100%">
            <Thead bg={tableHeaderBg}>
              <Tr>
                <Th>Campaign Name</Th>
                <Th>Description</Th>
                <Th>Start Date</Th>
                <Th>End Date</Th>
                <Th>Budget</Th>
                <Th>Brand</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredCampaigns.map((campaign) => (
                <Tr key={campaign.campaign_id}>
                  <Td>{campaign.name}</Td>
                  <Td>{campaign.description}</Td>
                  <Td>{new Date(campaign.start_date).toLocaleDateString()}</Td>
                  <Td>{new Date(campaign.end_date).toLocaleDateString()}</Td>
                  <Td>{campaign.budget}</Td>
                  <Td>{campaign.brand}</Td>
                  <Td>{campaign.status}</Td>
                  <Td>
                    <Flex>
                      <IconButton
                        icon={<FiEdit />}
                        size="sm"
                        colorScheme="teal"
                        onClick={() => openModal(campaign)}
                        aria-label="Edit"
                        mr={2}
                      />
                      <IconButton
                        icon={<FiTrash2 />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDelete(campaign.campaign_id)}
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

      <Modal isOpen={isOpen} onClose={onClose} size={modalSize}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEdit ? "Edit Campaign" : "Create New Campaign"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Campaign Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              mb={3}
            />
            <Input
              placeholder="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              mb={3}
            />
            <Input
              placeholder="Start Date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleInputChange}
              mb={3}
            />
            <Input
              placeholder="End Date"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleInputChange}
              mb={3}
            />
            <Input
              placeholder="Budget"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              mb={3}
            />
            <Input
              placeholder="Brand"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              mb={3}
            />
            <Select
              placeholder="Select status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="done">Done</option>
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleSave}>
              {isEdit ? "Update Campaign" : "Create Campaign"}
            </Button>
            <Button ml={3} onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
