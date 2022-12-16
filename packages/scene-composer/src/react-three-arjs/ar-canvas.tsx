/* eslint-disable indent */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-pascal-case */

import React from 'react';
import { Canvas } from '@react-three/fiber';

import { DEFAULT_CAMERA_POSITION } from '../common/constants';

import { AR } from './ar';
import ARLocation from './ar-location-pure';

const ARCanvas = ({
  arEnabled = true,
  tracking = true,
  children,
  patternRatio = 0.5,
  detectionMode = 'mono_and_matrix',
  cameraParametersUrl = 'src/data/camera_para.dat',
  matrixCodeType = '3x3',
  sourceType = 'webcam',
  onCameraStreamReady = () => null,
  onCameraStreamError = () => null,
  ...props
}) => (
  <canvas id="ar-canvas-xxxx" style={{backgroundColor: 'black', width:'100%', height:'100%', display:'block'}}>
    <video id='arjs-video' autoPlay playsInline style={{'display':'none'}}></video>
    <ARLocation />
  </canvas>

  // <Canvas
  //   className={'ar-canvas-xxxx'}
  //   dpr={window.devicePixelRatio}
  //   style={{ position: 'absolute' }}
  //   camera={arEnabled ? { position: DEFAULT_CAMERA_POSITION } : props.camera}
  //   {...props}
  // >
  //   {/* {arEnabled ? (
  //     <AR
  //       tracking={tracking}
  //       patternRatio={patternRatio}
  //       matrixCodeType={matrixCodeType}
  //       detectionMode={detectionMode}
  //       sourceType={sourceType}
  //       cameraParametersUrl={cameraParametersUrl}
  //       onCameraStreamReady={onCameraStreamReady}
  //       onCameraStreamError={onCameraStreamError}
  //     >
  //       {children}
  //     </AR>
  //   ) : (
  //     children
  //   )} */}
  //   <ARLocation />
  // </Canvas>
);

export default ARCanvas;
