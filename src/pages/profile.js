'use client'

import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import {
  Avatar,
  Box,
  Button,
  Center,
  Heading,
  Stack,
  Text,
  Badge,
  useColorModeValue,
  FormControl,
  FormLabel,
  Input,
  useToast,
} from '@chakra-ui/react'
import SidebarWithHeader from '../components/Navbar'
import { useEffect, useState } from 'react'
import { fetchUserProfile, updateUserProfile } from '../services/api' 

const ProfilePage = () => {
  const router = useRouter()
  const { logout, authToken, loading } = useAuth()
  const [profileData, setProfileData] = useState(null)
  const [error, setError] = useState('')
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const toast = useToast();

  useEffect(() => {
    if (!loading) {
      if (!authToken) {
        router.push('/auth/Login')
      } else {
        loadProfileData()
      }
    }
  }, [authToken, loading, router])

  const loadProfileData = async () => {
    try {
      const data = await fetchUserProfile(authToken)
      setProfileData(data)
      setFormData({
        name: data.name,
        phone: data.phone,
      });
    } catch (err) {
      setError('Failed to load profile data.')
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/auth/Login')
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleSaveChanges = async () => {
    try {
      await updateUserProfile(authToken, formData);
      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setEditMode(false);
      loadProfileData();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }

  if (!profileData) {
    return <div>{error || 'Loading profile data...'}</div>
  }

  return (
    <SidebarWithHeader>
      <Center py={6}>
        <Box
          maxW={'320px'}
          w={'full'}
          bg={useColorModeValue('white', 'gray.900')}
          boxShadow={'2xl'}
          rounded={'lg'}
          p={6}
          textAlign={'center'}>
          <Avatar
            size={'xl'}
            src={
              'https://bit.ly/dan-abramov' 
            }
            mb={4}
          />
          <Heading fontSize={'2xl'} fontFamily={'body'}>
            {profileData.name}
          </Heading>
          <Text fontWeight={600} color={'gray.500'} mb={4}>
            {profileData.email}
          </Text>

          <Stack align={'center'} justify={'center'} direction={'row'} mt={6}>
            <Badge
              px={2}
              py={1}
              bg={useColorModeValue('gray.50', 'gray.800')}
              fontWeight={'400'}>
              {profileData.phone}
            </Badge>
            <Badge
              px={2}
              py={1}
              bg={useColorModeValue('gray.50', 'gray.800')}
              fontWeight={'400'}>
              {profileData.role}
            </Badge>
            <Badge
              px={2}
              py={1}
              bg={useColorModeValue('gray.50', 'gray.800')}
              fontWeight={'400'}>
              {profileData.is_suspended ? 'Suspended' : 'Active'} 
            </Badge>
          </Stack>

          {editMode ? (
            <Stack spacing={4} mt={8}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                />
              </FormControl>
              <FormControl>
                <FormLabel>Phone</FormLabel>
                <Input 
                  type="text" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                />
              </FormControl>
              <Button colorScheme="teal" onClick={handleSaveChanges}>
                Save Changes
              </Button>
              <Button colorScheme="gray" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
            </Stack>
          ) : (
            <Stack mt={8} direction={'row'} spacing={4}>
              <Button
                flex={1}
                fontSize={'sm'}
                rounded={'full'}
                bg={'teal.400'}
                color={'white'}
                _hover={{
                  bg: 'teal.500',
                }}
                _focus={{
                  bg: 'teal.500',
                }}
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </Button>

              <Button
                flex={1}
                fontSize={'sm'}
                rounded={'full'}
                bg={'blue.400'}
                color={'white'}
                _hover={{
                  bg: 'blue.500',
                }}
                _focus={{
                  bg: 'blue.500',
                }}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Stack>
          )}
        </Box>
      </Center>
    </SidebarWithHeader>
  )
}

export default ProfilePage
