import { useState, useEffect } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Modal,
  Button,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  useDisclosure,
  useToast,
  Flex,
  Badge,
  Collapse,
  useColorModeValue,
  useMediaQuery,
  SimpleGrid,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { FiEdit, FiTrash2, FiFilter } from "react-icons/fi"; // Added filter icon
import {
  fetchAllUsers,
  updateUser,
  terminateUser,
  assignRole,
} from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    role: "",
  });
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    role: "",
    status: "",
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEdit, setIsEdit] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Toggle for filter box
  const { authToken } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const cardBg = useColorModeValue("white", "gray.700");
  const tableHeaderBg = useColorModeValue("gray.100", "gray.900");

  // Fetch user data on component load
  useEffect(() => {
    if (authToken) {
      loadUsers(authToken);
    }
  }, [authToken]);

  const loadUsers = async (token) => {
    setIsLoading(true); // Show loader
    try {
      const data = await fetchAllUsers(token);
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      toast({
        title: "Failed to fetch users.",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false); // Hide loader
    }
  };

  const openModal = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData(user);
      setIsEdit(true);
    } else {
      setSelectedUser(null);
      setFormData({ name: "", phone: "", email: "", role: "" });
      setIsEdit(false);
    }
    onOpen();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    applyFilters({ ...filters, [name]: value });
  };

  const applyFilters = (filterValues) => {
    const { name, email, role, status } = filterValues;
    const filtered = users.filter((user) => {
      const matchesName = name
        ? user.name?.toLowerCase().includes(name.toLowerCase())
        : true;
      const matchesEmail = email
        ? user.email.toLowerCase().includes(email.toLowerCase())
        : true;
      const matchesRole = role ? user.role === role : true;
      const matchesStatus = status
        ? status === "active"
          ? !user.is_suspended
          : user.is_suspended
        : true;

      return matchesName && matchesEmail && matchesRole && matchesStatus;
    });
    setFilteredUsers(filtered);
  };

  const handleSave = async () => {
    if (!authToken) return;
    try {
      if (isEdit) {
        await updateUser(selectedUser.user_id, formData, authToken);
        toast({
          title: "User updated successfully!",
          status: "success",
          duration: 3000,
        });
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.user_id === selectedUser.user_id
              ? { ...user, ...formData }
              : user
          )
        );
      } else {
        toast({
          title: "User created successfully!",
          status: "success",
          duration: 3000,
        });
      }
      onClose();
    } catch (err) {
      toast({
        title: "Failed to save user.",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleTerminate = async (userId, isSuspended) => {
    if (!authToken) return;
    try {
      await terminateUser(userId, isSuspended, authToken);
      toast({
        title: `User ${isSuspended ? "terminated" : "activated"} successfully!`,
        status: "success",
        duration: 3000,
      });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.user_id === userId
            ? { ...user, is_suspended: isSuspended }
            : user
        )
      );
    } catch (err) {
      toast({
        title: "Failed to update user status.",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleRoleAssignment = async (userId, newRole) => {
    if (!authToken) return;
    try {
      await assignRole(userId, newRole, authToken);
      toast({
        title: "Role assigned successfully!",
        status: "success",
        duration: 3000,
      });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.user_id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (err) {
      toast({
        title: "Failed to assign role.",
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <>
      <Flex justify="space-between" align="center" mb={4}>
        <Button
          leftIcon={<FiFilter />}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          colorScheme="teal"
          size={"sm"}
        >
          {isFilterOpen ? "Hide Filters" : "Show Filters"}
        </Button>
      </Flex>

      {/* Filter section */}
      <Collapse in={isFilterOpen} animateOpacity>
        <Box p={4} bg={cardBg} borderRadius="md" shadow="md" mb={4}>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            <Input
              placeholder="Filter by Name"
              size="sm"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
            />
            <Input
              placeholder="Filter by Email"
              size="sm"
              name="email"
              value={filters.email}
              onChange={handleFilterChange}
            />
            <Select
              placeholder="Filter by Role"
              size="sm"
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
            >
              <option value="admin">Admin</option>
              <option value="finance_manager">Finance Manager</option>
              <option value="operation_manager">Operation Manager</option>
              <option value="user">User</option>
            </Select>
            <Select
              placeholder="Filter by Status"
              size="sm"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="active">Active</option>
              <option value="terminated">Terminated</option>
            </Select>
          </SimpleGrid>
        </Box>
      </Collapse>

      {/* Loader */}
      {isLoading ? (
        <Flex justify="center" align="center" minHeight="50vh">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <Box
          borderWidth="1px"
          borderRadius="md"
          overflow="auto"
          bg={cardBg}
          shadow="sm"
          maxHeight="74vh"
        >
          <Table variant="simple" size="sm">
            <Thead bg={tableHeaderBg}>
              <Tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Phone</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredUsers.map((user) => (
                <Tr key={user.user_id}>
                  <Td>{user.name}</Td>
                  <Td>{user.email}</Td>
                  <Td>{user.phone}</Td>
                  <Td>
                    <Select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleAssignment(user.user_id, e.target.value)
                      }
                      size="sm"
                    >
                      <option value="admin">Admin</option>
                      <option value="finance_manager">Finance Manager</option>
                      <option value="operation_manager">
                        Operation Manager
                      </option>
                      <option value="user">User</option>
                    </Select>
                  </Td>
                  <Td>
                    <Badge colorScheme={user.is_suspended ? "red" : "green"}>
                      {user.is_suspended ? "Terminated" : "Active"}
                    </Badge>
                  </Td>
                  <Td>
                    <Flex>
                      <IconButton
                        icon={<FiEdit />}
                        size="sm"
                        colorScheme="teal"
                        onClick={() => openModal(user)}
                        aria-label="Edit"
                      />
                      <IconButton
                        icon={<FiTrash2 />}
                        size="sm"
                        colorScheme={user.is_suspended ? "green" : "red"}
                        onClick={() =>
                          handleTerminate(user.user_id, !user.is_suspended)
                        }
                        aria-label={
                          user.is_suspended ? "Activate" : "Terminate"
                        }
                      />
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Modal for Editing User */}
      <Modal isOpen={isOpen} onClose={onClose} size={isMobile ? "xs" : "md"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEdit ? "Edit User" : "Create New User"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              mb={3}
            />
            <Input
              placeholder="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              mb={3}
            />
            <Input
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              mb={3}
            />
            <Select
              placeholder="Select Role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              mb={3}
            >
              <option value="admin">Admin</option>
              <option value="finance_manager">Finance Manager</option>
              <option value="operation_manager">Operation Manager</option>
              <option value="user">User</option>
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleSave}>
              {isEdit ? "Update User" : "Create User"}
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
