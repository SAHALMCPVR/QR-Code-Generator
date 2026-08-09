document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. STATE & ELEMENTS MANAGEMENT
    // ==========================================

    // DOM Elements - Navigation & Header
    const themeToggleBtn = document.getElementById('theme-toggle');
    const historyToggleBtn = document.getElementById('history-toggle-btn');
    const historyCountBadge = document.getElementById('history-count');
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // Preset Pills & Forms
    const presetPills = document.querySelectorAll('.preset-pill');
    const typeForms = document.querySelectorAll('.type-form');

    // Form Inputs
    const inputUrl = document.getElementById('input-url');
    const inputText = document.getElementById('input-text');
    const wifiSsid = document.getElementById('wifi-ssid');
    const wifiPassword = document.getElementById('wifi-password');
    const wifiEncryption = document.getElementById('wifi-encryption');
    const vcardFname = document.getElementById('vcard-fname');
    const vcardLname = document.getElementById('vcard-lname');
    const vcardPhone = document.getElementById('vcard-phone');
    const vcardEmail = document.getElementById('vcard-email');
    const vcardOrg = document.getElementById('vcard-org');
    const emailTo = document.getElementById('email-to');
    const emailSubject = document.getElementById('email-subject');
    const emailBody = document.getElementById('email-body');
    const smsPhone = document.getElementById('sms-phone');
    const smsMessage = document.getElementById('sms-message');

    // Style Customizer Controls
    const colorModeBtns = document.querySelectorAll('[data-colormode]');
    const colorFg1 = document.getElementById('color-fg1');
    const colorFg1Hex = document.getElementById('color-fg1-hex');
    const colorFg2Group = document.getElementById('color-fg2-group');
    const colorFg2 = document.getElementById('color-fg2');
    const colorFg2Hex = document.getElementById('color-fg2-hex');
    const colorBg = document.getElementById('color-bg');
    const colorBgHex = document.getElementById('color-bg-hex');
    const shapeDots = document.getElementById('shape-dots');
    const shapeCorners = document.getElementById('shape-corners');

    // Logo Upload Controls
    const logoFileInput = document.getElementById('logo-file-input');
    const logoTriggerBtn = document.getElementById('logo-trigger-btn');
    const logoRemoveBtn = document.getElementById('logo-remove-btn');
    const logoNameDisplay = document.getElementById('logo-name-display');
    const logoOptionsGroup = document.getElementById('logo-options-group');
    const logoSizeSlider = document.getElementById('logo-size-slider');

    // Quality & Canvas Controls
    const qrSizeSelect = document.getElementById('qr-size-select');
    const qrEclSelect = document.getElementById('qr-ecl-select');
    const qrCanvas = document.getElementById('qr-canvas');
    const rawQrHidden = document.getElementById('raw-qr-hidden');

    // Action Buttons
    const btnDownloadPng = document.getElementById('btn-download-png');
    const btnDownloadSvg = document.getElementById('btn-download-svg');
    const btnCopyClipboard = document.getElementById('btn-copy-clipboard');
    const btnSaveHistory = document.getElementById('btn-save-history');

    // Scanner Elements
    const scannerTabs = document.querySelectorAll('.scanner-tab');
    const scanPanes = document.querySelectorAll('.scan-pane');
    const btnStartCamera = document.getElementById('btn-start-camera');
    const btnStopCamera = document.getElementById('btn-stop-camera');
    const cameraPlaceholder = document.getElementById('camera-placeholder');
    const fileDropZone = document.getElementById('file-drop-zone');
    const scannerFileInput = document.getElementById('scanner-file-input');
    const btnTriggerFileSelect = document.getElementById('btn-trigger-file-select');
    const scanResultCard = document.getElementById('scan-result-card');
    const scanResultTextDisplay = document.getElementById('scan-result-text-display');
    const btnResultCopy = document.getElementById('btn-result-copy');
    const btnResultOpen = document.getElementById('btn-result-open');

    // Bulk Generator Elements
    const bulkTextInput = document.getElementById('bulk-text-input');
    const btnBulkGenerate = document.getElementById('btn-bulk-generate');
    const btnBulkDownloadAll = document.getElementById('btn-bulk-download-all');
    const bulkGridContainer = document.getElementById('bulk-grid-container');
    const bulkCountSpan = document.getElementById('bulk-count');

    // History Elements
    const historyGrid = document.getElementById('history-grid');
    const historySearch = document.getElementById('history-search');
    const btnClearHistory = document.getElementById('btn-clear-history');

    // App State
    let state = {
        activePreset: 'url',
        colorMode: 'solid', // solid, linear, radial
        logoImage: null,
        logoName: '',
        html5QrcodeScanner: null,
        history: JSON.parse(localStorage.getItem('qr_master_history') || '[]'),
        bulkItems: []
    };

    // ==========================================
    // 2. THEME & VISUAL STYLE MANAGEMENT
    // ==========================================

    // Dark/Light Theme Initialization
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        themeToggleBtn.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    }

    // Lock Visual Theme Style to Modern Glass
    document.documentElement.setAttribute('data-theme-style', 'modern');

    // ==========================================
    // 3. NAVIGATION & PRESET SWITCHING
    // ==========================================

    // Studio Nav Tabs (Generator, Scanner, Bulk, History)
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            navTabs.forEach(t => t.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const targetId = tab.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');

            // Cleanup camera scanner if moving away from scanner tab
            if (targetId !== 'tab-scanner' && state.html5QrcodeScanner) {
                stopCameraScanner();
            }

            if (targetId === 'tab-history') {
                renderHistory();
            }
        });
    });

    historyToggleBtn.addEventListener('click', () => {
        const historyTabBtn = document.querySelector('[data-tab="tab-history"]');
        if (historyTabBtn) historyTabBtn.click();
    });

    // Content Preset Pills
    presetPills.forEach(pill => {
        pill.addEventListener('click', () => {
            presetPills.forEach(p => p.classList.remove('active'));
            typeForms.forEach(f => f.classList.remove('active'));

            pill.classList.add('active');
            state.activePreset = pill.getAttribute('data-type');
            document.getElementById(`form-${state.activePreset}`).classList.add('active');

            renderQR();
        });
    });

    // Quick Chip Buttons
    const chipBtns = document.querySelectorAll('.chip-btn');
    chipBtns.forEach(chip => {
        chip.addEventListener('click', () => {
            const val = chip.getAttribute('data-fill');
            if (val && inputUrl) {
                inputUrl.value = val;
                renderQR();
                showToast(`Loaded template: ${val}`, 'info');
            }
        });
    });

    // ==========================================
    // 4. ADVANCED QR RENDERING ENGINE
    // ==========================================

    // Listeners on inputs to re-render in real-time
    const allInputs = [
        inputUrl, inputText, wifiSsid, wifiPassword, wifiEncryption,
        vcardFname, vcardLname, vcardPhone, vcardEmail, vcardOrg,
        emailTo, emailSubject, emailBody, smsPhone, smsMessage,
        shapeDots, shapeCorners, qrSizeSelect, qrEclSelect, logoSizeSlider
    ];

    allInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', renderQR);
            input.addEventListener('change', renderQR);
        }
    });

    // Color Listeners & Hex Display Updates
    colorFg1.addEventListener('input', (e) => {
        colorFg1Hex.textContent = e.target.value.toUpperCase();
        renderQR();
    });
    colorFg2.addEventListener('input', (e) => {
        colorFg2Hex.textContent = e.target.value.toUpperCase();
        renderQR();
    });
    colorBg.addEventListener('input', (e) => {
        colorBgHex.textContent = e.target.value.toUpperCase();
        renderQR();
    });

    // Color Mode Segmented Control
    colorModeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            colorModeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.colorMode = btn.getAttribute('data-colormode');

            if (state.colorMode === 'solid') {
                colorFg2Group.style.display = 'none';
            } else {
                colorFg2Group.style.display = 'block';
            }
            renderQR();
        });
    });

    // Logo Upload Logic
    logoTriggerBtn.addEventListener('click', () => logoFileInput.click());

    logoFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    state.logoImage = img;
                    state.logoName = file.name;
                    logoNameDisplay.textContent = file.name;
                    logoRemoveBtn.style.display = 'inline-flex';
                    logoOptionsGroup.style.display = 'flex';
                    renderQR();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    logoRemoveBtn.addEventListener('click', () => {
        state.logoImage = null;
        state.logoName = '';
        logoFileInput.value = '';
        logoNameDisplay.textContent = 'No logo selected';
        logoRemoveBtn.style.display = 'none';
        logoOptionsGroup.style.display = 'none';
        renderQR();
    });

    // Main QR Content Payload Resolver
    function getQRTextContent() {
        switch (state.activePreset) {
            case 'url':
                let url = inputUrl.value.trim();
                if (url && !url.match(/^https?:\/\//i)) {
                    url = 'https://' + url;
                }
                return url || 'https://google.com';
            case 'text':
                return inputText.value.trim() || 'Hello, World!';
            case 'wifi':
                const ssid = wifiSsid.value.trim() || 'MyNetwork';
                const pass = wifiPassword.value.trim();
                const enc = wifiEncryption.value;
                return `WIFI:S:${ssid};T:${enc};P:${pass};;`;
            case 'vcard':
                const fn = vcardFname.value.trim() || 'John';
                const ln = vcardLname.value.trim() || 'Doe';
                const ph = vcardPhone.value.trim();
                const em = vcardEmail.value.trim();
                const org = vcardOrg.value.trim();
                return `BEGIN:VCARD\nVERSION:3.0\nN:${ln};${fn}\nFN:${fn} ${ln}\nTEL:${ph}\nEMAIL:${em}\nORG:${org}\nEND:VCARD`;
            case 'email':
                const to = emailTo.value.trim() || 'info@example.com';
                const sub = encodeURIComponent(emailSubject.value.trim());
                const body = encodeURIComponent(emailBody.value.trim());
                return `mailto:${to}?subject=${sub}&body=${body}`;
            case 'sms':
                const phone = smsPhone.value.trim() || '+1234567890';
                const msg = encodeURIComponent(smsMessage.value.trim());
                return `smsto:${phone}:${msg}`;
            default:
                return 'QR Master Studio';
        }
    }

    // Core Custom Canvas Renderer
    function renderQR() {
        const textPayload = getQRTextContent();
        const size = parseInt(qrSizeSelect.value) || 512;
        const eclKey = qrEclSelect.value || 'H';

        // Map ECL to qrcodejs enum
        const eclMap = {
            'L': QRCode.CorrectLevel.L,
            'M': QRCode.CorrectLevel.M,
            'Q': QRCode.CorrectLevel.Q,
            'H': QRCode.CorrectLevel.H
        };

        // 1. Generate Raw QRCode using library in hidden element
        rawQrHidden.innerHTML = '';
        const rawQr = new QRCode(rawQrHidden, {
            text: textPayload,
            width: size,
            height: size,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: eclMap[eclKey] || QRCode.CorrectLevel.H
        });

        // Small timeout to allow library to render canvas/img
        setTimeout(() => {
            const sourceCanvas = rawQrHidden.querySelector('canvas');
            if (!sourceCanvas) return;

            const ctx = sourceCanvas.getContext('2d');
            const imgData = ctx.getImageData(0, 0, size, size);
            
            // Derive grid size (modules count)
            // Inspect first row to find module pixel width
            let modulePx = 1;
            for (let x = 0; x < size; x++) {
                const isBlack = imgData.data[(x * 4)] === 0;
                if (!isBlack) {
                    modulePx = x;
                    break;
                }
            }
            if (modulePx <= 0) modulePx = 1;

            const moduleCount = Math.round(size / modulePx);
            
            // Build binary matrix [row][col]
            const matrix = [];
            for (let r = 0; r < moduleCount; r++) {
                const row = [];
                for (let c = 0; c < moduleCount; c++) {
                    const pxX = Math.floor((c + 0.5) * (size / moduleCount));
                    const pxY = Math.floor((r + 0.5) * (size / moduleCount));
                    const idx = (pxY * size + pxX) * 4;
                    const rVal = imgData.data[idx];
                    row.push(rVal < 128 ? 1 : 0);
                }
                matrix.push(row);
            }

            // 2. Render onto output high-res #qr-canvas
            qrCanvas.width = size;
            qrCanvas.height = size;
            const targetCtx = qrCanvas.getContext('2d');
            targetCtx.clearRect(0, 0, size, size);

            // Background Fill
            targetCtx.fillStyle = colorBg.value;
            targetCtx.fillRect(0, 0, size, size);

            // Setup Foreground Style (Solid or Gradient)
            let fgStyle;
            if (state.colorMode === 'solid') {
                fgStyle = colorFg1.value;
            } else if (state.colorMode === 'linear') {
                const grad = targetCtx.createLinearGradient(0, 0, size, size);
                grad.addColorStop(0, colorFg1.value);
                grad.addColorStop(1, colorFg2.value);
                fgStyle = grad;
            } else if (state.colorMode === 'radial') {
                const grad = targetCtx.createRadialGradient(size/2, size/2, 10, size/2, size/2, size * 0.7);
                grad.addColorStop(0, colorFg1.value);
                grad.addColorStop(1, colorFg2.value);
                fgStyle = grad;
            }
            targetCtx.fillStyle = fgStyle;
            targetCtx.strokeStyle = fgStyle;

            const cellDim = size / moduleCount;
            const dotShape = shapeDots.value;
            const cornerShape = shapeCorners.value;

            // Helper to check if cell is in Finder Pattern (Top-Left, Top-Right, Bottom-Left)
            function isFinderPattern(r, c) {
                if (r < 7 && c < 7) return true; // Top-Left
                if (r < 7 && c >= moduleCount - 7) return true; // Top-Right
                if (r >= moduleCount - 7 && c < 7) return true; // Bottom-Left
                return false;
            }

            // Helper to check if cell is in Logo reserved area
            const logoScale = state.logoImage ? (parseInt(logoSizeSlider.value) / 100) : 0;
            const logoModuleSize = Math.floor(moduleCount * logoScale);
            const logoStart = Math.floor((moduleCount - logoModuleSize) / 2);
            const logoEnd = logoStart + logoModuleSize;

            function isLogoArea(r, c) {
                if (!state.logoImage) return false;
                return (r >= logoStart - 1 && r <= logoEnd && c >= logoStart - 1 && c <= logoEnd);
            }

            // 3. Draw Body Dots
            for (let r = 0; r < moduleCount; r++) {
                for (let c = 0; c < moduleCount; c++) {
                    if (matrix[r][c] === 1 && !isFinderPattern(r, c) && !isLogoArea(r, c)) {
                        const x = c * cellDim;
                        const y = r * cellDim;

                        if (dotShape === 'square') {
                            targetCtx.fillRect(x, y, cellDim, cellDim);
                        } else if (dotShape === 'circle') {
                            targetCtx.beginPath();
                            targetCtx.arc(x + cellDim / 2, y + cellDim / 2, cellDim / 2 * 0.85, 0, Math.PI * 2);
                            targetCtx.fill();
                        } else if (dotShape === 'rounded') {
                            drawRoundedRect(targetCtx, x + 0.5, y + 0.5, cellDim - 1, cellDim - 1, cellDim * 0.4);
                        } else if (dotShape === 'classy') {
                            drawRoundedRect(targetCtx, x, y, cellDim, cellDim, cellDim * 0.25);
                        }
                    }
                }
            }

            // 4. Draw Corner Finder Patterns (7x7 Outer Frame + 3x3 Inner Eye)
            const cornerPositions = [
                { r: 0, c: 0 },
                { r: 0, c: moduleCount - 7 },
                { r: moduleCount - 7, c: 0 }
            ];

            cornerPositions.forEach(pos => {
                const ox = pos.c * cellDim;
                const oy = pos.r * cellDim;
                const outerSize = 7 * cellDim;
                const innerSize = 3 * cellDim;
                const innerOffset = 2 * cellDim;

                // Draw Outer Frame
                if (cornerShape === 'square') {
                    targetCtx.fillRect(ox, oy, outerSize, outerSize);
                    targetCtx.fillStyle = colorBg.value;
                    targetCtx.fillRect(ox + cellDim, oy + cellDim, outerSize - 2 * cellDim, outerSize - 2 * cellDim);
                    targetCtx.fillStyle = fgStyle;
                    targetCtx.fillRect(ox + innerOffset, oy + innerOffset, innerSize, innerSize);
                } else if (cornerShape === 'rounded') {
                    drawRoundedRect(targetCtx, ox, oy, outerSize, outerSize, cellDim * 1.8);
                    targetCtx.fillStyle = colorBg.value;
                    drawRoundedRect(targetCtx, ox + cellDim, oy + cellDim, outerSize - 2 * cellDim, outerSize - 2 * cellDim, cellDim * 1.2);
                    targetCtx.fillStyle = fgStyle;
                    drawRoundedRect(targetCtx, ox + innerOffset, oy + innerOffset, innerSize, innerSize, cellDim * 0.8);
                } else if (cornerShape === 'circle') {
                    const cx = ox + outerSize / 2;
                    const cy = oy + outerSize / 2;

                    targetCtx.beginPath();
                    targetCtx.arc(cx, cy, outerSize / 2, 0, Math.PI * 2);
                    targetCtx.fill();

                    targetCtx.fillStyle = colorBg.value;
                    targetCtx.beginPath();
                    targetCtx.arc(cx, cy, (outerSize - 2 * cellDim) / 2, 0, Math.PI * 2);
                    targetCtx.fill();

                    targetCtx.fillStyle = fgStyle;
                    targetCtx.beginPath();
                    targetCtx.arc(cx, cy, innerSize / 2, 0, Math.PI * 2);
                    targetCtx.fill();
                }
            });

            // 5. Draw Center Logo Overlay if uploaded
            if (state.logoImage) {
                const logoPxSize = (logoModuleSize + 1) * cellDim;
                const logoX = (size - logoPxSize) / 2;
                const logoY = (size - logoPxSize) / 2;

                // White/Bg Backdrop Badge
                targetCtx.fillStyle = colorBg.value;
                drawRoundedRect(targetCtx, logoX - 4, logoY - 4, logoPxSize + 8, logoPxSize + 8, 12);

                // Draw Image
                targetCtx.drawImage(state.logoImage, logoX, logoY, logoPxSize, logoPxSize);
            }

        }, 50);
    }

    // Helper: Draw Rounded Rectangle on Canvas
    function drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }

    // Initial QR Generation Render
    renderQR();

    // ==========================================
    // 5. EXPORT & DOWNLOAD ACTIONS
    // ==========================================

    // Download PNG
    btnDownloadPng.addEventListener('click', () => {
        const dataUrl = qrCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `qrmaster-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        saveToHistory(getQRTextContent(), dataUrl, 'Generated QR Code');
        showToast('PNG QR code downloaded successfully!', 'success');
    });

    // Vector SVG Export Generator
    btnDownloadSvg.addEventListener('click', () => {
        const size = parseInt(qrSizeSelect.value) || 512;
        const textPayload = getQRTextContent();
        
        // Generate SVG markup
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <rect width="100%" height="100%" fill="${colorBg.value}"/>
            <image href="${qrCanvas.toDataURL('image/png')}" width="${size}" height="${size}"/>
        </svg>`;

        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qrmaster-${Date.now()}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast('SVG Vector QR code exported!', 'success');
    });

    // Copy Canvas Image to Clipboard
    btnCopyClipboard.addEventListener('click', async () => {
        try {
            qrCanvas.toBlob(async (blob) => {
                if (blob && navigator.clipboard && navigator.clipboard.write) {
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    showToast('QR Code image copied to clipboard!', 'success');
                } else {
                    showToast('Clipboard API not supported in browser.', 'error');
                }
            });
        } catch (err) {
            console.error('Copy failed', err);
            showToast('Failed to copy image.', 'error');
        }
    });

    // Save to History Button
    btnSaveHistory.addEventListener('click', () => {
        const dataUrl = qrCanvas.toDataURL('image/png');
        saveToHistory(getQRTextContent(), dataUrl, 'Saved Custom QR');
        showToast('Saved to history collection!', 'success');
    });

    // ==========================================
    // 6. QR SCANNER ENGINE (CAMERA & FILE)
    // ==========================================

    // Scanner Mode Switcher (Camera vs File)
    scannerTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            scannerTabs.forEach(t => t.classList.remove('active'));
            scanPanes.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const mode = tab.getAttribute('data-scannermode');
            document.getElementById(`scan-pane-${mode}`).classList.add('active');

            if (mode !== 'camera' && state.html5QrcodeScanner) {
                stopCameraScanner();
            }
        });
    });

    // Start Live Camera Scan
    btnStartCamera.addEventListener('click', startCameraScanner);
    btnStopCamera.addEventListener('click', stopCameraScanner);

    function startCameraScanner() {
        cameraPlaceholder.style.display = 'none';
        btnStopCamera.style.display = 'inline-flex';

        if (!state.html5QrcodeScanner) {
            state.html5QrcodeScanner = new Html5Qrcode("camera-reader");
        }

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        state.html5QrcodeScanner.start(
            { facingMode: "environment" },
            config,
            onScanSuccess,
            (err) => { /* ignore minor frame decode errors */ }
        ).catch(err => {
            console.error("Camera start failed", err);
            showToast("Could not access camera. Check browser permissions.", "error");
            cameraPlaceholder.style.display = 'block';
            btnStopCamera.style.display = 'none';
        });
    }

    function stopCameraScanner() {
        if (state.html5QrcodeScanner) {
            state.html5QrcodeScanner.stop().then(() => {
                cameraPlaceholder.style.display = 'block';
                btnStopCamera.style.display = 'none';
            }).catch(err => console.error("Camera stop failed", err));
        }
    }

    // Drag & Drop / File Upload QR Decoder
    btnTriggerFileSelect.addEventListener('click', () => scannerFileInput.click());
    fileDropZone.addEventListener('click', (e) => {
        if (e.target !== btnTriggerFileSelect) scannerFileInput.click();
    });

    fileDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileDropZone.classList.add('dragover');
    });

    fileDropZone.addEventListener('dragleave', () => {
        fileDropZone.classList.remove('dragover');
    });

    fileDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        fileDropZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processScanFile(e.dataTransfer.files[0]);
        }
    });

    scannerFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            processScanFile(e.target.files[0]);
        }
    });

    function processScanFile(file) {
        if (!state.html5QrcodeScanner) {
            state.html5QrcodeScanner = new Html5Qrcode("camera-reader");
        }

        state.html5QrcodeScanner.scanFile(file, true)
            .then(decodedText => {
                onScanSuccess(decodedText);
            })
            .catch(err => {
                console.error("File decode failed", err);
                showToast("Could not find or decode a valid QR code in image.", "error");
            });
    }

    // Successful Scan Handler
    function onScanSuccess(decodedText) {
        scanResultTextDisplay.textContent = decodedText;
        scanResultCard.style.display = 'block';
        scanResultCard.scrollIntoView({ behavior: 'smooth' });

        // Link detector
        if (isValidUrl(decodedText)) {
            btnResultOpen.style.display = 'inline-flex';
            btnResultOpen.onclick = () => window.open(decodedText, '_blank');
        } else {
            btnResultOpen.style.display = 'none';
        }

        saveToHistory(decodedText, null, 'Scanned QR Code');
        showToast("QR code decoded successfully!", "success");
    }

    btnResultCopy.addEventListener('click', () => {
        const text = scanResultTextDisplay.textContent;
        navigator.clipboard.writeText(text).then(() => {
            showToast("Result copied to clipboard!", "success");
        });
    });

    // ==========================================
    // 7. BULK QR GENERATOR LOGIC
    // ==========================================

    btnBulkGenerate.addEventListener('click', () => {
        const raw = bulkTextInput.value.trim();
        if (!raw) {
            showToast("Please enter at least one line of text.", "error");
            return;
        }

        const items = raw.split('\n').map(i => i.trim()).filter(i => i.length > 0);
        state.bulkItems = items;
        bulkCountSpan.textContent = items.length;
        bulkGridContainer.innerHTML = '';

        if (items.length === 0) return;

        items.forEach((itemText, index) => {
            const card = document.createElement('div');
            card.className = 'bulk-item-card';

            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 200;

            card.appendChild(canvas);

            const label = document.createElement('span');
            label.textContent = itemText;
            card.appendChild(label);

            bulkGridContainer.appendChild(card);

            // Render QRs onto canvas
            const tempDiv = document.createElement('div');
            tempDiv.style.display = 'none';
            document.body.appendChild(tempDiv);

            const rawQr = new QRCode(tempDiv, {
                text: itemText,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff"
            });

            setTimeout(() => {
                const srcCanvas = tempDiv.querySelector('canvas');
                if (srcCanvas) {
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(srcCanvas, 0, 0, 200, 200);
                }
                document.body.removeChild(tempDiv);
            }, 50);
        });

        btnBulkDownloadAll.disabled = false;
        showToast(`Generated ${items.length} bulk QR codes!`, "success");
    });

    btnBulkDownloadAll.addEventListener('click', () => {
        const cards = bulkGridContainer.querySelectorAll('.bulk-item-card');
        cards.forEach((card, idx) => {
            const canvas = card.querySelector('canvas');
            if (canvas) {
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = `bulk-qr-${idx + 1}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        });
        showToast("Downloaded all bulk QR images!", "success");
    });

    // ==========================================
    // 8. HISTORY MANAGER & LOCAL STORAGE
    // ==========================================

    function saveToHistory(text, dataUrl, title = 'QR Code') {
        const item = {
            id: Date.now(),
            title: title,
            text: text,
            dataUrl: dataUrl,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
        };

        // Avoid duplicate top item
        if (state.history.length > 0 && state.history[0].text === text) return;

        state.history.unshift(item);
        if (state.history.length > 30) state.history.pop(); // max 30 items

        localStorage.setItem('qr_master_history', JSON.stringify(state.history));
        updateHistoryBadge();
    }

    function updateHistoryBadge() {
        historyCountBadge.textContent = state.history.length;
    }

    function renderHistory(filterQuery = '') {
        updateHistoryBadge();
        historyGrid.innerHTML = '';

        const query = filterQuery.toLowerCase();
        const filtered = state.history.filter(item => item.text.toLowerCase().includes(query));

        if (filtered.length === 0) {
            historyGrid.innerHTML = `<div class="empty-state">
                <i class="fa-solid fa-folder-open"></i>
                <p>No saved history items found.</p>
            </div>`;
            return;
        }

        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = 'history-card';

            const previewImg = item.dataUrl ? `<div class="history-img-wrap"><img src="${item.dataUrl}" alt="QR"></div>` : '';

            card.innerHTML = `
                ${previewImg}
                <div class="history-info">
                    <div class="history-title">${item.title}</div>
                    <div class="history-date">${item.timestamp}</div>
                    <div class="history-text" title="${item.text}">${item.text}</div>
                </div>
                <div class="history-card-actions">
                    <button class="secondary-btn btn-sm btn-load" title="Load into Generator"><i class="fa-solid fa-arrow-rotate-left"></i> Load</button>
                    <button class="secondary-btn btn-sm btn-copy" title="Copy Text"><i class="fa-solid fa-copy"></i></button>
                    <button class="text-danger-btn btn-delete" title="Delete Item"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;

            // Card Action Handlers
            card.querySelector('.btn-load').addEventListener('click', () => {
                inputUrl.value = item.text;
                inputText.value = item.text;
                document.querySelector('[data-tab="tab-generator"]').click();
                renderQR();
                showToast('Loaded item into generator!', 'success');
            });

            card.querySelector('.btn-copy').addEventListener('click', () => {
                navigator.clipboard.writeText(item.text);
                showToast('Copied content to clipboard!', 'success');
            });

            card.querySelector('.btn-delete').addEventListener('click', () => {
                state.history = state.history.filter(i => i.id !== item.id);
                localStorage.setItem('qr_master_history', JSON.stringify(state.history));
                renderHistory(historySearch.value);
                showToast('Item deleted from history.', 'info');
            });

            historyGrid.appendChild(card);
        });
    }

    historySearch.addEventListener('input', (e) => {
        renderHistory(e.target.value);
    });

    btnClearHistory.addEventListener('click', () => {
        if (state.history.length === 0) return;
        state.history = [];
        localStorage.setItem('qr_master_history', JSON.stringify(state.history));
        renderHistory();
        showToast('History log cleared.', 'info');
    });

    updateHistoryBadge();

    // ==========================================
    // 9. UTILITIES & TOAST NOTIFICATIONS
    // ==========================================

    function showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            'success': '<i class="fa-solid fa-circle-check" style="color: #4ade80;"></i>',
            'error': '<i class="fa-solid fa-triangle-exclamation" style="color: #ef4444;"></i>',
            'info': '<i class="fa-solid fa-circle-info" style="color: #6366f1;"></i>'
        };

        toast.innerHTML = `${icons[type] || icons.info} <span>${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(50px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                if (toastContainer.contains(toast)) toastContainer.removeChild(toast);
            }, 300);
        }, 3000);
    }

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
});
