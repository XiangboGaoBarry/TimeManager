import React, {Component} from 'react';
import {DayPilot, DayPilotCalendar} from "daypilot-pro-react";
import AffairsAddingForm from './AffairsAddingForm/AffairsAddingForm.js';
import RestingTimeEventsForm from './RestingTimeEventsForm/RestingTimeEventsForm.js';
import FixedTimeEventsForm from './FixedTimeEventsForm/FixedTimeEventsForm.js';
import ModeController from './ModeController/ModeController.js';
import PopupWindow from './PopupWindow/PopupWindow.js';
import Backdrop from './Backdrop/Backdrop.js';
import PassDueNoticeWindow from './PopupWindow/PassDueNoticeWindow/PassDueNoticeWindow.js'

class Calendar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      viewType: "Days",
      days: 14,
      businessBeginsHour: 6,
      businessEndsHour: 23,
      // dayBeginsHour: 0,
      // dayEndsHour: 23,
      startDate: DayPilot.Date.today(),
      cellDuration: 10,
      eventArrangement: "SideBySide",
      allowEventOverlap: false,
      timeRangeSelectedHandling: "Disabled",
      eventDeleteHandling: "Disabled",
      eventMoveHandling: "Disabled",
      eventResizeHandling: "Disabled",
      eventClickHandling: "Disabled",
      eventHoverHandling: "Disabled",
      cellHeight: 10,
      mode:'flexiableEvents',
      popupAble: false,
      popupType: "",
      content: ""
    };
    this.EEvents = []
    this.fixedHours = []
    this.restingHours = []
  }

  componentDidMount() {
    var workingHour = { start: 6, end: 23 }
    var workingHours = []
    for (let i = 0; i < this.state.days; i++)
      workingHours.push(Object.assign({}, workingHour));
    this.setState({ workingHours: workingHours}, 
      () => this.generateTheCal());         
  }

  grabEEventsInfo(){
    console.log("running")
    return fetch('http://localhost:3000/',{
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        username: this.props.username_login,
      })
    })
    .then(response => response.json())
    .then(events => this.setState({
      EEvents:events
    }));
  }

  grabFixedEventsInfo(){
    console.log("running 2")
    return fetch('http://localhost:3000/fixed',{
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        username: this.props.username_login,
      })
    })
    .then(response => response.json())
    .then(fixedEvents => this.setState({
      fixedHours:fixedEvents 
    }));
  }

  grabRestEventsInfo(){
    console.log("running 3")
    return fetch('http://localhost:3000/rest',{
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        username: this.props.username_login,
      })
    })
    .then(response => response.json())
    .then(rests => this.setState({
      restingHours:rests }));
  }
    

  async generateTheCal() {
    await this.grabEEventsInfo();
    await this.grabFixedEventsInfo();
    await this.grabRestEventsInfo();

    this.EEvents = this.state.EEvents
    this.fixedHours = this.state.fixedHours
    this.restingHours = this.state.restingHours

    if (this.EEvents.length < 1 && this.fixedHours.length < 1) return;
    const dateNow = new Date();
    dateNow.setMinutes(this.minutesCelling(dateNow.getMinutes()))
    dateNow.setSeconds(0);

    var sortedEventArray = [];
    const passDeadlineEvents = [];

    this.EEvents.forEach(event => {
      var temporary = new Date(event.deadline)
      if (temporary > dateNow) {
        var timeSpan = Math.floor(this.getTotalMinutesBySpan(event.timespan)/this.state.cellDuration);
        for (var i=0; i<timeSpan; i++) {
          var newEvent = {
            Affair: event.name,
            TimeSpan: event.timespan,
            UrgenceLevel: event.urgencylevel,
            deadline: event.deadline
          }
          sortedEventArray.push(newEvent);
        }
      } else {
        passDeadlineEvents.push({
          Affair: event.name,
          TimeSpan: event.timespan,
          UrgenceLevel: event.urgencylevel,
          deadline: event.deadline
        })
      }
    });
    if (passDeadlineEvents.length>0) {
      var eventNames = []
      passDeadlineEvents.forEach(event => {
        eventNames.push(event.Affair);
        this.deleteFlexiableEvent(event.Affair);
      })
      this.setState({
        popupType: "passDueNoice",
        popupAble: true,
        content: "The following events have passed the deadline and been deleted.",
        passDueEventList: eventNames
      })
    }

    //Sort the Array by their urgenceLevel
    sortedEventArray.sort( function(y,x) { return y.UrgenceLevel-x.UrgenceLevel } );

    var EventsArray = this.generate2DArray(this.state.days, Math.floor(24*60/this.state.cellDuration), {
            Affair: "No Scheduling",
            TimeSpan: this.state.cellDuration,
            UrgenceLevel: 0,
            deadline: ""
          });
    
    this.restingHours.forEach(event => {
      var eventStart = new Date(event.starttime)
      var restStart = eventStart.setMinutes(this.minutesFloor(eventStart.getMinutes()));
      var eventEnd = new Date(event.endtime)
      var restEnd = eventEnd.setMinutes(this.minutesFloor(eventEnd.getMinutes()));
      var dateNowPlusViewDays = new Date(dateNow);
      dateNowPlusViewDays.setDate(dateNowPlusViewDays.getDate()+this.state.days)
      if (eventStart < dateNow || eventStart > dateNowPlusViewDays) return;
      var dayDiff = Math.floor((eventStart - dateNow)/86400000);
      var start = new Date();
      start.setHours(0,0,0,0);
      var startBox = Math.floor((eventStart - start)/1000/60/this.state.cellDuration);
      var endBox = Math.floor((eventEnd - start)/1000/60/this.state.cellDuration);
      for (var i = startBox ; i < endBox ; i++){
        EventsArray[dayDiff][i] = {
          Affair: "Resting",
          TimeSpan: this.state.cellDuration,
          UrgenceLevel: 0,
          deadline: ""
        }
      }
    })

    this.fixedHours.forEach(event => {
      var eventStart = new Date(event.starttime)
      var fixedStart = eventStart.setMinutes(this.minutesFloor(eventStart.getMinutes()));
      var eventEnd = new Date(event.endtime)
      var fixedEnd = eventEnd.setMinutes(this.minutesFloor(eventEnd.getMinutes()));
      var dateNowPlusViewDays = new Date(dateNow);
      dateNowPlusViewDays.setDate(dateNowPlusViewDays.getDate()+this.state.days)
      if (eventStart < dateNow || eventStart > dateNowPlusViewDays) return;
      var dayDiff = Math.floor((eventStart - dateNow)/86400000);
      var start = new Date();
      start.setHours(0,0,0,0);
      var startBox = Math.floor((eventStart - start)/1000/60/this.state.cellDuration);
      var endBox = Math.floor((eventEnd - start)/1000/60/this.state.cellDuration);
      for (var i = startBox ; i < endBox ; i++){
        EventsArray[dayDiff][i] = {
          Affair: "fixed",
          TimeSpan: this.state.cellDuration,
          UrgenceLevel: 0,
          deadline: ""
        }
      }
    })   
    console.log(this.fixedHours)
    console.log(EventsArray)

    for(var i = 0 ; i < EventsArray.length ; i++){
      for (var j = this.state.workingHours[i].start*60/this.state.cellDuration ; j < this.state.workingHours[i].end*60/this.state.cellDuration ; j++){
        if (i > 0 || j >= this.toMinutes(dateNow.getHours(),dateNow.getMinutes())/this.state.cellDuration)
          if(EventsArray[i][j].Affair !== "Resting" && EventsArray[i][j].Affair !== "fixed"){
            var poppedEvent = sortedEventArray.pop();
            if (poppedEvent) EventsArray[i][j] = poppedEvent; else break;
          }
      }
    }


    var tempDate = new Date();
    tempDate.setSeconds(0);
    tempDate.setMinutes(0);
    tempDate.setHours(0);

    var newEventsArray = [];
    for (let i = 0; i < EventsArray.length ; i++){
      var hasStart = false;
      for (let j = 0; j < EventsArray[0].length ; j++) {
        var event = EventsArray[i][j];
        if(event.Affair === "Resting" || event.Affair === "No Scheduling" || event.Affair === "fixed")
          tempDate.setMinutes(tempDate.getMinutes()+this.state.cellDuration)
        else {
          if(!hasStart){ 
            hasStart = true; 
            var startTime = new Date(tempDate);
          }
          tempDate.setMinutes(tempDate.getMinutes() + this.state.cellDuration)
          if(EventsArray[i][j+1].Affair !== EventsArray[i][j].Affair || tempDate.getHours() >= this.state.workingHours.end){
            hasStart = false;
            var endTime = new Date(tempDate);
            var newEvent = {
              text: EventsArray[i][j].Affair,
              start: this.dateToDaypilot(startTime),
              end: this.dateToDaypilot(endTime)
              }
            newEventsArray = newEventsArray.concat(newEvent);
          }
        }
      }
      tempDate.setDate(tempDate.getDate()+1);
      tempDate.setHours(0);
      tempDate.setMinutes(0);
    }
    this.setState({
      events:newEventsArray
    })
  }



  minutesFloor(minutes) { return Math.floor(minutes/this.state.cellDuration)*this.state.cellDuration; }

  minutesCelling(minutes){
    return (minutes/this.state.cellDuration === Math.floor(minutes/this.state.cellDuration)) 
      ? Math.floor(minutes/this.state.cellDuration)*this.state.cellDuration
      : Math.floor(minutes/this.state.cellDuration)*this.state.cellDuration + this.state.cellDuration;
  }

  // array[col][row]
  generate2DArray(col, row, defaultNum){
    var temp = []
    for(var i = 0 ; i < col ; i++){
      var temp2 = []
      for (var j = 0 ; j <row ; j++){
        temp2.push(defaultNum);
      }
      temp.push(temp2);
    }
    return temp;
  }

  toMinutes(hours, minutes) { return hours*60 + minutes; }

  getTotalMinutesBySpan(span){
    var hours = Math.floor(span);
    return (span - hours) * 100 + 60 * hours;
  }

  dateToDaypilot(date) {
    var y = '' + date.getFullYear(),
        m = '' + (date.getMonth() + 1),
        d = '' + date.getDate(),
        h = '' + date.getHours(),
        min = '' + date.getMinutes(),
        s = '' + date.getSeconds();
    m = m.length >= 2 ? m : 0+m;
    d = d.length >= 2 ? d : 0+d;
    h = h.length >= 2 ? h : 0+h;
    min = min.length >= 2 ? min : 0+min;
    s = s.length >= 2 ? s : 0+s;
    return [[y,m,d].join('-'),[h,min,s].join(':')].join('T');
  }

  parseDate(date, time) {
    var dates = date.split(/\D/);
    var times = time.split(":");
    return new Date(Number(dates[0]), Number(dates[1])-1, Number(dates[2]), Number(times[0]), Number(times[1]));
  }

  setFlexiableEvent(){
    var failCase = '';
    if (this.state.Affair==='') failCase = "Event";
    else if (this.state.DeadlineDate==='') failCase = "Deadline Date";
    else if (this.state.Deadline==='') failCase = "Deadline";
    else if (this.state.TimeSpan===0) failCase = "Time Span";
    else if (this.state.UrgenceLevel===0) failCase = "Urgence Level";
    else {
      var popupType = '';
      fetch('http://localhost:3000/enter', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        name: this.state.Affair,
        timespan: Number(this.state.TimeSpan),
        urgencylevel: Number(this.state.UrgenceLevel),
        deadline: this.parseDate(this.state.DeadlineDate, this.state.Deadline),
        username: this.props.username_login
        })
      })
      .then( res => {
        console.log(res.status)
        popupType = res.status===400?"Operation Failed":"Operation Succeed"
        return res.json()
      })
      .then( message => this.setState({
        content: message,
        popupAble: true,
        popupType: popupType
      }))

      return fetch('http://localhost:3000/',{
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          username: this.props.username_login,
        })
      })
      .then(response => response.json())
      .then(data => {
        this.setState({EEvents: data}, () => {
          this.generateTheCal();
        });
      });
    }
    this.setState({
      content: `Unable to Enter!\nPlease Enter the ${failCase}`,
      popupAble: true,
      popupType: "Operation Failed"
    })
  }

  setFixedEvent(){
    const dateNow = new Date();
    if (this.parseDate(this.state.eventStartDate, this.state.eventStartTime) < dateNow) {
      this.setState({
        content: "Unable to Enter!\nThe Event Starts Before the Current Time",
        popupAble: true,
        popupType: "Operation Failed"
      })
      return;
    }
    var failCase = '';
    if (this.state.Affair==='') failCase = "Event";
    else if (this.state.eventStartDate==='') failCase = "Start Date";
    else if (this.state.eventStartTime==='') failCase = "Start Time";
    else if (this.state.TimeSpan===0) failCase = "Time Span";
    else {
      var popupType = '';
      var eventStart = new Date(this.parseDate(this.state.eventStartDate, this.state.eventStartTime));
      var eventEnd = new Date(eventStart);
      eventEnd.setMinutes(eventEnd.getMinutes()+this.getTotalMinutesBySpan(Number(this.state.TimeSpan)));
      if (eventStart.getDate() === eventEnd.getDate()){
        fetch('http://localhost:3000/fixedEnter', {
          method: 'post',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            name: this.state.Affair,
            starttime: eventStart,
            endtime: eventEnd,
            username: this.props.username_login
          })
        })
        .then( res => {
          popupType = res.status===400?"Operation Failed":"Operation Succeed"
          console.log("innn")
          console.log(popupType)
          return res.json()
        })
        .then( message => this.setState({
          popupType: popupType,
          content: message,
          popupAble: true
        }))
      } 
      else {
        var middle = new Date(eventEnd);
        middle.setHours(0);
        fetch('http://localhost:3000/fixedEnter', {
          method: 'post',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            name: this.state.Affair,
            starttime: eventStart,
            endtime: middle,
            username: this.props.username_login
          })
        })
        .then( res => {
          popupType = res.status===400?"Operation Failed":"Operation Succeed"
          return res.json();
        })
        .then( message => this.setState({
          content: message,
          popupAble: true,
          popupType: popupType
        }))

        return fetch('http://localhost:3000/fixedEnter', {
          method: 'post',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            name: this.state.Affair,
            starttime: middle,
            endtime: eventEnd,
            username: this.props.username_login
          })
        })
        .then( res => {
          popupType = res.status===400?"Operation Failed":"Operation Succeed"
          return res.json()
        })
        .then( message => this.setState({
          content: message,
          popupAble: true,
          popupType: popupType
        }))
      }
    }
    console.log("filaisdjsia")
    this.setState({
      content: `Unable to Enter!\nPlease Enter the  ${failCase}`,
      popupAble: true,
      popupType: "Operation Failed"
    })
  }

  setRestingEvent(){
    const dateNow = new Date();
    if (this.parseDate(this.state.eventStartDate, this.state.eventStartTime) < dateNow) {
      this.setState({
        content: "Unable to Enter!\nThe Event Starts Before the Current Time",
        popupAble: true,
        popupType: "Operation Failed"
      })
      return;
    }
    var failCase = '';
    if (this.state.Affair==='') failCase = "Event";
    else if (this.state.eventStartDate==='') failCase = "Start Date";
    else if (this.state.eventStartTime==='') failCase = "Start Time";
    else if (this.state.TimeSpan===0) failCase = "Time Span";
    else {
      var popupType = '';
      var eventStart = this.parseDate(this.state.eventStartDate, this.state.eventStartTime);
      var eventEnd = new Date(eventStart);
      eventEnd.setMinutes(eventEnd.getMinutes()+this.getTotalMinutesBySpan(Number(this.state.TimeSpan)));
      if (eventStart.getDate() === eventEnd.getDate()){
        fetch('http://localhost:3000/restEnter', {
          method: 'post',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            name: this.state.Affair,
            starttime: eventStart,
            endtime: eventEnd,
            username: this.props.username_login
          })
        })
        .then( res => {
          popupType = res.status===400?"Operation Failed":"Operation Succeed"
          return res.json()
        })
        .then( message => this.setState({
          content: message,
          popupAble: true,
          popupType: popupType
        }))
      } else {
        var middle = new Date(eventEnd);
        middle.setHours(0);
        fetch('http://localhost:3000/restEnter', {
          method: 'post',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            name: this.state.Affair,
            starttime: eventStart,
            endtime: middle,
            username: this.props.username_login
          })
        })
        .then( res => {
          popupType = res.status===400?"Operation Failed":"Operation Succeed"
          return res.json()
        })
        .then( message => this.setState({
          content: message,
          popupAble: true,
          popupType: popupType
        }))

        fetch('http://localhost:3000/restEnter', {
          method: 'post',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            name: this.state.Affair,
            starttime: middle,
            endtime: eventEnd,
            username: this.props.username_login
          })
        })
        .then( res => {
          popupType = res.status===400?"Operation Failed":"Operation Succeed"
          return res.json()
        })
        .then( message => this.setState({
          content: message,
          popupAble: true,
          popupType: popupType
        }))
      }
    }
    
    this.setState({
      content: `Unable to Enter!\nPlease Enter the  ${failCase}`,
      popupAble: true,
      popupType: "Operation Failed"
    })
  }

  deleteFlexiableEvent(readyToDelete=""){
    console.log(readyToDelete)
    console.log(this.props.username_login)
    return fetch('http://localhost:3000/delete', {
      method: 'delete',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        DeleteEvent:readyToDelete?readyToDelete:this.state.readyToDelete,
        username: this.props.username_login

      })
    })
  }

  deleteFixedEvent(readyToDelete=""){
    return fetch('http://localhost:3000/fixedDelete', {
      method: 'delete',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        DeleteEvent:readyToDelete?readyToDelete:this.state.readyToDelete,
        username: this.props.username_login
      })
    })
  }

  deleteRestingEvent(readyToDelete=""){
    return fetch('http://localhost:3000/restDelete', {
      method: 'delete',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        DeleteEvent:readyToDelete?readyToDelete:this.state.readyToDelete,
        username: this.props.username_login
      })
    })
  }

  deleteAllFlexiableEvent(){
    return fetch('http://localhost:3000/deleteAll', {
      method: 'delete',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        username: this.props.username_login
      })
    })
  }

  deleteAllFixedEvent(){
    return fetch('http://localhost:3000/fixedDeleteAll', {
      method: 'delete',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        username: this.props.username_login
      })
    })
  }

  deleteAllRestingEvent(){
    return fetch('http://localhost:3000/restDeleteAll', {
      method: 'delete',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        username: this.props.username_login
      })
    })
  }

  UpdateModalFromPromise(promise){
    promise.then( res => res.json())
    .then( message => this.setState({
      content: message,
      popupAble: true
    }))
  }


  setAffair = (Affair) => { this.setState({Affair:Affair.target.value}) }
  setDeadline = (Deadline) => { this.setState({Deadline:Deadline.target.value}) }
  setDeadlineDate = (DeadlineDate) => { this.setState({DeadlineDate:DeadlineDate.target.value}) }
  setDeleteEvent = (event) => { this.setState({readyToDelete: event.target.value }) }
  setStartDate = (date) => { this.setState({eventStartDate:date.target.value }) }
  setStartTime = (time) => { this.setState({eventStartTime:time.target.value }) }
  setTimeSpan = (TimeSpan) => { this.setState({TimeSpan:TimeSpan.target.value}) }
  setUrgenceLevel = (UrgenceLevel) => { this.setState({UrgenceLevel:UrgenceLevel.target.value}) }

  setEvent = () => {
    if(this.state.mode === 'flexiableEvents') this.setFlexiableEvent();
    else if (this.state.mode === 'fixedEvents') this.setFixedEvent();
    else this.setRestingEvent();
  }

  deleteEvent = () => {
    if (this.state.readyToDelete==='') {
      this.setState({
        content: "Please Enter The Event",
        popupAble: true
      })
    } else {
      var promise = '';
      if(this.state.mode === 'flexiableEvents') promise = this.deleteFlexiableEvent();
      else if (this.state.mode === 'fixedEvents') promise = this.deleteFixedEvent();
      else promise = this.deleteRestingEvent();
      this.UpdateModalFromPromise(promise);
    }
  }

