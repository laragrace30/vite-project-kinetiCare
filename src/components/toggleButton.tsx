import { ChangeEvent } from 'react';

interface ToggleButtonProps {
    isActive: boolean;
    onToggle: (event: ChangeEvent<HTMLInputElement>) => void; 
    disabled?: boolean; 
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ isActive, onToggle }) => {
    return (
        <label className="toggle-switch">
            <input 
                type="checkbox" 
                checked={isActive} 
                onChange={onToggle} 
            />
            <span className="slider round"></span>
        </label>
    );
};

export default ToggleButton;
