import React, { useContext, useState } from 'react';
import AppContext from '../context/AppContext';
import "../css/Configure.css"

const Configure = () => {
  const context = useContext(AppContext);
  const {
    newClass, setNewClass,
    classes, setClasses,
    monday, tuesday, wednesday, thursday, friday, saturday, sunday,
    setMonday, setTuesday, setWednesday, setThursday, setFriday, setSaturday, setSunday, stats,setStats
  } = context;


  function handleInput(e) {
    setNewClass(e.target.value);
  }

  function handleNewClass() {
    if (classes.includes(newClass)) {
      alert("Class already exists");
    } else {
      setClasses([...classes, newClass]);
      setNewClass("");
      setStats({...stats,[newClass]:{"held":0,"attended":0}})
    }
  }


  const handleAddToDay = (day,cls) => {
    
    const dayArray = {
      monday, tuesday, wednesday, thursday, friday, saturday, sunday
    }[day];
  
    const setDayArray = {
      monday: setMonday, tuesday: setTuesday, wednesday: setWednesday,
      thursday: setThursday, friday: setFriday, saturday: setSaturday, sunday: setSunday
    }[day];
  
    setDayArray([...dayArray, cls]);
  
  };
  

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  function handleRemoveClass(indiclass){
    setClasses(classes.filter((item) => item !== indiclass));
    const updatedStats = { ...stats };
  delete updatedStats[indiclass];
  setStats(updatedStats);
  }
  

  return (
    <div className='ConfigureContainer'>
    <h1>Configure:</h1>
      <div className='ClassesContainer'>
        <span className='NewClassHeading'>New Class:</span>
        <input type='text' name='newclass' onInput={handleInput} value={newClass} className='newclass'/>
        <button onClick={handleNewClass} className='AddClass'>Add </button>
        <div className='ExistingClasses'>
          {classes.length !== 0 ? (
            classes.map((indclass, index) => (
              <div className='indclass' key={index}>
                {indclass}
                <button className='RemoveButton' onClick={()=>{handleRemoveClass(indclass)}}>Remove</button>
              </div>
            ))
          ) : <>No classes exist yet. Add your classes.</>}
        </div>
      </div>

      <div className='daysConfigure'>
        {days.map((day) => (
          <div className='day' id={day} key={day}>
            <h2 className='configureDayHeading'>{day}</h2>
            <div className='setData'>
              <div className='AddClassToDayContainer'>
              {classes.map((cls, idx) => (
                <div className='addClassToDay' id={idx} onClick={() => handleAddToDay(day,cls)}>
                  <h3>{cls}</h3>
                  <span className='plusClass'>+</span>
                </div>
                ))}
                </div>
            </div>
            <div className='currentDayData'>
              {(context[day] && context[day].length > 0) ? (
                context[day].map((cls, i) => <div key={i}>{cls}</div>)
              ) : <>No classes added yet</>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Configure;
//option to delete class, edit class and option to add in classes to a day.