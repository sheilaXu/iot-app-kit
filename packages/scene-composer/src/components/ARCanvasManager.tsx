import { Button } from '@awsui/components-react';
import { Canvas } from '@react-three/fiber';
import React, { FC, useContext, useMemo, useState } from 'react';
import { Euler, VideoTexture } from 'three';

import { sceneComposerIdContext } from '../common/sceneComposerIdContext';
import ARCanvas from '../react-three-arjs/ar-canvas';
import ARLocation from '../react-three-arjs/ar-location';
import ARMarker from '../react-three-arjs/ar-marker';

interface ARCanvasManagerProps {}

const locationBasedd = true;
export const videoUrl =
'https://m.media-amazon.com/images/S/vse-vms-transcoding-artifact-us-east-1-prod/v2/6947f8aa-83c9-52e6-9914-80294c5794f4/ShortForm-Generic-480p-16-9-1409173089793-rpcbe5.mp4';

const ARCanvasManager: FC<ARCanvasManagerProps> = ({}) => {
  const sceneComposerId = useContext(sceneComposerIdContext);

  const [video, setVideo] = useState<HTMLVideoElement | undefined>(undefined);

  const texture = useMemo(() => {
    const video = document.createElement('video');

    video.src = videoUrl;
    video.autoplay = false;
    video.muted = true;
    video.crossOrigin = 'Anonymous';
    video.controls = true;

    setVideo(video);
    const texture = new VideoTexture(video);

    return texture;
  }, []);

  const [permission, setPermission] = useState(typeof (navigator as any).standalone === "undefined");

  return (
    permission ?
    (locationBasedd ?
      (
        <>
        {/* <video id='arjs-video'  style={{'display':'none'}}></video> */}
        <Canvas id="ar-canvas-xxxx" style={{backgroundColor: 'black', width:'100%', height:'100%', display:'block'}}>
        <ARLocation />
      </Canvas>
      </>
      )
  :
    (<ARCanvas
      gl={{ antialias: false, powerPreference: 'default', physicallyCorrectLights: true }}
      camera={{ position: [0, 0, 0] }}
      onCreated={({ gl }) => {
        gl.setSize(window.innerWidth, window.innerHeight);
      }}
    >
      {/* <ambientLight />
      <pointLight position={[10, 10, 0]} /> */}
      <ARMarker
        type={'pattern'}
        patternUrl={'src/data/patt.hiro'}
        onMarkerFound={() => {
          console.log('xxxxx Marker found!!');
          // alert(`xxxxx Marker found!! ${video}`);
          video?.play();
        }}
        onMarkerLost={() => {
          console.log('xxxxx Marker lost!!');
          video?.pause();
          return null;
        }}
      >
        <mesh
          rotation={new Euler(-Math.PI / 2)}
          onClick={() => {
            console.log('xxxx CLICKED');
          }}
        >
          <planeGeometry args={[1, 1, 1]} />
          <meshBasicMaterial 
          // color={'green'}
            map={texture}
             />
        </mesh>
      </ARMarker>
    </ARCanvas>))
    : (
      <Button onClick={() => {
        if (!(window.DeviceOrientationEvent as any).requestPermission) {
          setPermission(true);
          return;
        }
        (window.DeviceOrientationEvent as any).requestPermission()
        .then(function (response) {
          if (response == "granted") {
            console.log('xxxx granted')
            setPermission(true);
          }
        })
        .catch(function (error) {
          console.error(
            "THREE.DeviceOrientationControls: Unable to use DeviceOrientation API: ",
            error
          );
        });

      }}>Request orientation permission</Button>
    )
  );
};

export default ARCanvasManager;
