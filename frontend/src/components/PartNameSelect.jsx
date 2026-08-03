import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from '../api/axios';

export const PartNameSelect = ({ value, onChange, placeholder = "Select or type a part name..." }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPartNames = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/part-names/active');
        const formattedOptions = response.data.map(part => ({
          value: part.name,
          label: part.name
        }));
        setOptions(formattedOptions);
      } catch (error) {
        console.error('Failed to fetch part names:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartNames();
  }, []);

  const customStyles = {
    control: (base, state) => ({
      ...base,
      background: 'var(--color-bg-primary)',
      borderColor: state.isFocused ? 'var(--color-primary)' : 'var(--color-border)',
      boxShadow: state.isFocused ? '0 0 0 3px var(--color-primary-light)' : null,
      borderRadius: '8px',
      padding: '2px',
      fontSize: '0.875rem',
      transition: 'all 0.2s ease',
      "&:hover": {
        borderColor: state.isFocused ? 'var(--color-primary)' : '#cbd5e1'
      }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? 'var(--color-primary)' 
        : state.isFocused 
          ? 'var(--color-primary-light)' 
          : 'transparent',
      color: state.isSelected ? 'white' : 'var(--color-text-primary)',
      fontSize: '0.875rem',
      cursor: 'pointer',
      "&:active": {
        backgroundColor: 'var(--color-primary-light)'
      }
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      overflow: 'hidden'
    })
  };

  const selectedOption = options.find(opt => opt.value === value) || (value ? { value, label: value } : null);

  return (
    <Select
      value={selectedOption}
      onChange={(selected) => onChange(selected ? selected.value : '')}
      options={options}
      isLoading={loading}
      isClearable
      isSearchable
      placeholder={placeholder}
      styles={customStyles}
      noOptionsMessage={() => "No part names found"}
    />
  );
};
