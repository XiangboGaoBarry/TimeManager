import React from 'react';
import './PassDueNoticeWindow.css';

const PassDueNoticeWindow = ({popupDisable, content, passDueEventList}) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <p>{content}</p>
        <ul>
          {passDueEventList.map(function(name, index){
            return <li key={ index }>{name}</li>;
          })}
        </ul>
        <button className = 'w-60 grow f4 link pv2 white bg-light-purple' onClick={popupDisable}>
          Close      
        </button>
      </div>
    </div>
  );
}

export default PassDueNoticeWindow;