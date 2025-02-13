import { WeightName } from '../types/survey';

export interface GraphHeaderProps { 
    setSpecialVisible: React.Dispatch<React.SetStateAction<boolean>>
    setWeightName: React.Dispatch<React.SetStateAction<WeightName>>
}

export interface GraphHeaderHook {
    handleSpecialToggle: () => void;
    handleWeightNameChange: (_event: React.MouseEvent<HTMLElement>, wName: WeightName) => void;
}

function useGraphHeader({ setSpecialVisible, setWeightName }: GraphHeaderProps): GraphHeaderHook {
    const handleSpecialToggle = () => setSpecialVisible((currVisibility) => !currVisibility)
    const handleWeightNameChange = (_event: React.MouseEvent<HTMLElement>, wName: WeightName | null) => {
        if (wName) setWeightName(wName) // Avoid toggling off the sector
    }

    return { handleSpecialToggle, handleWeightNameChange }
}

export default useGraphHeader
