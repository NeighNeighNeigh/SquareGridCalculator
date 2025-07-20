import { generateSVG } from './renderer.js';

// Modal handling
function initModal() {
    const helpIcon = document.querySelector('.help-icon');
    const modal = document.getElementById('helpModal');
    const closeBtn = modal.querySelector('.close-modal');

    helpIcon.addEventListener('click', () => {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });

    closeBtn.addEventListener('click', closeModal);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
}

function closeModal() {
    const modal = document.getElementById('helpModal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

// Theme handling
let prefersDark;
let systemThemeListener;

function updateThemeColor(theme) {
    const themeColor = theme === 'dark' ? '#2d2d2d' : '#fff';
    document.querySelector('meta[name="theme-color"]').setAttribute('content', themeColor);
}

function initTheme() {
    prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const savedThemeChoice = localStorage.getItem('themeChoice') || 'system';
    const themeInputs = document.querySelectorAll('input[name="theme"]');
    
    // Set initial radio button state
    themeInputs.forEach(input => {
        if (input.value === savedThemeChoice) {
            input.checked = true;
        }
    });
    
    // Setup system theme listener
    systemThemeListener = (e) => {
        const currentChoice = localStorage.getItem('themeChoice') || 'system';
        if (currentChoice === 'system') {
            const systemTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', systemTheme);
            updateThemeColor(systemTheme);
        }
    };
    prefersDark.addEventListener('change', systemThemeListener);
    
    // Handle theme radio changes
    themeInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const choice = e.target.value;
            localStorage.setItem('themeChoice', choice);
            
            if (choice === 'system') {
                const systemTheme = prefersDark.matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', systemTheme);
                updateThemeColor(systemTheme);
            } else {
                document.documentElement.setAttribute('data-theme', choice);
                updateThemeColor(choice);
            }
            
            // Regenerate SVGs with new theme
            regenerateGrids();
        });
    });
    
    // Set initial theme
    if (savedThemeChoice === 'system') {
        const systemTheme = prefersDark.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', systemTheme);
        updateThemeColor(systemTheme);
        return systemTheme;
    } else {
        document.documentElement.setAttribute('data-theme', savedThemeChoice);
        updateThemeColor(savedThemeChoice);
        return savedThemeChoice;
    }
}

function regenerateGrids() {
    const gridItems = document.querySelectorAll('.grid-item');
    gridItems.forEach(gridItem => {
        const gridInfo = gridItem.querySelector('.grid-info');
        if (!gridInfo) return;
        
        // Extract grid parameters from the info display
        const gridSize = gridInfo.querySelector('.grid-info-value').textContent.split('×').map(Number);
        const cellSize = gridInfo.querySelectorAll('.grid-info-value')[1].textContent.split('×').map(n => parseInt(n));
        const padding = parseInt(gridInfo.querySelectorAll('.grid-info-value')[2].textContent);
        
        // Get active baseline and subdivision values
        const activeBaseline = parseInt(gridItem.dataset.activeBaseline) || null;
        const activeSubdivisions = {
            h: parseInt(gridItem.dataset.activeSubdivisionH) || 0,
            v: parseInt(gridItem.dataset.activeSubdivisionV) || 0
        };
        
        // Generate new SVG with current theme
        const svg = generateSVG(
            gridSize[0] * cellSize[0] + (gridSize[0] - 1) * padding + padding * 2,
            gridSize[1] * cellSize[1] + (gridSize[1] - 1) * padding + padding * 2,
            gridSize[0],
            gridSize[1],
            cellSize[0],
            cellSize[1],
            padding,
            padding,
            activeBaseline,
            activeSubdivisions
        );
        
        // Replace old SVG with new one
        const oldSvg = gridItem.querySelector('svg');
        if (oldSvg) {
            oldSvg.outerHTML = svg;
        }
    });
}

