'use client';

import { Box, keyframes } from '@mui/material';

const descend = keyframes`
  0%   { transform: translateY(-10px); opacity: 0; }
  8%   { opacity: 1; }
  78%  { transform: translateY(210px); opacity: 1; }
  91%  { transform: translateY(210px); opacity: 0; }
  100% { transform: translateY(-10px); opacity: 0; }
`;

const riseUp = keyframes`
  0%   { transform: translateY(0); opacity: 0.6; }
  100% { transform: translateY(-80px); opacity: 0; }
`;

const dot = keyframes`
  0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
  40%           { opacity: 1;   transform: scale(1); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const depthPulse = keyframes`
  0%, 100% { opacity: 0.25; }
  50%      { opacity: 0.55; }
`;

/*
  Exact diver silhouette extracted from the Blue Mind Freediving logo PDF.
  Path: vector path 32, fill #0d396d, transform matrix(1,0,0,-1,584.9927,295.49354)
  viewBox 578.46 206.51 591.28 129.40 (page coordinates after transform)

  The SVG is rendered at its natural horizontal aspect ratio (4.57:1),
  then rotated 90° clockwise via CSS so the diver is vertical — head down,
  fins up — descending along the freediving rope.
*/
const DIVER_PATH =
  'M0 0C0 0 24.757 13.789 37.292 14.729 49.828 15.669 65.497 18.489 71.451 18.489 77.405 18.489 94.014 15.982 109.37 20.056 124.726 24.13 133.814 26.011 139.768 26.011 139.768 26.011 143.215 29.458 152.617 27.578 162.018 25.697 164.525 23.19 177.06 22.877 189.596 22.563 207.772 19.116 211.846 20.056 215.92 20.997 219.68 22.877 222.814 22.877 225.948 22.877 231.902 26.637 238.17 30.085 244.437 33.532 250.392 35.412 259.166 33.845 267.941 32.278 273.268 30.398 276.716 30.711 280.163 31.025 290.504 34.785 302.099 36.666 313.695 38.546 321.216 37.292 335.005 46.38 348.793 55.468 358.508 61.423 368.223 62.363 377.938 63.303 399.874 67.69 403.322 73.018 406.769 78.345 409.903 82.733 414.917 82.419 419.931 82.106 448.449 80.852 448.449 80.852 448.449 80.852 456.283 78.345 463.491 81.166 470.699 83.986 493.262 83.046 519.586 65.183 545.91 47.321 574.741 19.43 574.741 19.43 574.741 19.43 579.755 13.285 570.981 16.827 562.206 20.37 557.192 20.179 558.445 16.827 559.699 13.475 551.551 16.609 543.716 24.13 535.882 31.651 505.797 59.856 483.234 63.616 460.67 67.377 467.565 69.257 457.85 65.183 448.135 61.109 439.36 61.109 432.153 59.856 424.945 58.602 413.036 58.602 407.709 56.409 402.381 54.215 362.582 36.666 354.434 31.965 346.286 27.264 344.093 25.07 341.586 22.25 339.078 19.43 312.441 4.387 312.441 4.387 312.441 4.387 322.783-1.254 329.99 0 337.198 1.253 355.061 1.253 362.269-2.507 369.476-6.268 389.533-12.535 391.1-12.535 392.667-12.535 395.487-3.447 402.381-6.581 409.276-9.715 412.41-15.982 430.899-18.49 449.389-20.997 455.343-20.997 471.012-13.162 486.681-5.328 515.826 15.982 524.914 27.578 524.914 27.578 530.868 31.651 529.301 27.891 527.734 24.13 532.562 26.684 536.509 26.951 540.455 27.217 539.956 25.384 532.435 18.489 524.914 11.595 500.47-12.37 476.966-19.974 453.463-27.578 453.149-23.504 442.494-29.458 431.839-35.412 419.304-34.472 409.276-31.338 399.248-28.204 393.92-24.757 378.251-23.504 362.582-22.25 349.733-21.937 342.526-20.683 335.318-19.43 329.364-19.43 317.455-20.997 305.547-22.563 280.476-21.623 261.673-18.803 261.673-18.803 255.406-20.683 251.645-18.49 247.885-16.296 244.437-17.549 236.289-19.743 228.142-21.937 213.413-30.398 191.789-27.578 170.166-24.757 165.779-24.444 158.884-21.31 151.99-18.176 149.796-16.296 149.796-16.296 149.796-16.296 139.768-20.37 134.127-18.803 134.127-18.803 132.759-22.84 129.138-23.692 125.516-24.544 124.451-26.035 121.042-26.035L119.764-28.379C119.764-28.379 115.291-27.101 112.734-24.118 112.734-24.118 107.834-24.331 103.361-23.053 103.361-23.053 89.087-21.988 87.17-5.371 87.17-5.371 75.879-4.519 62.032-4.306 48.185-4.093 36.255-2.815 36.255-2.815 36.255-2.815 36.681-2.602 31.142-4.945 25.603-7.288 19.425-4.306 16.443-4.306 13.46-4.306-1.53-6.772 0 0';

function DiverSVG() {
  return (
    /*
      Natural size: 240×53 px (aspect ratio matches viewBox 591.28:129.40).
      Rotated 90° CW → appears 53 wide × 240 tall inside the animation container.
    */
    <Box
      component="svg"
      viewBox="578.46 206.51 591.28 129.40"
      sx={{
        position: 'absolute',
        width: 170,
        height: 38,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(90deg) scaleX(-1)',
        overflow: 'visible',
      }}
    >
      <path
        transform="matrix(1,0,0,-1,584.9927,295.49354)"
        d={DIVER_PATH}
        fill="#90d5ff"
      />
    </Box>
  );
}

const DEPTHS = ['5m', '10m', '20m', '30m', '40m', '50m'];

export default function DiverLoader({ message = 'Exploring dive sites' }: { message?: string }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        width: '100%',
        background: 'linear-gradient(180deg, #00111f 0%, #002040 40%, #003f80 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Depth layer bands */}
      {[0, 25, 50, 75].map((top, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            top: `${top}%`,
            left: 0,
            right: 0,
            height: '25%',
            borderTop: '1px solid rgba(79,195,247,0.04)',
            background: `rgba(0,${18 + i * 6},${38 + i * 12},${0.05 + i * 0.02})`,
          }}
        />
      ))}

      {/* Rope + diver scene */}
      <Box
        sx={{
          position: 'relative',
          width: 160,
          height: 320,
          animation: `${fadeUp} 0.5s ease both`,
        }}
      >
        {/* Freediving rope */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: 2,
            transform: 'translateX(-50%)',
            background:
              'linear-gradient(to bottom, rgba(144,213,255,0.75) 0%, rgba(144,213,255,0.08) 100%)',
            borderRadius: 1,
          }}
        />

        {/* Buoy at top */}
        <Box
          sx={{
            position: 'absolute',
            top: -8,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 14,
            height: 14,
            borderRadius: '50%',
            bgcolor: 'rgba(144,213,255,0.55)',
            boxShadow: '0 0 10px rgba(144,213,255,0.35)',
          }}
        />

        {/* Depth markers */}
        {DEPTHS.map((d, i) => (
          <Box
            key={d}
            sx={{
              position: 'absolute',
              top: `${6 + i * 16}%`,
              left: '50%',
              display: 'flex',
              alignItems: 'center',
              animation: `${depthPulse} 3s ease-in-out infinite`,
              animationDelay: `${i * 0.18}s`,
            }}
          >
            <Box sx={{ width: 8, height: 1, bgcolor: 'rgba(144,213,255,0.45)', transform: 'translateX(-20px)' }} />
            <Box
              component="span"
              sx={{
                color: 'rgba(144,213,255,0.5)',
                fontSize: '0.6rem',
                fontFamily: 'monospace',
                transform: 'translateX(-18px)',
                letterSpacing: '0.04em',
              }}
            >
              {d}
            </Box>
          </Box>
        ))}

        {/* Animated diver + bubbles */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 38,
            height: 170,
            animation: `${descend} 4.8s ease-in-out infinite`,
            filter: 'drop-shadow(0 4px 16px rgba(0,130,255,0.5))',
          }}
        >
          {/* Bubbles rising from fins (top of rotated diver) */}
          {[
            { left: -6,  delay: '0s',    size: 5 },
            { left:  8,  delay: '0.65s', size: 3.5 },
            { left: -1,  delay: '1.3s',  size: 4.5 },
            { left:  12, delay: '1.9s',  size: 3 },
            { left: -10, delay: '2.5s',  size: 4 },
          ].map((b, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                top: 4,
                left: `calc(50% + ${b.left}px)`,
                width: b.size,
                height: b.size,
                borderRadius: '50%',
                border: '1.5px solid rgba(144,213,255,0.55)',
                background: 'rgba(144,213,255,0.08)',
                animation: `${riseUp} 2s ease-in infinite`,
                animationDelay: b.delay,
              }}
            />
          ))}

          <DiverSVG />
        </Box>
      </Box>

      {/* Loading text */}
      <Box
        sx={{
          mt: 3.5,
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          animation: `${fadeUp} 0.7s ease 0.25s both`,
        }}
      >
        <Box
          component="span"
          sx={{
            color: 'rgba(144,213,255,0.82)',
            fontSize: '0.85rem',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-montserrat, sans-serif)',
          }}
        >
          {message}
        </Box>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            component="span"
            sx={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              bgcolor: 'rgba(144,213,255,0.7)',
              display: 'inline-block',
              animation: `${dot} 1.4s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
