/* eslint-disable no-underscore-dangle */
import * as THREE from 'three';
// import { MathUtils as Math} from 'three';
import * as THREEx from '../../../../node_modules/@ar-js-org/ar.js/three.js/build/ar-threex-location-only';
import { PerspectiveCamera } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DeviceOrientationControls } from './location-based/DeviceOrientationControls';
import { LocationBased } from './location-based/LocationBased';

export const isMobile = () => {
  return typeof (navigator as any).standalone !== "undefined";
};

const ARLocation = ({}) => {
  const rootRef = useRef<THREE.Object3D>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  // const meshRef = useRef<THREE.Mesh>();
  const scene = useThree((state) => state.scene);
  const renderer = useThree((state) => state.gl);
  const webcamRef = useRef<any>();
  const orientationControlsRef = useRef<any>();
  const locationControlsRef = useRef<any>();
  const first = useRef(true);
  const [objects, setObjects] = useState<THREE.Object3D[]>([]);
 
  useEffect(() => {
    if (document.querySelector("#arjs-video")) {
      return;
    }

  
    const video = document.createElement('video');
    // video.id = 'arjs-video';
    // video.autoplay = true;
    // video.playsInline = true;
    // video.style.display = 'none';

    video.style.position = "absolute";
    video.style.top = "0px";
    video.style.left = "0px";
    video.style.zIndex = "-2";
    video.setAttribute("id", "arjs-video");

    video.autoplay = true;
    // video.webkitPlaysinline = true;
    video.controls = false;
    video.loop = true;
    video.muted = true;
  
    document.body.appendChild(video);
  }, []);

  const setupObjects = useCallback(
    (longitude, latitude) => {
      const locationControls = locationControlsRef.current;

      if (!locationControls || !rootRef.current) return;

      const geom = new THREE.BoxGeometry(50,50,50);

      // Use position of first GPS update (fake or real)
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const material2 = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      const material3 = new THREE.MeshBasicMaterial({ color: 0x0000ff });
      const material4 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

      // const worldCoords = locationControls.lonLatToWorldCoords(longitude, latitude);

      const mesh = new THREE.Mesh(geom, material);
      const mesh2 = new THREE.Mesh(geom, material2)
      const mesh3 = new THREE.Mesh(geom, material3)
      const mesh4 = new THREE.Mesh(geom, material4)
      mesh.name = 'ar-mesh';
      mesh2.name = 'ar-mesh-2';
      mesh3.name = 'ar-mesh-3';
      mesh4.name = 'ar-mesh-4';

      setObjects([mesh, mesh2, mesh3, mesh4]);
      rootRef.current.add(mesh);
      rootRef.current.add(mesh2);
      rootRef.current.add(mesh3);
      rootRef.current.add(mesh4);

      locationControls.add(mesh, longitude, latitude + 0.001); // slightly north
      locationControls.add(mesh2, longitude, latitude - 0.001); // slightly south
      locationControls.add(mesh3, longitude - 0.001, latitude); // slightly west
      locationControls.add(mesh4, longitude + 0.001, latitude); // slightly east
    },
    [locationControlsRef.current, rootRef.current],
  );

  useEffect(() => {
    const camera = cameraRef.current;
    if (!camera) {
      return;
    }

    const locationControls = new LocationBased(scene, camera, 
      // { gpsMinAccuracy: 30 }
      );

    const cam = new THREEx.WebcamRenderer(renderer, '#arjs-video');

    const mouseStep = THREE.MathUtils.degToRad(5);

    let orientationControls;

    // Orientation controls only work on mobile device
    if (isMobile()) {
      orientationControls = new DeviceOrientationControls(camera);
    }

    const fake: any = null;

    locationControls.on('gpsupdate', (pos) => {
      console.log(`GPS updated: lat=${pos.coords.latitude}, log=${pos.coords.longitude}, alt=${pos.coords.altitude}, acc=${pos.coords.accuracy}, mobile=${isMobile()}`, navigator);

      console.log('xxxxx pos coordd', pos.coords)
      if (first.current) {
        // setupObjects(pos.coords.longitude, pos.coords.latitude);
        setupObjects(-122.34, 47.656);

        first.current = false;
      }
    });

    locationControls.on('gpserror', (code) => {
      alert(`GPS error: code ${code}`);
    });

    // Uncomment to use a fake GPS location
    // fake = { lat: 51.05, lon : -0.72 };
    // if (fake) {
    //   locationControls.fakeGps(fake.lon, fake.lat);
    // } else {
      locationControls.startGps();
    // }

    let mousedown = false;
    let lastX = 0;

    // Mouse events for testing on desktop machine
    if (!isMobile()) {
      window.addEventListener('mousedown', (e) => {
        mousedown = true;
      });

      window.addEventListener('mouseup', (e) => {
        mousedown = false;
      });

      window.addEventListener('mousemove', (e) => {
        if (!mousedown) return;
        if (e.clientX < lastX) {
          camera.rotation.y += mouseStep;
          if (camera.rotation.y < 0) {
            camera.rotation.y += 2 * Math.PI;
          }
        } else if (e.clientX > lastX) {
          camera.rotation.y -= mouseStep;
          if (camera.rotation.y > 2 * Math.PI) {
            camera.rotation.y -= 2 * Math.PI;
          }
        }
        lastX = e.clientX;
      });
    }

    window.addEventListener('resize', resizeUpdate);

    webcamRef.current = cam;
    orientationControlsRef.current = orientationControls;
    locationControlsRef.current = locationControls;

    return () => {
      // webcamRef.current?.dispose();
      // orientationControlsRef.current?.dispose();
      // locationControlsRef.current?.stopGPS();
    };
  }, [cameraRef.current, setupObjects]);

  const resizeUpdate = useCallback(() => {
    const camera = cameraRef.current;
    if (!camera) {
      return;
    }

    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width != canvas.width || height != canvas.height) {
      renderer.setSize(width, height, false);
    }
    camera!.aspect = canvas.clientWidth / canvas.clientHeight;
    camera!.updateProjectionMatrix();
  }, [cameraRef.current, renderer.domElement]);

  useFrame(() => {
    resizeUpdate();
    orientationControlsRef.current?.update();
    webcamRef.current?.update();
    cameraRef.current && renderer.render(scene, cameraRef.current);
  });

  return (
    <group ref={rootRef} name='ar-location'>
      <PerspectiveCamera ref={cameraRef} fov={80} aspect={2} near={0.1} far={50000} />
      {/* {children} */}
    </group>
  );
};

export default ARLocation;
