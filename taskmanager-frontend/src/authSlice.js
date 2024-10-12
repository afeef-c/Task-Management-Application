import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants';
import { decodeToken } from './utils/decodeToken';
import { isTokenExpired } from './utils/isTokenExpired';
import api from './api';
import jwt_decode from 'jwt-decode';

export const loginUser = createAsyncThunk('auth/loginUser', async ({ username, password }, thunkAPI) => {
  try {
    const response = await api.post('/login/', { username, password });
    const { access, refresh } = response.data;

    localStorage.setItem(ACCESS_TOKEN, access);
    localStorage.setItem(REFRESH_TOKEN, refresh);

    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || 'Login failed');
  }
});

export const fetchUserDetails = createAsyncThunk('auth/fetchUserDetails', async (_, thunkAPI) => {
  const state = thunkAPI.getState();
  let authTokens = state.auth.authTokens;

  if (authTokens && !isTokenExpired(authTokens.access)) {
    try {
      const response = await api.get('/profile/', {
        headers: {
          Authorization: `Bearer ${authTokens.access}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.response.status === 401) {
        // Token might be expired, try to refresh it
        try {
          const refreshResponse = await api.post('/api/users/token/refresh/', {
            refresh: authTokens.refresh
          });

          authTokens = {
            ...authTokens,
            access: refreshResponse.data.access
          };

          // Store new tokens in state and local storage
          thunkAPI.dispatch(setAuthTokens(authTokens));
          localStorage.setItem(ACCESS_TOKEN, authTokens.access);

          // Retry the original request with the new token
          const retryResponse = await api.get('/profile/', {
            headers: {
              Authorization: `Bearer ${authTokens.access}`
            }
          });
          return retryResponse.data;
        } catch (refreshError) {
          // If refresh fails, log out the user
          thunkAPI.dispatch(logoutUser());
          return thunkAPI.rejectWithValue(refreshError.response.data);
        }
      } else {
        return thunkAPI.rejectWithValue(error.response.data);
      }
    }
  } else {
    thunkAPI.dispatch(logoutUser());
    return thunkAPI.rejectWithValue('Token expired or invalid');
  }
});

export const fetchUsers = createAsyncThunk('auth/fetchUsers', async () => {
  const response = await api.get('/users_list/');
  const usersData = response.data;
  return usersData;
});

// Utility function to get the user ID from the access token
export const getUserId = (state) => {
  const authTokens = state.auth.authTokens; // Access the authTokens from the Redux state

  if (authTokens && authTokens.access) {
    try {
      const decodedToken = jwt_decode(authTokens.access); // Decode the JWT token
      return decodedToken.user_id; // Extract the user ID from the decoded token (ensure your token contains 'user_id')
    } catch (error) {
      console.error('Error decoding token:', error);
      return null; // Handle cases where decoding fails
    }
  }

  return null; // Return null if there are no tokens or the token doesn't have user info
};


const authSlice = createSlice({
  name: 'auth',
  initialState: {
    authTokens: localStorage.getItem(ACCESS_TOKEN) ? {
      access: localStorage.getItem(ACCESS_TOKEN),
      refresh: localStorage.getItem(REFRESH_TOKEN)
    } : null,
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
    users: {},
    loading: false,
    error: null
  },
  reducers: {
    setAuthTokens: (state, action) => {
      state.authTokens = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    logoutUser: (state) => {
      state.authTokens = null;
      state.user = null;
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);
      localStorage.removeItem('user');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.authTokens = action.payload;
        state.user = decodeToken(action.payload.access);
        state.loading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
        state.loading = false;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchUsers.pending, (state) => {
        state.error = null;
        state.loading = true
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.users = action.payload.reduce((acc, user) => {
              acc[user.id] = user;
              return acc;
          }, {});
          state.loading = false
      })
      .addCase(fetchUsers.rejected, (state, action) => {
          state.loading = false;
          state.error = action.error.message;
      });
  }
});

export const { logoutUser, setAuthTokens, setUser } = authSlice.actions;

export default authSlice.reducer;
