import React from "react";

const ModeController = ({changeMode,modeController}) => {     //这里的destructor(忘了是不是这个单词了),即使没有在前面出现过也不会报错，但是无法实现功能，在boolean条件下默认为false， 所以可能是个empty string
	return(
		<div style={{display: 'flex', justifyContent: 'flex-end'}}>
			<select onChange = {changeMode} name="time">
				<option type = "text" value= "flexiableEvents" name="flexiableEvents">Flexiable Events</option>
				<option type = "text" value= "fixedEvents" name="fixedEvents">Fixed Events</option>
				<option type = "text" value= "rest" name="rest">Resting Time</option>
			</select>
		</div>
		);
}

export default ModeController;