import { createContext, useState, useCallback } from 'react';

const USER_CONTEXT = '00000';

export const UserContext = createContext(USER_CONTEXT);

export const useUser = () => {
  const [userId, setId] = useState();

  const setUid = useCallback((currentId) => {
    setId(currentId);
  }, []);

  return {
    userId,
    setUid,
  };
};
