// components/SidebarWithHeader.jsx

import { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  IconButton,
  Avatar,
  HStack,
  VStack,
  Text,
  useColorModeValue,
  Drawer,
  DrawerContent,
  useDisclosure,
  useMediaQuery,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useColorMode,
  Link as ChakraLink,
  Icon,
  Heading,
  Tooltip,
  Divider,
} from '@chakra-ui/react';
import {
  FiMenu,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiSun,
  FiMoon,
  FiHome,
  FiUser,
  FiVideo,
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiSpeaker,
  FiLogOut,
} from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { fetchUserProfile } from '../services/api';

const SidebarWithHeader = ({ children }) => {
  // **Hook Calls at the Top Level**
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const bgSidebar = useColorModeValue('white', 'gray.800'); // Sidebar background
  const bgMain = useColorModeValue('gray.50', 'gray.900'); // Main content background
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, setUser, logout } = useAuth();
  const router = useRouter();
  const [isMobile] = useMediaQuery('(max-width: 768px)');

  // Initialize states
  const [expanded, setExpanded] = useState(true); // Default to expanded
  const [mounted, setMounted] = useState(false); // To track if component is mounted

  // Set expanded from localStorage after mount
  useEffect(() => {
    const savedExpanded = localStorage.getItem('sidebarExpanded');
    if (savedExpanded !== null) {
      const parsed = JSON.parse(savedExpanded);
      setExpanded(parsed);
    }
    setMounted(true); // Mark as mounted
  }, []);

  // Persist expand/collapse state in localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebarExpanded', JSON.stringify(expanded));
    }
  }, [expanded, mounted]);

  const [activeKey, setActiveKey] = useState('dashboard');

  // **Fetch user profile (commented out)**
  /*
  useEffect(() => {
    const fetchProfile = async () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        if (token) {
          try {
            const data = await fetchUserProfile(token);
            setUser(data);
          } catch (error) {
            setUser(null);
            logout(); // Ensure logout is called on error
            router.push('/auth/Login');
          }
        } else {
          router.push('/auth/Login');
        }
      }
    };
    fetchProfile();
  }, [router, setUser, logout]);
  */

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const capitalizeFirstLetter = (string) => {
    if (string.length === 0) return string;
    return string[0].toUpperCase() + string.slice(1);
  };

  const pagePath = capitalizeFirstLetter(router.pathname.split('/')[1] || 'Dashboard');

  // **Prevent rendering until mounted to avoid hydration mismatch**
  if (!mounted) {
    return null; // Or a loading spinner if preferred
  }

  return (
    <Box minH="100vh" bg={bgMain}>
      {/* Sidebar for Desktop */}
      <SidebarContent
        onClose={onClose}
        user={user}
        expanded={expanded}
        activeKey={activeKey}
        setActiveKey={setActiveKey}
        handleToggle={handleToggle}
        logout={logout} // Pass logout function
        display={{ base: 'none', md: 'block' }}
      />

      {/* Drawer for Mobile */}
      <Drawer
        isOpen={isOpen}
        placement="right" // Sidebar opens from the right on mobile
        onClose={onClose}
      >
        <DrawerContent maxW="80vw" w="80vw" overflow="hidden">
          <SidebarContent
            onClose={onClose}
            user={user}
            expanded={true} // Always expanded in mobile view
            activeKey={activeKey}
            setActiveKey={setActiveKey}
            handleToggle={handleToggle}
            logout={logout} // Pass logout function
            isMobile
          />
        </DrawerContent>
      </Drawer>

      {/* Header */}
      <Header
        onOpen={onOpen}
        user={user}
        handleToggle={handleToggle}
        expanded={expanded}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <Box
        ml={{ base: 0, md: expanded ? '240px' : '60px' }}
        transition="margin-left 0.3s ease"
        p="4"
      >
        {/* Breadcrumb */}
        <Box
          bg={useColorModeValue('white', 'gray.800')}
          px={4}
          py={2}
          mb={4}
          borderRadius="md"
          boxShadow="sm"
        >
          <Breadcrumb spacing="8px" separator={<FiChevronRight color="gray.500" />}>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink href="#">{pagePath}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </Box>
        {children}
      </Box>
    </Box>
  );
};