//TODO: Create a Comfirmation of Delete All Events
  deleteAllEvents = () => {
    var promise = '';
    if(this.state.mode === 'flexiableEvents') promise = this.deleteAllFlexiableEvent();
    else if (this.state.mode === 'fixedEvents') promise = this.deleteAllFixedEvent();
    else promise = this.deleteAllRestingEvent();
    this.UpdateModalFromPromise(promise);
  }

  CalendarGenerate = () => {
    fetch('http://localhost:3000/',{
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        username: this.props.username_login,
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log(data)
      this.setState({EEvents: data})
    });

    fetch('http://localhost:3000/fixed',{
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        username: this.props.username_login,
      })
    })
    .then(response => response.json())
    .then(data => {this.setState({fixedHours: data})});

    fetch('http://localhost:3000/rest',{
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        username: this.props.username_login,
      })
    })
    .then(response => response.json())
    .then(data => {this.setState({restingHours: data})});
    this.generateTheCal();
  }

  changeMode = (event) => {
    this.setState({
      mode: event.target.value,
      Affair: "",
      Deadline: "",
      DeadlineDate: "",
      readyToDelete: "",
      eventStartDate: "",
      eventStartTime: "",
      TimeSpan: 0,
      UrgenceLevel: 0
    })
  }

  popupDisable = () => {
    this.setState({
      popupAble: false
    })
  }



  render() {
    var {...config} = this.state;
    return (
      <div>
      <ModeController 
        changeMode = {this.changeMode}
        modeController = {this.state.modeController}
        />
      {this.state.mode === 'flexiableEvents' 
        ?
        <AffairsAddingForm 
          setEvent = {this.setEvent} 
          deleteEvent={this.deleteEvent}
          setAffair = {this.setAffair}
          setTimeSpan = {this.setTimeSpan}
          setUrgenceLevel = {this.setUrgenceLevel}
          setDeadlineDate = {this.setDeadlineDate}
          setDeadline = {this.setDeadline}
          CalendarGenerate = {this.CalendarGenerate}
          setDeleteEvent = {this.setDeleteEvent}
          deleteAllEvents = {this.deleteAllEvents}
          />
        :
        this.state.mode === 'fixedEvents'
          ?
          <FixedTimeEventsForm 
            setEvent = {this.setEvent} 
            deleteEvent={this.deleteEvent}
            setAffair = {this.setAffair}
            setStartDate = {this.setStartDate}
            setStartTime = {this.setStartTime}
            setTimeSpan = {this.setTimeSpan}
            CalendarGenerate = {this.CalendarGenerate}
            setDeleteEvent = {this.setDeleteEvent}
            deleteAllEvents = {this.deleteAllEvents}
            />
          :
          <RestingTimeEventsForm 
            setEvent = {this.setEvent} 
            deleteEvent={this.deleteEvent}
            setAffair = {this.setAffair}
            setStartDate = {this.setStartDate}
            setStartTime = {this.setStartTime}
            setTimeSpan = {this.setTimeSpan}
            CalendarGenerate = {this.CalendarGenerate}
            setDeleteEvent = {this.setDeleteEvent}
            deleteAllEvents = {this.deleteAllEvents}
            />
      }
        {this.state.popupAble && <Backdrop/>}
        {
          this.state.popupAble
          && (this.state.popupType==="Operation Failed"
            ?<PopupWindow
              popupDisable = {this.popupDisable}
              content = {this.state.content}
              />
            :this.state.popupType==="Operation Succeed"
              ?<PopupWindow
                popupDisable = {this.popupDisable}
                content = {this.state.content}
              />
              : 
              <PassDueNoticeWindow
                popupDisable = {this.popupDisable}
                content = {this.state.content}
                passDueEventList = {this.state.passDueEventList}
              />)
            }
        <DayPilotCalendar
          {...config}
          ref={component => {
            this.calendar = component && component.control;
          }}
        />
      </div>
    );
  }
}

export default Calendar;
