import React, { useRef, useEffect, useState } from "react";
import Picker from "pickerjs";
import "pickerjs/dist/picker.css";

interface PickerComponentProps {
    value: string; // Assuming the value is a string (formatted time)
    onChange: (value: string) => void; // onChange function that receives a string
    mode: string
}

const TimePicker: React.FC<PickerComponentProps> = ({ value, onChange, mode }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [borderColor, setBorderColor] = useState('grey');
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        const picker =      new Picker(inputRef.current!, {
            format: 'HH:00', // Time format
            headers: true,   // Show headers for hour and minute
            increment: {
                hour: 2,
                minute: 0, // Increment minutes by 0 to keep it fixed
            },
            text: {
                title: 'Pilih Waktu',
                hour: 'Jam',
                minute: 'Menit',
            },
            controls: true,
        });

        // Update the event handler to set minutes to '00'
        inputRef.current?.addEventListener('change', (event) => {
            const selectedTime = (event.target as HTMLInputElement).value;
            onChange(selectedTime);
            setIsFocused(true); // Set focus state when a value is selected
        });

        return () => {
            picker.destroy();
        };
    }, [onChange]);

    useEffect(() => {
        if (value) {
            setIsFocused(true);
        }
    }, [value]);

    return (
        <div className="mb-2 mt-2 flex items-center w-full" style={{ position: 'relative' }}>
            {
                mode === 'new' && (
            <label
                htmlFor="time-picker"
                style={{
                    position: 'absolute',
                    left: 0,
                    top: isFocused ? '-15px' : '1px',
                    transform: 'translateY(-50%)',
                    fontSize: isFocused ? '14px' : '17px',
                    color: isFocused ? 'black' : 'grey',
                    transition: 'all 0.2s ease-out',
                    pointerEvents: 'none',
                    marginBottom: '20px',
                }}
                className="mb-2"
            >
                Waktu <span style={{ color: 'red' }}>*</span>
            </label>
                )
            }
            <input
                type="text"
                ref={inputRef}
                value={value}
                onChange={(e) => {onChange(e.target.value);}}
                style={{
                    border: 'none',
                    borderBottom: `1px solid ${borderColor}`,
                    outline: 'none',
                    width: '100%',
                    fontSize: '17px',
                }}
                onMouseEnter={() => setBorderColor('black')}
                onMouseLeave={() => setBorderColor('grey')}
                onFocus={() => setBorderColor('blue')}
                onBlur={() => setBorderColor('grey')}
            />
        </div>
    );
};

export default TimePicker;