// Define your navigation items
const navigationItems = [
  {
    label: 'Dashboard',
    eventKey: 'dashboard',
    icon: FiHome,
    roles: ['admin', 'operation_manager', 'finance_manager', 'user'],
    path: '/dashboard',
  },
  {
    label: 'Profile',
    eventKey: 'profile',
    icon: FiUser,
    roles: ['admin', 'operation_manager', 'finance_manager', 'user'],
    path: '/profile',
  },
  {
    label: 'Campaigns',
    eventKey: 'campaign',
    icon: FiSpeaker,
    roles: ['admin'],
    path: '/campaign',
  },
  {
    label: 'Users',
    eventKey: 'users',
    icon: FiUsers,
    roles: ['admin'],
    path: '/users',
  },
  {
    label: 'Videos',
    eventKey: 'video',
    icon: FiVideo,
    roles: ['admin', 'finance_manager', 'operation_manager'],
    path: '/video',
  },
  {
    label: 'Payments',
    eventKey: 'payment',
    icon: FiDollarSign,
    roles: ['admin', 'finance_manager'],
    path: '/payment',
  },
  {
    label: 'Creators',
    eventKey: 'creators',
    icon: FiTrendingUp,
    roles: ['admin', 'finance_manager', 'operation_manager', 'user'],
    path: '/creators',
  },
];

// Sidebar Content Component
const SidebarContent = ({
  onClose,
  user,
  expanded,
  activeKey,
  setActiveKey,
  handleToggle,
  isMobile,
  logout,
  ...rest
}) => {
  // **Hook Calls at the Top Level**
  const router = useRouter();
  const { colorMode } = useColorMode();

  // **Predefine all useColorModeValue calls**
  const bgSidebar = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconColorActive = useColorModeValue('teal.500', 'teal.200');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const activeBg = useColorModeValue('teal.100', 'teal.700');

  // Set activeKey based on current path
  useEffect(() => {
    const path = router.pathname.split('/')[1] || 'dashboard';
    setActiveKey(path);
  }, [router.pathname, setActiveKey]);

  const handleSelect = (eventKey, path) => {
    if (eventKey === 'logout') {
      // Handle logout
      logout();
      router.push('/auth/Login');
      return;
    }

    setActiveKey(eventKey);
    router.push(path);
    if (isMobile) {
      onClose(); // Close the drawer on mobile after navigation
    }
  };

  return (
    <Box
      bg={bgSidebar}
      borderRight="1px"
      borderRightColor={borderColor}
      w={{ base: isMobile ? 'full' : expanded ? '240px' : '60px' }}
      pos="fixed"
      h="full"
      {...rest}
    >
      {/* Sidebar Header */}
      <Flex
        h="20"
        alignItems="center"
        mx="4"
        justifyContent={expanded ? 'space-between' : 'center'}
      >
        {/* Toggle Button for Desktop */}
        {!isMobile && (
          <IconButton
            onClick={handleToggle}
            variant="ghost"
            aria-label="Toggle sidebar"
            icon={expanded ? <FiChevronLeft /> : <FiChevronRight />}
            size="sm"
            _hover={{ bg: useColorModeValue('gray.200', 'gray.700') }}
          />
        )}
        {/* Close Button for Mobile */}
        {isMobile && (
          <IconButton
            onClick={onClose}
            variant="ghost"
            aria-label="Close sidebar"
            icon={<FiChevronRight />}
            size="sm"
            _hover={{ bg: useColorModeValue('gray.200', 'gray.700') }}
          />
        )}
      </Flex>

      {/* Navigation Items */}
      <VStack align="stretch" mt={4} spacing={1}>
        {navigationItems.map((item) => {
          // Check if user has access based on role
          if (!item.roles.includes(user?.role)) {
            return null;
          }
          const isActive = activeKey === item.eventKey;
          return (
            <ChakraLink
              key={item.eventKey}
              href="#"
              onClick={() => handleSelect(item.eventKey, item.path)}
              style={{ textDecoration: 'none' }}
            >
              <Tooltip label={expanded ? '' : item.label} placement="right">
                <Flex
                  align="center"
                  mr={4}
                  p={2.5}
                  mx={1}
                  borderRadius="md"
                  bg={isActive ? activeBg : 'transparent'} // Use predefined activeBg
                  color={isActive ? iconColorActive : textColor}
                  cursor="pointer"
                  _hover={{
                    bg: hoverBg,
                    color: iconColorActive,
                  }}
                  transition="background 0.2s ease, color 0.2s ease"
                >
                  <Icon as={item.icon} w={5} h={5} />
                  {expanded && (
                    <Text ml={4} fontSize="md">
                      {item.label}
                    </Text>
                  )}
                </Flex>
              </Tooltip>
            </ChakraLink>
          );
        })}
      </VStack>

      {/* Logout Button */}
      <Box position="absolute" bottom="4" w="full">
        <ChakraLink
          href="#"
          onClick={() => handleSelect('logout', '/auth/Login')}
          style={{ textDecoration: 'none' }}
        >
          <Tooltip label={expanded ? '' : 'Logout'} placement="right">
            <Flex
              align="center"
              mr={4}
              p={2.5}
              mx={1}
              borderRadius="md"
              bg="red.100"
              color="red.500"
              cursor="pointer"
              _hover={{
                bg: 'red.200',
              }}
              transition="background 0.2s ease"
            >
              <Icon as={FiLogOut} w={5} h={5} />
              {expanded && (
                <Text ml={4} fontSize="md">
                  Logout
                </Text>
              )}
            </Flex>
          </Tooltip>
        </ChakraLink>
      </Box>
    </Box>
  );
};

