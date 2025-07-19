document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleUpload);
    }
});

function showModal() {
    const modalContainer = document.getElementById('modal-container');
    const modalHtml = `
    <div id="modal" class="modal">
      <div class="modal-content">
        <span class="close-button" onclick="closeModal()">×</span>
        <h2>Additional Information</h2>
        <div>
          <label for="keywordsFile">Keywords File:</label>
          <input type="file" id="keywordsFile" name="keywordsFile" required>
        </div>
        <div>
          <label for="numWords">Number of Words:</label>
          <input type="number" id="numWords" name="numWords" min="1" required>
        </div>
        <button type="button" onclick="submitForm()">Submit</button>
      </div>
    </div>
  `;
    modalContainer.innerHTML = modalHtml;
    window.addEventListener('click', outsideClick);
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.parentNode.removeChild(modal);
        window.removeEventListener('click', outsideClick);
    }
}

function outsideClick(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
}

function handleUpload(event) {
    event.preventDefault();
    const pdfFile = document.getElementById('pdfFile').files[0];
    if (!pdfFile) {
        alert('Please select a PDF file');
        return;
    }
    showModal();
}

function submitForm() {
    const keywordsFile = document.getElementById('keywordsFile').files[0];
    const numWords = document.getElementById('numWords').value;
    const pdfFile = document.getElementById('pdfFile').files[0]; // Get PDF file again

    if (!keywordsFile || !numWords) {
        alert('Please fill in all additional information.');
        return;
    }

    const formData = new FormData();
    formData.append('pdfFile', pdfFile);
    formData.append('keywordsFile', keywordsFile);
    formData.append('numWords', numWords);

    closeModal();
    document.getElementById('summary').textContent = 'Processing...';

    fetch('/upload', {
        method: 'POST',
        body: formData,
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Update the <p> tag with the summary
        document.getElementById('summary').textContent = data.summary;
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('summary').textContent = 'An error occurred while generating the summary.';
    });
}