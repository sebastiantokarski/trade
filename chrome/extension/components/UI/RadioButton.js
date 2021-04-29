import React from 'react';

const RadioButton = ({ name, value, label, onChange, checked }) => {
  return (
    <div>
      <input
        type="radio"
        name={name}
        id={`${name}_${value}`}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <label htmlFor={`${name}_${value}`}>{label}</label>
    </div>
  );
};

export default RadioButton;
