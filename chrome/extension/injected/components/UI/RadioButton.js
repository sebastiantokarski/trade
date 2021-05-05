import React from 'react';

const RadioButton = ({ name, value, label, onChange, checked, inline = true }) => {
  return (
    <div style={{ display: inline ? 'inline-block' : 'block' }}>
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
