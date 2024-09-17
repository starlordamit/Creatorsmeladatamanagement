// src/pages/dashboard.js
'use client'

import { Box, Flex, Heading, Text, Stack } from '@chakra-ui/react'
import SidebarWithHeader from '../components/Navbar'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const { authToken } = useAuth()
  const [userData, setUserData] = useState(null)
  const router = useRouter()

  useEffect(() => {
    if (!authToken) {
      router.push('/auth/Login')
    } 
  }, [authToken, router])

  return (
    <>
       {/* Include the responsive navbar */}
<SidebarWithHeader>
       
          <Heading fontSize="2xl">Welcome to the Dashboard</Heading>
          
           
       </SidebarWithHeader>

    </>
  )
}
