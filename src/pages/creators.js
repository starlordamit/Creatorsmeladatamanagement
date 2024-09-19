import React, { useState, useEffect } from 'react';
import {
  Box, Table, Thead, Tbody, Tr, Th, Td, Button, Input, CheckboxGroup, Checkbox,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useToast, Select, useDisclosure,
  useColorModeValue, Flex, FormControl, FormLabel, SimpleGrid,
  Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverHeader, PopoverBody,
  IconButton, useColorMode, Spacer, Heading,useMediaQuery
} from '@chakra-ui/react';
import { FiDownload, FiEye, FiPlus, FiFilter, FiSun, FiMoon } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { addCreator, getAllCreators, updateCreator } from '../services/api'; // Import API functions
import { useAuth } from '../context/AuthContext'; // Import Auth context
import SidebarWithHeader from '../components/Navbar'; // Navbar

const CreatorsPage = () => {
  const { user } = useAuth(); // Assuming `user` contains role information
  const [creators, setCreators] = useState([]);
  const [formData, setFormData] = useState({
    profile_name: '', profile_url: '', youtube_url: '', instagram_url: '', video_url: '',
    followers: 0, phone: '', email: '', platform: '', category: '', region: '', language: '', is_exclusive: false,
  });
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCreatorId, setSelectedCreatorId] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { authToken } = useAuth();
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState({
    profile_name: true, profile_url: true, youtube_url: true, instagram_url: true, followers: true, phone: true, email: true, platform: true, category: true, region: true, language: true
  });
  const [tempSelectedColumns, setTempSelectedColumns] = useState({ ...selectedColumns });
  const [filters, setFilters] = useState({
    profile_name: '', platform: '', region: '', followers: ''
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const { colorMode, toggleColorMode } = useColorMode();
  const [isMobile] = useMediaQuery("(max-width: 768px)");

  const buttonBg = useColorModeValue('blue.500', 'blue.200');
  const buttonText = useColorModeValue('white', 'black');
  const modalSize = isMobile ? "full" : "lg";
  const bgColor = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const tableHeaderBg = useColorModeValue("gray.100", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");



  // Load creators when component mounts
  useEffect(() => {
    if (authToken) {
      loadCreators(authToken);
    }
  }, [authToken]);

  const loadCreators = async (token) => {
    try {
      const data = await getAllCreators(token);
      setCreators(data);
    } catch (error) {
      toast({
        title: 'Error fetching creators',
        status: 'error',
        description: error.message,
        duration: 5000,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    try {
      if (isEdit) {
        await updateCreator(selectedCreatorId, formData, authToken);
        toast({ title: 'Creator updated successfully', status: 'success' });
      } else {
        await addCreator(formData, authToken);
        toast({ title: 'Creator added successfully', status: 'success' });
      }
      onClose();
      loadCreators(authToken);
    } catch (error) {
      toast({
        title: 'Failed to save creator',
        status: 'error',
        description: error.message,
        duration: 5000,
      });
    }
  };

  const openEditModal = (creator) => {
    setIsEdit(true);
    setSelectedCreatorId(creator.creator_id);
    setFormData(creator);
    onOpen();
  };

  const openAddModal = () => {
    setIsEdit(false);
    setFormData({
      profile_name: '', profile_url: '', youtube_url: '', instagram_url: '', video_url: '',
      followers: 0, phone: '', email: '', platform: '', category: '', region: '', language: '', is_exclusive: false,
    });
    onOpen();
  };

  // Define the hasEditPermission function
  const hasEditPermission = () => {
    return user && (user.role === 'admin' || user.role === 'operation_manager' || user.role === 'finance_manager');
  };

  // Row selection handler
  const handleRowSelect = (creator_id) => {
    if (selectedRows.includes(creator_id)) {
      setSelectedRows(selectedRows.filter((id) => id !== creator_id));
    } else {
      setSelectedRows([...selectedRows, creator_id]);
    }
  };

  // Export selected rows to Excel
  const handleDownloadExcel = () => {
    if (selectedRows.length === 0) {
      toast({
        title: 'No data selected',
        description: 'Please select at least one creator to export.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    const selectedData = creators.filter((creator) => selectedRows.includes(creator.creator_id));
    const exportData = selectedData.map((creator) =>
      Object.keys(selectedColumns).filter(col => selectedColumns[col]).reduce((obj, col) => {
        obj[col] = creator[col];
        return obj;
      }, {})
    );
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Creators');
    XLSX.writeFile(workbook, 'creators.xlsx');
  };

  // Apply column changes
  const applyColumnChanges = () => {
    setSelectedColumns(tempSelectedColumns);
  };

  // Apply filters
  const applyFilters = () => {
    setFilters(tempFilters);
  };

  // Reset filters
  const resetFilters = () => {
    setTempFilters({
      profile_name: '', platform: '', region: '', followers: ''
    });
    setFilters({
      profile_name: '', platform: '', region: '', followers: ''
    });
  };

  // Filtering function
  const filteredCreators = creators.filter((creator) => {
    return Object.keys(filters).every((key) => {
      return filters[key] === '' || String(creator[key]).toLowerCase().includes(filters[key].toLowerCase());
    });
  });

  return (
  <>
      {/* <Flex align="center" mb={4}>
        <Heading size="lg">Creators</Heading>
        <Spacer />
        <IconButton
          icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
          aria-label="Toggle Color Mode"
          onClick={toggleColorMode}
        />
      </Flex> */}

      {/* Buttons and Column Selection */}
      <Box bg={cardBg} p={4} mb={4} borderRadius="md" shadow="md">
        <Flex
          justify="flex-start"
          align="center"
          wrap="wrap"
          direction="row"
          gap={2}
        >
          {/* Column Visibility Popover */}
          <Popover>
            <PopoverTrigger>
              <Button
                leftIcon={<FiEye />}
                size="sm"
                variant="outline"
              >
                Columns
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader>Select Columns</PopoverHeader>
              <PopoverBody>
                <CheckboxGroup value={Object.keys(tempSelectedColumns).filter((col) => tempSelectedColumns[col])}>
                  <SimpleGrid columns={2} spacing={2}>
                    {Object.keys(tempSelectedColumns).map((col) => (
                      <Checkbox
                        key={col}
                        isChecked={tempSelectedColumns[col]}
                        onChange={(e) => {
                          setTempSelectedColumns((prev) => ({ ...prev, [col]: e.target.checked }));
                        }}
                      >
                        {col.replace('_', ' ')}
                      </Checkbox>
                    ))}
                  </SimpleGrid>
                </CheckboxGroup>
                <Button mt={4} colorScheme="teal" size="sm" onClick={applyColumnChanges}>
                  Apply
                </Button>
              </PopoverBody>
            </PopoverContent>
          </Popover>

          {/* Filter Popover */}
          <Popover>
            <PopoverTrigger>
              <Button
                leftIcon={<FiFilter />}
                size="sm"
                variant="outline"
              >
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader>Filter Options</PopoverHeader>
              <PopoverBody>
                <SimpleGrid columns={1} spacing={3}>
                  <FormControl>
                    <FormLabel>Profile Name</FormLabel>
                    <Input
                      placeholder="Profile Name"
                      value={tempFilters.profile_name}
                      onChange={(e) => setTempFilters((prev) => ({ ...prev, profile_name: e.target.value }))}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Platform</FormLabel>
                    <Select
                      placeholder="Select platform"
                      value={tempFilters.platform}
                      onChange={(e) => setTempFilters((prev) => ({ ...prev, platform: e.target.value }))}
                    >
                      <option value="youtube">YouTube</option>
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="other">Other</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Region</FormLabel>
                    <Input
                      placeholder="Region"
                      value={tempFilters.region}
                      onChange={(e) => setTempFilters((prev) => ({ ...prev, region: e.target.value }))}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Followers</FormLabel>
                    <Input
                      placeholder="Followers"
                      type="number"
                      value={tempFilters.followers}
                      onChange={(e) => setTempFilters((prev) => ({ ...prev, followers: e.target.value }))}
                    />
                  </FormControl>
                </SimpleGrid>
                <Flex mt={4} justify="space-between">
                  <Button colorScheme="teal" size="sm" onClick={applyFilters}>
                    Apply
                  </Button>
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Reset
                  </Button>
                </Flex>
              </PopoverBody>
            </PopoverContent>
          </Popover>

          {/* Download Excel Button */}
          <Button
            leftIcon={<FiDownload />}
            size="sm"
            variant="outline"
            onClick={handleDownloadExcel}
          >
            Export
          </Button>

          {/* Add Creator IconButton */}
          {hasEditPermission() && (
            <IconButton
              icon={<FiPlus />}
              aria-label="Add Creator"
              onClick={openAddModal}
              colorScheme="teal"
              size="sm"
              variant="solid"
            />
          )}
        </Flex>
      </Box>

      {/* Creators Table */}
      <Box width="100%" overflow="auto">
        <Box borderWidth="1px"
          borderRadius="md"
          overflow="auto"
          bg={cardBg}
          shadow="sm"
          maxHeight={{ base: "400px", md: "600px" }}
          border={`1px solid ${borderColor}`}>
        <Table variant="simple" size="sm" colorScheme={useColorModeValue("blackAlpha", "whiteAlpha")}>
          <Thead bg={tableHeaderBg}>
            <Tr>
              <Th>
                <Checkbox
                  isChecked={selectedRows.length === filteredCreators.length && filteredCreators.length > 0}
                  onChange={() => setSelectedRows(selectedRows.length === filteredCreators.length ? [] : filteredCreators.map((creator) => creator.creator_id))}
                />
              </Th>
              {Object.keys(selectedColumns).map((col) => (
                selectedColumns[col] && (
                  <Th key={col}>
                    {col.replace('_', ' ')}
                  </Th>
                )
              ))}
              {hasEditPermission() && <Th>Actions</Th>}
            </Tr>
          </Thead>
          <Tbody>
            {filteredCreators.map((creator) => (
              <Tr key={creator.creator_id}>
                <Td>
                  <Checkbox
                    isChecked={selectedRows.includes(creator.creator_id)}
                    onChange={() => handleRowSelect(creator.creator_id)}
                  />
                </Td>
                {Object.keys(selectedColumns).map((col) => selectedColumns[col] && <Td key={col}>{creator[col]}</Td>)}
                {hasEditPermission() && (
                  <Td>
                    <Button onClick={() => openEditModal(creator)} colorScheme="teal" size="sm">Edit</Button>
                  </Td>
                )}
              </Tr>
            ))}
          </Tbody>
        </Table>
        </Box>
      </Box>

      {/* Add/Edit Creator Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', md: 'md' }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEdit ? 'Edit Creator' : 'Add Creator'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Profile Name</FormLabel>
                <Input placeholder="Profile Name" name="profile_name" value={formData.profile_name} onChange={handleInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Profile URL</FormLabel>
                <Input placeholder="Profile URL" name="profile_url" value={formData.profile_url} onChange={handleInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>YouTube URL</FormLabel>
                <Input placeholder="YouTube URL" name="youtube_url" value={formData.youtube_url} onChange={handleInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Instagram URL</FormLabel>
                <Input placeholder="Instagram URL" name="instagram_url" value={formData.instagram_url} onChange={handleInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Video URL</FormLabel>
                <Input placeholder="Video URL" name="video_url" value={formData.video_url} onChange={handleInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Followers</FormLabel>
                <Input placeholder="Followers" name="followers" type="number" value={formData.followers} onChange={handleInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Phone</FormLabel>
                <Input placeholder="Phone" name="phone" value={formData.phone} onChange={handleInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input placeholder="Email" name="email" value={formData.email} onChange={handleInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Platform</FormLabel>
                <Select placeholder="Select platform" name="platform" value={formData.platform} onChange={handleInputChange}>
                  <option value="youtube">YouTube</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="other">Other</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Category</FormLabel>
                <Input placeholder="Category" name="category" value={formData.category} onChange={handleInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Region</FormLabel>
                <Input placeholder="Region" name="region" value={formData.region} onChange={handleInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Language</FormLabel>
                <Input placeholder="Language" name="language" value={formData.language} onChange={handleInputChange} />
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <Checkbox
                  name="is_exclusive"
                  isChecked={formData.is_exclusive}
                  onChange={handleInputChange}
                >
                  Exclusive Creator
                </Checkbox>
              </FormControl>
            </SimpleGrid>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={handleSave}>{isEdit ? 'Update Creator' : 'Add Creator'}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      </>
  );
};

export default CreatorsPage;
