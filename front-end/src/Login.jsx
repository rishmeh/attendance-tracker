import React, { useState } from 'react'
import "../css/Login.css"
const Login = () => {
  const [showLogin, setShowLogin] = useState(false);
  
  function handleLoginPageClick(){
    setShowLogin(true)
  }
  function handleRegisterPageClick(){
    
    setShowLogin(false)
  }
  return (
    <div className='LoginPage'>
    <div className='loginorregcontainer'>
      <div className={`RegisterContainer`}>
        <h2 className='RegisterHeading' onClick={handleRegisterPageClick}>Register</h2>
        <p className='mailid'>Mail Id:</p>
        <input type='email' placeholder='Please input your email id' className='logininput emailinp'/>
        <p className='password'>Password:</p>
        <input type='password' placeholder='Please enter your password' className='logininput passwordinp'/>
        <button className='RegisterButton'>Register</button>
      </div>

      <div className={`LoginContainer ${showLogin ? 'showLogin' : ''}`} >
      <div className='LoginMainContainer'>
        <h2 className='LoginHeading' onClick={handleLoginPageClick}>Login</h2>
        <p className='mailid logincontainertext'>Mail Id:</p>
        <input type='email' placeholder='Please input your email id' className='logininput1 emailinp'/>
        <p className='password logincontainertext'>Password:</p>
        <input type='password' placeholder='Please enter your password' className='logininput1 passwordinp'/>
        <button className='LoginButton'>Login</button>
      </div>
      </div>
      </div>
    </div>
  )
}

export default Login