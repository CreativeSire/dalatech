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

        await fetch('/.netlify/functions/lead-qualification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
      } catch (error) {
        console.error('Lead capture bridge failed:', error);
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalLabel;
        }

        HTMLFormElement.prototype.submit.call(form);
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', initLeadCaptureBridge);
