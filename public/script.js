document.getElementById('filter').addEventListener('change', function() {
  const dateField = document.getElementById('dateField');
  if (this.value === 'date') {
      dateField.classList.remove('hidden');
  } else {
      dateField.classList.add('hidden');
  }
});

document.getElementById('uploadForm').addEventListener('submit', handleUpload);

function showModal() {
  const modalContainer = document.getElementById('modal-container');
  const modalHtml = `
      <div id="modal" class="modal">
      <div class="modal-content">
          <span class="close-button" onclick="closeModal()">&times;</span> <!-- Close button with onclick event -->
          <h2>Additional Information</h2>
          <div id="dateField" class="mb-4 hidden">
              <label for="startDate">Start Date:</label>
              <input type="date" id="startDate" class="w-full px-4 py-2 rounded border border-gray-400 focus:outline-none focus:border-blue-500">
              <label for="endDate">End Date:</label>
              <input type="date" id="endDate" class="w-full px-4 py-2 rounded border border-gray-400 focus:outline-none focus:border-blue-500">
          </div>
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
  modal.parentNode.removeChild(modal);
  window.removeEventListener('click', outsideClick);
}

function outsideClick(event) {
  const modal = document.getElementById('modal');
  const modalContent = document.querySelector('.modal-content');

  if (event.target === modal && !modalContent.contains(event.target)) {
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
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const keywordsFile = document.getElementById('keywordsFile').files[0];
  const numWords = document.getElementById('numWords').value;

  if (!keywordsFile) {
      alert('Please select a keywords file');
      return;
  }

  if (!numWords) {
      alert('Please enter the number of words');
      return;
  }

  const formData = new FormData();
  formData.append('startDate', startDate);
  formData.append('endDate', endDate);
  formData.append('pdfFile', document.getElementById('pdfFile').files[0]);
  formData.append('keywordsFile', keywordsFile);
  formData.append('numWords', numWords);

  closeModal();

  fetch('/upload', {
      method: 'POST',
      body: formData,
  })
  .then((response) => response.text())
  .then((data) => {
      alert(data);
  })
  .catch((error) => {
      console.error('Error:', error);
  });
}

function displayFileName(input) {
  const fileNameElement = document.getElementById('pdfFileName');
  if (input.files.length > 0) {
      fileNameElement.textContent = input.files[0].name;
  } else {
      fileNameElement.textContent = '';
  }
}