// Header Component
const Header = ({
  onOpen,
  user,
  handleToggle,
  expanded,
  isMobile,
  ...rest
}) => {
  // **Hook Calls at the Top Level**
  const { colorMode, toggleColorMode } = useColorMode();
  const router = useRouter();
  const { logout } = useAuth(); // Destructure logout from AuthContext

  // **Predefine color values**
  const bgHeader = useColorModeValue('white', 'gray.800');
  const borderBottomColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'white');

  const handleLogout = () => {
    logout();
    router.push('/auth/Login');
  };

  return (
    <Flex
      ml={{ base: 0, md: expanded ? '240px' : '60px' }}
      transition="margin-left 0.3s ease"
      px={{ base: 4, md: 6 }}
      height="20"
      alignItems="center"
      bg={bgHeader}
      borderBottomWidth="1px"
      borderBottomColor={borderBottomColor}
      justifyContent="space-between"
      position="fixed"
      top="0"
      width={{ base: '100%', md: `calc(100% - ${expanded ? '240px' : '60px'})` }}
      zIndex="1000"
      {...rest}
    >
      <Flex alignItems="center">
        {/* Hamburger Menu for Mobile */}
        {isMobile && (
          <IconButton
            onClick={onOpen}
            variant="ghost"
            aria-label="Open menu"
            icon={<FiMenu />}
            mr={2}
          />
        )}
        {/* Brand Name */}
        <Heading
          fontSize={{ base: 'lg', md: 'xl' }}
          bgGradient="linear(to-r, teal.400, green.400)"
          bgClip="text"
          fontWeight="extrabold"
        >
          CreatorsMela
        </Heading>
      </Flex>
      <HStack spacing={4}>
        {/* Color Mode Toggle Button */}
        <IconButton
          aria-label="Toggle color mode"
          icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
          onClick={toggleColorMode}
          variant="ghost"
        />
        {!isMobile && (
          <VStack
            display="flex"
            alignItems="flex-start"
            spacing="1px"
            ml="2"
          >
            <Text fontSize="sm" color={textColor}>
              {user?.name || 'User'}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {user?.role || ''}
            </Text>
          </VStack>
        )}
      </HStack>
    </Flex>
  );
};

export default SidebarWithHeader;
