import React, { useState, useEffect } from 'react';
import AppContext from './AppContext';

const AppState = ({ children }) => {
  
  const [monday, setMonday] = useState([]);
  const [tuesday, setTuesday] = useState([]);
  const [wednesday, setWednesday] = useState([]);
  const [thursday, setThursday] = useState([]);
  const [friday, setFriday] = useState([]);
  const [saturday, setSaturday] = useState([]);
  const [sunday, setSunday] = useState([]);
  const [newClass, setNewClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [stats, setStats] = useState({});
  const [user, setUser] = useState('');


  // Save state to localStorage whenever it changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("user id:",user)
        const res = await fetch("http://localhost:8080/api/user-class-data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ id: user })
        });
  
        if (!res.ok) {
          console.error("error:", res.message);
          return;
        }
  
        const data = await res.json();
  
        setMonday(data.monday || []);
        setTuesday(data.tuesday || []);
        setWednesday(data.wednesday || []);
        setThursday(data.thursday || []);
        setFriday(data.friday || []);
        setSaturday(data.saturday || []);
        setSunday(data.sunday || []);
        setClasses(data.classes || []);
        setAttendance(data.attendance || {});
        setStats(data.stats || {});
      } catch (err) {
        console.error("Error fetching class data:", err);
      }
    };
  
    fetchData();
  }, [user]);

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // Load user data from API when token changes
  useEffect(() => {
    const calculateStats = () => {
      // Initialize stats object with classes
      const newStats = {};
      classes.forEach(cls => {
        newStats[cls] = { held: 0, attended: 0 };
      });
      
      // Process attendance data
      Object.entries(attendance).forEach(([date, dayData]) => {
        Object.entries(dayData).forEach(([day, classesData]) => {
          Object.entries(classesData).forEach(([classKey, status]) => {
            // Extract class name from the key (format is "className-index")
            const className = classKey.substring(0, classKey.lastIndexOf('-'));
            
            if (classes.includes(className)) {
              if (status.held) {
                newStats[className].held = (newStats[className].held || 0) + 1;
              }
              if (status.attended) {
                newStats[className].attended = (newStats[className].attended || 0) + 1;
              }
            }
          });
        });
      });
      
      setStats(newStats);
      localStorage.setItem('stats', JSON.stringify(newStats));
    };
    
    calculateStats();
  }, [attendance, classes]);

  // Fetch user data from the API
  

  // Login function
  async function login (id, password) {
    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },  
        body: JSON.stringify({ id, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setUser(id);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, message: error.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Network error" };
    }
  };

  // Register function
  async function register (userData) {
    try {
      const response = await fetch('http://localhost:8080/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setUser(userData.id);
        return { success: true, userId: data.userId };
      } else {
        const error = await response.json();
        return { success: false, message: error.message || "Registration failed" };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: "Network error" };
    }
  };

  

  // Add a class
  const addClass = async (className, day, time) => {
    try {
      const response = await fetch('http://localhost:8080/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: className, day, time })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Immediately update local state with the new class
        setClasses(prev => [...prev, className]);
        
        // Update the appropriate day's schedule
        const daySetter = {
          'Monday': setMonday,
          'Tuesday': setTuesday,
          'Wednesday': setWednesday,
          'Thursday': setThursday,
          'Friday': setFriday,
          'Saturday': setSaturday,
          'Sunday': setSunday
        };
        
        if (daySetter[day]) {
          daySetter[day](prev => [...prev, `${className} (${time})`]);
        }
        
        // Also fetch updated user data from backend
        await fetchUserData();
        
        return { success: true, class: data.class };
      } else {
        const error = await response.json();
        return { success: false, message: error.message || "Failed to add class" };
      }
    } catch (error) {
      console.error("Error adding class:", error);
      return { success: false, message: "Network error" };
    }
  };

  return (
    <AppContext.Provider
      value={{
       monday, tuesday, wednesday, thursday, friday, saturday, sunday,
        newClass, setNewClass,
        classes, setClasses,
        attendance, setAttendance,
        stats, setStats,
        setMonday, setTuesday, setWednesday, setThursday, setFriday, setSaturday, setSunday,
        user, isAuthenticated, 
        login, register,
        addClass  
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppState;