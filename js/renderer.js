function generateSVG(width, height, columns, rows, columnWidth, rowHeight, innerPadding, outerPadding, activeBaseline = null, activeSubdivisions = null) {
    // Get current theme
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // Define colors based on theme
    const styles = {
        background: getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim(),
        cell: getComputedStyle(document.documentElement).getPropertyValue('--cell-color').trim(),
        stroke: getComputedStyle(document.documentElement).getPropertyValue('--cell-stroke').trim(),
        strokeWidth: getComputedStyle(document.documentElement).getPropertyValue('--cell-stroke-width').trim(),
        baseline: getComputedStyle(document.documentElement).getPropertyValue('--baseline-color').trim(),
        baselineOpacity: getComputedStyle(document.documentElement).getPropertyValue('--baseline-opacity').trim(),
        baselineWidth: getComputedStyle(document.documentElement).getPropertyValue('--baseline-width').trim(),
        baselineDash: getComputedStyle(document.documentElement).getPropertyValue('--baseline-dash').trim().replace(/"/g, ''),
        subdivision: getComputedStyle(document.documentElement).getPropertyValue('--subdivision-color').trim(),
        subdivisionOpacity: getComputedStyle(document.documentElement).getPropertyValue('--subdivision-opacity').trim(),
        subdivisionWidth: getComputedStyle(document.documentElement).getPropertyValue('--subdivision-width').trim(),
        subdivisionDash: getComputedStyle(document.documentElement).getPropertyValue('--subdivision-dash').trim().replace(/"/g, '')
    };

    let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Canvas background
    svg += `<rect id="Canvas" width="${width}" height="${height}" fill="${styles.background}"/>`;
    
    // Draw grid cells
    svg += `<g id="Cells">`;
    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            const x = outerPadding + (i * (columnWidth + innerPadding));
            const y = outerPadding + (j * (rowHeight + innerPadding));
            
            svg += `<rect x="${x}" y="${y}" width="${columnWidth}" height="${rowHeight}" 
                    fill="${styles.cell}" stroke="${styles.stroke}" stroke-width="${styles.strokeWidth}"/>`;
        }
    }
    svg += `</g>`;
    
    // Draw baseline lines if active (in their own layer on top)
    if (activeBaseline) {
        svg += `<g class="baseline-layer" id="Baseline">`;
        const startY = outerPadding;
        const endY = outerPadding + (rows * rowHeight) + ((rows-1) * innerPadding);
        
        for (let y = startY; y <= endY; y += activeBaseline) {
            const dashAttr = styles.baselineDash ? ` stroke-dasharray="${styles.baselineDash}"` : '';
            svg += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" 
                    stroke="${styles.baseline}" stroke-width="${styles.baselineWidth}" opacity="${styles.baselineOpacity}"${dashAttr}/>`;
        }
        svg += `</g>`;
    }
    
    // Draw subdivision lines if active
    if (activeSubdivisions) {
        // Horizontal subdivisions (vertical lines)
        if (activeSubdivisions.h > 0) {
            svg += `<g class="subdivision-layer" id="HorizontalSubdivisions">`;
            const cellsPerSection = columns / activeSubdivisions.h;
            
            // Draw first edge
            const x0 = outerPadding;
            // Get dash attribute for subdivision lines
            const subdivDashAttr = styles.subdivisionDash ? ` stroke-dasharray="${styles.subdivisionDash}"` : '';
            
            // Draw first edge
            svg += `<line x1="${x0}" y1="0" x2="${x0}" y2="${height}" 
                    stroke="${styles.subdivision}" stroke-width="${styles.subdivisionWidth}"${subdivDashAttr} opacity="${styles.subdivisionOpacity}"/>`;
            
            // Draw internal edges
            for (let section = 1; section < activeSubdivisions.h; section++) {
                // Calculate x positions for the start and end of each section
                const sectionStartCell = section * cellsPerSection;
                const x1 = outerPadding + (sectionStartCell - 1) * (columnWidth + innerPadding) + columnWidth;
                const x2 = outerPadding + sectionStartCell * (columnWidth + innerPadding);
                
                // Draw two lines for each subdivision
                svg += `<line x1="${x1}" y1="0" x2="${x1}" y2="${height}" 
                        stroke="${styles.subdivision}" stroke-width="${styles.subdivisionWidth}"${subdivDashAttr} opacity="${styles.subdivisionOpacity}"/>`;
                svg += `<line x1="${x2}" y1="0" x2="${x2}" y2="${height}" 
                        stroke="${styles.subdivision}" stroke-width="${styles.subdivisionWidth}"${subdivDashAttr} opacity="${styles.subdivisionOpacity}"/>`;
            }
            
            // Draw last edge
            const xLast = outerPadding + (columns - 1) * (columnWidth + innerPadding) + columnWidth;
            svg += `<line x1="${xLast}" y1="0" x2="${xLast}" y2="${height}" 
                    stroke="${styles.subdivision}" stroke-width="${styles.subdivisionWidth}"${subdivDashAttr} opacity="${styles.subdivisionOpacity}"/>`;
            svg += `</g>`;
        }
        
        // Vertical subdivisions (horizontal lines)
        if (activeSubdivisions.v > 0) {
            svg += `<g class="subdivision-layer" id="VerticalSubdivisions">`;
            const cellsPerSection = rows / activeSubdivisions.v;
            
            // Draw first edge
            const y0 = outerPadding;
            // Get dash attribute for subdivision lines
            const subdivDashAttr = styles.subdivisionDash ? ` stroke-dasharray="${styles.subdivisionDash}"` : '';
            
            // Draw first edge
            svg += `<line x1="0" y1="${y0}" x2="${width}" y2="${y0}" 
                    stroke="${styles.subdivision}" stroke-width="${styles.subdivisionWidth}"${subdivDashAttr} opacity="${styles.subdivisionOpacity}"/>`;
            
            // Draw internal edges
            for (let section = 1; section < activeSubdivisions.v; section++) {
                // Calculate y positions for the start and end of each section
                const sectionStartCell = section * cellsPerSection;
                const y1 = outerPadding + (sectionStartCell - 1) * (rowHeight + innerPadding) + rowHeight;
                const y2 = outerPadding + sectionStartCell * (rowHeight + innerPadding);
                
                // Draw two lines for each subdivision
                svg += `<line x1="0" y1="${y1}" x2="${width}" y2="${y1}" 
                        stroke="${styles.subdivision}" stroke-width="${styles.subdivisionWidth}"${subdivDashAttr} opacity="${styles.subdivisionOpacity}"/>`;
                svg += `<line x1="0" y1="${y2}" x2="${width}" y2="${y2}" 
                        stroke="${styles.subdivision}" stroke-width="${styles.subdivisionWidth}"${subdivDashAttr} opacity="${styles.subdivisionOpacity}"/>`;
            }
            
            // Draw last edge
            const yLast = outerPadding + (rows - 1) * (rowHeight + innerPadding) + rowHeight;
            svg += `<line x1="0" y1="${yLast}" x2="${width}" y2="${yLast}" 
                    stroke="${styles.subdivision}" stroke-width="${styles.subdivisionWidth}"${subdivDashAttr} opacity="${styles.subdivisionOpacity}"/>`;
            svg += `</g>`;
        }
    }
    
    svg += '</svg>';
    return svg;
}

function createGridCard(result, index, canvasWidth, canvasHeight, activeSubdivisions = null) {
    const gridItem = document.createElement('div');
    gridItem.className = 'grid-item';
    
    const svg = generateSVG(
        canvasWidth,
        canvasHeight,
        result.columns,
        result.rows,
        result.columnWidth,
        result.rowHeight,
        result.innerPadding,
        result.outerPadding,
        null, // activeBaseline
        activeSubdivisions
    );
    
    const useCustomOuterPadding = document.getElementById('useCustomOuterPadding').checked;
    const paddingInfo = useCustomOuterPadding ? `
            <div class="grid-info-row">
                <div class="grid-info-label">Inner Padding:</div>
                <div class="grid-info-value">${result.innerPadding}px</div>
            </div>
            <div class="grid-info-row">
                <div class="grid-info-label">Outer Padding:</div>
                <div class="grid-info-value">${result.outerPadding}px</div>
            </div>
    ` : `
            <div class="grid-info-row">
                <div class="grid-info-label">Padding:</div>
                <div class="grid-info-value">${result.innerPadding}px</div>
            </div>
    `;

    gridItem.innerHTML = `
        <div class="grid-info">
            <div class="grid-info-row">
                <div class="grid-info-label">Grid Size:</div>
                <div class="grid-info-value">${result.columns}×${result.rows}</div>
            </div>
            <div class="grid-info-row">
                <div class="grid-info-label">Cell Size:</div>
                <div class="grid-info-value">${result.columnWidth}×${result.rowHeight}px</div>
            </div>
            ${paddingInfo}
            <div class="grid-info-row subdivisions-row">
                <div class="grid-info-label">Subdivisions:</div>
            </div>
            <div class="subdivisions-container">
                <div class="subdivision-line">
                    <span class="subdivisions-label">H:</span>
                    <div class="subdivisions-values">
                        ${result.divisibility.x.map(value => 
                            `<span class="subdivision-value h-value" data-value="${value}">${value}</span>`
                        ).join('')}
                    </div>
                </div>
                <div class="subdivision-line">
                    <span class="subdivisions-label">V:</span>
                    <div class="subdivisions-values">
                        ${result.divisibility.y.map(value => 
                            `<span class="subdivision-value v-value" data-value="${value}">${value}</span>`
                        ).join('')}
                    </div>
                </div>
            </div>
            ${result.baselineValues !== null ? `
            <div class="grid-info-row baseline-row">
                <div class="grid-info-label">Baseline Values:</div>
            </div>
            <div class="baseline-container">
                <div class="baseline-values">
                    ${result.baselineValues.split(', ').map(value => 
                        `<span class="baseline-value" data-value="${value}">${value}</span>`
                    ).join('')}
                </div>
            </div>
            ` : ''}
        </div>
        ${svg}
        <div class="button-group">
            <button class="view-btn" data-index="${index}">View</button>
            <button class="download-btn" data-index="${index}">Download</button>
        </div>
    `;
    
    return gridItem;
}

function handleSVG(result, width, height, activeBaseline = null, activeSubdivisions = null, mode = 'view') {
    // Generate SVG using the existing generateSVG function
    const svg = generateSVG(
        width, height,
        result.columns, result.rows,
        result.columnWidth, result.rowHeight,
        result.innerPadding, result.outerPadding,
        activeBaseline,
        activeSubdivisions
    );
    
    // Create blob and URL
    const blob = new Blob([svg], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    
    if (mode === 'download') {
        // Create filename based on grid parameters
        const filename = `grid_${result.columns}x${result.rows}_${result.columnWidth}x${result.rowHeight}_inner${result.innerPadding}_outer${result.outerPadding}${activeBaseline ? `_baseline${activeBaseline}` : ''}.svg`;
        
        // Create and trigger download
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    } else {
        // Open in new tab
        window.open(url, '_blank');
    }
    
    // Cleanup
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

// Maintain existing function names for backward compatibility
const viewFullSVG = (result, width, height, activeBaseline = null, activeSubdivisions = null) => 
    handleSVG(result, width, height, activeBaseline, activeSubdivisions, 'view');

const downloadSVG = (result, width, height, activeBaseline = null, activeSubdivisions = null) => 
    handleSVG(result, width, height, activeBaseline, activeSubdivisions, 'download');

function displayResults(results, canvasWidth, canvasHeight) {
    const resultsContainer = document.getElementById('results');
    const resultsCount = document.getElementById('results-count');
    resultsContainer.innerHTML = '';
    
    // Update results count
    resultsCount.classList.remove('hidden');
    if (results.length === 0) {
        resultsCount.textContent = 'No valid grid configurations found';
        return;
    }
    resultsCount.textContent = `Found ${results.length} grid${results.length === 1 ? '' : 's'}`;
    
    // Scroll to results count after a small delay
    setTimeout(() => {
        const yOffset = 10; // Add a small offset from the top
        const y = resultsCount.getBoundingClientRect().top + window.pageYOffset - yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }, 100);
    
    results.forEach((result, index) => {
        const gridItem = createGridCard(result, index, canvasWidth, canvasHeight);
        resultsContainer.appendChild(gridItem);
        
        // Store the active values in data attributes
        gridItem.dataset.activeBaseline = '0';
        gridItem.dataset.activeSubdivisionH = '0';
        gridItem.dataset.activeSubdivisionV = '0';
        
        // Add click handlers for baseline and subdivision values
        const baselineValues = gridItem.querySelectorAll('.baseline-value');
        baselineValues.forEach(value => {
            value.addEventListener('click', function() {
                const baselineValue = parseInt(this.dataset.value);
                const currentActive = parseInt(gridItem.dataset.activeBaseline);
                
                // Remove active class from all values
                baselineValues.forEach(v => v.classList.remove('active'));
                
                // Toggle baseline value
                if (currentActive === baselineValue) {
                    gridItem.dataset.activeBaseline = '0';
                } else {
                    this.classList.add('active');
                    gridItem.dataset.activeBaseline = baselineValue;
                }
                
                // Update SVG with both baseline and subdivisions
                const svg = generateSVG(
                    canvasWidth, canvasHeight,
                    result.columns, result.rows,
                    result.columnWidth, result.rowHeight,
                    result.innerPadding, result.outerPadding,
                    parseInt(gridItem.dataset.activeBaseline),
                    {
                        h: parseInt(gridItem.dataset.activeSubdivisionH),
                        v: parseInt(gridItem.dataset.activeSubdivisionV)
                    }
                );
                
                gridItem.querySelector('svg').outerHTML = svg;
            });
        });

        // Add click handlers for subdivision values
        const subdivisionValues = gridItem.querySelectorAll('.subdivision-value');
        subdivisionValues.forEach(value => {
            value.addEventListener('click', function() {
                const subdivValue = parseInt(this.dataset.value);
                const isHorizontal = this.classList.contains('h-value');
                
                // Get current active values
                const currentH = parseInt(gridItem.dataset.activeSubdivisionH);
                const currentV = parseInt(gridItem.dataset.activeSubdivisionV);
                
                // Remove active class from all values in the same direction
                gridItem.querySelectorAll(isHorizontal ? '.h-value' : '.v-value')
                    .forEach(v => v.classList.remove('active'));
                
                // Toggle subdivision value
                if ((isHorizontal && currentH === subdivValue) || (!isHorizontal && currentV === subdivValue)) {
                    if (isHorizontal) {
                        gridItem.dataset.activeSubdivisionH = '0';
                    } else {
                        gridItem.dataset.activeSubdivisionV = '0';
                    }
                } else {
                    this.classList.add('active');
                    if (isHorizontal) {
                        gridItem.dataset.activeSubdivisionH = subdivValue;
                    } else {
                        gridItem.dataset.activeSubdivisionV = subdivValue;
                    }
                }
                
                // Update SVG with both baseline and subdivisions
                const svg = generateSVG(
                    canvasWidth, canvasHeight,
                    result.columns, result.rows,
                    result.columnWidth, result.rowHeight,
                    result.innerPadding, result.outerPadding,
                    parseInt(gridItem.dataset.activeBaseline),
                    {
                        h: parseInt(gridItem.dataset.activeSubdivisionH),
                        v: parseInt(gridItem.dataset.activeSubdivisionV)
                    }
                );
                
                gridItem.querySelector('svg').outerHTML = svg;
            });
        });
    });

    // Add event listeners for buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const gridItem = this.closest('.grid-item');
            const activeBaseline = parseInt(gridItem.dataset.activeBaseline);
            const activeSubdivisions = {
                h: parseInt(gridItem.dataset.activeSubdivisionH),
                v: parseInt(gridItem.dataset.activeSubdivisionV)
            };
            viewFullSVG(results[index], canvasWidth, canvasHeight, activeBaseline, activeSubdivisions);
        });
    });

    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const gridItem = this.closest('.grid-item');
            const activeBaseline = parseInt(gridItem.dataset.activeBaseline);
            const activeSubdivisions = {
                h: parseInt(gridItem.dataset.activeSubdivisionH),
                v: parseInt(gridItem.dataset.activeSubdivisionV)
            };
            downloadSVG(results[index], canvasWidth, canvasHeight, activeBaseline, activeSubdivisions);
        });
    });
}

export { generateSVG, createGridCard, viewFullSVG, downloadSVG, displayResults };
