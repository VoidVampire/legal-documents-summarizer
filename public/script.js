document.getElementById('uploadForm').addEventListener('submit', handleUpload);

function showModal() {
  const modalContainer = document.getElementById('modal-container');
  const modalHtml = `
    <div id="modal" class="modal">
      <div class="modal-content">
        <span class="close-button" onclick="closeModal()">&times;</span> <!-- Close button with onclick event -->
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
  formData.append('pdfFile', document.getElementById('pdfFile').files[0]);
  formData.append('keywordsFile', keywordsFile);
  formData.append('numWords', numWords);

  closeModal();

  fetch('/upload', {
    method: 'POST',
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById('summary').textContent = data.summary;
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
// Define a function to handle the "Apply" button click
function handleApply() {
  // Get selected sort order
  const orderBy = document.getElementById('orderBy').value;
  console.log('Selected order:', orderBy);

  // Get selected date range
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;
  console.log('From Date:', fromDate);
  console.log('To Date:', toDate);

  // Mapping of month names to their numeric representations with leading zero
  const monthMap = {
      'January': '01', 'February': '02', 'March': '03', 'April': '04', 'May': '05', 'June': '06',
      'July': '07', 'August': '08', 'September': '09', 'October': '10', 'November': '11', 'December': '12'
  };

  // Get list of summaries
  const summariesList = document.querySelector('.summary-list');
  console.log('Summaries list:', summariesList);

  // Get array of summary items
  const summaryItems = Array.from(summariesList.querySelectorAll('.summary-item'));
  console.log('Summary items:', summaryItems);

  // Filter summary items based on date range (if both dates are provided)
  let filteredItems = summaryItems;
  if (fromDate && toDate) {
      filteredItems = summaryItems.filter(item => {
          const summaryText = item.querySelector('.summary-text').textContent;
          const summaryDateStr = summaryText.substring(summaryText.lastIndexOf('_') + 1); // Extract date string from summary name
          const parts = summaryDateStr.split(' ');
          const year = parseInt(parts[2]);
          const month = monthMap[parts[1]]; // Get the month with leading zero
          const day = parseInt(parts[0]);
          const summaryDate = new Date(`${year}-${month}-${day}`);
          return summaryDate >= new Date(fromDate) && summaryDate <= new Date(toDate);
      });
      console.log('Filtered summary items:', filteredItems);
  }

  // Sort summary items based on selected order
  if (orderBy === 'ascending') {
      filteredItems.sort((a, b) => a.textContent.localeCompare(b.textContent));
      console.log('Sorted summary items (ascending):', filteredItems.map(item => item.textContent));
  } else if (orderBy === 'descending') {
      filteredItems.sort((a, b) => b.textContent.localeCompare(a.textContent));
      console.log('Sorted summary items (descending):', filteredItems.map(item => item.textContent));
  }

  // Remove existing items from the summaries list
  summariesList.innerHTML = '';

  // Append sorted and filtered summary items to summaries list
  filteredItems.forEach(item => {
      summariesList.appendChild(item);
  });
}
