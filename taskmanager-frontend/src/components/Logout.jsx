import React from 'react';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../authSlice';

const Logout = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return <button
  onClick={handleLogout}
  className="mt-4 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
>
  Logout
</button>
;
};

export default Logout;
