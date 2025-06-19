import { useContext } from 'react';
import { AxesContext } from '../context/AxesContext';

export const useAxes = () => {
  const context = useContext(AxesContext);
  
  if (!context) {
    throw new Error('useAxes must be used within an AxisProvider');
  }

  return context;
};