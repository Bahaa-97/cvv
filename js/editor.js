/**
 * CVFlow — Editor Script
 * Handles real-time form updates, dynamic lists (experience, education),
 * design controls, and PDF generation.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const { templates, debounce, showToast, getParam } = window.CVFlow;

  // ── Elements: Navigation & Tabs ─────────────────────────────
  const templateNameEl = document.getElementById('editorTemplateName');
  const saveStatusEl = document.getElementById('saveStatus');
  const previewFrame = document.getElementById('resumePreview');
  const tabBtns = document.querySelectorAll('.panel-tab');
  const tabPanels = document.querySelectorAll('.panel-content');
  const bpBtns = document.querySelectorAll('.bp-btn');
  const previewWrapper = document.getElementById('previewWrapper');
  
  // ── Elements: Form Inputs ─────────────────────────────────
  const inputFullName = document.getElementById('inputFullName');
  const inputJobTitle = document.getElementById('inputJobTitle');
  const inputEmail = document.getElementById('inputEmail');
  const inputPhone = document.getElementById('inputPhone');
  const inputCity = document.getElementById('inputCity');
  const inputCountry = document.getElementById('inputCountry');
  const inputWebsite = document.getElementById('inputWebsite');
  const inputLinkedin = document.getElementById('inputLinkedin');
  const inputGithub = document.getElementById('inputGithub');
  const inputSummary = document.getElementById('inputSummary');
  const summaryCount = document.getElementById('summaryCount');
  
  // ── Elements: Dynamic Lists ───────────────────────────────
  const experienceList = document.getElementById('experienceList');
  const btnAddExperience = document.getElementById('addExperience');
  const educationList = document.getElementById('educationList');
  const btnAddEducation = document.getElementById('addEducation');
  const languagesList = document.getElementById('languagesList');
  const btnAddLanguage = document.getElementById('addLanguage');
  
  // ── Elements: Skills ──────────────────────────────────────
  const skillInput = document.getElementById('skillInput');
  const skillsTags = document.getElementById('skillsTags');
  const skillsInputArea = document.getElementById('skillsInputArea');
  
  // ── Elements: Design Controls ─────────────────────────────
  const colorSwatches = document.querySelectorAll('.color-swatch');
  const customColorInput = document.getElementById('customColor');
  const fontOptions = document.querySelectorAll('.font-option');
  const fontSizeSlider = document.getElementById('fontSizeSlider');
  const fontSizeValue = document.getElementById('fontSizeValue');
  const spacingSlider = document.getElementById('spacingSlider');
  const spacingValue = document.getElementById('spacingValue');
  
  // ── Buttons ───────────────────────────────────────────────
  const btnDownloadPdf = document.getElementById('downloadPdfBtn');
  const btnReset = document.getElementById('resetBtn');
  const pdfOverlay = document.getElementById('pdfOverlay');
  const mobilePreviewFab = document.getElementById('mobilePreviewFab');
  const mobileClosePreview = document.getElementById('mobileClosePreview');

  // ── State ──────────────────────────────────────────────────
  let currentTemplate = null;
  let resumeData = {
    personal: {},
    social: {},
    summary: '',
    experience: [],
    education: [],
    skills: [],
    languages: [],
    design: {
      color: '#6366f1',
      font: 'Inter',
      fontSize: 12,
      spacing: 1.5
    }
  };

  // ── Initialization ─────────────────────────────────────────
  await initEditor();

  async function initEditor() {
    await templates.load();
    const templateId = getParam('template') || 'modern-pro';
    currentTemplate = templates.getById(templateId);

    if (!currentTemplate) {
      showToast('Template not found. Redirecting...', 'error');
      setTimeout(() => window.location.href = 'templates.html', 2000);
      return;
    }

    templateNameEl.textContent = currentTemplate.name;
    
    // Set default color from template
    resumeData.design.color = currentTemplate.color;
    updateDesignControlsUI();

    // Load saved data or populate defaults
    loadSavedData();
    
    // Setup iframe
    setupIframe();

    // Bind all events
    bindEvents();
    
    // Collapsible sections
    setupCollapsibleSections();
    
    // Listen for language changes
    window.addEventListener('languageChanged', () => {
      renderDynamicLists();
    });
  }

  // ── Iframe Communication ───────────────────────────────────
  function setupIframe() {
    // We append ?t=timestamp to avoid caching
    previewFrame.src = `${currentTemplate.path}template.html?t=${Date.now()}`;
    
    previewFrame.onload = () => {
      // Inject CSS variables
      updateIframeDesign();
      // Render initial data
      updatePreview();
    };
  }

  function updatePreview() {
    if (!previewFrame.contentWindow) return;
    
    // We send a postMessage to the iframe to update its content
    previewFrame.contentWindow.postMessage({
      type: 'UPDATE_DATA',
      data: resumeData
    }, '*');
    
    showSaveStatus();
    saveToLocal();
  }

  function updateIframeDesign() {
    if (!previewFrame.contentWindow) return;
    previewFrame.contentWindow.postMessage({
      type: 'UPDATE_DESIGN',
      design: resumeData.design
    }, '*');
  }

  // ── Persistence ────────────────────────────────────────────
  function saveToLocal() {
    localStorage.setItem('rf_resume_data', JSON.stringify(resumeData));
  }

  function loadSavedData() {
    const saved = localStorage.getItem('rf_resume_data');
    if (saved) {
      try {
        resumeData = JSON.parse(saved);
        populateFormFromData();
        renderDynamicLists();
        renderSkills();
      } catch (e) {
        console.error('Error parsing saved data', e);
        loadSampleData();
      }
    } else {
      loadSampleData();
    }
  }

  function loadSampleData() {
    resumeData = {
      personal: {
        fullName: 'Jane Doe',
        jobTitle: 'Senior UI/UX Designer',
        photo: '',
        email: 'jane.doe@example.com',
        phone: '+1 (555) 123-4567',
        city: 'San Francisco',
        country: 'USA',
        website: 'janedoe.design'
      },
      social: {
        linkedin: 'linkedin.com/in/janedoe',
        github: 'github.com/janedoe'
      },
      summary: 'Passionate and detail-oriented UI/UX Designer with over 6 years of experience creating user-centric digital products. Proven track record of improving user engagement and conversion rates through intuitive design solutions. Adept at collaborating with cross-functional teams to bring creative visions to life.',
      experience: [
        {
          id: Date.now().toString(),
          title: 'Senior Product Designer',
          company: 'Tech Innovators Inc.',
          location: 'San Francisco, CA',
          startDate: '2020',
          endDate: 'Present',
          description: 'Led the redesign of the core SaaS platform, resulting in a 25% increase in user retention. Managed a team of 3 junior designers and established a comprehensive design system.'
        },
        {
          id: (Date.now() + 1).toString(),
          title: 'UI Designer',
          company: 'Creative Agency LLC',
          location: 'New York, NY',
          startDate: '2017',
          endDate: '2020',
          description: 'Collaborated with clients across various industries to design responsive websites and mobile applications. Conducted user research and usability testing.'
        }
      ],
      education: [
        {
          id: Date.now().toString(),
          degree: 'Bachelor of Fine Arts in Graphic Design',
          school: 'Rhode Island School of Design',
          location: 'Providence, RI',
          startDate: '2013',
          endDate: '2017',
          description: 'Graduated with Honors. Specialized in interaction design and typography.'
        }
      ],
      skills: ['UI/UX Design', 'Figma', 'Prototyping', 'User Research', 'HTML/CSS', 'Design Systems', 'Wireframing', 'Adobe Creative Suite'],
      languages: [
        { id: Date.now().toString(), name: 'English', level: 'Native' },
        { id: (Date.now() + 1).toString(), name: 'Spanish', level: 'Intermediate' }
      ],
      design: resumeData.design // keep current design
    };
    
    populateFormFromData();
    renderDynamicLists();
    renderSkills();
    updatePreview();
    updateIframeDesign();
  }

  // ── Form Population ────────────────────────────────────────
  function populateFormFromData() {
    inputFullName.value = resumeData.personal.fullName || '';
    inputJobTitle.value = resumeData.personal.jobTitle || '';
    inputEmail.value = resumeData.personal.email || '';
    inputPhone.value = resumeData.personal.phone || '';
    inputCity.value = resumeData.personal.city || '';
    inputCountry.value = resumeData.personal.country || '';
    inputWebsite.value = resumeData.personal.website || '';
    
    const removePhotoBtn = document.getElementById('removePhotoBtn');
    if (removePhotoBtn) {
      if (resumeData.personal.photo) {
        removePhotoBtn.style.display = 'block';
      } else {
        removePhotoBtn.style.display = 'none';
      }
    }
    
    inputLinkedin.value = resumeData.social.linkedin || '';
    inputGithub.value = resumeData.social.github || '';
    
    inputSummary.value = resumeData.summary || '';
    updateSummaryCount();
    
    updateDesignControlsUI();
  }

  function updateSummaryCount() {
    const len = inputSummary.value.length;
    summaryCount.textContent = `${len} / 500`;
    summaryCount.style.color = len > 500 ? 'var(--brand-accent)' : 'var(--text-muted)';
  }

  // ── Events Binding ─────────────────────────────────────────
  function bindEvents() {
    // Photo Upload
    const inputPhoto = document.getElementById('inputPhoto');
    const removePhotoBtn = document.getElementById('removePhotoBtn');
    
    if (inputPhoto && removePhotoBtn) {
      inputPhoto.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            resumeData.personal.photo = evt.target.result;
            removePhotoBtn.style.display = 'block';
            updatePreview();
          };
          reader.readAsDataURL(file);
        }
      });
      
      removePhotoBtn.addEventListener('click', () => {
        resumeData.personal.photo = '';
        inputPhoto.value = '';
        removePhotoBtn.style.display = 'none';
        updatePreview();
      });
    }

    // Input handlers
    const handleInput = debounce(() => {
      resumeData.personal = {
        fullName: inputFullName.value,
        jobTitle: inputJobTitle.value,
        photo: resumeData.personal.photo,
        email: inputEmail.value,
        phone: inputPhone.value,
        city: inputCity.value,
        country: inputCountry.value,
        website: inputWebsite.value
      };
      resumeData.social = {
        linkedin: inputLinkedin.value,
        github: inputGithub.value
      };
      resumeData.summary = inputSummary.value;
      
      updatePreview();
    }, 400);

    // Bind standard inputs
    [inputFullName, inputJobTitle, inputEmail, inputPhone, inputCity, inputCountry, inputWebsite, inputLinkedin, inputGithub].forEach(el => {
      el.addEventListener('input', handleInput);
    });

    inputSummary.addEventListener('input', () => {
      updateSummaryCount();
      handleInput();
    });

    // Reset button
    btnReset.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset to sample data? Current data will be lost.')) {
        loadSampleData();
      }
    });

    // Dynamic lists Add buttons
    btnAddExperience.addEventListener('click', () => addDynamicItem('experience'));
    btnAddEducation.addEventListener('click', () => addDynamicItem('education'));
    btnAddLanguage.addEventListener('click', () => addDynamicItem('languages'));

    // Skills
    skillsInputArea.addEventListener('click', () => skillInput.focus());
    skillInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const val = skillInput.value.trim().replace(/,$/, '');
        if (val && !resumeData.skills.includes(val)) {
          resumeData.skills.push(val);
          skillInput.value = '';
          renderSkills();
          updatePreview();
        }
      } else if (e.key === 'Backspace' && skillInput.value === '') {
        resumeData.skills.pop();
        renderSkills();
        updatePreview();
      }
    });

    // Tabs
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(`tab${btn.dataset.tab.charAt(0).toUpperCase() + btn.dataset.tab.slice(1)}Panel`).classList.add('active');
      });
    });

    // Breakpoints
    bpBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        bpBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        if (btn.dataset.bp === 'mobile') {
          previewWrapper.classList.add('mobile-view');
        } else {
          previewWrapper.classList.remove('mobile-view');
        }
      });
    });

    // Design: Colors
    colorSwatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        colorSwatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        resumeData.design.color = swatch.dataset.color;
        updateIframeDesign();
        saveToLocal();
      });
    });

    customColorInput.addEventListener('input', (e) => {
      colorSwatches.forEach(s => s.classList.remove('active'));
      const col = e.target.value;
      resumeData.design.color = col;
      customColorInput.parentElement.style.borderColor = col;
      updateIframeDesign();
      saveToLocal();
    });

    // Design: Fonts
    fontOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        fontOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        resumeData.design.font = opt.dataset.font;
        updateIframeDesign();
        saveToLocal();
      });
    });

    // Design: Sliders
    fontSizeSlider.addEventListener('input', (e) => {
      fontSizeValue.textContent = `${e.target.value}px`;
      resumeData.design.fontSize = e.target.value;
      updateIframeDesign();
      saveToLocal();
    });

    spacingSlider.addEventListener('input', (e) => {
      let label = 'Normal';
      if (e.target.value < 1.3) label = 'Compact';
      else if (e.target.value > 1.7) label = 'Spacious';
      spacingValue.textContent = label;
      
      resumeData.design.spacing = e.target.value;
      updateIframeDesign();
      saveToLocal();
    });

    // PDF Download
    btnDownloadPdf.addEventListener('click', generatePDF);

    // Mobile Preview Overlay Toggle
    if (mobilePreviewFab && mobileClosePreview) {
      mobilePreviewFab.addEventListener('click', () => {
        document.body.classList.add('preview-active');
      });
      mobileClosePreview.addEventListener('click', () => {
        document.body.classList.remove('preview-active');
      });
    }
  }

  // ── Collapsible Sections ───────────────────────────────────
  function setupCollapsibleSections() {
    const headers = document.querySelectorAll('.form-section-header');
    headers.forEach(header => {
      header.addEventListener('click', () => {
        const section = header.parentElement;
        section.classList.toggle('collapsed');
      });
    });
  }

  // ── Dynamic Lists Logic (Exp, Edu, Lang) ───────────────────
  function renderDynamicLists() {
    renderList('experience', experienceList, (item) => `
      <div class="form-group">
        <label class="form-label" data-i18n="ed_item_title">Title / Position</label>
        <input type="text" class="form-control item-input" data-field="title" value="${item.title || ''}">
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label" data-i18n="ed_item_company">Company</label>
          <input type="text" class="form-control item-input" data-field="company" value="${item.company || ''}">
        </div>
        <div class="form-group">
          <label class="form-label" data-i18n="ed_item_loc">Location</label>
          <input type="text" class="form-control item-input" data-field="location" value="${item.location || ''}">
        </div>
        <div class="form-group">
          <label class="form-label" data-i18n="ed_item_start">Start Date</label>
          <input type="text" class="form-control item-input" data-field="startDate" value="${item.startDate || ''}" placeholder="e.g. Jan 2020">
        </div>
        <div class="form-group">
          <label class="form-label" data-i18n="ed_item_end">End Date</label>
          <input type="text" class="form-control item-input" data-field="endDate" value="${item.endDate || ''}" placeholder="e.g. Present">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" data-i18n="ed_item_desc">Description</label>
        <textarea class="form-control item-input" data-field="description" rows="3">${item.description || ''}</textarea>
      </div>
    `);

    renderList('education', educationList, (item) => `
      <div class="form-group">
        <label class="form-label" data-i18n="ed_item_deg">Degree / Program</label>
        <input type="text" class="form-control item-input" data-field="degree" value="${item.degree || ''}">
      </div>
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label" data-i18n="ed_item_school">School / University</label>
          <input type="text" class="form-control item-input" data-field="school" value="${item.school || ''}">
        </div>
        <div class="form-group">
          <label class="form-label" data-i18n="ed_item_loc">Location</label>
          <input type="text" class="form-control item-input" data-field="location" value="${item.location || ''}">
        </div>
        <div class="form-group">
          <label class="form-label" data-i18n="ed_item_start">Start Date</label>
          <input type="text" class="form-control item-input" data-field="startDate" value="${item.startDate || ''}">
        </div>
        <div class="form-group">
          <label class="form-label" data-i18n="ed_item_end">End Date</label>
          <input type="text" class="form-control item-input" data-field="endDate" value="${item.endDate || ''}">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" data-i18n="ed_item_desc">Description (Optional)</label>
        <textarea class="form-control item-input" data-field="description" rows="2">${item.description || ''}</textarea>
      </div>
    `);

    renderList('languages', languagesList, (item) => `
      <div class="form-grid-2">
        <div class="form-group">
          <label class="form-label" data-i18n="ed_item_lang">Language</label>
          <input type="text" class="form-control item-input" data-field="name" value="${item.name || ''}">
        </div>
        <div class="form-group">
          <label class="form-label" data-i18n="ed_item_level">Level</label>
          <input type="text" class="form-control item-input" data-field="level" value="${item.level || ''}" placeholder="e.g. Fluent, Native">
        </div>
      </div>
    `);
  }

  function renderList(type, container, htmlGenerator) {
    container.innerHTML = '';
    const items = resumeData[type];
    
    items.forEach((item, index) => {
      const el = document.createElement('div');
      el.className = 'dynamic-item';
      
      // Determine title for header
      let headerTitle = `Item ${index + 1}`;
      if (type === 'experience') headerTitle = item.title || item.company || headerTitle;
      else if (type === 'education') headerTitle = item.degree || item.school || headerTitle;
      else if (type === 'languages') headerTitle = item.name || headerTitle;

      el.innerHTML = `
        <div class="dynamic-item-header">
          <span class="dynamic-item-title">${headerTitle}</span>
          <div class="dynamic-item-actions">
            <button class="btn-item-delete" type="button" data-id="${item.id}" title="Remove item">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="dynamic-item-body">
          ${htmlGenerator(item)}
        </div>
      `;

      // Bind delete
      el.querySelector('.btn-item-delete').addEventListener('click', () => {
        resumeData[type] = resumeData[type].filter(i => i.id !== item.id);
        renderDynamicLists();
        updatePreview();
      });

      // Bind inputs
      const inputs = el.querySelectorAll('.item-input');
      inputs.forEach(input => {
        input.addEventListener('input', debounce((e) => {
          const field = e.target.dataset.field;
          item[field] = e.target.value;
          
          // Update header text in real-time
          if (['title', 'company', 'degree', 'school', 'name'].includes(field)) {
            let newTitle = 'Item';
            if (type === 'experience') newTitle = item.title || item.company || newTitle;
            else if (type === 'education') newTitle = item.degree || item.school || newTitle;
            else if (type === 'languages') newTitle = item.name || newTitle;
            el.querySelector('.dynamic-item-title').textContent = newTitle;
          }
          
          updatePreview();
        }, 400));
      });

      container.appendChild(el);
    });

    // Translate any freshly created data-i18n attributes
    const lang = window.CVFlow.lang ? window.CVFlow.lang.get() : 'en';
    const dict = window.CVFlow.translations ? window.CVFlow.translations[lang] : null;
    if (dict) {
      container.querySelectorAll('[data-i18n]').forEach(tag => {
        const key = tag.getAttribute('data-i18n');
        if (dict[key]) {
          tag.textContent = dict[key];
        }
      });
    }
  }

  function addDynamicItem(type) {
    const newItem = { id: Date.now().toString() };
    resumeData[type].push(newItem);
    renderDynamicLists();
    
    // Expand section if collapsed
    const section = document.getElementById(`section-${type}`);
    if (section && section.classList.contains('collapsed')) {
      section.classList.remove('collapsed');
    }
    
    updatePreview();
  }

  // ── Skills ─────────────────────────────────────────────────
  function renderSkills() {
    skillsTags.innerHTML = '';
    resumeData.skills.forEach((skill, index) => {
      const tag = document.createElement('span');
      tag.className = 'skill-tag';
      tag.innerHTML = `
        ${skill}
        <button class="skill-tag-remove" data-index="${index}" type="button">
          <i class="fa-solid fa-xmark"></i>
        </button>
      `;
      
      tag.querySelector('.skill-tag-remove').addEventListener('click', () => {
        resumeData.skills.splice(index, 1);
        renderSkills();
        updatePreview();
      });
      
      skillsTags.appendChild(tag);
    });
  }

  // ── UI Updates ─────────────────────────────────────────────
  function updateDesignControlsUI() {
    // Colors
    colorSwatches.forEach(s => {
      if (s.dataset.color.toLowerCase() === resumeData.design.color.toLowerCase()) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });

    // Fonts
    fontOptions.forEach(o => {
      if (o.dataset.font === resumeData.design.font) o.classList.add('active');
      else o.classList.remove('active');
    });

    // Sliders
    fontSizeSlider.value = resumeData.design.fontSize;
    fontSizeValue.textContent = `${resumeData.design.fontSize}px`;
    
    spacingSlider.value = resumeData.design.spacing;
    let label = 'Normal';
    if (resumeData.design.spacing < 1.3) label = 'Compact';
    else if (resumeData.design.spacing > 1.7) label = 'Spacious';
    spacingValue.textContent = label;
  }

  function showSaveStatus() {
    saveStatusEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    saveStatusEl.style.color = 'var(--text-muted)';
    
    setTimeout(() => {
      saveStatusEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> Auto-saved';
      saveStatusEl.style.color = 'var(--brand-success)';
    }, 600);
  }

  // ── PDF Generation ─────────────────────────────────────────
  async function generatePDF() {
    if (!previewFrame.contentWindow) return;

    pdfOverlay.hidden = false;
    const nameStr = resumeData.personal.fullName ? resumeData.personal.fullName.replace(/\s+/g, '_') : 'Resume';
    const filename = `${nameStr}.pdf`;

    previewFrame.contentWindow.postMessage({ 
      type: 'DOWNLOAD_PDF', 
      filename: filename 
    }, '*');

    // Add a temporary listener for the download completion
    const messageHandler = (event) => {
      if (event.data && event.data.type === 'DOWNLOAD_COMPLETE') {
        pdfOverlay.hidden = true;
        showToast('PDF downloaded successfully.', 'success');
        window.removeEventListener('message', messageHandler);
      } else if (event.data && event.data.type === 'DOWNLOAD_ERROR') {
        pdfOverlay.hidden = true;
        showToast('PDF Generation failed. Try printing (Ctrl+P).', 'error');
        window.removeEventListener('message', messageHandler);
        // Fallback to native print
        previewFrame.contentWindow.postMessage({ type: 'PRINT_DOCUMENT' }, '*');
      }
    };
    window.addEventListener('message', messageHandler);

    // Timeout fallback just in case the iframe doesn't respond
    setTimeout(() => {
      if (!pdfOverlay.hidden) {
        pdfOverlay.hidden = true;
        window.removeEventListener('message', messageHandler);
        showToast('Download request sent.', 'success');
      }
    }, 5000);
  }});
