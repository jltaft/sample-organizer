import React, { useEffect, useState } from 'react';
import { Spectrogram } from './Spectrogram';

type Features = {
  spectrogram: number[][];
  mfcc: number[][];
  spectral_features: number[];
  sample_rate: number;
};

export default function App() {
  const [features, setFeatures] = useState<Features | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/features.json')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setFeatures)
      .catch(err => setError(String(err)));
  }, []);

  if (error) return <div style={{ padding: 20 }}>Error loading features.json: {error}</div>;
  if (!features) return <div style={{ padding: 20 }}>Loading…</div>;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '1rem' }}>
      <h1 style={{ marginTop: 0 }}>Mel Spectrogram</h1>
      <Spectrogram data={features.spectrogram} size={600} />
    </div>
  );
}

