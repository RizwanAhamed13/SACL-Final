import React, { useState, useEffect } from 'react';

const TimePicker = ({ value, onChange, name, className = '' }) => {
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [ampm, setAmpm] = useState('AM');

  useEffect(() => {
    if (value) {
      const match = value.match(/^(\d{1,2}):(\d{2})$/);
      if (match) {
        let h = parseInt(match[1], 10);
        let m = match[2];
        let ap = 'AM';
        
        if (h >= 12) {
          ap = 'PM';
          if (h > 12) h -= 12;
        } else if (h === 0) {
          h = 12;
        }
        
        setHour(h.toString().padStart(2, '0'));
        setMinute(m);
        setAmpm(ap);
      }
    } else {
      setHour('');
      setMinute('');
      setAmpm('AM');
    }
  }, [value]);

  const handleUpdate = (newH, newM, newAp) => {
    if (!newH || !newM) {
      onChange({ target: { name, value: '' } });
      return;
    }

    let h24 = parseInt(newH, 10);
    if (newAp === 'PM' && h24 < 12) h24 += 12;
    if (newAp === 'AM' && h24 === 12) h24 = 0;

    const formattedTime = `${h24.toString().padStart(2, '0')}:${newM}`;
    onChange({ target: { name, value: formattedTime } });
  };

  const handleHourChange = (e) => {
    const val = e.target.value;
    setHour(val);
    handleUpdate(val, minute, ampm);
  };

  const handleMinuteChange = (e) => {
    const val = e.target.value;
    setMinute(val);
    handleUpdate(hour, val, ampm);
  };

  const handleAmpmChange = (e) => {
    const val = e.target.value;
    setAmpm(val);
    handleUpdate(hour, minute, val);
  };

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <div className={`time-picker ${className}`} style={{ display: 'flex', gap: '4px' }}>
      <select 
        value={hour} 
        onChange={handleHourChange} 
        style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
      >
        <option value="">HH</option>
        {hours.map(h => <option key={h} value={h}>{h}</option>)}
      </select>
      <span style={{ alignSelf: 'center', fontWeight: 'bold' }}>:</span>
      <select 
        value={minute} 
        onChange={handleMinuteChange} 
        style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
      >
        <option value="">MM</option>
        {minutes.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      <select 
        value={ampm} 
        onChange={handleAmpmChange} 
        style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '13px' }}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
};

export default TimePicker;
