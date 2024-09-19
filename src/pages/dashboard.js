// src/pages/dashboard.js

'use client'

import {
  Box,
  Flex,
  Heading,
  Text,
  Grid,
  Spinner,
  Center,
  useColorMode,
  useColorModeValue,
  IconButton,
  VStack,
  Avatar,
  HStack,
  Button,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Divider,
  Tooltip,
} from '@chakra-ui/react'
import {
  SunIcon,
  MoonIcon,
  InfoIcon,
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons'
import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts'
import { FiLogOut } from 'react-icons/fi'
import { FaHome, FaChartBar, FaCog } from 'react-icons/fa'
import SidebarWithHeader from '@/components/Navbar'

export default function Dashboard() {
  const { colorMode, toggleColorMode } = useColorMode()
  const bg = useColorModeValue('gray.100', 'gray.800')
  const cardBg = useColorModeValue('white', 'gray.700')
  const textColor = useColorModeValue('gray.700', 'white')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [statusData, setStatusData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Function to retrieve token (Assuming it's stored in localStorage)
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken') || null
    }
    return null
  }

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken')
    window.location.href = '/auth/Login'
  }

  useEffect(() => {
    const token = getToken()
    if (!token) {
      // Redirect to login if token is not available
      window.location.href = '/auth/Login'
    } else {
      // Fetch data from the API
      axios
        .get('https://winner51.online/api/campaigns/status', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setStatusData(response.data)
          setLoading(false)
        })
        .catch((err) => {
          console.error(err)
          setError(err.response?.data?.message || 'Error fetching data')
          setLoading(false)
          // If unauthorized, redirect to login
          if (err.response && err.response.status === 401) {
            handleLogout()
          }
        })
    }
  }, [])

  if (loading) {
    return (
      <Center h="100vh" bg={bg}>
        <Spinner size="xl" color="blue.500" />
      </Center>
    )
  }

  if (error) {
    return (
      <Center h="100vh" bg={bg}>
        <VStack>
          <Text fontSize="xl" color="red.500">
            {error}
          </Text>
          <IconButton
            aria-label="Retry"
            icon={<InfoIcon />}
            onClick={() => window.location.reload()}
          />
        </VStack>
      </Center>
    )
  }

  // Prepare data for charts
  const last30Videos = statusData?.date_wise_video_report?.slice(-30) || []

  const dateWiseData = last30Videos.map((item) => ({
    date: new Date(item.date).toLocaleDateString(),
    video_count: item.video_count,
  }))

  console.log('dateWiseData:', dateWiseData) // For debugging

  return (
    <>
    <Flex bg={bg} minH="100vh">
      {/* Sidebar for Desktop */}
      {/* <Sidebar isOpen={isOpen} onClose={onClose} /> */}

      {/* Main Content */}
      <Flex  flex="1"  transition="margin-left 0.3s ease">
        {/* Top Navigation Bar */}
        {/* <TopNav onOpen={onOpen} toggleColorMode={toggleColorMode} colorMode={colorMode} /> */}

        {/* Content Area */}
        <Box p={{ base: 4, md: 8 }} bg={bg} flex="1">
          {/* Metric Cards */}
          <Grid
            templateColumns={{ base: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }}
            gap={6}
            mb={6}
          >
            {/* <MetricCard title="Total Creators" value={statusData.total_creators} icon={FaHome} color="blue.500" /> */}
            {/* <MetricCard title="Total Campaigns" value={statusData.total_campaigns} icon={FaChartBar} color="green.500" /> */}
            <MetricCard
              title="Active Campaigns"
              value={statusData.total_active_campaigns}
              icon={FaCog}
              color="yellow.500"
            />
            <MetricCard title="Total Videos" value={statusData.total_videos} icon={FaHome} color="purple.500" />
            <MetricCard
              title="In-Progress Videos"
              value={statusData.total_in_progress_videos}
              icon={FaChartBar}
              color="orange.500"
            />
            <MetricCard
              title="Top Contributor"
              value={statusData.best_user.name}
              subtitle={`Videos: ${statusData.best_user.total_videos}`}
              icon={FaHome}
              color="teal.500"
            />
            {/* <MetricCard
              title="Your Contribution"
              value={statusData.user_contribution.video_count}
              subtitle={`Remaining: ${statusData.total_videos - statusData.user_contribution.video_count}`}
              icon={FaChartBar}
              color="red.500"
            /> */}
          </Grid>

          {/* Line Chart for Date-wise Video Report */}
          <Box
            bg={cardBg}
            boxShadow="lg"
            borderRadius="xl"
            p={6}
            border="1px solid"
            borderColor={borderColor}
            height="400px"
            w="full"
            maxW="7xl"
          >
            <Heading size="md" mb={4} color={textColor}>
              Last 30 Days Video Report
            </Heading>
            {dateWiseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={dateWiseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={useColorModeValue('#e2e8f0', '#4a5568')} />
                  <XAxis dataKey="date" tick={{ fill: textColor }} />
                  <YAxis tick={{ fill: textColor }} />
                  <RechartsTooltip />
                  <Line
                    type="monotone"
                    dataKey="video_count"
                    stroke="#3182CE"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Center h="100%">
                <Text color={textColor}>No data available</Text>
              </Center>
            )}
          </Box>
        </Box>
      </Flex>
    </Flex>
   </>
  )
}

