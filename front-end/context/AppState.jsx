import React, { useState, useEffect } from 'react';
import AppContext from './AppContext';

const AppState = ({ children }) => {
  // Load initial state from localStorage or use defaults
  const loadState = (key, defaultValue) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  };

  const [monday, setMonday] = useState(() => loadState('monday', []));
  const [tuesday, setTuesday] = useState(() => loadState('tuesday', []));
  const [wednesday, setWednesday] = useState(() => loadState('wednesday', []));
  const [thursday, setThursday] = useState(() => loadState('thursday', []));
  const [friday, setFriday] = useState(() => loadState('friday', []));
  const [saturday, setSaturday] = useState(() => loadState('saturday', []));
  const [sunday, setSunday] = useState(() => loadState('sunday', []));
  const [newClass, setNewClass] = useState('');
  const [classes, setClasses] = useState(() => loadState('classes', []));
  const [attendance, setAttendance] = useState(() => loadState('attendance', {}));
  const [stats, setStats] = useState(() => loadState('stats', {}));

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('monday', JSON.stringify(monday));
  }, [monday]);

  useEffect(() => {
    localStorage.setItem('tuesday', JSON.stringify(tuesday));
  }, [tuesday]);

  useEffect(() => {
    localStorage.setItem('wednesday', JSON.stringify(wednesday));
  }, [wednesday]);

  useEffect(() => {
    localStorage.setItem('thursday', JSON.stringify(thursday));
  }, [thursday]);

  useEffect(() => {
    localStorage.setItem('friday', JSON.stringify(friday));
  }, [friday]);

  useEffect(() => {
    localStorage.setItem('saturday', JSON.stringify(saturday));
  }, [saturday]);

  useEffect(() => {
    localStorage.setItem('sunday', JSON.stringify(sunday));
  }, [sunday]);

  useEffect(() => {
    localStorage.setItem('classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('attendance', JSON.stringify(attendance));
  }, [attendance]);

  // Authentication state
  const [user, setUser] = useState(null);
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
  const fetchUserData = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
        
        // Process the user's classes and populate the schedule
        if (data.user.classes) {
          // Create class list
          const classList = data.user.classes.map(cls => cls.name);
          setClasses(classList);
          
          // Populate the schedule based on class day
          const scheduleByDay = {
            Monday: [], Tuesday: [], Wednesday: [], 
            Thursday: [], Friday: [], Saturday: [], Sunday: []
          };
          
          data.user.classes.forEach(cls => {
            if (cls.schedule && cls.schedule.day) {
              scheduleByDay[cls.schedule.day].push(`${cls.name} (${cls.schedule.time})`);
            }
          });
          
          setMonday(scheduleByDay.Monday);
          setTuesday(scheduleByDay.Tuesday);
          setWednesday(scheduleByDay.Wednesday);
          setThursday(scheduleByDay.Thursday);
          setFriday(scheduleByDay.Friday);
          setSaturday(scheduleByDay.Saturday);
          setSunday(scheduleByDay.Sunday);
          
          // Build stats object
          const statsObj = {};
          data.user.classes.forEach(cls => {
            statsObj[cls.name] = {
              held: cls.held || 0,
              attended: cls.attended || 0
            };
          });
          setAttendance(statsObj);
        }
      } else {
        // Token invalid
        logout();
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      logout();
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setToken(data.token);
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
  const register = async (userData) => {
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
        setToken(data.token);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, message: error.message || "Registration failed" };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: "Network error" };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
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
        // Refresh user data to get updated classes
        fetchUserData();
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, message: error.message || "Failed to add class" };
      }
    } catch (error) {
      console.error("Error adding class:", error);
      return { success: false, message: "Network error" };
    }
  };

  // Update attendance stats
  const updateAttendance = async (classId, attendanceData) => {
    try {
      const response = await fetch(`http://localhost:8080/api/attendance/${classId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(attendanceData)
      });
      
      if (response.ok) {
        // Refresh user data after update
        fetchUserData();
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, message: error.message || "Failed to update attendance" };
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
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
        login, register, logout,
        addClass, updateAttendance
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppState;