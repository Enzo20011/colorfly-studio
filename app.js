const paletteContainer = document.getElementById('palette-container');
const generateBtn = document.getElementById('generate-btn');
const btnHex = document.getElementById('btn-hex');
const btnHsl = document.getElementById('btn-hsl');
const sizeSelect = document.getElementById('palette-size');
const toastContainer = document.getElementById('toast-container');
const toastMessage = document.getElementById('toast-message');
const helpBtn = document.getElementById('help-btn');
const helpModal = document.getElementById('help-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const closeGuideBtn = document.getElementById('close-guide-btn');

const PALETTE_KEY = 'colorfly_palette_v2';
const SIZE_KEY = 'colorfly_size_v2';
const VALID_SIZES = [6, 8, 9];

let currentPalette = [];
let paletteSize = 6;
let activeFormat = 'hex';

function readStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Sin almacenamiento disponible: la paleta sigue funcionando, solo no se guarda.
    }
}

function loadSavedPalette() {
    try {
        const parsed = JSON.parse(readStorage(PALETTE_KEY));
        const valid = Array.isArray(parsed) && parsed.every(
            (c) => c && /^#[0-9A-Fa-f]{6}$/.test(c.hex) && typeof c.hsl === 'string'
        );
        return valid ? parsed : [];
    } catch {
        return [];
    }
}

function init() {
    const savedSize = parseInt(readStorage(SIZE_KEY), 10);
    if (VALID_SIZES.includes(savedSize)) {
        paletteSize = savedSize;
        sizeSelect.value = String(paletteSize);
    }

    currentPalette = loadSavedPalette();
    if (currentPalette.length !== paletteSize) {
        generateNewPalette();
    } else {
        renderPalette();
    }

    setupEventListeners();
}

function setupEventListeners() {
    generateBtn.addEventListener('click', generateNewPalette);
    btnHex.addEventListener('click', () => setActiveFormat('hex'));
    btnHsl.addEventListener('click', () => setActiveFormat('hsl'));

    sizeSelect.addEventListener('change', (e) => {
        const newSize = parseInt(e.target.value, 10);
        if (newSize > paletteSize) {
            for (let i = paletteSize; i < newSize; i++) {
                currentPalette.push(createRandomColorObj());
            }
        } else if (newSize < paletteSize) {
            currentPalette = currentPalette.slice(0, newSize);
        }

        paletteSize = newSize;
        writeStorage(SIZE_KEY, paletteSize);
        saveAndRender();
    });

    helpBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    closeGuideBtn.addEventListener('click', closeModal);

    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && helpModal.classList.contains('show')) {
            closeModal();
            return;
        }

        if (e.code === 'Space' && !helpModal.classList.contains('show')) {
            const tag = document.activeElement.tagName;
            if (tag !== 'BUTTON' && tag !== 'SELECT' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
                e.preventDefault();
                generateNewPalette();
            }
        }
    });
}

function openModal() {
    helpModal.classList.add('show');
    helpModal.setAttribute('aria-hidden', 'false');
    closeModalBtn.focus();
}

function closeModal() {
    helpModal.classList.remove('show');
    helpModal.setAttribute('aria-hidden', 'true');
    helpBtn.focus();
}

function setActiveFormat(format) {
    activeFormat = format;

    btnHex.classList.toggle('active', format === 'hex');
    btnHex.setAttribute('aria-pressed', String(format === 'hex'));
    btnHsl.classList.toggle('active', format === 'hsl');
    btnHsl.setAttribute('aria-pressed', String(format === 'hsl'));

    renderPalette();
}

function generateRandomHex() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function hexToRgb(hex) {
    return [
        parseInt(hex.substring(1, 3), 16),
        parseInt(hex.substring(3, 5), 16),
        parseInt(hex.substring(5, 7), 16),
    ];
}

function hexToHsl(hex) {
    const [r8, g8, b8] = hexToRgb(hex);
    const r = r8 / 255;
    const g = g8 / 255;
    const b = b8 / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h;
    let s;
    const l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            default: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

// Elige texto blanco o negro según la luminancia relativa del fondo (WCAG).
function prefersLightInk(hex) {
    const [r, g, b] = hexToRgb(hex).map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance < 0.18;
}

function createRandomColorObj() {
    const hex = generateRandomHex();
    return { hex, hsl: hexToHsl(hex), locked: false };
}

function generateNewPalette() {
    if (currentPalette.length !== paletteSize) {
        currentPalette = Array.from({ length: paletteSize }, createRandomColorObj);
    } else {
        currentPalette = currentPalette.map((color) => (color.locked ? color : createRandomColorObj()));
    }
    saveAndRender();
}

function saveAndRender() {
    writeStorage(PALETTE_KEY, JSON.stringify(currentPalette));
    renderPalette();
}

function createValueButton(text, className) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = className;
    btn.textContent = text;
    btn.setAttribute('aria-label', `Copiar ${text}`);
    btn.addEventListener('click', () => copyToClipboard(text));
    return btn;
}

function renderPalette() {
    paletteContainer.innerHTML = '';
    paletteContainer.style.setProperty('--palette-size', paletteSize);

    currentPalette.forEach((color, index) => {
        const card = document.createElement('div');
        card.className = `color-card${prefersLightInk(color.hex) ? ' light-ink' : ''}`;
        card.style.backgroundColor = color.hex;
        card.style.setProperty('--card', color.hex);

        const lockBtn = document.createElement('button');
        lockBtn.type = 'button';
        lockBtn.className = 'lock-btn';
        lockBtn.addEventListener('click', () => toggleLock(index, lockBtn));
        updateLockButton(lockBtn, color.locked);

        const isHex = activeFormat === 'hex';
        const primary = createValueButton(
            isHex ? color.hex : color.hsl,
            `value-btn value-btn--main${isHex ? '' : ' is-hsl'}`
        );

        const secondary = document.createElement('span');
        secondary.className = 'value-sub';
        secondary.textContent = isHex ? color.hsl : color.hex;

        const group = document.createElement('div');
        group.className = 'value-group';
        group.append(primary, secondary);

        card.append(lockBtn, group);
        paletteContainer.appendChild(card);
    });
}

function updateLockButton(btn, locked) {
    btn.classList.toggle('locked', locked);
    btn.textContent = locked ? 'Bloqueado' : 'Bloquear';
    btn.setAttribute('aria-pressed', String(locked));
    btn.setAttribute('aria-label', locked ? 'Desbloquear este color' : 'Bloquear este color');
}

function toggleLock(index, btn) {
    currentPalette[index].locked = !currentPalette[index].locked;
    writeStorage(PALETTE_KEY, JSON.stringify(currentPalette));
    updateLockButton(btn, currentPalette[index].locked);
}

function copyToClipboard(text) {
    const done = () => showToast(`Copiado: ${text}`);

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done).catch(() => showToast('No se pudo copiar'));
        return;
    }

    // Respaldo para contextos sin la API del portapapeles.
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try {
        document.execCommand('copy') ? done() : showToast('No se pudo copiar');
    } catch {
        showToast('No se pudo copiar');
    }
    area.remove();
}

let toastTimeout;
function showToast(message) {
    toastMessage.textContent = message;
    toastContainer.classList.add('show');
    toastContainer.setAttribute('aria-hidden', 'false');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toastContainer.classList.remove('show');
        toastContainer.setAttribute('aria-hidden', 'true');
    }, 2500);
}

window.addEventListener('DOMContentLoaded', init);
