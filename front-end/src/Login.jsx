import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import "../css/Login.css"
import AppContext from '../context/AppContext'

const Login = () => {
  const navigate = useNavigate();
  const { login, register } = useContext(AppContext);
  
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({
    id: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    id: '',
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
    
    if (!loginData.id || !loginData.password) {
      setError('Please enter both id and password');
      return;
    }
    
    try {
      const result = await login(loginData.id, loginData.password);
      
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
      
      if (!registerData.id || !registerData.password) {
        setError('All fields are required for registration');
        return;
      }
      
      try {
        const result = await register(registerData);
        
        if (result.success) {
          setSuccessMessage('Registration successful! Redirecting to dashboard...');
          setTimeout(() => {
            navigate('/');
          }, 1000);
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
          
          <form onSubmit={handleRegisterSubmit} className='loginform'>
            <p className='username'>Username:</p>
            <input 
              type='text' 
              name="id"
              placeholder='Please enter your username' 
              className='reginput '
              value={registerData.id}
              onChange={handleRegisterChange}
            />
            
            <p className='password'>Password:</p>
            <input 
              type='password' 
              name="password"
              placeholder='Please enter your password' 
              className='reginput '
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
              <p className='username logincontainertext'>Username:</p>
              <input 
                type='text' 
                name="id"
                placeholder='Please enter your username' 
                className='logininput1 idinp'
                value={loginData.id}
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