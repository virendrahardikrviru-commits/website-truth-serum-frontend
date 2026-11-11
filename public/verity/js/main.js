(() => {
  'use strict';

  const select = (selector, scope = document) => scope.querySelector(selector);
  const selectAll = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  // Header and mobile navigation
  const header = select('[data-header]');
  const menuButton = select('[data-menu-toggle]');
  const mobileNavigation = select('[data-mobile-nav]');

  const updateHeader = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 12);
  };

  const closeMenu = (returnFocus = false) => {
    if (!menuButton || !mobileNavigation) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    mobileNavigation.hidden = true;
    document.body.classList.remove('menu-open');
    if (returnFocus) menuButton.focus();
  };

  if (menuButton && mobileNavigation) {
    menuButton.addEventListener('click', () => {
      const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(willOpen));
      menuButton.setAttribute('aria-label', willOpen ? 'Close navigation' : 'Open navigation');
      mobileNavigation.hidden = !willOpen;
      document.body.classList.toggle('menu-open', willOpen);
    });

    selectAll('a', mobileNavigation).forEach((link) => {
      link.addEventListener('click', () => closeMenu());
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
        closeMenu(true);
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 960) closeMenu();
    });
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  // Respect reduced-motion preferences and avoid hidden content without JS.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealItems = selectAll('.reveal');
  revealItems.forEach((item) => {
    if (item.dataset.delay) item.style.setProperty('--reveal-delay', `${item.dataset.delay}ms`);
  });

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -25px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const year = select('#current-year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Accessible, independently expandable FAQs
  selectAll('.faq-item button[aria-controls]').forEach((button) => {
    button.addEventListener('click', () => {
      const answer = document.getElementById(button.getAttribute('aria-controls'));
      if (!answer) return;
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      answer.hidden = expanded;
    });
  });

  // Sample report tabs with arrow-key navigation
  const reportExplorer = select('[data-report-explorer]');
  if (reportExplorer) {
    const tabs = selectAll('[data-report-tab]', reportExplorer);
    const panels = selectAll('[data-report-panel]', reportExplorer);

    const activateTab = (tab, moveFocus = false) => {
      const target = tab.dataset.reportTab;
      tabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.reportPanel !== target;
      });
      if (moveFocus) tab.focus();
      if (window.innerWidth <= 720) {
        tab.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'nearest' });
      }
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activateTab(tab));
      tab.addEventListener('keydown', (event) => {
        let nextIndex = null;
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
        if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = tabs.length - 1;
        if (nextIndex !== null) {
          event.preventDefault();
          activateTab(tabs[nextIndex], true);
        }
      });
    });
  }

  // Draft legal notices use native modal dialogs for focus management.
  let activeDialogTrigger = null;
  selectAll('[data-dialog-open]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const dialog = document.getElementById(trigger.dataset.dialogOpen);
      if (!dialog || typeof dialog.showModal !== 'function') return;
      activeDialogTrigger = trigger;
      dialog.showModal();
      document.body.classList.add('dialog-open');
    });
  });

  selectAll('dialog').forEach((dialog) => {
    selectAll('[data-dialog-close]', dialog).forEach((button) => {
      button.addEventListener('click', () => dialog.close());
    });
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      const inside = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
      if (!inside) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
      if (activeDialogTrigger) activeDialogTrigger.focus();
    });
  });

  // Early-access request form
  const form = select('#verification-request-form');
  if (!form) return;

  // VERITY uses the existing WebsiteTruthSerum Supabase project.
  const supabaseConfig = window.VERITY_SUPABASE_CONFIG;
  const supabaseClient = (
    window.supabase &&
    typeof window.supabase.createClient === 'function' &&
    supabaseConfig &&
    supabaseConfig.url &&
    supabaseConfig.anonKey
  )
    ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey)
    : null;

  const submitButton = select('[data-submit-button]', form);
  const submitLabel = select('[data-submit-label]', form);
  const submitArrow = submitButton ? select('.icon', submitButton) : null;
  const spinner = select('.button-spinner', form);
  const formStatus = select('#form-status');
  const formSuccess = select('#form-success');
  const requestReference = select('#request-reference');
  const requestHeading = select('.request-card-heading');
  const notes = select('#investigation-notes');
  const notesCount = select('#notes-count');

  const fields = {
    fullName: select('#full-name'),
    email: select('#business-email'),
    companyName: select('#company-name'),
    businessType: select('#business-type'),
    businessWebsite: select('#business-website'),
    supplierWebsite: select('#supplier-website'),
    supplierCountry: select('#supplier-country'),
    services: select('#requested-services'),
    purpose: select('#verification-purpose'),
    purposeDetails: select('#purpose-details'),
    notes,
    deliverable: select('#expected-deliverable'),
    paidAck: select('#paid-service-acknowledgement'),
    consent: select('#privacy-consent')
  };

  if (notes && notesCount) {
    notes.addEventListener('input', () => {
      notesCount.textContent = String(notes.value.length);
    });
  }

  const normalizeWebsite = (value) => {
    const trimmed = value.trim();
    if (!trimmed) throw new Error('Please enter a website.');
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    let parsed;
    try {
      parsed = new URL(withProtocol);
    } catch {
      throw new Error('Enter a valid website, such as https://company.com.');
    }
    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname.includes('.') || parsed.username || parsed.password) {
      throw new Error('Enter a valid public website, such as https://company.com.');
    }
    return parsed.href;
  };

  const setFieldError = (field, message) => {
    if (!field) return;
    const error = document.getElementById(`${field.id}-error`);
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (error) error.textContent = message;
  };

  const clearErrors = () => {
    [
      fields.fullName,
      fields.email,
      fields.businessWebsite,
      fields.supplierWebsite,
      fields.services,
      fields.purpose,
      fields.notes,
      fields.deliverable,
      fields.paidAck,
      fields.consent
    ].forEach((field) => setFieldError(field, ''));

    if (formStatus) formStatus.hidden = true;
  };

  const validateForm = () => {
    clearErrors();
    const invalidFields = [];

    if (fields.fullName.value.trim().length < 2) {
      setFieldError(fields.fullName, 'Please enter your full name.');
      invalidFields.push(fields.fullName);
    }

    if (!fields.email.value.trim() || !fields.email.validity.valid) {
      setFieldError(fields.email, 'Please enter a valid business email address.');
      invalidFields.push(fields.email);
    }

    [fields.businessWebsite, fields.supplierWebsite].forEach((field) => {
      try {
        normalizeWebsite(field.value);
      } catch (error) {
        setFieldError(field, error.message);
        invalidFields.push(field);
      }
    });

    const selectedServices = fields.services.querySelectorAll('input[name="requested_services"]:checked');

    if (selectedServices.length === 0) {
      setFieldError(fields.services, 'Please select at least one verification service.');
      invalidFields.push(fields.services.querySelector('input[name="requested_services"]'));
    }

    if (!fields.purpose.value) {
      setFieldError(fields.purpose, 'Please select why you need this verification.');
      invalidFields.push(fields.purpose);
    }

    if (fields.notes.value.trim().length < 10) {
      setFieldError(fields.notes, 'Please provide at least 10 characters describing what you want investigated.');
      invalidFields.push(fields.notes);
    }

    if (!fields.deliverable.value) {
      setFieldError(fields.deliverable, 'Please select your expected deliverable.');
      invalidFields.push(fields.deliverable);
    }

    if (!fields.paidAck.checked) {
      setFieldError(fields.paidAck, 'Please acknowledge the paid-service terms before submitting.');
      invalidFields.push(fields.paidAck);
    }

    if (!fields.consent.checked) {
      setFieldError(fields.consent, 'Please confirm that we may use these details to respond to your request.');
      invalidFields.push(fields.consent);
    }

    if (invalidFields.length) {
      invalidFields[0].focus();
      return false;
    }

    return true;
  };

  [
    fields.fullName,
    fields.email,
    fields.businessWebsite,
    fields.supplierWebsite,
    fields.notes
  ].forEach((field) => {
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') setFieldError(field, '');
    });
  });

  [fields.purpose, fields.deliverable].forEach((field) => {
    field.addEventListener('change', () => setFieldError(field, ''));
  });

  fields.services.querySelectorAll('input[name="requested_services"]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      if (fields.services.querySelector('input[name="requested_services"]:checked')) {
        setFieldError(fields.services, '');
      }
    });
  });

  fields.paidAck.addEventListener('change', () => {
    if (fields.paidAck.checked) setFieldError(fields.paidAck, '');
  });

  fields.consent.addEventListener('change', () => {
    if (fields.consent.checked) setFieldError(fields.consent, '');
  });
  const setSubmitting = (submitting) => {
    submitButton.disabled = submitting;
    submitButton.setAttribute('aria-busy', String(submitting));
    submitLabel.textContent = submitting ? 'Submitting Your Request' + '\u2026' : 'Submit Verification Enquiry';
    if (submitArrow) submitArrow.hidden = submitting;
    if (spinner) spinner.hidden = !submitting;
    selectAll('input, select, textarea', form).forEach((field) => {
      field.readOnly = submitting && field.type !== 'checkbox';
      if (field.tagName === 'SELECT' || field.type === 'checkbox') field.disabled = submitting;
    });
  };

  const showFormError = (message) => {
    formStatus.textContent = message;
    formStatus.className = 'form-status error';
    formStatus.hidden = false;
    formStatus.setAttribute('role', 'alert');
  };

  const submissionErrorMessage = (status) => {
    if ([404, 405, 501].includes(status)) {
      return 'The early-access request service is not connected on this site yet. Your information has not been sent or saved, and your entries remain in the form. Please try again once the service is available.';
    }
    if (status === 401 || status === 403) {
      return 'The request service could not accept your submission because access is not configured. Your information has not been saved, and your entries remain in the form.';
    }
    if (status === 413) {
      return 'The request was too large for the request service. Please shorten your investigation notes and try again. Your entries remain in the form.';
    }
    if (status === 429) {
      return 'The request service is receiving too many submissions right now. Your information has not been saved. Please wait and try again; your entries remain in the form.';
    }
    return 'We could not save your request because the request service returned an error. No confirmation has been created. Your entries remain in the form so you can try again later.';
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const payload = {
      full_name: fields.fullName.value.trim(),
      business_email: fields.email.value.trim(),
      company_name: fields.companyName.value.trim(),
      business_type: fields.businessType.value,
      business_website: normalizeWebsite(fields.businessWebsite.value),
      supplier_website: normalizeWebsite(fields.supplierWebsite.value),
      supplier_country: fields.supplierCountry.value.trim(),
      investigation_notes: fields.notes.value.trim(),
      requested_services: Array.from(
        fields.services.querySelectorAll('input[name="requested_services"]:checked')
      ).map((checkbox) => checkbox.value),
      verification_purpose: fields.purpose.value,
      purpose_details: fields.purposeDetails.value.trim(),
      investigation_requirements: fields.notes.value.trim(),
      expected_deliverable: fields.deliverable.value,
      paid_service_acknowledgement: fields.paidAck.checked,
      privacy_consent: fields.consent.checked,
      request_status: 'new',
      source: 'verity_early_access_landing_page'
    };

    if (!supabaseClient) {
      showFormError('The request service is not configured correctly. Your entries remain in the form. Please contact the site operator.');
      return;
    }

    setSubmitting(true);

    let savedRecord;

    try {
      // Generate a reference locally. No SELECT permission is required.
      const requestId = crypto.randomUUID();

      const { error } = await supabaseClient
        .from('verity_enquiries')
        .insert({
          id: requestId,
          full_name: payload.full_name,
          business_email: payload.business_email,
          company_name: payload.company_name || null,
          business_type: payload.business_type || null,
          business_website: payload.business_website,
          supplier_website: payload.supplier_website,
          supplier_country: payload.supplier_country || null,
          investigation_notes: payload.investigation_notes || null,
          requested_services: payload.requested_services,
          verification_purpose: payload.verification_purpose,
          purpose_details: payload.purpose_details || null,
          investigation_requirements: payload.investigation_requirements,
          expected_deliverable: payload.expected_deliverable,
          paid_service_acknowledgement: payload.paid_service_acknowledgement,
          privacy_consent: payload.privacy_consent
        });

      if (error) throw error;

      // The insert succeeded. The locally generated ID identifies the saved row.
      savedRecord = { id: requestId };

    } catch {
      showFormError('We could not save your request. Your information has not been confirmed as saved, and your entries remain in the form. Please check your connection and try again later.');
      setSubmitting(false);
      return;
    }
    // Success is shown only after a real saved record and ID are returned.
    requestReference.textContent = `VR-${savedRecord.id.slice(0, 8).toUpperCase()}`;
    form.hidden = true;
    if (requestHeading) requestHeading.hidden = true;
    formSuccess.hidden = false;
    formSuccess.focus();
    form.reset();
    if (notesCount) notesCount.textContent = '0';
    setSubmitting(false);
  });

  const newRequestButton = select('[data-new-request]');
  if (newRequestButton) {
    newRequestButton.addEventListener('click', () => {
      formSuccess.hidden = true;
      form.hidden = false;
      if (requestHeading) requestHeading.hidden = false;
      clearErrors();
      setSubmitting(false);
      fields.fullName.focus();
    });
  }
})();
