import React from 'react';
import { withCookies } from 'react-cookie';

import './App.css';

import 'bootstrap/dist/css/bootstrap.min.css';

import { LoginCard, CourseSelectCard } from './CardComponents';
import { LoadingModal, LoginModal } from "./Modals";
import { AuthService } from './AuthService';
import TitleSVG from "./assets/title.svg";

export class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      moodleclient: null, 
      loading: false, 
      awaitinglogin: false,
      darkMode: true, // Default to dark mode
      isInitializing: true
    };
    this.setMoodleClient = this.setMoodleClient.bind(this)
    this.setLoading = this.setLoading.bind(this);
    this.setAwaitLogin = this.setAwaitLogin.bind(this);
    this.toggleTheme = this.toggleTheme.bind(this);
    this.logout = this.logout.bind(this);
  }

  async componentDidMount() {
    // Set dark mode by default on mount
    document.documentElement.setAttribute('data-theme', 'dark');
    
    // Try to restore authentication from localStorage
    this.setState({ loading: true });
    try {
      const client = await AuthService.createMoodleClientFromStorage();
      if (client) {
        this.setState({ moodleclient: client });
        console.log('Successfully restored authentication from storage');
      }
    } catch (error) {
      console.error('Failed to restore authentication:', error);
      AuthService.clearAuthData();
    } finally {
      this.setState({ loading: false, isInitializing: false });
    }
  }

  toggleTheme() {
    const newDarkMode = !this.state.darkMode;
    this.setState({ darkMode: newDarkMode });
    document.documentElement.setAttribute('data-theme', newDarkMode ? 'dark' : 'light');
  }

  setMoodleClient(client) {
    this.setState({ moodleclient: client });
  }
  
  setLoading(isloading) {
    this.setState({ loading: isloading });
  }
  
  setAwaitLogin(isawaitinglogin) {
    this.setState({ awaitinglogin: isawaitinglogin})
  }

  logout() {
    AuthService.logout();
    this.setState({ moodleclient: null });
  }
  
  render() {
    if (this.state.isInitializing) {
      return (
        <div className="App">
          <div className="App-header">
            <img id="title" src={TitleSVG} alt="MoodleArchiver" className="m-3" />
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Checking authentication...</p>
            </div>
          </div>
        </div>
      );
    }

    const remainingDays = AuthService.getRemainingDays();
    
    return (
      <div className="App">
        <div className="theme-toggle" onClick={this.toggleTheme}>
          {this.state.darkMode ? (
            <svg viewBox="0 0 24 24">
              <path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24">
              <path d="M10 7C10 10.866 13.134 14 17 14C18.9584 14 20.729 13.1957 21.9995 11.8995C22 11.933 22 11.9665 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C12.0335 2 12.067 2 12.1005 2.00049C10.8043 3.27098 10 5.04157 10 7Z"/>
            </svg>
          )}
        </div>

        {this.state.moodleclient && (
          <div className="logout-button" onClick={this.logout}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M4 18H6V20H18V4H6V6H4V3C4 2.44772 4.44772 2 5 2H19C19.5523 2 20 2.44772 20 3V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4.44772 21.5523 4 21V18ZM6 11H13V13H6V16L1 12L6 8V11Z"/>
            </svg>
          </div>
        )}

        <header className="App-header">
          <img id="title" src={TitleSVG} alt="MoodleArchiver" className="m-3" />
          
          {this.state.moodleclient === null && (
            <LoginCard 
              cookies={this.props.cookies} 
              setMoodleClient={this.setMoodleClient} 
              setLoading={this.setLoading} 
              setAwaitLogin={this.setAwaitLogin}
            />
          )}
          
          {this.state.moodleclient !== null && (
            <div className="main-content">
              <div className="search-section">
                <h1 className="search-title">What do you want to <span style={{color: '#007bff'}}>download</span>?</h1>
                <p className="search-subtitle">Select your Moodle courses and download all materials at once</p>
                {remainingDays > 0 && (
                  <div className="auth-status">
                    <small className="text-muted">
                      Logged in as <strong>{AuthService.getAuthData()?.username}</strong> • 
                      Session expires in <strong>{remainingDays} days</strong>
                    </small>
                  </div>
                )}
              </div>
              <CourseSelectCard 
                cookies={this.props.cookies} 
                moodleclient={this.state.moodleclient} 
                setLoading={this.setLoading} 
                setAwaitLogin={this.setAwaitLogin}
              />
            </div>
          )}
        </header>
        
        <div className='footer'>
          <p className="text-start text-light font-monospace mb-0" id="self-credit-msg">By: <a href="https://github.com/pranav-dp" target="_blank" rel="noopener noreferrer" className="link-onhover-color-change link">Pranav</a> & Forked from <a href="https://github.com/Aathish04" target="_blank" rel="noopener noreferrer" className="link-onhover-color-change link">Aathish04</a></p>
          <p className="text-start text-light font-monospace mb-0" id="contribute-msg">Feel free to <a href="https://github.com/Aathish04/moodlearchiver" target="_blank" rel="noopener noreferrer" className="link-onhover-color-change link">Contribute</a>!</p>
        </div>
        
        {this.state.loading && <LoadingModal downloadProgress={this.state.moodleclient ? this.state.moodleclient.downloadProgress : 0} />}
        {this.state.awaitinglogin && <LoginModal></LoginModal>}
      </div>
    );
  }
}

export default withCookies(App);
