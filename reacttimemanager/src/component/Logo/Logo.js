import React from 'react';
import Tilt from 'react-tilt';
import './Logo.css';
import clock from './clock.png'


const Logo = () => {
	return(
		<div className='ma4, mt0'>
			<Tilt className="Tilt br2 shadow-2" options={{ max : 50 }} style={{ height: 150, width: 150 }} >
				<div className = 'Tilt-inner'><img style = {{paddingTop: '5px'}} alt = 'Logo' src = {clock}/></div>
			</Tilt>
		</div>
		);
}

export default Logo;