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
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useColorMode,
  Link,
  Icon,
  Spacer,
  Heading
} from '@chakra-ui/react';
import {
  FiMenu,
  FiBell,
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
} from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { fetchUserProfile } from '../services/api';

const SidebarWithHeader = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [isMobile] = useMediaQuery('(max-width: 768px)');

  // Initialize states
  const [expanded, setExpanded] = useState(true); // Default to true
  const [mounted, setMounted] = useState(false);  // To track if component is mounted

  // Set expanded from localStorage after mount
  useEffect(() => {
    const savedExpanded = localStorage.getItem('sidebarExpanded');
    if (savedExpanded !== null) {
      const parsed = JSON.parse(savedExpanded);
      console.log('Loaded sidebarExpanded from localStorage:', parsed);
      setExpanded(parsed);
    }
    setMounted(true); // Mark as mounted
  }, []);

  // Persist expand/collapse state in localStorage
  useEffect(() => {
    if (mounted) { // Only update after mount to avoid SSR issues
      localStorage.setItem('sidebarExpanded', JSON.stringify(expanded));
      console.log('Saved sidebarExpanded to localStorage:', expanded);
    }
  }, [expanded, mounted]);

  const [activeKey, setActiveKey] = useState('dashboard');

  // Fetch user profile
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
            router.push('/auth/Login');
          }
        } else {
          router.push('/auth/Login');
        }
      }
    };
    fetchProfile();
  }, [router, setUser]);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  function capitalizeFirstLetter(string) {
    if (string.length === 0) {
      return string; // Return the empty string if it's empty
    }
    return string[0].toUpperCase() + string.slice(1);
  }

  const pagePath = capitalizeFirstLetter(router.pathname.split('/')[1]);

  // Prevent rendering until mounted to avoid hydration mismatch
  if (!mounted) {
    return null; // Or a loading spinner if preferred
  }

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
      {/* Sidebar */}
      <SidebarContent
        onClose={onClose}
        user={user}
        expanded={expanded}
        activeKey={activeKey}
        setActiveKey={setActiveKey}
        handleToggle={handleToggle}
        display={{ base: 'none', md: 'block' }}
      />
      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerContent maxW="60vw" w="60vw" overflow="hidden">
          <SidebarContent
            onClose={onClose}
            user={user}
            expanded={true} // Always expanded in mobile view
            activeKey={activeKey}
            setActiveKey={setActiveKey}
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
        ml={{ base: 0, md: expanded ? '240px' : '56px' }}
        transition="margin-left 0.2s"
        p="4"
      >
        {/* Breadcrumb */}
        <Box
          bg={useColorModeValue('white', 'gray.800')}
          px={4}
          py={2}
          mb={4}
          borderRadius="md"
          boxShadow="md"
        >
          <Breadcrumb>
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
    roles: ['admin', 'operation_manager', 'finance_manager','user'],
  },
  {
    label: 'Profile',
    eventKey: 'profile',
    icon: FiUser,
    roles: ['admin', 'operation_manager', 'finance_manager','user'],
  },
  {
    label: 'Campaigns',
    eventKey: 'campaign',
    icon: FiSpeaker,
    roles: ['admin'],
  },
  {
    label: 'Users',
    eventKey: 'users',
    icon: FiUsers,
    roles: ['admin'],
  },
  {
    label: 'Videos',
    eventKey: 'video',
    icon: FiVideo,
    roles: ['admin', 'finance_manager', 'operation_manager'],
  },
  {
    label: 'Payments',
    eventKey: 'payment',
    icon: FiDollarSign,
    roles: ['admin', 'finance_manager'],
  },
  {
    label: 'Creators',
    eventKey: 'creators',
    icon: FiTrendingUp,
    roles: ['admin', 'finance_manager', 'operation_manager','user'],
  },
];

