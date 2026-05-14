import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { homeColours as homeColoursApi } from '../../api/endpoints';

export default function FavouriteColour() {
  const [colours, setColours] = useState([]);

  useEffect(() => {
    homeColoursApi
      .list({ active: 'true' })
      .then(setColours)
      .catch(() => setColours([]));
  }, []);

  if (!colours.length) return null;

  return (
    <section className="colours-section">
      <div className="container">
        <h2 className="fnp-heading">
          <Sparkles size={18} strokeWidth={2} /> Choose a Favourite Colour <Sparkles size={18} strokeWidth={2} />
        </h2>
        <div className="colours-grid">
          {colours.map((c) => (
            <Link
              key={c.id}
              to={`/flowers?color=${encodeURIComponent(c.name)}`}
              className="colour-item"
            >
              <div className="colour-img-wrap">
                {c.image
                  ? <img src={c.image} alt={c.name} />
                  : <div style={{ width: '100%', height: '100%', background: c.swatch || '#eee', borderRadius: '50%' }} />}
              </div>
              <span>{c.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
