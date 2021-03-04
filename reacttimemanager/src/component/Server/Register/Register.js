import React, {Component}  from 'react';
import PopupWindow from '../Popup/PopupWindow.js';
import Backdrop from '../Backdrop/Backdrop.js';

class Register extends Component {

  constructor(props) {
    super(props);
    this.state = {
      UserNameEntered:"",
      passwordEntered:""
      
    }
  }

  componentDidMount() {
  }

  register = () => {
    var status = 0;
    fetch('http://localhost:3000/register',
    {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        username: this.state.UserNameEntered,
        password: this.state.passwordEntered,
    })
    })
      .then(response => {
        status = response.status;
        return response.json();
      })
      .then(user => {
        status===200?
        this.props.set_server_status("calender", this.state.UserNameEntered)
        :this.setState({
          popupAble: true,
          content: "Failed!\nYour username or password may not be vaild"
        })
      });
  }

  toLogin = () => {
    this.props.set_server_status("login")
  }

  popupDisable = () => {
    this.setState({
      popupAble: false
    })
  }
 

  render(){
    return (
      <div>
        {this.state.popupAble && <Backdrop/>}
        {
          this.state.popupAble
          && <PopupWindow
              popupDisable = {this.popupDisable}
              content = {this.state.content}
              />
            }
        <div style ={{display: 'flex', justifyContent: 'flex-end'}}>
        <button 
          style = {{display: 'flex'}}
          className = 'w-15 grow pv4 ph2 near-white bg-animate bg-near-black hover-bg-gray inline-flex items-center ma2 br2 pa2'
          onClick = {this.toLogin}> 
        Login
        </button>
        </div>
          <article className="br4 ba b--black-10 mv4 w-100 w-50-m w-25-l mw6 shadow-5 center">
            <fieldset id="login" className="ba b--transparent ph0 mh0">
              <label className="db fw6 lh-copy f6">Username</label>
              <input 
                onChange = {enter=>{this.setState({UserNameEntered:enter.target.value})}}
                placeholder="Enter your User Name"
                className = 'f4 pa2 w-100 center dim bg-transparent hover-white' 
                type='text'> 
              </input>
              <label className="db fw6 lh-copy f6">Password</label>
              <input 
                onChange = {enter=>{this.setState({passwordEntered:enter.target.value})}}
                placeholder="Enter your Password"
                className = 'f4 pa2 w-100 center dim bg-transparent hover-white' 
                type='password'> 
              </input>
              <button 
                className = "b ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6 dib" 
                onClick = {this.register}> 
              Register 
              </button>
            </fieldset>
          </article>
      </div>
    );
  }
}

export default Register;






