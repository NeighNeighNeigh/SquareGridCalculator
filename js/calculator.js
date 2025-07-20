function findDivisors(num) {
    const divisors = [];
    for (let d = 1; d <= num; d++) {
        if (num % d === 0) divisors.push(d);
    }
    return divisors;
}

function findCommonDivisors(num1, num2, minBaseline, maxBaseline) {
    const divisors1 = findDivisors(num1);
    const divisors2 = findDivisors(num2);
    // Return divisors within the specified range
    return divisors1.filter(d => d >= minBaseline && d <= maxBaseline && divisors2.includes(d));
}

function checkDivisibility(cellsX, cellsY) {
    const xDivisible = [];
    const yDivisible = [];
    
    for (let d = 2; d <= cellsX; d++) {
        if (cellsX % d === 0) xDivisible.push(d);
    }
    
    for (let d = 2; d <= cellsY; d++) {
        if (cellsY % d === 0) yDivisible.push(d);
    }
    
    return {
        x: xDivisible,
        y: yDivisible,
        xText: xDivisible.join(', '),
        yText: yDivisible.join(', ')
    };
}

function estimateGridCount(width, height, settings) {
    const {
        minCellSize, maxCellSize,
        allowNonSquare,
        useDesiredColumns, desiredColumns,
        useDesiredRows, desiredRows,
        minInnerPadding, maxInnerPadding,
        minOuterPadding, maxOuterPadding,
        useCustomOuterPadding
    } = settings;

    // Calculate ranges for columns and rows
    const getRange = (size, minSize, useDesired, desiredCount) => {
        if (useDesired) return { start: desiredCount, end: desiredCount };
        const maxCount = Math.floor(size / minSize);
        return { start: 2, end: maxCount };
    };

    const colRange = getRange(width, minCellSize, useDesiredColumns, desiredColumns);
    const rowRange = getRange(height, minCellSize, useDesiredRows, desiredRows);

    // Calculate number of possible column/row combinations
    const numCols = colRange.end - colRange.start + 1;
    const numRows = rowRange.end - rowRange.start + 1;

    // Calculate number of padding combinations
    const numInnerPaddings = maxInnerPadding - minInnerPadding + 1;
    const numOuterPaddings = useCustomOuterPadding ? 
        (maxOuterPadding - minOuterPadding + 1) : 1;

    // Rough estimate of total possible combinations
    return numCols * numRows * numInnerPaddings * numOuterPaddings;
}

function calculateGrids(width, height, settings, onTooMany) {
    const results = [];
    const {
        minCellSize, maxCellSize,
        allowNonSquare,
        useDesiredColumns, desiredColumns,
        useDesiredRows, desiredRows,
        minInnerPadding, maxInnerPadding,
        minOuterPadding, maxOuterPadding,
        useCustomOuterPadding,
        useBaselineGrid
    } = settings;

    // Calculate ranges for columns and rows
    const getRange = (size, minSize, useDesired, desiredCount) => {
        if (useDesired) return { start: desiredCount, end: desiredCount };
        const maxCount = Math.floor(size / minSize);
        return { start: 2, end: maxCount };
    };

    // When dimensions are specified, ignore minCellSize
    const colRange = useDesiredColumns ? 
        { start: desiredColumns, end: desiredColumns } :
        getRange(width, minCellSize, useDesiredColumns, desiredColumns);
    const rowRange = useDesiredRows ? 
        { start: desiredRows, end: desiredRows } :
        getRange(height, minCellSize, useDesiredRows, desiredRows);

    // Try different numbers of cells in each dimension
    for (let cellsX = colRange.start; cellsX <= colRange.end; cellsX++) {
        for (let cellsY = rowRange.start; cellsY <= rowRange.end; cellsY++) {
            // Try different padding values
            for (let innerPadding = minInnerPadding; innerPadding <= maxInnerPadding; innerPadding++) {
                const outerPaddingStart = useCustomOuterPadding ? 
                    (settings.outerPaddingGreaterEqual ? Math.max(minOuterPadding, innerPadding) : minOuterPadding) : 
                    innerPadding;
                const outerPaddingEnd = useCustomOuterPadding ? maxOuterPadding : innerPadding;
                
                const maxGapX = Math.floor((width - cellsX * minCellSize) / (cellsX + 1));
                const maxGapY = Math.floor((height - cellsY * minCellSize) / (cellsY + 1));
                const maxPossibleGap = Math.min(maxGapX, maxGapY);

                for (let outerPadding = outerPaddingStart; 
                     outerPadding <= Math.min(outerPaddingEnd, maxPossibleGap); 
                     outerPadding++) {
                    
                    // Calculate available space after padding
                    const availableWidth = width - (innerPadding * (cellsX - 1)) - (outerPadding * 2);
                    const availableHeight = height - (innerPadding * (cellsY - 1)) - (outerPadding * 2);
                    
                    // Calculate cell dimensions
                    const cellWidth = availableWidth / cellsX;
                    const cellHeight = availableHeight / cellsY;

                    // Check if dimensions are valid
                    const isValidWidth = Number.isInteger(cellWidth) && 
                                       (useDesiredColumns || 
                                        ((!maxCellSize || cellWidth <= maxCellSize) && 
                                         cellWidth >= minCellSize));
                    const isValidHeight = Number.isInteger(cellHeight) && 
                                        (useDesiredRows || 
                                         ((!maxCellSize || cellHeight <= maxCellSize) && 
                                          cellHeight >= minCellSize));

                    // For square grids, ensure width equals height
                    if (!allowNonSquare && cellWidth !== cellHeight) continue;

                    // Check if configuration is valid
                    if (isValidWidth && isValidHeight) {
                        // Calculate actual grid dimensions
                        const gridWidth = cellsX * cellWidth + (cellsX - 1) * innerPadding + 2 * outerPadding;
                        const gridHeight = cellsY * cellHeight + (cellsY - 1) * innerPadding + 2 * outerPadding;
                        
                        // Ensure perfect fill and valid padding
                        const minCellDim = Math.min(cellWidth, cellHeight);
                        if (gridWidth === width && 
                            gridHeight === height && 
                            innerPadding <= minCellDim && 
                            outerPadding <= minCellDim) {
                            
                            // Calculate baseline values if enabled
                            let baselineValues = null;
                            if (useBaselineGrid) {
                                const commonDivisors = findCommonDivisors(cellHeight, innerPadding, settings.minBaselineGrid, settings.maxBaselineGrid);
                                if (commonDivisors.length === 0) continue;
                                baselineValues = commonDivisors.join(', ');
                            }
                            
                            const gridConfig = {
                                columns: cellsX,
                                rows: cellsY,
                                columnWidth: cellWidth,
                                rowHeight: cellHeight,
                                innerPadding,
                                outerPadding,
                                divisibility: checkDivisibility(cellsX, cellsY),
                                baselineValues
                            };
                            results.push(gridConfig);

                            // If we've found 100 valid configurations, check if we should continue
                            if (results.length === 100 && onTooMany) {
                                const shouldContinue = onTooMany();
                                if (!shouldContinue) {
                                    return results;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    return results;
}

export { checkDivisibility, estimateGridCount, calculateGrids };
