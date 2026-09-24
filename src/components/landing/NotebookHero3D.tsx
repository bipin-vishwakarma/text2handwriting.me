import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface NotebookHero3DProps {
    className?: string;
    interactive?: boolean;
    activeInk?: string;
}

const NOTEBOOK_SAMPLES = [
    {
        title: "Verification of Ohm's Law",
        figure: 'Fig. 4.1 · Circuit and V-I graph',
        lines: [
            'Aim: Study the V-I relation for a resistance wire.',
            'Circuit: Cell, key, rheostat, ammeter and test wire.',
            'At 2 V, the current recorded was 0.41 A.',
            'At 6 V, the current recorded was 1.25 A.',
            'The plotted points form a straight line through origin.',
            'Therefore, V is directly proportional to I.',
        ],
    },
    {
        title: 'Resistance of a Given Wire',
        figure: 'Fig. 4.2 · Wheatstone bridge observation',
        lines: [
            'Aim: Determine the resistance of a given wire.',
            'Balance point was found at 47.2 cm on the bridge wire.',
            'Known resistance in the left gap: 4.0 ohm.',
            'Calculated value of the specimen: 3.58 ohm.',
            'Repeat readings remained within a small tolerance.',
            'Result: resistance recorded in the observation table.',
        ],
    },
    {
        title: 'V-I Characteristic of a Diode',
        figure: 'Fig. 4.3 · Forward-bias test circuit',
        lines: [
            'Aim: Plot the forward-bias V-I characteristic of a diode.',
            'Current remained low before the knee-voltage region.',
            'A sharp rise was observed after the threshold voltage.',
            'The diode was connected with correct polarity throughout.',
            'Readings were noted only after the meter became steady.',
            'Result: the curve confirms one-way conduction behaviour.',
        ],
    },
] as const;

