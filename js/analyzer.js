document.addEventListener('DOMContentLoaded', () => {
  try {
    const pdf = window.pdfjsLib || window['pdfjs-dist/build/pdf'];
    if (pdf) {
      pdf.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    } else {
      console.warn("PDF library not found on load.");
    }

    const form = document.getElementById('analyzerForm');
    const apiKeyInput = document.getElementById('apiKey');
    const pdfUpload = document.getElementById('pdfUpload');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resultsCard = document.getElementById('resultsCard');
    
    const ratingValue = document.getElementById('ratingValue');
    const prosList = document.getElementById('prosList');
    const consList = document.getElementById('consList');

    // Load saved API key
    const savedKey = localStorage.getItem('rf_gemini_key');
    if (savedKey) {
      apiKeyInput.value = savedKey;
    }

    let extractedCvText = '';

  // Auto-extract text from PDF when selected
  pdfUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) {
      extractedCvText = '';
      return;
    }
    
    const originalBtnText = analyzeBtn.innerHTML;
    analyzeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Extracting text...';
    analyzeBtn.disabled = true;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const typedarray = new Uint8Array(arrayBuffer);
      const pdfLib = window.pdfjsLib || window['pdfjs-dist/build/pdf'];
      const pdfDoc = await pdfLib.getDocument({ data: typedarray }).promise;
      let text = '';
      
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        text += textContent.items.map(item => item.str).join(' ') + '\n';
      }
      
      extractedCvText = text.trim();
      if (!extractedCvText) {
        alert('Could not find any readable text in the PDF. Is it a scanned image?');
        pdfUpload.value = '';
      }
    } catch (err) {
      console.error(err);
      extractedCvText = '';
      alert('Failed to extract text from PDF. The file might be corrupted or unreadable.');
      pdfUpload.value = '';
    } finally {
      analyzeBtn.innerHTML = originalBtnText;
      analyzeBtn.disabled = false;
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) return alert('API Key is required. Please get one from Google AI Studio.');
    
    if (!extractedCvText) return alert('Please upload a valid PDF CV first.');

    // Save key
    localStorage.setItem('rf_gemini_key', apiKey);

    // Update UI
    const originalBtnText = analyzeBtn.innerHTML;
    analyzeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span data-i18n="analyzer_analyzing">Analyzing...</span>';
    analyzeBtn.disabled = true;
    resultsCard.classList.remove('active');
    
    // Apply translations if language is Arabic
    if (window.ResumeForge && window.ResumeForge.translations) {
        const lang = localStorage.getItem('rf_lang') || 'en';
        if (lang === 'ar') {
            analyzeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span data-i18n="analyzer_analyzing">' + window.ResumeForge.translations.ar.analyzer_analyzing + '</span>';
        }
    }

    try {
      const prompt = `You are an expert HR and CV analyzer.
Analyze the following CV text.
Return the result EXACTLY as a JSON object with the following structure:
{
  "rating": "A number out of 10 representing the overall strength of the CV",
  "pros": ["pro 1", "pro 2", ...],
  "cons": ["con 1", "con 2", ...]
}
Do not include any other text, markdown formatting, or explanations outside the JSON block.
CV Text:
${extractedCvText}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            response_mime_type: "application/json",
          }
        })
      });

      if (!response.ok) {
        let errText = await response.text();
        try {
           const errJson = JSON.parse(errText);
           errText = errJson.error ? errJson.error.message : errText;
        } catch(e) {}
        throw new Error(`API Error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const resultText = data.candidates[0].content.parts[0].text;
      
      let parsedResult;
      try {
        parsedResult = JSON.parse(resultText);
      } catch (err) {
        // Fallback in case Gemini wrapped it in markdown despite instructions
        const cleanedText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedResult = JSON.parse(cleanedText);
      }

      // Display results
      ratingValue.textContent = parsedResult.rating + '/10';
      
      prosList.innerHTML = '';
      parsedResult.pros.forEach(pro => {
        const li = document.createElement('li');
        li.textContent = pro;
        prosList.appendChild(li);
      });

      consList.innerHTML = '';
      parsedResult.cons.forEach(con => {
        const li = document.createElement('li');
        li.textContent = con;
        consList.appendChild(li);
      });

      resultsCard.classList.add('active');
      // Scroll to results
      resultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch (err) {
      console.error(err);
      let errorMsg = "An error occurred during analysis. Please check your API key and try again.";
      if (window.ResumeForge && window.ResumeForge.translations) {
        const lang = localStorage.getItem('rf_lang') || 'en';
        errorMsg = window.ResumeForge.translations[lang].analyzer_error;
      }
      alert(errorMsg + "\n\n[تفاصيل للمطورين]:\n" + err.message);
    } finally {
      analyzeBtn.innerHTML = originalBtnText;
      analyzeBtn.disabled = false;
    }
  });
  
  } catch (error) {
    alert("Script Error: " + error.message);
  }
});