// Input handling
function initializeInputHandlers() {
    // Store user values and states
    let userColumnsValue = '8';
    let userRowsValue = '6';
    let lastColumnCheckState = false;
    let lastRowCheckState = false;

    document.getElementById('desiredColumns').addEventListener('input', function() {
        userColumnsValue = this.value;
    });

    document.getElementById('desiredRows').addEventListener('input', function() {
        userRowsValue = this.value;
    });

    document.getElementById('useDesiredColumns').addEventListener('change', function() {
        const columnsInput = document.getElementById('desiredColumns');
        columnsInput.disabled = !this.checked;
        lastColumnCheckState = this.checked;
        if (!this.checked) {
            columnsInput.value = '';
        } else {
            columnsInput.value = userColumnsValue;
        }
        updateCellSizeLabels();
    });

    document.getElementById('useDesiredRows').addEventListener('change', function() {
        const rowsInput = document.getElementById('desiredRows');
        rowsInput.disabled = !this.checked;
        lastRowCheckState = this.checked;
        if (!this.checked) {
            rowsInput.value = '';
        } else {
            rowsInput.value = userRowsValue;
        }
        updateCellSizeLabels();
    });

    document.getElementById('allowNonSquare').addEventListener('change', function() {
        const customControls = document.getElementById('customGridControls');
        const columnsCheckbox = document.getElementById('useDesiredColumns');
        const rowsCheckbox = document.getElementById('useDesiredRows');
        const columnsInput = document.getElementById('desiredColumns');
        const rowsInput = document.getElementById('desiredRows');
        
        customControls.classList.toggle('hidden', !this.checked);
        
        if (!this.checked) {
            // Store current states before hiding
            lastColumnCheckState = columnsCheckbox.checked;
            lastRowCheckState = rowsCheckbox.checked;
            
            // Clear and disable inputs
            columnsCheckbox.checked = false;
            rowsCheckbox.checked = false;
            columnsInput.disabled = true;
            rowsInput.disabled = true;
            columnsInput.value = '';
            rowsInput.value = '';
        } else {
            // Restore previous states
            columnsCheckbox.checked = lastColumnCheckState;
            rowsCheckbox.checked = lastRowCheckState;
            columnsInput.disabled = !lastColumnCheckState;
            rowsInput.disabled = !lastRowCheckState;
            if (lastColumnCheckState) columnsInput.value = userColumnsValue;
            if (lastRowCheckState) rowsInput.value = userRowsValue;
        }
        updateCellSizeLabels();
    });

    document.getElementById('useCustomOuterPadding').addEventListener('change', function() {
        const controls = document.querySelector('.outer-padding-controls');
        controls.classList.toggle('hidden', !this.checked);
        
        controls.querySelectorAll('input').forEach(input => {
            input.disabled = !this.checked;
        });

        // Reset greater than or equal checkbox when outer padding is disabled
        if (!this.checked) {
            document.getElementById('outerPaddingGreaterEqual').checked = false;
        }
    });

    document.getElementById('useBaselineGrid').addEventListener('change', function() {
        const controls = document.getElementById('baselineGridControls');
        controls.classList.toggle('hidden', !this.checked);
        
        controls.querySelectorAll('input').forEach(input => {
            input.disabled = !this.checked;
        });
    });
}

function updateCellSizeLabels() {
    const useColumns = document.getElementById('useDesiredColumns').checked;
    const useRows = document.getElementById('useDesiredRows').checked;
    const cellSizeControls = document.getElementById('cellSizeControls');
    const minLabel = document.querySelector('label[for="minCellSize"]');
    const maxLabel = document.querySelector('label[for="maxCellSize"]');
    
    // Hide controls if both dimensions are specified
    cellSizeControls.classList.toggle('hidden', useColumns && useRows);
    
    // Update labels based on which dimension is specified
    if (useColumns && !useRows) {
        minLabel.textContent = 'Min Row Size:';
        maxLabel.textContent = 'Max Row Size:';
    } else if (useRows && !useColumns) {
        minLabel.textContent = 'Min Column Size:';
        maxLabel.textContent = 'Max Column Size:';
    } else {
        minLabel.textContent = 'Min Cell Size:';
        maxLabel.textContent = 'Max Cell Size:';
    }
}

function getReasons(settings) {
    const reasons = [];
    if (settings.maxCellSize - settings.minCellSize > 100) 
        reasons.push('Large cell size range (' + settings.minCellSize + ' to ' + settings.maxCellSize + 'px)');
    if (settings.maxInnerPadding - settings.minInnerPadding > 20)
        reasons.push('Many padding values (' + settings.minInnerPadding + ' to ' + settings.maxInnerPadding + 'px)');
    if (settings.allowNonSquare && !settings.useDesiredColumns && !settings.useDesiredRows)
        reasons.push('Unconstrained non-square grid (try setting desired columns/rows)');
    if (settings.useCustomOuterPadding && settings.maxOuterPadding - settings.minOuterPadding > 20)
        reasons.push('Wide outer padding range (' + settings.minOuterPadding + ' to ' + settings.maxOuterPadding + 'px)');
    return reasons;
}

function getSettings() {
    const width = parseInt(document.getElementById('width').value);
    const height = parseInt(document.getElementById('height').value);
    const allowNonSquare = document.getElementById('allowNonSquare').checked;
    const useBaselineGrid = document.getElementById('useBaselineGrid').checked;
    
    return {
        width,
        height,
        minCellSize: parseInt(document.getElementById('minCellSize').value),
        maxCellSize: parseInt(document.getElementById('maxCellSize').value),
        allowNonSquare,
        useBaselineGrid,
        useDesiredColumns: allowNonSquare && document.getElementById('useDesiredColumns').checked,
        desiredColumns: parseInt(document.getElementById('desiredColumns').value),
        useDesiredRows: allowNonSquare && document.getElementById('useDesiredRows').checked,
        desiredRows: parseInt(document.getElementById('desiredRows').value),
        minInnerPadding: parseInt(document.getElementById('minInnerPadding').value),
        maxInnerPadding: parseInt(document.getElementById('maxInnerPadding').value),
        useCustomOuterPadding: document.getElementById('useCustomOuterPadding').checked,
        outerPaddingGreaterEqual: document.getElementById('outerPaddingGreaterEqual').checked,
        minOuterPadding: parseInt(document.getElementById('minOuterPadding').value),
        maxOuterPadding: parseInt(document.getElementById('maxOuterPadding').value),
        minBaselineGrid: parseInt(document.getElementById('minBaselineGrid').value),
        maxBaselineGrid: parseInt(document.getElementById('maxBaselineGrid').value)
    };
}

export { 
    initTheme, 
    initializeInputHandlers, 
    updateCellSizeLabels, 
    getReasons, 
    getSettings,
    initModal
};
