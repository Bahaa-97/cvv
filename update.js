<<<<<<< HEAD
const fs = require('fs');

const files = [
  'templates/arabic-elegant/template.html',
  'templates/ats-master/template.html',
  'templates/creative-spark/template.html',
  'templates/executive-dark/template.html',
  'templates/minimal-clean/template.html',
  'templates/modern-pro/template.html'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Add html2pdf script before closing </body>
  if (!content.includes('html2pdf.bundle.min.js')) {
    content = content.replace('</body>', '  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>\n</body>');
  }

  // Add DOWNLOAD_PDF handler
  if (!content.includes('DOWNLOAD_PDF')) {
    const handler = `} else if (type === 'DOWNLOAD_PDF') {
        const { filename } = event.data;
        document.body.classList.add('print-mode');
        
        // Wait for styles to apply
        setTimeout(() => {
          const opt = {
            margin:       0,
            filename:     filename || 'resume.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, windowWidth: 794, windowHeight: 1123 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };
          
          html2pdf().set(opt).from(document.body).save().then(() => {
            document.body.classList.remove('print-mode');
            window.parent.postMessage({ type: 'DOWNLOAD_COMPLETE' }, '*');
          }).catch(err => {
            console.error('PDF Generation failed:', err);
            document.body.classList.remove('print-mode');
            window.parent.postMessage({ type: 'DOWNLOAD_ERROR' }, '*');
          });
        }, 200);
      `;
    
    content = content.replace("} else if (type === 'PRINT_DOCUMENT') {", handler + "} else if (type === 'PRINT_DOCUMENT') {");
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated ' + file);
=======
const fs = require('fs');

const files = [
  'templates/arabic-elegant/template.html',
  'templates/ats-master/template.html',
  'templates/creative-spark/template.html',
  'templates/executive-dark/template.html',
  'templates/minimal-clean/template.html',
  'templates/modern-pro/template.html'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Add html2pdf script before closing </body>
  if (!content.includes('html2pdf.bundle.min.js')) {
    content = content.replace('</body>', '  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>\n</body>');
  }

  // Add DOWNLOAD_PDF handler
  if (!content.includes('DOWNLOAD_PDF')) {
    const handler = `} else if (type === 'DOWNLOAD_PDF') {
        const { filename } = event.data;
        document.body.classList.add('print-mode');
        
        // Wait for styles to apply
        setTimeout(() => {
          const opt = {
            margin:       0,
            filename:     filename || 'resume.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, windowWidth: 794, windowHeight: 1123 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };
          
          html2pdf().set(opt).from(document.body).save().then(() => {
            document.body.classList.remove('print-mode');
            window.parent.postMessage({ type: 'DOWNLOAD_COMPLETE' }, '*');
          }).catch(err => {
            console.error('PDF Generation failed:', err);
            document.body.classList.remove('print-mode');
            window.parent.postMessage({ type: 'DOWNLOAD_ERROR' }, '*');
          });
        }, 200);
      `;
    
    content = content.replace("} else if (type === 'PRINT_DOCUMENT') {", handler + "} else if (type === 'PRINT_DOCUMENT') {");
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated ' + file);
>>>>>>> 67f94de (Initial static site)
});