// Sidebar Component
// const Sidebar = ({ isOpen, onClose }) => {
//   const bg = useColorModeValue('white', 'gray.700')
//   const borderColor = useColorModeValue('gray.200', 'gray.600')

//   return (
//     <>
     
//       <Box
//         pos="fixed"
//         left="0"
//         top="0"
//         w="60"
//         h="full"
//         bg={bg}
//         boxShadow="lg"
//         borderRight="1px solid"
//         borderColor={borderColor}
//         display={{ base: 'none', md: 'block' }}
//       >
//         <Flex direction="column" p={5} h="full" justifyContent="space-between">
//           <VStack align="start" spacing={6}>
//             <Heading size="md">Dashboard</Heading>
//             <NavItem icon={FaHome} label="Home" />
//             <NavItem icon={FaChartBar} label="Analytics" />
//             <NavItem icon={FaCog} label="Settings" />
//           </VStack>
//           <NavItem icon={FiLogOut} label="Logout" onClick={() => window.location.href = '/auth/Login'} />
//         </Flex>
//       </Box>
//     </>
//   )
// }

// Top Navigation Component for Mobile
// const TopNav = ({ onOpen, toggleColorMode, colorMode }) => {
//   const bg = useColorModeValue('white', 'gray.700')
//   const borderColor = useColorModeValue('gray.200', 'gray.600')

//   return (
//     <Flex
//       as="header"
//       w="full"
//       px={4}
//       py={2}
//       bg={bg}
//       borderBottom="1px solid"
//       borderColor={borderColor}
//       align="center"
//       justify="space-between"
//       display={{ base: 'flex', md: 'none' }}
//     >
//       <IconButton
//         aria-label="Open menu"
//         icon={<HamburgerIcon />}
//         onClick={onOpen}
//       />
//       <Heading size="md">Dashboard</Heading>
//       <IconButton
//         aria-label="Toggle color mode"
//         icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
//         onClick={toggleColorMode}
//       />
//     </Flex>
//   )
// }

// Navigation Item Component
// const NavItem = ({ icon, label, onClick }) => {
//   const hoverBg = useColorModeValue('gray.200', 'gray.600')
//   const color = useColorModeValue('gray.700', 'white')

//   return (
//     <Flex
//       align="center"
//       p={3}
//       borderRadius="md"
//       cursor="pointer"
//       _hover={{ bg: hoverBg }}
//       onClick={onClick}
//     >
//       <Box as={icon} mr={3} color={color} />
//       <Text fontSize="md" color={color}>
//         {label}
//       </Text>
//     </Flex>
//   )
// }

// Metric Card Component
const MetricCard = ({ title, value, subtitle, icon, color }) => {
  const cardBg = useColorModeValue('white', 'gray.700')
  const textColor = useColorModeValue('gray.700', 'white')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  return (
    <Box
      bg={cardBg}
      boxShadow="md"
      borderRadius="lg"
      p={6}
      border="1px solid"
      borderColor={borderColor}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      _hover={{ transform: 'scale(1.02)', boxShadow: 'lg' }}
      transition="all 0.2s ease"
    >
      <VStack align="start" spacing={1}>
        <HStack>
          <Box as={icon} color={color} boxSize={6} />
          <Text fontSize="sm" color="gray.500">
            {title}
          </Text>
        </HStack>
        <Text fontSize="2xl" fontWeight="bold" color={textColor}>
          {value}
        </Text>
        {subtitle && (
          <Text fontSize="sm" color="gray.400">
            {subtitle}
          </Text>
        )}
      </VStack>
    </Box>
  )
}
