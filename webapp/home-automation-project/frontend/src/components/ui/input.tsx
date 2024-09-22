import React from 'react';

type InputProps = {
    type?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
};

export const Input: React.FC<InputProps> = ({ type = 'text', placeholder = '', value, onChange, className = '' }) => {
    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`border px-4 py-2 rounded ${className}`}
        />
    );
};
