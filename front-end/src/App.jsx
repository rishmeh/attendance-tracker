import React, { useContext, useState } from 'react';
import '../css/App.css';
import AppContext from '../context/AppContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGears } from "@fortawesome/free-solid-svg-icons";
import { faChartSimple } from '@fortawesome/free-solid-svg-icons';

function App() {
  const context = useContext(AppContext);
  const { monday, tuesday, wednesday, thursday, friday, saturday, sunday ,stats,setStats} = context;

  const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const pad = (n) => n.toString().padStart(2, '0');
  const getTodayDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [attendance, setAttendance] = useState({}); 

  const handleDateChange = (e) => setSelectedDate(e.target.value);
  const getDayFromDate = (dateStr) => weekday[new Date(dateStr).getDay()];
  const day = getDayFromDate(selectedDate);

  const dayData = {
    Monday: monday, Tuesday: tuesday, Wednesday: wednesday,
    Thursday: thursday, Friday: friday, Saturday: saturday, Sunday: sunday
  };
  const todayData = dayData[day] || [];

  const toggleCheckbox = (type, uniqueKey) => {
    setAttendance(prev => {
      const prevDayData = prev[selectedDate]?.[day] || {};
      const prevClassData = prevDayData[uniqueKey] || { held: false, attended: false };
      const newValue = !prevClassData[type];

      const className = uniqueKey.split('-')[0];
      setStats(prevStats => {
        const classStats = prevStats[className] || { held: 0, attended: 0 };
        return {
          ...prevStats,
          [className]: {
            ...classStats,
            [type]: classStats[type] + (newValue ? 0.5 : -0.5)
          }
        };
      });
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
      <div className='ontopages'>
      <FontAwesomeIcon icon={faChartSimple} className='Stats nav'/>
      <FontAwesomeIcon icon={faGears} className='Setting nav'/>
      </div>
      <h1>{selectedDate}</h1>
      <h2>{day}</h2>
      <h4>Select a date:  <input
        type="date"
        name="todays-date"
        min="2025-01-01"
        max={getTodayDate()}
        value={selectedDate}
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
          <>No classes scheduled. Only thing in schedule is rest.</>
        )}
      </div>
    </div>
  );
}

export default App;
