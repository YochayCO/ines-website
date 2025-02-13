import { useState } from 'react';
import { WeightName } from '../types/survey';

export interface GraphCommons {
    isSpecialDisplayed: boolean;
    setSpecialVisible: React.Dispatch<React.SetStateAction<boolean>>;
    weightName: WeightName;
    setWeightName: React.Dispatch<React.SetStateAction<WeightName>>;
}

function useGraphCommons(): GraphCommons {
    const [isSpecialDisplayed, setSpecialVisible] = useState(true)
    const [weightName, setWeightName] = useState<WeightName>('all')

    return { 
        isSpecialDisplayed, 
        setSpecialVisible, 
        weightName, 
        setWeightName, 
     }
}

export default useGraphCommons;
