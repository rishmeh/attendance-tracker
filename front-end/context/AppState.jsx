// AppState.js
import React, { useState } from 'react';
import AppContext from './AppContext';

const AppState = ({ children }) => {
  const [monday, setMonday] = useState([]);
  const [tuesday, setTuesday] = useState([]);
  const [wednesday, setWednesday] = useState([]);
  const [thursday, setThursday] = useState([]);
  const [friday, setFriday] = useState([]);
  const [saturday, setSaturday] = useState([]);
  const [sunday, setSunday] = useState([]);
  const [newClass,setNewClass] = useState('');
  const [classes,setClasses] = useState([]);
  const [stats,setStats] = useState([]);

  return (
    <AppContext.Provider
      value={{
        monday, tuesday, wednesday, thursday, friday, saturday, sunday, newClass, setNewClass, classes, setClasses,setMonday,setTuesday,setWednesday,setThursday,setFriday,setSaturday,setSunday, stats, setStats
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppState;
