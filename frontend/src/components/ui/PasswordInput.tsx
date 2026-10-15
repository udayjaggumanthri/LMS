import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input, InputProps } from './Input';

export const PasswordInput: React.FC<Omit<InputProps, 'type' | 'rightIcon'>> = (props) => {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      rightIcon={
        <button
          type="button"
          className="text-slate-500 hover:text-slate-800"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      }
    />
  );
};
