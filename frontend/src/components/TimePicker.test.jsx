import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import TimePicker from './TimePicker';

describe('TimePicker Component', () => {
  it('renders correctly with an empty value', () => {
    render(<TimePicker name="testTime" value="" onChange={() => {}} />);
    
    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(3);
    expect(selects[0].value).toBe('');
    expect(selects[1].value).toBe('');
    expect(selects[2].value).toBe('AM');
  });

  it('renders correctly with a valid time', () => {
    render(<TimePicker name="testTime" value="14:30" onChange={() => {}} />);
    
    const selects = screen.getAllByRole('combobox');
    expect(selects[0].value).toBe('02');
    expect(selects[1].value).toBe('30');
    expect(selects[2].value).toBe('PM');
  });

  it('calls onChange with correctly formatted time when selections change', () => {
    const onChangeMock = vi.fn();
    render(<TimePicker name="testTime" value="" onChange={onChangeMock} />);
    
    const selects = screen.getAllByRole('combobox');
    
    // Select 2 PM
    fireEvent.change(selects[0], { target: { value: '02' } });
    fireEvent.change(selects[1], { target: { value: '45' } });
    fireEvent.change(selects[2], { target: { value: 'PM' } });
    
    // The last call should have the updated 24h formatted time
    expect(onChangeMock).toHaveBeenCalledWith({
      target: { name: 'testTime', value: '14:45' }
    });
  });
});
