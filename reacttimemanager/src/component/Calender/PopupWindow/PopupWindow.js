import React from 'react';
import './Popupwindow.css';

const PopupWindow = ({popupDisable, content}) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <p>{content}</p>
        <button className = 'w-60 grow f4 link pv2 white bg-light-purple' onClick={popupDisable}>
          Close      
        </button>
      </div>
    </div>
  );
}

export default PopupWindow;