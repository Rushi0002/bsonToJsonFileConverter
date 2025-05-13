const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const progress = document.getElementById("progress");
const downloadBtn = document.getElementById("download-link");
const statusMessage = document.getElementById("status-message");

let currentFilename = "";

// ✅ Clear server-side JSON files on page load
window.addEventListener("load", () => {
  fetch("/clear-temp", { method: "POST" });
});

// ✅ Handle drag-and-drop file upload
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.style.borderColor = "green";
});

dropZone.addEventListener("dragleave", () => {
  dropZone.style.borderColor = "#3498db";
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.style.borderColor = "#3498db";

  const file = e.dataTransfer.files[0];
  if (file) uploadFile(file);
});

// ✅ Click to open file selector
dropZone.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) uploadFile(file);
});

// ✅ Upload BSON file to server and get back JSON filename
function uploadFile(file) {
  fileInput.value = "";
  progress.classList.remove("hidden");
  hideMessage();

  const formData = new FormData();
  formData.append("bsonFile", file);

  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then(({ filename }) => {
      currentFilename = filename;
      showMessage(
        "✅ File converted successfully. Ready to download.",
        "success"
      );
    })
    .catch(() => {
      showMessage("❌ Conversion failed.", "error");
    })
    .finally(() => {
      progress.classList.add("hidden");
    });
}

// ✅ Download the converted JSON file
downloadBtn.addEventListener("click", () => {
  if (!currentFilename) {
    showMessage(
      "❗ Please select, drag, or upload a BSON file first.",
      "error"
    );
    return;
  }

  const link = document.createElement("a");
  link.href = `/download/${encodeURIComponent(currentFilename)}`;
  link.download = currentFilename;
  link.click();

  showMessage("✅ File downloaded successfully.", "success");
});

// ✅ Show a message (success or error)
function showMessage(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `message ${type}`;
  statusMessage.classList.remove("hidden");

  // Auto-hide success messages after 4 seconds
  if (type === "success") {
    setTimeout(() => hideMessage(), 4000);
  }
}

function hideMessage() {
  statusMessage.classList.add("hidden");
}
