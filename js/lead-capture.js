function initLeadCaptureBridge() {
  const formNames = new Set([
    'contact-lead-qualification',
    'get-listed-qualification',
    'get-listed-qualification-inline'
  ]);

  const forms = Array.from(document.forms).filter((form) => formNames.has(form.getAttribute('name')));
  if (!forms.length) return;

  forms.forEach((form) => {
    let bridgeSubmitting = false;
    let feedback = form.parentElement ? form.parentElement.querySelector('.lead-capture-feedback') : null;

    function ensureFeedbackNode() {
      if (feedback) return feedback;
      feedback = document.createElement('div');
      feedback.className = 'lead-capture-feedback';
      feedback.style.marginTop = '18px';
      feedback.style.padding = '14px 16px';
      feedback.style.borderRadius = '14px';
      feedback.style.fontSize = '0.98rem';
      feedback.style.lineHeight = '1.5';
      feedback.style.display = 'none';
      form.insertAdjacentElement('afterend', feedback);
      return feedback;
    }

    function showFeedback(type, message) {
      const node = ensureFeedbackNode();
      node.textContent = message;
      node.style.display = 'block';
      if (type === 'success') {
        node.style.background = 'rgba(17, 153, 85, 0.08)';
        node.style.border = '1px solid rgba(17, 153, 85, 0.24)';
        node.style.color = '#146c43';
      } else {
        node.style.background = 'rgba(232, 74, 60, 0.08)';
        node.style.border = '1px solid rgba(232, 74, 60, 0.22)';
        node.style.color = '#a1281d';
      }
    }

    form.addEventListener('submit', async (event) => {
      if (bridgeSubmitting) return;

      event.preventDefault();
      bridgeSubmitting = true;

      const submitButton = form.querySelector('button[type="submit"]');
      const originalLabel = submitButton ? submitButton.innerHTML : '';

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = 'Submitting...';
      }

      try {
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());
        payload.form_name = form.getAttribute('name') || '';
        payload.source_page = window.location.pathname;

        const response = await fetch('/.netlify/functions/lead-qualification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(result.message || 'We could not submit your details right now. Please try again.');
        }

        form.reset();
        showFeedback('success', 'Thank you. Your details have been submitted successfully. Our team will review them and get back to you.');
        feedback?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch (error) {
        console.error('Lead capture bridge failed:', error);
        showFeedback('error', error.message || 'We could not submit your details right now. Please try again.');
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalLabel;
        }
        bridgeSubmitting = false;
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', initLeadCaptureBridge);
