## Features we extract with librosa and what they mean

### Spectrogram and spectral features

*librosa* creates a mel-scaled spectrogram from the audio files we feed it.

Spectrograms are visual representations of frequency over time. The y-axis of a spectrogram represents frequency in hertz. The x-axis of a spectrogram represents time (in samples as *librosa* polls the audio files at a constant, user-defined rate).

The spectrogram *librosa* creates is mel-scaled, meaning that it compresses the higher frequencies as humans can't hear them.

From a spectrogram we can derive informational datapoints that give us clues about the qualities of a given sound.

These spectral features are:

- **spectral centroid**, basically the center of frequencies in a spectrogram, think brightness of a sound.

A kick would have a lower spectral centroid and a hi hat would have a higher spectral centroid.

- **spectral bandwidth**, the amount of spread around the centroid (or width around a centroid), think timbre of a sound.

A rattling snare drum would presumably have a greater spectral bandwidth than a bassy, four-on-the-floor kick.

- **spectral contrast**, the difference between the strongest frequencies and the weakest frequencies.

A piano chord would have high spectral contrast (high frequency peaks at each note played in the chord, quiet frequency valleys between them). White noise would have low spectral contrast (even frequency power across the entire range).

- **spectral flatness**, similar to spectral contrast, shows how flat a spectrogram is.

Spectral flatness is useful for determining whether a sound is tonal or not.

### Other features we collect

- **rms**, the loudness of a sound
- **mfcc**, mel-frequency cepstral coefficients, based on mel-spectrogram, tells us about the timbre, to be honest don't really know what this represents exactly
- **zcr**, zero crossing rate, represents how often the waveform crosses zero, higher zcr means more chaos/noise, lower zcr means smoother sound

## chromagram

The chromagram is like a spectrogram but instead of frequency over time, it's pitches over time. The chromagram separates frequencies into musical notes (A, B, C, C#, etc...).

Not very useful for drum classification rn, but probably useful if we want to expand the scope to instruments/genre/key recognition.

Ex: we can determine instrument of a sample based on the notes it's playing (different classical instruments have a different range of notes and octaves they can play).

