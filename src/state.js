import { createContext, useState, useCallback } from 'react';

export const defaultSessionContext = {
  app_id: 'eb8e2114337f4422b490c61bdb758a98',
  channel_id: 'react-dev',
  channel_typ: 'broadcast',
  event_id: 'lr5PUQf9VbRUYXIoiZHJ',
  token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ4aXJjdXMiLCJpYXQiOjE2MDUyODI5NTQsImV4cCI6MTYwNTMwMDY5MzU0LCJ1aWQiOiIxMyIsIm5hbWUiOiJEYXZpZEtvZXJudGdlbiIsInJvbGVzIjpbImFkbWluaXN0cmF0b3IiXX0.ev5zO5hoaIYf7ptRWpPqE3bqDm3qJQ_UWOUXZZ8ieos',
};

const SESSION_CONTEXT = {};
const USER_CONTEXT = '';

export const SessionContext = createContext(SESSION_CONTEXT);
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
