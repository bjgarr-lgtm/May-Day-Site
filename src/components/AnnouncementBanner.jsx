import React from 'react';
export default function AnnouncementBanner({ text }) {
  if (!text) return null;
  return (
    <div style={{background:'#e3a7a5',color:'#264636',padding:'10px',textAlign:'center',fontWeight:'bold'}}>
      {text}
    </div>
  );
}
