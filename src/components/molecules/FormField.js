import React from 'react';
import Text from '../atoms/Text';
import Input from '../atoms/Input';

const FormField = ({ label, type = 'text', value, onChange, placeholder, error, disabled }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <Text variant="small" weight="bold" color="primary">{label}</Text>}
      <Input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        error={error}
        disabled={disabled}
      />
      {error && <Text variant="xs" color="danger">{error}</Text>}
    </div>
  );
};

export default FormField;
