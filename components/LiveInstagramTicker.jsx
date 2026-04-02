import React, { useEffect, useState } from 'react';

export default function LiveInstagramTicker({ title }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch('/api/live-feed')
      .then(res => res.json())
      .then(data => setItems(data.items || []));
  }, []);

  return (
    <div style={{ position: 'fixed', bottom: 0, width: '100%', background: '#111', color: '#fff', overflowX: 'auto', display: 'flex', gap: '12px', padding: '8px' }}>
      <span style={{ fontWeight: 'bold' }}>{title}</span>
      {items.map((item, i) => (
        <a key={i} href={item.permalink} target="_blank" rel="noreferrer" style={{ color: '#fff' }}>
          <img src={item.media_url} alt="" style={{ height: '60px', borderRadius: '4px' }} />
        </a>
      ))}
    </div>
  );
}
