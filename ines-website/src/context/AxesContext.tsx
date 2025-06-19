import { createContext, useState, ReactNode } from 'react';

interface AxesContextType {
  x: string;
  setX: (x: string) => void;
  y: string;
  setY: (y: string) => void;
  swapXY: () => void;
  selectX: (x: string) => void;
}

export const AxesContext = createContext<AxesContextType | undefined>(undefined);

export default function AxesProvider ({ children }: { children: ReactNode }) {
  const [x, setX] = useState('');
  const [y, setY] = useState('');
  const swapXY = () => {
    setX(y);
    setY(x);
  };
  const selectX = (newX: string) => {
    setX(newX);
    if (newX === '') setY('');
  };

  return (
    <AxesContext.Provider value={{ x, setX, y, setY, swapXY, selectX }}>
      {children}
    </AxesContext.Provider>
  );
};