export default function NotebookHero3D({ 
    className = '', 
    interactive = true,
    activeInk: propInk,
}: NotebookHero3DProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Synchronize with activeInk prop
    const activeInkColor = propInk || '#1e3a8a';
    const [isPlaying, setIsPlaying] = useState(true);

    // Refs for live engine synchronization
    const inkRef = useRef(activeInkColor);
    const paperRef = useRef('ruled');
    const playRef = useRef(isPlaying);
    const restartTriggerRef = useRef(0);

    useEffect(() => {
        inkRef.current = activeInkColor;
    }, [activeInkColor]);

    useEffect(() => {
        playRef.current = isPlaying;
    }, [isPlaying]);

    const handleRestart = () => {
        restartTriggerRef.current += 1;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        let animationFrameId: number;
        let width = container.clientWidth;
        let height = container.clientHeight;
        const isSmallScreen = window.matchMedia('(max-width: 767px)').matches;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const useLightweightRenderer = isSmallScreen || prefersReducedMotion;

        // 1. Three.js Scene
        const scene = new THREE.Scene();

        // 2. Camera: Studio perspective lens with realistic depth & uncaged headroom
        const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
        camera.position.set(0, 0.05, 11.5);

                        // 3. High-Fidelity Renderer
        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, useLightweightRenderer ? 1.25 : 2));
        renderer.shadowMap.enabled = !useLightweightRenderer;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setClearColor(0x000000, 0);
        
        // 4. Balanced Studio Lighting Rig
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
        scene.add(ambientLight);

        // Warm Key Light (Top-right studio lamp)
        const keyLight = new THREE.DirectionalLight(0xfffdf0, 1.8);
        keyLight.position.set(5.0, 7.5, 6.0);
        keyLight.castShadow = !useLightweightRenderer;
        keyLight.shadow.mapSize.set(useLightweightRenderer ? 512 : 1024, useLightweightRenderer ? 512 : 1024);
        keyLight.shadow.bias = -0.0001;
        scene.add(keyLight);

        // Bright Spotlight for glossy premium feel
        const spotLight = new THREE.SpotLight(0xffffff, 1.2);
        spotLight.position.set(0, 5, 5);
        spotLight.angle = Math.PI / 4;
        spotLight.penumbra = 0.5;
        scene.add(spotLight);

        // Cool Sky Fill Light
        const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.7);
        fillLight.position.set(-5, 4, 4);
        scene.add(fillLight);

        // Specular glint for spiral rings
        

        // 5. Notebook Master Assembly Group
        const notebookGroup = new THREE.Group();
        scene.add(notebookGroup);

        // Soft Radial Gradient Shadow Canvas (Contact & Desk Shadow)
        const shadowCanvas = document.createElement('canvas');
        shadowCanvas.width = 512;
        shadowCanvas.height = 512;
        const sCtx = shadowCanvas.getContext('2d')!;
        const radGrad = sCtx.createRadialGradient(256, 256, 30, 256, 256, 245);
        radGrad.addColorStop(0, 'rgba(15, 23, 42, 0.32)');
        radGrad.addColorStop(0.35, 'rgba(30, 41, 59, 0.16)');
        radGrad.addColorStop(0.7, 'rgba(30, 41, 59, 0.05)');
        radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        sCtx.fillStyle = radGrad;
        sCtx.fillRect(0, 0, 512, 512);

        const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
        shadowTexture.colorSpace = THREE.SRGBColorSpace;
        
        // Soft contact shadow placed directly behind the notebook pages (NEVER intersects paper)
        const shadowGeo = new THREE.PlaneGeometry(7.6, 5.6);
        const shadowMat = new THREE.MeshBasicMaterial({
            map: shadowTexture,
            transparent: true,
            opacity: 0.98,
            depthWrite: false,
        });
        const contactShadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        contactShadowMesh.position.set(0, 0, -0.05);
        contactShadowMesh.renderOrder = -1;
        // notebookGroup.add(contactShadowMesh);

        

        // --- LEFT PAGE: Circuit Diagram & Schematic Canvas ---
        const leftCanvas = document.createElement('canvas');
        leftCanvas.width = 1024;
        leftCanvas.height = 1360;
        const lCtx = leftCanvas.getContext('2d')!;
        let currentSampleIndex = 0;

        const renderLeftPage = () => {
            const paperType = paperRef.current;
            lCtx.fillStyle = paperType === 'parchment' ? '#fbf4e6' : '#fdfbf7';
            lCtx.fillRect(0, 0, 1024, 1360);

            // Grid lines
            lCtx.strokeStyle = paperType === 'graph' ? '#bae6fd' : '#e0f2fe';
            lCtx.lineWidth = 1;
            for (let x = 60; x < 960; x += 32) {
                lCtx.beginPath();
                lCtx.moveTo(x, 80);
                lCtx.lineTo(x, 1280);
                lCtx.stroke();
            }
            for (let y = 80; y < 1280; y += 32) {
                lCtx.beginPath();
                lCtx.moveTo(60, y);
                lCtx.lineTo(960, y);
                lCtx.stroke();
            }

            // Header
            lCtx.font = '700 32px Caveat, cursive, sans-serif';
            lCtx.fillStyle = inkRef.current;
            lCtx.fillText(NOTEBOOK_SAMPLES[currentSampleIndex].figure, 100, 130);

            // Hand-drawn circuit schematic: a real series loop with a battery,
            // key, ammeter, resistor and a voltmeter branch.
            lCtx.strokeStyle = inkRef.current;
            lCtx.lineWidth = 4;
            lCtx.lineCap = 'round';
            lCtx.lineJoin = 'round';
            lCtx.beginPath();
            lCtx.moveTo(180, 260); lCtx.lineTo(385, 260);
            lCtx.moveTo(535, 260); lCtx.lineTo(760, 260);
            lCtx.moveTo(760, 260); lCtx.lineTo(760, 680);
            lCtx.moveTo(760, 680); lCtx.lineTo(575, 680);
            lCtx.moveTo(350, 680); lCtx.lineTo(180, 680);
            lCtx.moveTo(180, 680); lCtx.lineTo(180, 260);
            lCtx.stroke();

            // Battery plates and polarity.
            lCtx.beginPath();
            lCtx.moveTo(405, 224); lCtx.lineTo(405, 296);
            lCtx.moveTo(432, 238); lCtx.lineTo(432, 282);
            lCtx.moveTo(488, 224); lCtx.lineTo(488, 296);
            lCtx.moveTo(515, 238); lCtx.lineTo(515, 282);
            lCtx.stroke();
            lCtx.font = 'bold 23px Caveat, cursive';
            lCtx.fillStyle = inkRef.current;
            lCtx.fillText('+', 396, 212); lCtx.fillText('E', 452, 212); lCtx.fillText('−', 510, 212);

            // Open key on the left branch.
            lCtx.beginPath();
            lCtx.arc(180, 385, 7, 0, Math.PI * 2);
            lCtx.moveTo(180, 385); lCtx.lineTo(223, 360);
            lCtx.arc(180, 435, 7, 0, Math.PI * 2);
            lCtx.stroke();
            lCtx.font = 'bold 21px Caveat, cursive';
            lCtx.fillText('K', 135, 415);

            // Ammeter in series.
            lCtx.fillStyle = paperType === 'parchment' ? '#fbf4e6' : '#fdfbf7';
            lCtx.fillRect(715, 420, 90, 100);
            lCtx.beginPath(); lCtx.arc(760, 470, 34, 0, Math.PI * 2); lCtx.stroke();
            lCtx.font = 'bold 30px Caveat, cursive'; lCtx.fillStyle = inkRef.current; lCtx.fillText('A', 751, 480);

            // Proper zig-zag resistance wire.
            lCtx.beginPath();
            lCtx.moveTo(350, 680);
            for (let i = 0; i < 8; i++) lCtx.lineTo(370 + i * 25, i % 2 === 0 ? 650 : 710);
            lCtx.lineTo(575, 680);
            lCtx.stroke();
            lCtx.font = 'bold 22px Caveat, cursive'; lCtx.fillText('R · test wire', 420, 755);

            // Voltmeter branch across the resistor.
            lCtx.beginPath();
            lCtx.moveTo(350, 680); lCtx.lineTo(350, 555); lCtx.lineTo(575, 555); lCtx.lineTo(575, 680);
            lCtx.stroke();
            lCtx.fillStyle = paperType === 'parchment' ? '#fbf4e6' : '#fdfbf7'; lCtx.fillRect(430, 515, 70, 80);
            lCtx.beginPath(); lCtx.arc(465, 555, 30, 0, Math.PI * 2); lCtx.stroke();
            lCtx.font = 'bold 28px Caveat, cursive'; lCtx.fillStyle = inkRef.current; lCtx.fillText('V', 456, 565);

            // V-I Graph Box
            lCtx.strokeStyle = '#475569';
            lCtx.lineWidth = 2.5;
            lCtx.beginPath();
            lCtx.moveTo(200, 1140);
            lCtx.lineTo(820, 1140);
            lCtx.moveTo(200, 1140);
            lCtx.lineTo(200, 840);
            lCtx.stroke();

            lCtx.font = 'bold 24px Caveat, cursive';
            lCtx.fillText("Voltage V (Volts) →", 460, 1175);
            lCtx.fillText("Current I (mA) ↑", 90, 840);

            // Linear slope line
            lCtx.strokeStyle = '#dc2626';
            lCtx.lineWidth = 3.5;
            lCtx.beginPath();
            lCtx.moveTo(200, 1140);
            lCtx.lineTo(760, 880);
            lCtx.stroke();

            // Data points
            const points = [
                { x: 300, y: 1095 },
                { x: 420, y: 1040 },
                { x: 530, y: 990 },
                { x: 640, y: 935 },
                { x: 740, y: 890 }
            ];
            lCtx.fillStyle = inkRef.current;
            points.forEach(p => {
                lCtx.beginPath();
                lCtx.arc(p.x, p.y, 7, 0, Math.PI * 2);
                lCtx.fill();
                lCtx.stroke();
            });

            lCtx.font = 'bold 26px Caveat, cursive';
            lCtx.fillStyle = inkRef.current;
            lCtx.fillText("Slope = ΔV/ΔI = 4.82 Ω", 530, 965);

            // Center Crease Shadow
            const lGrad = lCtx.createLinearGradient(924, 0, 1024, 0);
            lGrad.addColorStop(0, 'rgba(0,0,0,0)');
            lGrad.addColorStop(1, 'rgba(0,0,0,0.1)');
            lCtx.fillStyle = lGrad;
            lCtx.fillRect(924, 0, 100, 1360);
        };

        renderLeftPage();
        const leftTexture = new THREE.CanvasTexture(leftCanvas);
        leftTexture.colorSpace = THREE.SRGBColorSpace;
        leftTexture.anisotropy = 8;

        // --- RIGHT PAGE: DYNAMIC REAL-TIME INSCRIBING NOTEBOOK ---
        const rightCanvas = document.createElement('canvas');
        rightCanvas.width = 1024;
        rightCanvas.height = 1360;
        const rCtx = rightCanvas.getContext('2d')!;

        const rightTexture = new THREE.CanvasTexture(rightCanvas);
        rightTexture.colorSpace = THREE.SRGBColorSpace;
        rightTexture.anisotropy = 8;

        // Offscreen static background cache for 60fps write rendering
        const rightBgCanvas = document.createElement('canvas');
        rightBgCanvas.width = 1024;
        rightBgCanvas.height = 1360;
        const rBgCtx = rightBgCanvas.getContext('2d')!;

        const updateRightStaticBackground = () => {
            const paperType = paperRef.current;
            rBgCtx.fillStyle = paperType === 'parchment' ? '#fbf4e6' : '#fdfbf7';
            rBgCtx.fillRect(0, 0, 1024, 1360);

            // Center Crease Shadow
            const rGrad = rBgCtx.createLinearGradient(0, 0, 100, 0);
            rGrad.addColorStop(0, 'rgba(0,0,0,0.15)');
            rGrad.addColorStop(1, 'rgba(0,0,0,0)');
            rBgCtx.fillStyle = rGrad;
            rBgCtx.fillRect(0, 0, 100, 1360);

            // Red margin double line
            rBgCtx.strokeStyle = '#ef4444';
            rBgCtx.lineWidth = 2.5;
            rBgCtx.beginPath();
            rBgCtx.moveTo(140, 0);
            rBgCtx.lineTo(140, 1360);
            rBgCtx.stroke();

            rBgCtx.strokeStyle = '#fca5a5';
            rBgCtx.lineWidth = 1.2;
            rBgCtx.beginPath();
            rBgCtx.moveTo(148, 0);
            rBgCtx.lineTo(148, 1360);
            rBgCtx.stroke();

            // Blue horizontal ruled lines
            rBgCtx.strokeStyle = paperType === 'graph' ? '#bae6fd' : '#93c5fd';
            rBgCtx.lineWidth = 1.4;
            const lineSpacing = 42;
            for (let y = 140; y < 1320; y += lineSpacing) {
                rBgCtx.beginPath();
                rBgCtx.moveTo(60, y);
                rBgCtx.lineTo(980, y);
                rBgCtx.stroke();
            }

            // Header & Title
            rBgCtx.font = 'bold 24px Caveat, cursive, sans-serif';
            rBgCtx.fillStyle = '#64748b';
            rBgCtx.fillText("PAGE: 04", 170, 105);
            rBgCtx.fillText(`DATE: ${new Date().toLocaleDateString('en-GB')}`, 750, 105);

            rBgCtx.font = 'bold 34px Caveat, cursive, sans-serif';
            rBgCtx.fillStyle = inkRef.current;
            rBgCtx.fillText(NOTEBOOK_SAMPLES[currentSampleIndex].title, 170, 175);
        };

        updateRightStaticBackground();

        // 3D Curved Pages Assembly (Organic page bend resting naturally on desk)
        const pageW = 2.65;
        const pageH = 3.8;

        const leftGeo = new THREE.PlaneGeometry(pageW, pageH, 32, 32);
        const posL = leftGeo.attributes.position;
        for (let i = 0; i < posL.count; i++) {
            const x = posL.getX(i);
            const normX = (x + 1.325) / 2.65;
            const arch = Math.sin(normX * Math.PI) * 0.05;
            const cornerCurl = normX < 0.12 ? Math.pow(0.12 - normX, 2) * 1.5 : 0;
            posL.setZ(i, arch + cornerCurl + 0.01);
        }
        leftGeo.computeVertexNormals();

        const pageMatConfig = { roughness: 0.7, metalness: 0.05, side: THREE.FrontSide };
        const leftMat = new THREE.MeshStandardMaterial({ map: leftTexture, ...pageMatConfig });
        const leftMesh = new THREE.Mesh(leftGeo, leftMat);
        leftMesh.position.set(-1.35, 0, 0);
        leftMesh.castShadow = true;
        leftMesh.receiveShadow = true;
        notebookGroup.add(leftMesh);

        const rightGeo = new THREE.PlaneGeometry(pageW, pageH, 32, 32);
        const posR = rightGeo.attributes.position;
        for (let i = 0; i < posR.count; i++) {
            const x = posR.getX(i);
            const normX = (1.325 - x) / 2.65;
            const arch = Math.sin(normX * Math.PI) * 0.05;
            const cornerCurl = normX < 0.12 ? Math.pow(0.12 - normX, 2) * 1.5 : 0;
            posR.setZ(i, arch + cornerCurl + 0.01);
        }
        rightGeo.computeVertexNormals();

        const rightMat = new THREE.MeshStandardMaterial({ map: rightTexture, ...pageMatConfig });
        const rightMesh = new THREE.Mesh(rightGeo, rightMat);
        rightMesh.position.set(1.35, 0, 0);
        rightMesh.castShadow = true;
        rightMesh.receiveShadow = true;
                notebookGroup.add(rightMesh);

                // --- Shiny Metal Spiral Coils ---
        const coilsGroup = new THREE.Group();
        const coilGeo = new THREE.TorusGeometry(0.065, 0.018, 16, 32);
        const coilMat = new THREE.MeshStandardMaterial({ 
            color: 0xdddddd,
            roughness: 0.2,
            metalness: 0.95
        });
        
        for (let y = 1.75; y >= -1.75; y -= 0.12) {
            const coil = new THREE.Mesh(coilGeo, coilMat);
            coil.position.set(0, y, -0.01);
            coil.rotation.x = Math.PI / 2 + 0.2; // Angle the spirals
            coil.castShadow = true;
            coilsGroup.add(coil);
        }
        notebookGroup.add(coilsGroup);

        // Thick Paper Stack Rim ("Lots of pages" effect)
        const paperStackMat = new THREE.MeshStandardMaterial({
            color: 0xf0f0f0, // slightly darker to show page layers
            roughness: 0.9,
            metalness: 0.0,
        });
        // Make the stack much thicker (0.15) to look like a lot of pages
        const stackGeo = new THREE.BoxGeometry(2.68, 3.82, 0.15);
        
        const leftStackMesh = new THREE.Mesh(stackGeo, paperStackMat);
        leftStackMesh.position.set(-1.35, 0, -0.08); // Offset by half thickness
        leftStackMesh.castShadow = true;
        leftStackMesh.receiveShadow = true;
        notebookGroup.add(leftStackMesh);

        const rightStackMesh = new THREE.Mesh(stackGeo, paperStackMat);
        rightStackMesh.position.set(1.35, 0, -0.08);
        rightStackMesh.castShadow = true;
        rightStackMesh.receiveShadow = true;
        notebookGroup.add(rightStackMesh);

        

        

        // Real-Time Inscription State
        let currentLine = 0;
        let currentChar = 0;
        let charTimer = 0;
        let pauseTimer = 0;
        let lastRestartId = restartTriggerRef.current;
        let lastInk = inkRef.current;
        let lastPaper = paperRef.current;

        // Viewport tracking & Frameless Floating Scale
        const baseScale = 1.05; // Wide breathing room, uncaged, no boundary box clipping
        let targetRotX = 0.10;  // Upright legible angle (eliminates downward tilt)
        let targetRotY = -0.04; // Subtle angle showing both schematic and writing pages
        let targetZ = 0.0;

        notebookGroup.scale.set(baseScale, baseScale, baseScale);
        notebookGroup.rotation.x = targetRotX;
        notebookGroup.rotation.y = targetRotY;

        let isVisible = true;
        let isPageVisible = !document.hidden;
        const handlePointerMove = (e: MouseEvent) => {
            if (!interactive || !isVisible || !isPageVisible || prefersReducedMotion) return;
            const x = (e.clientX / window.innerWidth) * 2 - 1;
            const y = -(e.clientY / window.innerHeight) * 2 + 1;
            // Heavily dampened luxury float (stable, non-dizzying)
            targetRotY = -0.04 + x * 0.12;
            targetRotX = 0.10 - y * 0.08;
            targetZ = x * 0.02;
        };
        window.addEventListener('mousemove', handlePointerMove, { passive: true });

                const handleResize = () => {
            if (!container || !renderer) return;
            width = container.clientWidth;
            height = container.clientHeight;
            camera.aspect = width / height;
            
            // Dynamically pull camera back on narrower screens to prevent edge clipping
            if (camera.aspect < 1.0) {
                camera.position.z = 11.5 + (1.0 - camera.aspect) * 8.0;
            } else {
                camera.position.z = 11.5;
            }
            
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        handleResize(); // call immediately to set initial correct Z
        window.addEventListener('resize', handleResize);

        // IntersectionObserver to pause rendering when hero notebook is offscreen
        const observer = new IntersectionObserver(([entry]) => {
            const wasVisible = isVisible;
            isVisible = entry.isIntersecting;
            if (isVisible && !wasVisible && isPageVisible) {
                cancelAnimationFrame(animationFrameId);
                animate();
            }
        }, { threshold: 0.05 });
        observer.observe(container);

        const handleVisibilityChange = () => {
            isPageVisible = !document.hidden;
            if (isPageVisible && isVisible) {
                cancelAnimationFrame(animationFrameId);
                animate();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Animation Loop with Real-Time Handwriting Inscription & Pen Gliding
        const clock = new THREE.Clock();
        const lineSpacing = 42;
        const lineBaseY = 258;
        const currentSample = () => NOTEBOOK_SAMPLES[currentSampleIndex];

        const animate = () => {
            if (!isVisible || !isPageVisible) return;
            animationFrameId = requestAnimationFrame(animate);
            const delta = clock.getDelta();
            const elapsedTime = clock.getElapsedTime();

            // Detect live control changes (Ink color or paper style)
            if (lastInk !== inkRef.current || lastPaper !== paperRef.current) {
                lastInk = inkRef.current;
                lastPaper = paperRef.current;
                renderLeftPage();
                leftTexture.needsUpdate = true;
                updateRightStaticBackground();
            }

            // Handle manual re-inscribe reset
            if (lastRestartId !== restartTriggerRef.current) {
                lastRestartId = restartTriggerRef.current;
                currentLine = 0;
                currentChar = 0;
                pauseTimer = 0;
                charTimer = 0;
            }

            // Real-Time Handwriting Inscription Loop
            if (playRef.current) {
                if (pauseTimer > 0) {
                    pauseTimer -= delta;
                    if (pauseTimer <= 0) {
                        currentSampleIndex = (currentSampleIndex + 1) % NOTEBOOK_SAMPLES.length;
                        currentLine = 0;
                        currentChar = 0;
                        renderLeftPage();
                        leftTexture.needsUpdate = true;
                        updateRightStaticBackground();
                    }
                } else {
                    charTimer += delta;
                    // Write at ~35 chars/sec with natural rhythm
                    if (charTimer > 0.028) {
                        charTimer = 0;
                        if (currentLine < currentSample().lines.length) {
                            const fullLine = currentSample().lines[currentLine];
                            if (currentChar < fullLine.length) {
                                currentChar += 1;
                            } else {
                                currentLine += 1;
                                currentChar = 0;
                                if (currentLine >= currentSample().lines.length) {
                                    pauseTimer = 4.5; // Hold completed page for 4.5s
                                }
                            }

                            // Re-draw right canvas
                            rCtx.drawImage(rightBgCanvas, 0, 0);
                            rCtx.font = '600 31px Caveat, cursive, sans-serif';
                            rCtx.fillStyle = inkRef.current;

                            // Draw completed lines
                            for (let i = 0; i < currentLine; i++) {
                                rCtx.fillText(currentSample().lines[i], 170, lineBaseY + i * lineSpacing);
                            }

                            // Draw active partial line & calculate pen cursor coordinates
                            const penCanvasY = lineBaseY + currentLine * lineSpacing;

                            if (currentLine < currentSample().lines.length) {
                                const lineStr = currentSample().lines[currentLine].slice(0, currentChar);
                                rCtx.fillText(lineStr, 170, penCanvasY);
                            }

                            // If page finished, draw Verified Badge
                            if (currentLine >= currentSample().lines.length || (currentLine === currentSample().lines.length - 1 && currentChar === currentSample().lines[currentLine].length)) {
                                rCtx.strokeStyle = '#059669';
                                rCtx.lineWidth = 2.5;
                                rCtx.strokeRect(680, 1180, 240, 70);
                                rCtx.font = 'bold 22px Caveat, cursive';
                                rCtx.fillStyle = '#059669';
                                rCtx.fillText("SAMPLE PREVIEW", 700, 1215);
                                rCtx.font = '16px Caveat, cursive';
                                rCtx.fillText("Review your own work", 700, 1240);
                            }

                            rightTexture.needsUpdate = true;

                            

                            
                        }
                    }
                }
            }

            // Ambient breathing float (calm, subtle micro-movement)
            const idleFloat = prefersReducedMotion ? 0 : Math.sin(elapsedTime * 1.5) * 0.08;
            const idleTilt = prefersReducedMotion ? 0 : Math.cos(elapsedTime * 1.2) * 0.02;

            notebookGroup.position.y = THREE.MathUtils.lerp(notebookGroup.position.y, idleFloat, 0.06);
            notebookGroup.rotation.x = THREE.MathUtils.lerp(notebookGroup.rotation.x, targetRotX + idleTilt, 0.06);
            notebookGroup.rotation.y = THREE.MathUtils.lerp(notebookGroup.rotation.y, targetRotY, 0.06);
            notebookGroup.rotation.z = THREE.MathUtils.lerp(notebookGroup.rotation.z, targetZ, 0.06);

            
            

            renderer.render(scene, camera);
        };
        if (isPageVisible) animate();

        return () => {
            observer.disconnect();
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('visibilitychange', handleVisibilityChange);

            leftGeo.dispose();
            leftMat.dispose();
            rightGeo.dispose();
            rightMat.dispose();
                                    stackGeo.dispose();
            paperStackMat.dispose();
            coilGeo.dispose();
            coilMat.dispose();
            
            
            
            
            
            
            
            shadowGeo.dispose();
            
            shadowMat.dispose();
            shadowTexture.dispose();
            leftTexture.dispose();
            rightTexture.dispose();
            renderer.dispose();
        };
    }, [interactive]);

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-[520px] sm:h-[640px] lg:h-[760px] select-none ${className}`}
        >
            {/* Subtle Minimal Controls */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 p-1 rounded-full bg-white/85 backdrop-blur-md border border-stone-200/80 shadow-xs pointer-events-auto">
                <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="min-w-11 min-h-11 flex items-center justify-center rounded-full text-stone-600 hover:text-stone-950 hover:bg-stone-100 cursor-pointer transition-colors"
                    title={isPlaying ? 'Pause Inscription' : 'Resume Inscription'}
                    aria-label={isPlaying ? 'Pause Inscription' : 'Resume Inscription'}
                >
                    {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                </button>
                <button
                    type="button"
                    onClick={handleRestart}
                    className="min-w-11 min-h-11 flex items-center justify-center rounded-full text-stone-600 hover:text-stone-950 hover:bg-stone-100 cursor-pointer transition-colors"
                    title="Replay Inscription"
                    aria-label="Replay Inscription"
                >
                    <RotateCcw size={13} />
                </button>
            </div>

            {/* Three.js Canvas */}
            <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
    );
}
