const SidebarContent = ({
  onClose,
  user,
  expanded,
  activeKey,
  setActiveKey,
  handleToggle,
  isMobile,
  ...rest
}) => {
  const router = useRouter();
  const { colorMode } = useColorMode();

  // Set activeKey based on current path
  useEffect(() => {
    const path = router.pathname.split('/')[1] || 'dashboard';
    setActiveKey(path);
  }, [router.pathname, setActiveKey]);

  const handleSelect = (eventKey) => {
    setActiveKey(eventKey);
    router.push(`/${eventKey}`);
    if (isMobile) {
      onClose(); // Close the drawer on mobile after navigation
    }
  };

  // Determine colors based on theme
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconColorActive = useColorModeValue('teal.600', 'teal.200');
  const textColor = useColorModeValue('black', 'white');

  return (
    <Box
      transition="width 0.2s"
      bg={bg}
      borderRight="1px"
      borderRightColor={borderColor}
      w={{ base: isMobile ? 'full' : expanded ? '240px' : '56px' }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex
        h="20"
        alignItems="center"
        mx="4"
        justifyContent="space-between"
      >
        {!isMobile && (
          <IconButton
            onClick={handleToggle}
            variant="ghost"
            aria-label="Toggle sidebar"
            icon={expanded ? <FiChevronLeft /> : <FiChevronRight />}
            size="md"
            borderRadius="md"
            _hover={{ bg: useColorModeValue('gray.200', 'gray.700') }}
            color={textColor}
          />
        )}
        {isMobile && (
          <IconButton
            onClick={onClose}
            variant="ghost"
            aria-label="Close sidebar"
            icon={expanded ? <FiChevronRight /> : <FiChevronLeft />}
            color={textColor}
          />
        )}
      </Flex>
      <VStack align="stretch" mt={4} spacing={1}>
        {navigationItems.map((item) => {
          // Check if user has access based on role
          if (!item.roles.includes(user?.role)) {
            return null;
          }
          const isActive = activeKey === item.eventKey;
          return (
            <Link
              key={item.eventKey}
              px={4}
              py={2}
              display="flex"
              alignItems="center"
              onClick={() => handleSelect(item.eventKey)}
              bg={
                isActive
                  ? useColorModeValue('teal.100', 'teal.700')
                  : 'transparent'
              }
              color={isActive ? iconColorActive : textColor}
              _hover={{
                textDecor: 'none',
                bg: useColorModeValue('gray.100', 'gray.700'),
              }}
              borderRadius="md"
              cursor="pointer"
            >
              <Icon as={item.icon} mr={expanded ? 3 : 0} />
              {expanded && item.label}
            </Link>
          );
        })}
      </VStack>
    </Box>
  );
};

const Header = ({
  onOpen,
  user,
  handleToggle,
  expanded,
  isMobile,
  ...rest
}) => {
  const { logout } = useAuth();
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();

  const handleLogout = () => {
    logout();
    router.push('/auth/Login');
  };

  return (
    <>
   
    <Flex
      ml={{ base: 0, md: expanded ? '240px' : '56px' }}
      transition="margin-left 0.2s"
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue('white', 'gray.800')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent="space-between"
      {...rest}
    >
      <Flex alignItems="center">
        {isMobile ? (
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onOpen}
            variant="ghost"
            aria-label="Open menu"
            icon={<FiMenu />}
          />
        ) : null}
        <Heading
              fontSize={{ base: '1xl', sm: '2xl', md: '2xl' }}
              bgGradient='linear(to-r, blue.400, purple.400)'
              bgClip='text'
              fontWeight='extrabold'
            >
              CreatorsMela
            </Heading>
      </Flex>
      <HStack spacing={{ base: '0', md: '6' }}>
        {/* Color Mode Toggle Button */}
        <IconButton
          size="lg"
          variant="ghost"
          aria-label="Toggle Color Mode"
          onClick={toggleColorMode}
          icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
        />
        {/* <IconButton
          size="lg"
          variant="ghost"
          aria-label="Notifications"
          icon={<FiBell />}
        /> */}
        <Flex alignItems="center">
          <Menu>
            <MenuButton
              py={2}
              transition="all 0.3s"
              _focus={{ boxShadow: 'none' }}
            >
              <HStack>
                <Avatar
                  size="sm"
                  src={user?.profilePic || 'https://bit.ly/dan-abramov'}
                />
                <VStack
                  display={{ base: 'none', md: 'flex' }}
                  alignItems="flex-start"
                  spacing="1px"
                  ml="2"
                >
                  <Text fontSize="sm">{user?.name || 'Loading...'}</Text>
                  <Text fontSize="xs" color="gray.600">
                    {user?.role || ''}
                  </Text>
                </VStack>
                <Box display={{ base: 'none', md: 'flex' }}>
                  <FiChevronDown />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList
              bg={useColorModeValue('white', 'gray.800')}
              borderColor={useColorModeValue('gray.200', 'gray.700')}
            >
              <MenuItem onClick={handleLogout}>Sign out</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
     
    </Flex>
   
 </>
    
  );
};

export default SidebarWithHeader;
