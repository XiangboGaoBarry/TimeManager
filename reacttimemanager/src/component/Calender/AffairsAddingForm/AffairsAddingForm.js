import React from 'react';

const AffairsAddingForm = ({setAffair, setTimeSpan, setUrgenceLevel, setDeadline, setDeadlineDate, setEvent, deleteEvent,CalendarGenerate, setDeleteEvent,deleteAllEvents}) => {
	return(
			<div className='center'>
				<div className = 'pa4 br3 shadow-5'>
					<input onChange = {setAffair} placeholder="Your Affair" className = 'f4 pa2 w-100 center' type='text'/>
					Approximate Time Spend:
					<select onChange = {setTimeSpan} className = 'f4 pa2 w-100 center' name="time">	
						<option value="" hidden>Choose here</option>
						<option type = "number" value= "0.3" name="0.5">0.5h</option>
						<option type = "number" value= "1" name="1">1h</option>
						<option type = "number" value= "1.3" name="1.5">1.5h</option>
						<option type = "number" value= "2" name="2">2h</option>
						<option type = "number" value= "2.3" name="2.5">2.5h</option>
						<option type = "number" value= "3" name="3">3h</option>
						<option type = "number" value= "3.3" name="3.5">3.5h</option>
						<option type = "number" value= "4" name="4">4h</option>
						<option type = "number" value= "4.3" name="4.5">4.5h</option>
						<option type = "number" value= "5" name="5">5h</option>
						<option type = "number" value= "5.3" name="5.5">5.5h</option>
						<option type = "number" value= "6" name="6">6h</option>
						<option type = "number" value= "6.3" name="6.5">6.5h</option>
						<option type = "number" value= "7" name="7">7h</option>
						<option type = "number" value= "7.3" name="7.5">7.5h</option>
						<option type = "number" value= "8" name="8">8</option>
					</select>
					Urgence Level:
					<select onChange = {setUrgenceLevel} className = 'f4 pa2 w-100 center' name="urgence">
						<option type = "number" value= "1" name="1">1</option>
						<option type = "number" value= "2" name="2">2</option>
						<option type = "number" value= "3" name="3">3</option>
						<option type = "number" value= "4" name="4">4</option>
						<option type = "number" value= "5" name="5">5</option>
					</select>
					Deadline:
					<input onChange = {setDeadlineDate} className = 'f4 pa2 w-100 center' type="date" name="deadlineDate"/>
					<input onChange = {setDeadline} className = 'f4 pa2 w-100 center' type="time" name="deadline"/>
					<button className = 'w-60 grow f4 link pv2 white bg-light-purple' onClick = {setEvent}> Enter </button>
					<input onChange = {setDeleteEvent} placeholder="Enter the event you want to delete" className = 'f4 pa2 w-100 center' type='text'/>
					<button className = 'w-60 grow f4 link pv2 white bg-light-purple' onClick = {deleteEvent}> Delete </button>
					<button className = 'w-60 grow f4 link pv2 white bg-light-purple' onClick = {deleteAllEvents}> deleteAllEvents </button>
					<button className = 'w-60 grow f4 link pv2 white bg-light-purple' onClick = {CalendarGenerate}> Generate the Calendar </button>
				</div>
			</div>
		);
}

export default AffairsAddingForm;