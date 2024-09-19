// src/services/api.js
import axios from 'axios'

const API_URL = 'https://winner51.online/api' // Change this to your backend URL
// const API_URL = "localhost:3006/api"
// Login API call
// export const login = async (email, password) => {
//   const response = await axios.post(`${API_URL}/auth/login`, { email, password })
//   return response.data // The token and user data
// }

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    console.log('api')
    return response.data;
  } catch (error) {
    console.error("API call failed", error);
    throw error;
  }
};


// Signup API call
export const signup = async (name, email, password) => {
  const response = await axios.post(`${API_URL}/auth/signup`, { name, email, password })
  return response.data
}


export const resetPassword = async (token, password) => {
  const response = await axios.post(`${API_URL}/auth/reset-password`, { token, password })
  return response.data
}

export const changePassword = async (token,currentPassword, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/auth/change-password`, {
      currentPassword,
      newPassword,
    }, {
      headers: {
        Authorization: `Bearer ${token}`, // Assuming you're using Bearer token authentication
      },
    });

    return response.data;
  } catch (error) {
    // Handle errors appropriately, maybe re-throw or return a specific error message
    throw error; 
  }
};


// Fetch user data by ID


export const fetchUserData = async (userId, token) => {
  const response = await axios.get(`${API_URL}/users/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}
export const fetchUserProfile = async (token) => {
  const response = await axios.get(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

// Create a new campaign
export const createCampaign = async (campaignData, token) => {
    const response = await axios.post(`${API_URL}/campaigns/add`, campaignData, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  }
  
  // Update an existing campaign
  export const updateCampaign = async (campaignId, campaignData, token) => {
    const response = await axios.put(`${API_URL}/campaigns/update`, campaignData, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  }
  
  // Fetch all campaigns
  export const fetchCampaigns = async (token) => {
    const response = await axios.get(`${API_URL}/campaigns`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  }




// Delete Campaign API call (body-based)
export const deleteCampaign = async (campaignId, token) => {
  const response = await axios.post(`${API_URL}/campaigns/del`, { campaign_id: campaignId }, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}



export const fetchAllUsers = async (token) => {
    const response = await axios.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // Return the data from the response
  };
  // Fetch a single user by ID
  export const fetchUserById = async (id, token) => {
    const response = await axios.get(`${API_URL}/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  };
  
  // Update user
  export const updateUser = async (id, userData, token) => {
    const response = await axios.put(`${API_URL}/users/${id}`, userData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  };
  
  // Terminate or activate user
  export const terminateUser = async (id, isSuspended, token) => {
    const response = await axios.put(
      `${API_URL}/users/${id}/terminate`,
      { isSuspended },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  };
  
  // Assign a role to a user
  export const assignRole = async (id, newRole, token) => {
    const response = await axios.put(
      `${API_URL}/users/${id}/role`,
      { newRole },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  };



// Fetch all videos (for admin and higher roles)
export const fetchAllVideos = async (token) => {
  const response = await axios.get(`${API_URL}/videos`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Create a new video
export const createVideo = async (videoData, token) => {
  const response = await axios.post(`${API_URL}/videos`, videoData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Update video details
export const updateVideo = async (id, videoData, token) => {
  const response = await axios.put(`${API_URL}/videos/${id}`, videoData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Delete a video
export const deleteVideo = async (id, token) => {
  const response = await axios.delete(`${API_URL}/videos/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

//update payment status
export const updatePaymentStatus = async (videoId, paymentStatus,token) => {
  const response = await fetch(`${API_URL}/videos/payment/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // assuming token is stored in local storage
    },
    body: JSON.stringify({
      id: videoId,
      payment_status: paymentStatus,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update payment status');
  }

  return response.json();
};




// Add a new creator (Any authenticated user can add)
export const addCreator = async (creatorData,token) => {
  try {
    // const token = getAuthToken();
    const response = await axios.post(`${API_URL}/creators/add`, creatorData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response ? err.response.data.message : 'Failed to add creator.');
  }
};

// Get all creators (admin, finance_manager, campaign_manager see full details; others see limited)
export const getAllCreators = async (token) => {
  try {
    // const token = getAuthToken(token1);
    const response = await axios.get(`${API_URL}/creators/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response ? err.response.data.message : 'Failed to fetch creators.');
  }
};

// Get creator names and URLs (open to all authenticated users)
export const getCreatorsNameAndUrl = async (token) => {
  try {

    const response = await axios.get(`${API_URL}/creators/names-urls`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response ? err.response.data.message : 'Failed to fetch creator names and URLs.');
  }
};

// Update a creator (only accessible by admin, finance_manager, campaign_manager)
export const updateCreator = async (creatorId, updatedData,token) => {
  try {

    const response = await axios.put(`${API_URL}/creators/update/${creatorId}`,updatedData,  {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response ? err.response.data.message : 'Failed to update creator.');
  }
};


export const updateUserProfile = async (token,formdata) => {
  try {
    const response = await axios.post(
      `${API_URL}/users/update`, // The URL for your API endpoint
       formdata , // The data to send
       {
        headers: { Authorization: `Bearer ${token}` }}
    );

    return response.data; // Return the data from the response
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};
