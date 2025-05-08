import React, { useContext, useEffect, useState } from 'react'
import AppContext from '../context/AppContext'
import "../css/Stats.css"
import { Link } from 'react-router-dom';

const Stats = () => {
  const context = useContext(AppContext);
  const { stats, setStats } = context;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  

  // Calculate total classes and attendance
  const totalClasses = Object.values(stats || {}).reduce((total, classStats) => {
    return total + (classStats?.held || 0);
  }, 0);

  const totalAttended = Object.values(stats || {}).reduce((total, classStats) => {
    return total + (classStats?.attended || 0);
  }, 0);

  const attendancePercentage = totalClasses > 0 
    ? ((totalAttended / totalClasses) * 100).toFixed(2) 
    : 0;

  if (loading) {
    return <div className='StatsContainer'>Loading statistics...</div>;
  }

  if (error) {
    return <div className='StatsContainer'>{error}</div>;
  }

  return (
    <div className='StatsContainer'>
      <h2>Attendance Statistics</h2>
      
      <div className='overallStats'>
        <div className='statItem'>
          <h3>Total Classes</h3>
          <p>{totalClasses}</p>
        </div>
        <div className='statItem'>
          <h3>Classes Attended</h3>
          <p>{totalAttended}</p>
        </div>
        <div className='statItem'>
          <h3>Attendance Percentage</h3>
          <p>{attendancePercentage}%</p>
        </div>
      </div>

      <div className='classStats'>
        <h3>Class-wise Statistics</h3>
        {Object.keys(stats || {}).length > 0 ? (
          Object.entries(stats || {}).map(([className, classStats]) => {
            const classAttendance = classStats?.held > 0 
              ? ((classStats?.attended / classStats?.held) * 100).toFixed(2) 
              : 0;
            
            return (
              <div className='classStatItem' key={className}>
                <h4>{className}</h4>
                <div className='statDetails'>
                  <p>Held: {classStats?.held || 0}</p>
                  <p>Attended: {classStats?.attended || 0}</p>
                  <p>Attendance: {classAttendance}%</p>
                </div>
                <div className='percentageBar'>
                  <div 
                    className='percentageFill' 
                    style={{ width: `${classAttendance}%` }}
                  ></div>
                </div>
              </div>
            );
          })
        ) : (
          <p>No attendance data available</p>
        )}
      </div>

      <Link to="/" className="backButton">Back to Home</Link>
    </div>
  );
};

export default Stats;