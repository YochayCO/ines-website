import IconButton from '@mui/material/IconButton';
import SwipeVerticalIcon from '@mui/icons-material/SwipeVertical'
import { useAxes } from '../../hooks/useAxes';

import './SwapAxesButton.css';

export default function SwapAxesButton() {
  const { swapXY } = useAxes();
  
  return (
    <IconButton
      className='swap-axes-button'
      size='small'
      onClick={swapXY}
      title='Swap X and Y axes'
    >
      <SwipeVerticalIcon onClick={swapXY} />
    </IconButton>
  );
}
