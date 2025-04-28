// Debug script to find all headline elements and potential duplicates
document.addEventListener('DOMContentLoaded', function() {
  // Find all headline elements
  const headlineElements = document.querySelectorAll('.headline');
  console.log('Found ' + headlineElements.length + ' headline elements:');
  
  headlineElements.forEach((h, i) => {
    console.log(`Headline #${i}:`, h);
    console.log(`HTML: ${h.outerHTML}`);
    console.log(`Display Style: ${getComputedStyle(h).display}`);
    console.log(`Visibility Style: ${getComputedStyle(h).visibility}`);
    console.log(`Position: ${getComputedStyle(h).position}`);
    console.log('---');
  });
  
  // Find any h1 elements that are not visible
  const h1Elements = document.querySelectorAll('h1');
  console.log('Found ' + h1Elements.length + ' h1 elements:');
  
  h1Elements.forEach((h, i) => {
    console.log(`H1 #${i}:`, h);
    console.log(`HTML: ${h.outerHTML}`);
    console.log(`Display Style: ${getComputedStyle(h).display}`);
    console.log(`Visibility Style: ${getComputedStyle(h).visibility}`);
    console.log(`Position: ${getComputedStyle(h).position}`);
    console.log('---');
  });
  
  // Check for pseudo-elements that might be causing duplicates
  const headlineElement = document.querySelector('.headline');
  if (headlineElement) {
    const beforeContent = getComputedStyle(headlineElement, '::before').content;
    const afterContent = getComputedStyle(headlineElement, '::after').content;
    
    console.log('Headline ::before content:', beforeContent);
    console.log('Headline ::after content:', afterContent);
  }
}); 