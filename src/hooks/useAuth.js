// src/hooks/useAuth.js
'use client'

import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

// Custom hook to use authentication context
export const useAuth = () => {
  return useContext(AuthContext)
}
