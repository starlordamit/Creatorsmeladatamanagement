import { useState, useEffect } from 'react';
import {
  IconButton,
  Avatar,
  Box,
  CloseButton,
  Flex,
  HStack,
  VStack,
  Icon,
  useColorModeValue,
  Text,
  Drawer,
  Image,
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
} from '@chakra-ui/react';
import {
  FiHome,
  FiSettings,
  FiMenu,
  FiBell,
  FiChevronDown,
  FiStar,
  FiUser,
  FiVideo,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { fetchUserProfile } from '../services/api';

// Define links with conditional rendering for the admin role
const LinkItems = [
  { name: 'Home', icon: FiHome, route: '/dashboard' },
  { name: 'Profile', icon: FiSettings, route: '/profile' },
];

const SidebarWithHeader = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [isMobile] = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchUserProfile(token)
        .then((data) => setUser(data))
        .catch(() => {
          setUser(null);
          router.push('/auth/Login');
        });
    } else {
      router.push('/auth/Login');
    }
  }, [router, setUser]);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  function capitalizeFirstLetter(string) {
    if (string.length === 0) {
      return string; // Return the empty string if it's empty
    }
    return string[0].toUpperCase() + string.slice(1);
  }

  const pagePath = capitalizeFirstLetter(router.pathname.split('/')[1]);

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
      {/* Sidebar */}
      <SidebarContent
        onClose={onClose}
        user={user}
        isCollapsed={sidebarCollapsed}
        isMobile={isMobile}
        handleSidebarToggle={handleSidebarToggle}
        display={{ base: 'none', md: 'block' }}
      />
      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="full">
        <DrawerContent>
          <SidebarContent
            onClose={onClose}
            user={user}
            isMobile={isMobile}
            handleSidebarToggle={handleSidebarToggle}
          />
        </DrawerContent>
      </Drawer>
      {/* Mobile Nav */}
      <MobileNav
        onOpen={onOpen}
        user={user}
        onSidebarToggle={handleSidebarToggle}
        isCollapsed={sidebarCollapsed}
        isMobile={isMobile}
      />
      {/* Main Content */}
      <Box
        ml={{ base: 0, md: sidebarCollapsed ? '60px' : '200px' }}
        transition="margin-left 0.2s"
        p="4"
      >
        {/* Breadcrumb */}
        <Box bg="white" px={4} py={2} mb={4} borderRadius="md" boxShadow="md">
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink>Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>{pagePath}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </Box>
        {children}
      </Box>
    </Box>
  );
};

const SidebarContent = ({
  onClose,
  user,
  isCollapsed,
  isMobile,
  handleSidebarToggle,
  ...rest
}) => {
  const router = useRouter();

  const handleNavigation = (route) => {
    router.push(route);
  };

  return (
    <Box
      transition="width 0.2s"
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: isCollapsed ? '60px' : '200px' }}
      pos="fixed"
      h="full"
      display="flex"
      flexDirection="column"
      {...rest}
    >
      <Flex
        h="20"
        alignItems="center"
        mx="8"
        justifyContent={isCollapsed ? 'center' : 'space-between'}
      >
        {!isCollapsed && (
          <Image
            src="https://www.creatorsmela.com/images/logo-3.png"
            alt="Logo"
            h="30px"
          />
        )}
      </Flex>
      <Box flex="1" overflowY="auto">
        {LinkItems.map((link) => (
          <NavItem
            key={link.name}
            icon={link.icon}
            isCollapsed={isCollapsed}
            onClick={() => handleNavigation(link.route)}
          >
            {link.name}
          </NavItem>
        ))}

        {user?.role === 'admin' && (
          <NavItem
            icon={FiStar}
            isCollapsed={isCollapsed}
            onClick={() => handleNavigation('/campaign')}
          >
            Campaigns
          </NavItem>
        )}
        {user?.role === 'admin' && (
          <NavItem
            icon={FiUser}
            isCollapsed={isCollapsed}
            onClick={() => handleNavigation('/users')}
          >
            Users
          </NavItem>
        )}
        {(user?.role === 'admin' ||
          user?.role === 'finance_manager' ||
          user?.role === 'operation_manager') && (
          <NavItem
            icon={FiVideo}
            isCollapsed={isCollapsed}
            onClick={() => handleNavigation('/video')}
          >
            Videos
          </NavItem>
        )}
      </Box>
      <Flex align="center" justifyContent="center" p="2">
        <IconButton
          onClick={handleSidebarToggle}
          variant="ghost"
          aria-label="Toggle sidebar"
          icon={isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        />
      </Flex>
    </Box>
  );
};

const NavItem = ({ icon, children, isCollapsed, ...rest }) => (
  <Flex
    align="center"
    p="4"
    mx="4"
    my="2"
    borderRadius="lg"
    role="group"
    cursor="pointer"
    _hover={{
      bg: 'cyan.400',
      color: 'white',
    }}
    {...rest}
  >
    {icon && (
      <Icon
        mr={isCollapsed ? '0' : '4'}
        fontSize="20"
        _groupHover={{
          color: 'white',
        }}
        as={icon}
      />
    )}
    {!isCollapsed && (
      <Text
        fontSize="16"
        _groupHover={{
          color: 'white',
        }}
      >
        {children}
      </Text>
    )}
  </Flex>
);

const MobileNav = ({
  onOpen,
  user,
  onSidebarToggle,
  isCollapsed,
  isMobile,
  ...rest
}) => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth/Login');
  };

  return (
    <Flex
      ml={{ base: 0, md: isCollapsed ? '60px' : '200px' }}
      transition="margin-left 0.2s"
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue('white', 'gray.900')}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      justifyContent={{ base: 'space-between', md: 'space-between' }}
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
        ) : isCollapsed ? (
          <Image
            src="https://www.creatorsmela.com/images/logo-3.png"
            alt="Logo"
            h="30px"
            ml="2"
          />
        ) : (
          <Box w="40px" />
        )}
      </Flex>
      <HStack spacing={{ base: '0', md: '6' }}>
        <IconButton
          size="lg"
          variant="ghost"
          aria-label="Notifications"
          icon={<FiBell />}
        />
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
              bg={useColorModeValue('white', 'gray.900')}
              borderColor={useColorModeValue('gray.200', 'gray.700')}
            >
              <MenuItem onClick={handleLogout}>Sign out</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
    </Flex>
  );
};

export default SidebarWithHeader;
