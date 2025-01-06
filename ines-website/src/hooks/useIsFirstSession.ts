import { useState, useEffect } from 'react';

function useIsFirstSession() {
  const [isFirstSession, setIsFirstSession] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');

    if (!hasVisited) {
      setIsFirstSession(true);
      localStorage.setItem('hasVisited', 'true');
    }
  }, []);

  return isFirstSession;
}

export default useIsFirstSession;