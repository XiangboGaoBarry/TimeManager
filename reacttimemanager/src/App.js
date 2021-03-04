import React, {Component}  from 'react';
import Logo from './component/Logo/Logo.js';
import Calender from './component/Calender/Calender.js';
import Login from './component/Server/Login/Login.js';
import Register from './component/Server/Register/Register.js'
import './App.css';
import Particles from 'react-particles-js';

const particlesOptions = {
    particles: {
      number: {
        value: 30,
      density: {
        enable: true,
        value_area: 300
      }
      }
      
    }
}



class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      server_status: "login",
      username_login: ""
    }
  }

  componentDidMount() {
    this.setState({
      server_status: "login"
    })
  }

  set_server_status = (status, username) => {
    this.setState({
      server_status: status,
      username_login: username
    })
  }

  render(){
    return (
      <div className="App">
        <Particles  className = 'particles' params={particlesOptions}/>
        <Logo />
        {
          this.state.server_status === "login" 
          ? <Login set_server_status = {this.set_server_status}/>
          : this.state.server_status === "register"
            ? <Register set_server_status = {this.set_server_status}/>
            : <Calender 
                set_server_status = {this.set_server_status}
                username_login = {this.state.username_login}
                />
        }
      </div>
    );
  }
}

export default App;






