import React, { useContext, useState, useEffect } from 'react';
import '../css/App.css';
import AppContext from '../context/AppContext';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import Configure from './Configure';
import Stats from './Stats';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGears } from "@fortawesome/free-solid-svg-icons";
import { faChartSimple } from '@fortawesome/free-solid-svg-icons';

function App() {
  const context = useContext(AppContext);
  const { monday, tuesday, wednesday, thursday, friday, saturday, sunday, attendance, setAttendance , user} = context;
  const location = useLocation();

  const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const pad = (n) => n.toString().padStart(2, '0');
  const getTodayDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  };

  const [selectedDate, setSelectedDate] = useState(() => {
    return getTodayDate();
  });

  useEffect(() => {
    localStorage.setItem('selectedDate', selectedDate);
  }, [selectedDate]);

  const handleDateChange = (e) => setSelectedDate(e.target.value);
  const getDayFromDate = (dateStr) => weekday[new Date(dateStr).getDay()];
  const day = getDayFromDate(selectedDate);

  const dayData = {
    Monday: monday, Tuesday: tuesday, Wednesday: wednesday,
    Thursday: thursday, Friday: friday, Saturday: saturday, Sunday: sunday
  };
  const todayData = dayData[day] || [];

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!user) return;
      
      
      try {
        const response = await fetch(`http://localhost:8080/api/attendance-by-date?id=${user}&date=${selectedDate}`);
        
        if (response.ok) {
          const data = await response.json();
          
          // Update the attendance state with fetched data
          setAttendance(prev => {
            return {
              ...prev,
              [selectedDate]: {
                ...prev[selectedDate],
                [day]: data.attendanceData
              }
            };
          });
        } else {
          console.error('Failed to fetch attendance data:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      } 
    };

    fetchAttendanceData();
  }, [selectedDate, day, user, setAttendance]);

  const toggleCheckbox = async (type, uniqueKey) => {

    const currentStatus = getStatus(uniqueKey, type);
    const status = currentStatus ? "remove" : "add";
    const classname = uniqueKey.split("-")[0];
    try {
      await fetch(`http://localhost:8080/api/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: user,        
          classname,
          date: selectedDate,
          status
        })
      });
    } catch (err) {
      console.error(`Error updating ${type}:`, err);
    }

    setAttendance(prev => {
      const prevDayData = prev[selectedDate]?.[day] || {};
      const prevClassData = prevDayData[uniqueKey] || { held: false, attended: false };
      return {
        ...prev,
        [selectedDate]: {
          ...prev[selectedDate],
          [day]: {
            ...prevDayData,
            [uniqueKey]: {
              ...prevClassData,
              [type]: !prevClassData[type]
            }
          }
        }
      };
    });
  };
  
  const getStatus = (uniqueKey, type) => {
    return attendance[selectedDate]?.[day]?.[uniqueKey]?.[type] || false;
  };
  
  const count = (type) =>
    todayData.reduce((total, cls, i) => {
      const uniqueKey = `${cls}-${i}`;
      return getStatus(uniqueKey, type) ? total + 1 : total;
    }, 0);

  return (
    <div className='AppContainer'>
      <div className="ontopages">
        <Link to="/stats" className={location.pathname === '/stats' ? 'active' : ''}>
          <FontAwesomeIcon icon={faChartSimple} className='nav' />
        </Link>
        <Link to="/configure" className={location.pathname === '/configure' ? 'active' : ''}>
          <FontAwesomeIcon icon={faGears} className='nav' />
        </Link>
      </div>

      <Routes>
        <Route path="/" element={
          <>
            <h1>{selectedDate}</h1>
            <h2>{day}</h2>
            <h4>Select a date:  <input
              type="date"
              name="todays-date"
              min="2025-01-01"
              max={getTodayDate()}
              value={selectedDate}
              defaultValue={getTodayDate()}
              onChange={handleDateChange}
            /></h4>
           
            <hr/>
            <div className='TodaysClassesContainer'>
              {todayData.length > 0 ? (
                <>
                {todayData.map((cls, i) => {
                  const uniqueKey = `${cls}-${i}`;
                  return (
                    <div key={uniqueKey} className="classRow">
                      <span>{cls}</span>
                      <label>
                        <input
                          type="checkbox"
                          checked={getStatus(uniqueKey, 'held')}
                          onChange={() => toggleCheckbox('held', uniqueKey)}
                        /> Held
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={getStatus(uniqueKey, 'attended')}
                          onChange={() => toggleCheckbox('attended', uniqueKey)}
                        /> Attended
                      </label>
                    </div>
                  );
                })}
                  <hr />
                  <div>Held: {count('held')} / {todayData.length}</div>
                  <div>Attended: {count('attended')} / {todayData.length}</div>
                </>
              ) : (
                <>No classes scheduled.</>
              )}
            </div>
          </>
        } />
        <Route path="/configure" element={<Configure />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </div>
  );
}

export default App;
