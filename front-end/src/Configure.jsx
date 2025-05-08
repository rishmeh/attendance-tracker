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
    user, setStats
  } = context;

  function handleInput(e) {
    setNewClass(e.target.value);
  }

  async function handleNewClass() {
    if (newClass.trim() === '') {
      alert("Class name cannot be empty");
      return;
    }

    if (classes.includes(newClass)) {
      alert("Class already exists");
      return;
    }
    console.log(classes);
    try {
      setClasses([...classes, newClass]);
      // Initialize stats for the new class
      setStats(prevStats => ({
        ...prevStats,
        [newClass]: { held: 0, attended: 0 }
      }));
      setNewClass("");
      // Call backend API to update class schedule
      const response = await fetch('http://localhost:8080/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          
        },
        body: JSON.stringify({
          className: newClass,
          id: user
        })
      });

      if (response.ok) {
        console.log("Sucessfully added class",newClass)
      } else {
        alert("Failed to update schedule");
      }
    } catch (err) {
      console.error("Error updating schedule:", err);
      alert("Failed to update schedule. Please try again.");
    }
  }

  const handleAddToDay = async (day, cls) => {
    try{
      const dayArray = {
        monday, tuesday, wednesday, thursday, friday, saturday, sunday
      }[day];
  
      const setDayArray = {
        monday: setMonday, tuesday: setTuesday, wednesday: setWednesday,
        thursday: setThursday, friday: setFriday, saturday: setSaturday, sunday: setSunday
      }[day];
  
      setDayArray([...dayArray, cls]);
      const response = await fetch('http://localhost:8080/api/schedule', {
        method:'POST',
        headers:{
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: user,
          day:day,
          classname:cls
        })
      })
      if(response.ok){
        console.log("succesfully added class to day", cls, day);
      }
      else{
        console.log("failed to add class")
      }
    }
    catch(err){
      console.log("Error adding data to day array", err);
    }
  };

  async function handleRemoveClass(indclass) {
    setClasses(classes.filter((item) => item !== indclass));
    try{
      const response = await fetch('http://localhost:8080/api/classes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          className: indclass,
          id: user
        })
      });
      if(response.ok){
        console.log("Successfully removed class", indclass);
      }
      else{
        alert("failed to remove class")
      }
    }
    catch(err){
      console.error("Error updating schedule:", err);
    }
    // Remove stats for the deleted class
    setStats(prevStats => {
      const newStats = { ...prevStats };
      delete newStats[indclass];
      return newStats;
    });
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  async function handleRemoveClassFromDay(day, cls){
    try{
      const dayArray = {
        monday, tuesday, wednesday, thursday, friday, saturday, sunday
      }[day];
  
      const setDayArray = {
        monday: setMonday, tuesday: setTuesday, wednesday: setWednesday,
        thursday: setThursday, friday: setFriday, saturday: setSaturday, sunday: setSunday
      }[day];
  
      const index = dayArray.indexOf(cls);
      if (index > -1) {
        const newArray = [...dayArray];
        newArray.splice(index, 1);
        setDayArray(newArray);
      }
      const response = await fetch('http://localhost:8080/api/schedule', {
        method:'DELETE',
        headers:{
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: user,
          day:day,
          classname:cls
        })
      })
      if(response.ok){
        console.log("succesfully removed class from day", cls, day);
      }
      else{
        console.log("failed to remove class")
      }
    }
    catch(err){
      console.log("Error removing data to day array", err);
    }
  }

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
                  <div key={`${day}-class-${i}`}>{cls} <span className='remove-class' onClick={()=>{handleRemoveClassFromDay(day, cls)}}>-</span></div>
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