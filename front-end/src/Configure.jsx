import React, { useContext } from 'react';
import '../css/Configure.css';
import AppContext from '../context/AppContext';
import { Link } from 'react-router-dom';

function Configure() {
  const context = useContext(AppContext);
  const {
    monday, tuesday, wednesday, thursday, friday, saturday, sunday,
    newClass, setNewClass,
    classes, setClasses,
    setMonday, setTuesday, setWednesday, setThursday, setFriday, setSaturday, setSunday,
    stats, setStats
  } = context;

  function handleInput(e) {
    setNewClass(e.target.value);
  }

  function handleNewClass() {
    if (newClass.trim() === '') {
      alert("Class name cannot be empty");
      return;
    }

    if (classes.includes(newClass)) {
      alert("Class already exists");
      return;
    }

    setClasses([...classes, newClass]);
    // Initialize stats for the new class
    setStats(prevStats => ({
      ...prevStats,
      [newClass]: { held: 0, attended: 0 }
    }));
    setNewClass("");
  }

  const handleAddToDay = (day, cls) => {
    const dayArray = {
      monday, tuesday, wednesday, thursday, friday, saturday, sunday
    }[day];

    const setDayArray = {
      monday: setMonday, tuesday: setTuesday, wednesday: setWednesday,
      thursday: setThursday, friday: setFriday, saturday: setSaturday, sunday: setSunday
    }[day];

    setDayArray([...dayArray, cls]);
  };

  function handleRemoveClass(indclass) {
    setClasses(classes.filter((item) => item !== indclass));
    // Remove stats for the deleted class
    setStats(prevStats => {
      const newStats = { ...prevStats };
      delete newStats[indclass];
      return newStats;
    });
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className='ConfigureContainer'>
      <div className='ClassesContainer'>
        <span className='NewClassHeading'>New Class:</span>
        <input type='text' name='newclass' onInput={handleInput} value={newClass} className='newclass'/>
        <button onClick={handleNewClass} className='AddClass'>Add</button>
        <div className='ExistingClasses'>
          {classes.length !== 0 ? (
            classes.map((indclass, index) => (
              <div className='indclass' key={`class-${index}`}>
                {indclass}
                <button className='RemoveButton' onClick={() => handleRemoveClass(indclass)}>Remove</button>
              </div>
            ))
          ) : (
            <>No classes exist yet. Add your classes.</>
          )}
        </div>
      </div>

      <div className='daysConfigure'>
        {days.map((day) => (
          <div className='day' id={day} key={`day-${day}`}>
            <h2 className='configureDayHeading'>{day}</h2>
            <div className='setData'>
              <div className='AddClassToDayContainer'>
                {classes.map((cls, idx) => (
                  <div 
                    className='addClassToDay' 
                    id={idx} 
                    key={`${day}-${cls}-${idx}`}
                    onClick={() => handleAddToDay(day, cls)}
                  >
                    <h3>{cls}</h3>
                    <span className='plusClass'>+</span>
                  </div>
                ))}
              </div>
            </div>
            <div className='currentDayData'>
              {(context[day] && context[day].length > 0) ? (
                context[day].map((cls, i) => (
                  <div key={`${day}-class-${i}`}>{cls}</div>
                ))
              ) : (
                <>No classes added yet</>
              )}
            </div>
          </div>
        ))}
      </div>

      <Link to="/" className="backButton">Back to Home</Link>
    </div>
  );
}

export default Configure;