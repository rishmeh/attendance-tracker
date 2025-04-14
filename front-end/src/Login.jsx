import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import "../css/Login.css"
import AppContext from '../context/AppContext'

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useContext(AppContext);
  
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    id: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  function handleLoginPageClick(){
    setShowLogin(true);
    setError('');
    setSuccessMessage('');
  }
  
  function handleRegisterPageClick(){
    setShowLogin(false);
    setError('');
    setSuccessMessage('');
  }
  
  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!loginData.email || !loginData.password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      const result = await login(loginData.email, loginData.password);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      console.error(err);
    }
  };
  
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!registerData.id || !registerData.email || !registerData.password) {
      setError('All fields are required for registration');
      return;
    }
    
    try {
      const result = await register(registerData);
      
      if (result.success) {
        setSuccessMessage('Registration successful! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
      console.error(err);
    }
  };
  
  return (
    <div className='LoginPage'>
      <div className='loginorregcontainer'>
        <div className={`RegisterContainer ${showLogin ? '' : 'active'}`}>
          <h2 className='RegisterHeading' onClick={handleRegisterPageClick}>Register</h2>
          
          {error && !showLogin && <p className="error-message">{error}</p>}
          {successMessage && !showLogin && <p className="success-message">{successMessage}</p>}
          
          <form onSubmit={handleRegisterSubmit}>
            <p className='mailid'>Student ID:</p>
            <input 
              type='text' 
              name="id"
              placeholder='Please enter your student ID' 
              className='logininput idinp'
              value={registerData.id}
              onChange={handleRegisterChange}
            />
            
            <p className='mailid'>Mail Id:</p>
            <input 
              type='email' 
              name="email"
              placeholder='Please input your email id' 
              className='logininput emailinp'
              value={registerData.email}
              onChange={handleRegisterChange}
            />
            
            <p className='password'>Password:</p>
            <input 
              type='password' 
              name="password"
              placeholder='Please enter your password' 
              className='logininput passwordinp'
              value={registerData.password}
              onChange={handleRegisterChange}
            />
            
            <button type="submit" className='RegisterButton'>Register</button>
          </form>
        </div>

        <div className={`LoginContainer ${showLogin ? 'showLogin' : ''}`} >
          <div className='LoginMainContainer'>
            <h2 className='LoginHeading' onClick={handleLoginPageClick}>Login</h2>
            
            {error && showLogin && <p className="error-message">{error}</p>}
            
            <form onSubmit={handleLoginSubmit}>
              <p className='mailid logincontainertext'>Mail Id:</p>
              <input 
                type='email' 
                name="email"
                placeholder='Please input your email id' 
                className='logininput1 emailinp'
                value={loginData.email}
                onChange={handleLoginChange}
              />
              
              <p className='password logincontainertext'>Password:</p>
              <input 
                type='password' 
                name="password"
                placeholder='Please enter your password' 
                className='logininput1 passwordinp'
                value={loginData.password}
                onChange={handleLoginChange}
              />
              
              <button type="submit" className='LoginButton'>Login</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login