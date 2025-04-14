import React, { useContext } from 'react'
import AppContext from '../context/AppContext'
import "../css/Stats.css"

const Stats = () => {
  const context = useContext(AppContext);
  const { stats } = context;

  return (
    <div className='StatsPage'>
      <h2>Statistics:</h2>
      <ul>
        {Object.entries(stats).map(([cls, values]) => {
          const percentage = values.held > 0 ? (values.attended / values.held) * 100 : 0;
          return (
            <li key={cls}>
              {cls}: {values.attended} / {values.held}
              <div className='percentageshower'>
                <div
                  className='percentagebar'
                  style={{ width: `${percentage}%` }}
                ><p className='barpercentage'>{percentage}%</p></div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Stats;
