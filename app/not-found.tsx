'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { LOGIN_ROUTE } from '@/lib/routes';

export default function NotFound() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0f1a, 0.045);

    const camera = new THREE.PerspectiveCamera(
      48,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 3.3, 10);
    camera.lookAt(0, 0.6, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0x2b3a55, 0.9);
    scene.add(ambient);

    const rim = new THREE.DirectionalLight(0x7dd3c0, 0.5);
    rim.position.set(-4, 5, -4);
    scene.add(rim);

    const lampLight = new THREE.PointLight(0xffd98a, 2.2, 8, 2);
    lampLight.position.set(1.6, 2.4, 0.4);
    lampLight.castShadow = true;
    scene.add(lampLight);

    const rig = new THREE.Group();
    scene.add(rig);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(6, 48),
      new THREE.ShadowMaterial({ opacity: 0.35 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    rig.add(floor);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    type ModelSpec = {
      path: string;
      position: [number, number, number]; 
      fitAxis: 'y' | 'x'; 
      targetSize: number;
      rotationY?: number;
      placeholderSize: [number, number, number];
    };

    const models: ModelSpec[] = [
      { path: '/models/desk.glb', position: [0.25, 0, -0.3], fitAxis: 'y', targetSize: 0.78, placeholderSize: [1.6, 0.78, 0.8] },
      { path: '/models/monitor.glb', position: [0.25, 0.78, -0.6], fitAxis: 'x', targetSize: 0.55, placeholderSize: [0.55, 0.4, 0.15] },
      { path: '/models/lamp.glb', position: [1.15, 0, -0.6], fitAxis: 'y', targetSize: 1.55, placeholderSize: [0.4, 1.55, 0.4] },
      { path: '/models/plant.glb', position: [-1.35, 0, 0.2], fitAxis: 'y', targetSize: 1.1, placeholderSize: [0.5, 1.1, 0.5] },
      { path: '/models/turntable.glb', position: [-0.55, 0.78, -0.5], fitAxis: 'x', targetSize: 0.4, placeholderSize: [0.4, 0.08, 0.4] },
    ];

    const placeholderMat = new THREE.MeshStandardMaterial({
      color: 0x2a3550,
      roughness: 0.8,
      transparent: true,
      opacity: 0.35,
      wireframe: true,
    });

    models.forEach((spec) => {
      const placeholder = new THREE.Mesh(new THREE.BoxGeometry(...spec.placeholderSize), placeholderMat);
      placeholder.position.set(
        spec.position[0],
        spec.position[1] + spec.placeholderSize[1] / 2,
        spec.position[2]
      );
      rig.add(placeholder);

      gltfLoader.load(
        spec.path,
        (gltf) => {
          rig.remove(placeholder);
          const model = gltf.scene;

          const rawBox = new THREE.Box3().setFromObject(model);
          const rawSize = new THREE.Vector3();
          rawBox.getSize(rawSize);
          const rawCenter = new THREE.Vector3();
          rawBox.getCenter(rawCenter);

          const reference = spec.fitAxis === 'x' ? rawSize.x : rawSize.y;
          const scale = reference > 0 ? spec.targetSize / reference : 1;
          model.scale.setScalar(scale);
          if (spec.rotationY) model.rotation.y = spec.rotationY;

          model.position.set(
            spec.position[0] - rawCenter.x * scale,
            spec.position[1] - rawBox.min.y * scale,
            spec.position[2] - rawCenter.z * scale
          );

          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          rig.add(model);

          if (spec.path.includes('/lamp.glb')) {
            const finalBox = new THREE.Box3().setFromObject(model);
            lampLight.position.set(spec.position[0], finalBox.max.y * 0.92, spec.position[2]);
          }
        },
        undefined,
        () => {
        }
      );
    });

    rig.position.y = 0;

    let targetRotY = 0.15;
    let currentRotY = 0.15;
    let velocity = 0.0012; 
    let isDragging = false;
    let lastX = 0;
    let dragVelocity = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      lastX = e.clientX;
      dragVelocity = 0;
      mount.style.cursor = 'grabbing';
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      dragVelocity = dx * 0.005;
      targetRotY += dragVelocity;
    };
    const endDrag = () => {
      isDragging = false;
      mount.style.cursor = 'grab';
    };

    mount.style.cursor = 'grab';
    mount.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endDrag);

    let raf = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const dt = clock.getDelta();

      if (!isDragging) {
        dragVelocity *= 0.94;
        targetRotY += dragVelocity + velocity;
      }

      currentRotY += (targetRotY - currentRotY) * Math.min(1, dt * 6);
      rig.rotation.y = currentRotY;

      lampLight.intensity = 2.0 + Math.sin(performance.now() * 0.0015) * 0.3;

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrag);
      mount.removeEventListener('pointerdown', onPointerDown);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center px-6 text-center select-none"
      style={{
        background: 'radial-gradient(120% 90% at 50% 20%, #16233a 0%, #0c1424 55%, #070c16 100%)',
      }}
    >
      {/* Canvas 3D — full background, menerima drag */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* Konten teks, di atas canvas */}
      <div className="relative z-10 pointer-events-none flex flex-col items-center">
        <p className="text-xs font-semibold tracking-[0.25em] uppercase text-teal-300/70 mb-4">
          Halaman tidak ditemukan
        </p>
        <h1
          className="font-bold leading-none mb-4"
          style={{
            fontSize: 'clamp(5rem, 18vw, 11rem)',
            color: '#eef4f2',
            textShadow: '0 0 40px rgba(125,211,192,0.35), 0 0 90px rgba(125,211,192,0.15)',
          }}
        >
          404
        </h1>
        <p className="max-w-md text-neutral-300/80 mb-2">
          Halaman yang kamu cari sudah pindah, dihapus, atau memang belum pernah ada.
        </p>
        <Link
          href={LOGIN_ROUTE}
          className="pointer-events-auto inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-[#0c1424] bg-[#7dd3c0] hover:bg-[#93ddcc] shadow-[0_0_30px_rgba(125,211,192,0.35)] hover:shadow-[0_0_40px_rgba(125,211,192,0.5)] active:scale-[0.97] transition-all"
        >
          Kembali ke halaman masuk
        </Link>
      </div>
    </div>
  );
}