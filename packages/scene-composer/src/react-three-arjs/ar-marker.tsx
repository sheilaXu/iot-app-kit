/* eslint-disable no-underscore-dangle */
import { ArMarkerControls } from '@ar-js-org/ar.js/three.js/build/ar-threex';
import { useFrame } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import { Object3D } from 'three';

import { useAR } from './ar';

const ARMarker = ({
  children,
  type,
  barcodeValue = null,
  patternUrl,
  params = {},
  onMarkerFound,
  onMarkerLost = () => null,
}) => {
  const markerRoot = useRef<Object3D>();
  const { arToolkitContext } = useAR();
  const [isFound, setIsFound] = useState(false);

  useEffect(() => {
    if (!arToolkitContext || !markerRoot.current) {
      return;
    }

    const markerControls = new ArMarkerControls(arToolkitContext, markerRoot.current, {
      type,
      barcodeValue: type === 'barcode' ? barcodeValue : null,
      patternUrl: type === 'pattern' ? patternUrl : null,
      ...params,
    });

    return () => {
      const index = arToolkitContext._arMarkersControls.indexOf(markerControls);
      arToolkitContext._arMarkersControls.splice(index, 1);
    };
  }, [markerRoot.current]);

  useFrame(() => {
    if (markerRoot.current?.visible && !isFound) {
      setIsFound(true);
      if (onMarkerFound) {
        onMarkerFound();
      }
    } else if (!markerRoot.current?.visible && isFound) {
      setIsFound(false);
      if (onMarkerLost) {
        onMarkerLost();
      }
    }
  });

  return <group ref={markerRoot}>{children}</group>;
};

export default ARMarker;
