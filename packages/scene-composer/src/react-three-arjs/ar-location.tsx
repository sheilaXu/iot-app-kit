/* eslint-disable no-underscore-dangle */
import {
  LocationBased,
  WebcamRenderer,
  DeviceOrientationControls,
} from '@ar-js-org/ar.js/three.js/build/ar-threex-location-only';
import { PerspectiveCamera } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const isMobile = () => {
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    // true for mobile device
    return true;
  }
  return false;
};

const ARLocation = ({}) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const meshRef = useRef<THREE.Mesh>();
  const scene = useThree((state) => state.scene);
  const renderer = useThree((state) => state.gl);
  const webcamRef = useRef<any>();
  const orientationControlsRef = useRef<any>();
  const locationControlsRef = useRef<any>();
  const first = useRef(true);

  useEffect(() => {
    const video = document.createElement('video');
    video.id = 'arjs-video';
    video.autoplay = true;
    video.playsInline = true;
    video.style.display = 'none';
    document.body.appendChild(video);
  }, []);

  const setupObjects = useCallback(
    (longitude, latitude) => {
      const locationControls = locationControlsRef.current;

      if (!locationControls || !meshRef.current) return;

      const geom = new THREE.BoxGeometry(4000, 4000, 4000);
      console.log('xxxxx log lat', longitude, latitude, geom);

      // Use position of first GPS update (fake or real)
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const material2 = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      const material3 = new THREE.MeshBasicMaterial({ color: 0x0000ff });
      const material4 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

      const worldCoords = locationControls.lonLatToWorldCoords(longitude, latitude);

      const mesh1 = new THREE.Mesh(geom, material)

      // mesh1.position.x = worldCoords[0];
      // mesh1.position.z = worldCoords[2];
      // scene.add(mesh1)


      locationControls.add(mesh1, longitude, latitude); // slightly north
      locationControls.add(new THREE.Mesh(geom, material2), longitude, latitude - 0.001); // slightly south
      locationControls.add(new THREE.Mesh(geom, material3), longitude - 0.001, latitude); // slightly west
      locationControls.add(new THREE.Mesh(geom, material4), longitude + 0.001, latitude); // slightly east

      const pos = new THREE.Vector3();
      meshRef.current.getWorldPosition(pos);
      console.log('xxxxx mesh', worldCoords, pos);

    },
    [locationControlsRef.current, meshRef.current],
  );

  useEffect(() => {
    const camera = cameraRef.current;
    if (!camera) {
      return;
    }

    const locationControls = new LocationBased(scene, camera, { gpsMinAccuracy: 30 });

    const cam = new WebcamRenderer(renderer, '#arjs-video');

    const mouseStep = THREE.MathUtils.degToRad(5);

    let orientationControls;

    // Orientation controls only work on mobile device
    if (isMobile()) {
      orientationControls = new DeviceOrientationControls(camera);
    }

    const fake: any = null;

    locationControls.on('gpsupdate', (pos) => {
      console.log('xxxx GPS', pos.coords);
      if (first.current) {
        setupObjects(pos.coords.longitude, pos.coords.latitude);
        first.current = false;
      }
    });

    locationControls.on('gpserror', (code) => {
      alert(`GPS error: code ${code}`);
    });

    // Uncomment to use a fake GPS location
    // fake = { lat: 51.05, lon : -0.72 };
    if (fake) {
      locationControls.fakeGps(fake.lon, fake.lat);
    } else {
      locationControls.startGps();
    }

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

    // function render(time) {
    //     resizeUpdate();
    //     if(orientationControls) orientationControls.update();
    //     cam.update();
    //     // renderer.render(scene, camera);
    //     requestAnimationFrame(render);
    // }

    function resizeUpdate() {
      const canvas = renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width != canvas.width || height != canvas.height) {
        renderer.setSize(width, height, false);
      }
      camera!.aspect = canvas.clientWidth / canvas.clientHeight;
      camera!.updateProjectionMatrix();
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

  useFrame(() => {
    orientationControlsRef.current?.update();
    webcamRef.current?.update();
  });

  return (
    <group>
      <PerspectiveCamera ref={cameraRef} fov={80} aspect={2} near={0.1} far={50000} />
      <mesh ref={meshRef}>
        <boxGeometry parameters={{width: 40, height: 40, depth: 40, widthSegments: 1, heightSegments: 1, depthSegments: 1}} />
        <meshBasicMaterial color={new THREE.Color('red')} />
      </mesh>
      {/* {children} */}
    </group>
  );
};

export default ARLocation;
