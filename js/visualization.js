// Visualization service for D3 visualizations
const VisualizationService = {
  // Create a 3D scatter plot for embeddings visualization
  createEmbeddingVisualization: function(
    containerId, 
    embeddings, 
    labels, 
    colors = null,
    width = 600,
    height = 400
  ) {
    // Clear any existing visualization
    d3.select(`#${containerId}`).selectAll('*').remove();
    
    // Project embeddings to 3D if they're in higher dimensions
    let projectedData;
    if (embeddings.length > 0 && embeddings[0].length > 3) {
      projectedData = EmbeddingService.projectEmbeddingsTo3D(embeddings);
    } else {
      projectedData = embeddings;
    }
    
    // Get the container width
    const containerWidth = document.getElementById(containerId).clientWidth;
    width = containerWidth || width;
    
    // Create SVG container
    const svg = d3.select(`#${containerId}`)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);
    
    // Define scales
    const xExtent = d3.extent(projectedData, d => d[0]);
    const yExtent = d3.extent(projectedData, d => d[1]);
    const zExtent = projectedData[0] && projectedData[0].length > 2 
      ? d3.extent(projectedData, d => d[2]) 
      : [0, 1];
    
    const xScale = d3.scaleLinear()
      .domain([xExtent[0], xExtent[1]])
      .range([-width / 3, width / 3]);
    
    const yScale = d3.scaleLinear()
      .domain([yExtent[0], yExtent[1]])
      .range([-height / 3, height / 3]);
    
    const zScale = d3.scaleLinear()
      .domain([zExtent[0], zExtent[1]])
      .range([5, 15]); // Use size to represent z-dimension
    
    // Define color scale if not provided
    const colorScale = colors || d3.scaleOrdinal(d3.schemeCategory10);
    
    // Create points
    svg.selectAll('circle')
      .data(projectedData)
      .enter()
      .append('circle')
      .attr('cx', (d, i) => xScale(d[0]))
      .attr('cy', (d, i) => yScale(d[1]))
      .attr('r', (d, i) => projectedData[0].length > 2 ? zScale(d[2]) : 8)
      .attr('fill', (d, i) => {
        if (typeof colorScale === 'function') {
          return colorScale(i);
        } else {
          return colorScale[i] || '#1f77b4';
        }
      })
      .attr('opacity', 0.7)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1);
    
    // Add labels
    if (labels) {
      svg.selectAll('text')
        .data(projectedData)
        .enter()
        .append('text')
        .attr('x', (d, i) => xScale(d[0]) + 12)
        .attr('y', (d, i) => yScale(d[1]) + 4)
        .text((d, i) => labels[i])
        .attr('font-size', '10px')
        .attr('fill', '#333');
    }
    
    // Add rotation capability
    let rotation = 0;
    let dragging = false;
    let dragStartX = 0;
    
    svg.on('mousedown', function(event) {
      dragging = true;
      dragStartX = event.clientX;
    });
    
    d3.select('body')
      .on('mousemove', function(event) {
        if (dragging) {
          const dx = event.clientX - dragStartX;
          rotation += dx / 100;
          dragStartX = event.clientX;
          
          // Only rotate if we have 3D data
          if (projectedData[0] && projectedData[0].length > 2) {
            svg.selectAll('circle')
              .attr('cx', (d, i) => {
                const x = d[0];
                const z = d[2];
                const rotatedX = x * Math.cos(rotation) - z * Math.sin(rotation);
                return xScale(rotatedX);
              });
              
            if (labels) {
              svg.selectAll('text')
                .attr('x', (d, i) => {
                  const x = d[0];
                  const z = d[2];
                  const rotatedX = x * Math.cos(rotation) - z * Math.sin(rotation);
                  return xScale(rotatedX) + 12;
                });
            }
          }
        }
      })
      .on('mouseup', function() {
        dragging = false;
      });
    
    return {
      update: (newEmbeddings, newLabels, newColors) => {
        // Clear previous visualization and create a new one
        this.createEmbeddingVisualization(
          containerId, 
          newEmbeddings, 
          newLabels, 
          newColors, 
          width, 
          height
        );
      }
    };
  }
};
