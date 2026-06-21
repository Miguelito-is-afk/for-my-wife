import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBu7KYw-7X2k_JzDDwvAXZB48vWe0XPRaU",
    authDomain: "scrapbook-project-df635.firebaseapp.com",
    projectId: "scrapbook-project-df635",
    storageBucket: "scrapbook-project-df635.firebasestorage.app",
    messagingSenderId: "278025227308",
    appId: "1:278025227308:web:7fcf871b8526f8a7b41589",
    measurementId: "G-68EYEVHS7Z"
};

// Initialize Engine & Core Systems Setup Tracking Logs
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let localMemoriesArray = [];
let isAdmin = false; 

// System Log Engine Terminal Pipeline Writer
window.writeSystemLog = function(message, type = 'info') {
    const consoleBox = document.getElementById("terminal-console");
    if (!consoleBox) return;

    const entry = document.createElement("div");
    entry.className = `log-entry log-${type}`;
    
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    entry.innerHTML = `<span class="log-time">[${timestamp}]</span> <span class="log-msg">${message}</span>`;
    
    consoleBox.appendChild(entry);
    consoleBox.scrollTop = consoleBox.scrollHeight; 
};

window.clearConsoleLogs = function() {
    const consoleBox = document.getElementById("terminal-console");
    if (consoleBox) {
        consoleBox.innerHTML = "";
        window.writeSystemLog("Terminal buffer cleared by user configuration.", "sys");
    }
};

window.updateDatabaseBadgeStatus = function(stateText, className) {
    const badge = document.getElementById("db-status-badge");
    if (badge) {
        badge.innerText = stateText.toUpperCase();
        badge.className = className;
    }
};

// UI Tab View Context Switcher Mechanics
window.switchPanelTab = function(targetTab) {
    const uploadBtn = document.getElementById("tab-btn-upload");
    const logsBtn = document.getElementById("tab-btn-logs");
    const uploadContent = document.getElementById("tab-content-upload");
    const logsContent = document.getElementById("tab-content-logs");

    if (targetTab === 'upload') {
        uploadBtn.classList.add("active");
        logsBtn.classList.remove("active");
        uploadContent.style.display = "block";
        logsContent.style.display = "none";
        window.writeSystemLog("Switched display to Media Upload Workspace panel view.", "info");
    } else {
        logsBtn.classList.add("active");
        uploadBtn.classList.remove("active");
        uploadContent.style.display = "none";
        logsContent.style.display = "block";
        window.writeSystemLog("Switched display to Live Terminal Pipeline output console monitor.", "info");
    }
};

// Core App Window Layout View Framework Controllers
window.toggleControlPanel = function(show) {
    const modal = document.getElementById("control-panel-modal");
    if (show) {
        modal.classList.add("visible");
        window.writeSystemLog("Control Panel Modal Window opened successfully.", "sys");
    } else {
        modal.classList.remove("visible");
    }
};

window.toggleDetailsModal = function(show) {
    const modal = document.getElementById("details-modal");
    if (show) {
        modal.classList.add("visible");
    } else {
        modal.classList.remove("visible");
    }
};

window.openPhotoDetails = function(imgUrl, dateString, focusY) {
    const img = document.getElementById("details-img");
    const caption = document.getElementById("details-date-string");
    
    img.src = imgUrl;
    img.style.objectPosition = `center ${focusY || '50%'}`;
    
    const dateObj = new Date(dateString);
    caption.innerText = `Captured on: ${dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} 💜`;
    
    window.writeSystemLog(`Lightbox opened for memory block data string. Date target: ${dateString}`, "info");
    toggleDetailsModal(true);
};

// File stream parsing logic
const fileInput = document.getElementById("photo-input"); 
const focusInput = document.getElementById("focus-y");
const previewContainer = document.getElementById("preview-container");
const previewGrid = document.getElementById("preview-images-grid");
const fileNameDisplay = document.getElementById("file-name-display");
const dateInput = document.getElementById("photo-date");

let selectedFilesQueue = [];

if (fileInput) {
    fileInput.addEventListener("change", (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            selectedFilesQueue = [...selectedFilesQueue, ...Array.from(files)];
            renderPreviewGrid();
        }
    });
}

function renderPreviewGrid() {
    previewGrid.innerHTML = ""; 
    if (selectedFilesQueue.length === 0) {
        removePreview();
        return;
    }

    fileNameDisplay.innerText = selectedFilesQueue.length === 1 
        ? selectedFilesQueue[0].name 
        : `${selectedFilesQueue.length} items selected`;
    
    window.writeSystemLog(`Rendering asset queue view: ${selectedFilesQueue.length} items prepared.`, "info");
    previewContainer.style.display = "block";

    selectedFilesQueue.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const wrapper = document.createElement("div");
            wrapper.className = "preview-item-wrapper";

            const img = document.createElement("img");
            img.src = event.target.result;
            img.className = "upload-preview-thumb";
            img.alt = "Selection Stream Preview Asset";
            img.style.objectPosition = `center ${focusInput.value}%`;
            
            const closeBtn = document.createElement("button");
            closeBtn.type = "button";
            closeBtn.className = "remove-single-preview-btn";
            closeBtn.innerHTML = "&times;";
            closeBtn.title = "Remove this photo";
            closeBtn.onclick = function() {
                removeSingleFileFromQueue(index);
            };

            wrapper.appendChild(img);
            wrapper.appendChild(closeBtn);
            previewGrid.appendChild(wrapper);
        };
        reader.readAsDataURL(file);
    });
}

window.removeSingleFileFromQueue = function(indexToRemove) {
    window.writeSystemLog(`Removing temporary asset file index reference: [${indexToRemove}] Name: "${selectedFilesQueue[indexToRemove].name}"`, "info");
    selectedFilesQueue.splice(indexToRemove, 1);
    renderPreviewGrid();
};

if (focusInput) {
    focusInput.addEventListener("input", (e) => {
        const thumbs = document.querySelectorAll(".upload-preview-thumb");
        thumbs.forEach(thumb => {
            thumb.style.objectPosition = `center ${e.target.value}%`;
        });
    });
}

window.removePreview = function() {
    if (fileInput) fileInput.value = "";
    selectedFilesQueue = [];
    if (fileNameDisplay) fileNameDisplay.innerText = "No file selected";
    if (previewGrid) previewGrid.innerHTML = "";
    if (previewContainer) previewContainer.style.display = "none";
    window.writeSystemLog("Cleared temporary media upload asset cache data constraints.", "info");
};

// Optimised read operations fetching all memories sequentially
async function loadLiveMemories() {
    const timelineContainer = document.getElementById("dynamic-timeline");
    if (!timelineContainer) return;
    
    timelineContainer.innerHTML = `
        <div class="shimmer-loading-wrapper">
            <span class="heart-spinner">💜</span>
            <p style="font-weight:600; margin:0;">Reading our scrapbook from the clouds... ✨</p>
        </div>
    `;
    
    window.writeSystemLog("Executing query request sync stream target 'memories' collection...", "sys");
    window.updateDatabaseBadgeStatus("Syncing...", "badge-connecting");

    try {
        const memoryQueryRef = collection(db, "memories");
        const q = query(memoryQueryRef, orderBy("takenDate", "desc")); 

        const querySnapshot = await getDocs(q);
        
        localMemoriesArray = [];
        querySnapshot.forEach((doc) => {
            localMemoriesArray.push({ id: doc.id, ...doc.data() });
        });

        window.writeSystemLog(`Firestore fetch complete. Cached [${localMemoriesArray.length}] items total.`, "success");
        window.updateDatabaseBadgeStatus("ONLINE", "badge-online");
        renderTimelineGrid();
    } catch (error) {
        console.error("Database read failure: ", error);
        window.writeSystemLog(`CRITICAL PIPELINE ERROR: ${error.message}`, "error");
        window.updateDatabaseBadgeStatus("ERROR", "badge-offline");
    }
}

function renderTimelineGrid() {
    const timelineContainer = document.getElementById("dynamic-timeline");
    if (!timelineContainer) return;
    timelineContainer.innerHTML = "";

    const oldToggleBtn = document.getElementById("toggle-pics-btn");
    if (oldToggleBtn) oldToggleBtn.style.display = "none";

    if (localMemoriesArray.length === 0) {
        timelineContainer.innerHTML = "<p style='color: #888; text-align:center;'>No photos in the database yet! Open the Control Panel to add one.</p>";
        return;
    }

    const groupedMap = {};
    localMemoriesArray.forEach((memory) => {
        const dateObj = new Date(memory.takenDate || memory.createdAt);
        const groupKey = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        if (!groupedMap[groupKey]) {
            groupedMap[groupKey] = [];
        }
        groupedMap[groupKey].push(memory);
    });

    for (const [monthYearName, photosArray] of Object.entries(groupedMap)) {
        const section = document.createElement("section");
        section.className = "month-section month-collapsed"; 

        const headerDiv = document.createElement("div");
        headerDiv.className = "month-header";
        headerDiv.style.cursor = "pointer"; 
        headerDiv.innerHTML = `<span class="dot"></span><h2>${monthYearName} 🌸 <span class="accordion-arrow">▼</span></h2>`;
        
        const gridDiv = document.createElement("div");
        gridDiv.className = "photo-grid"; 

        headerDiv.onclick = () => {
            const isNowCollapsed = section.classList.toggle("month-collapsed");
            const arrow = headerDiv.querySelector(".accordion-arrow");
            
            if (isNowCollapsed) {
                arrow.innerText = "▼";
                window.writeSystemLog(`Collapsed section folder: ${monthYearName}`, "info");
            } else {
                arrow.innerText = "▲";
                window.writeSystemLog(`Expanded section folder: ${monthYearName}. Displaying initial asset cluster.`, "info");
            }
        };
        section.appendChild(headerDiv);

        photosArray.forEach((memory, index) => {
            const photoDiv = document.createElement("div");
            photoDiv.className = "photo";

            if (index >= 4) {
                photoDiv.classList.add("hidden-pic");
            }

            const img = document.createElement("img");
            img.onload = () => { img.classList.add("loaded"); };
            img.onerror = () => {
                window.writeSystemLog(`Render warning: Asset index [${index}] failed to decode or string is corrupt.`, "error");
            };
            img.src = memory.imageUrl;
            
            if (img.complete) {
                img.classList.add("loaded");
            }
            
            img.alt = "Scrapbook Memory Card";
            img.style.objectPosition = `center ${memory.focusY || '50%'}`;
            
            img.onclick = (e) => {
                e.stopPropagation(); 
                openPhotoDetails(memory.imageUrl, memory.takenDate || memory.createdAt, memory.focusY);
            };
            photoDiv.appendChild(img);

            const actionsOverlay = document.createElement("div");
            actionsOverlay.className = "photo-actions-overlay";

            const downloadBtn = document.createElement("button");
            downloadBtn.className = "action-icon-btn";
            downloadBtn.innerHTML = "⬇️";
            downloadBtn.title = "Download Photo";
            downloadBtn.onclick = (e) => { 
                e.stopPropagation(); 
                downloadPhoto(memory.imageUrl, `memory-${monthYearName}.jpg`); 
            };
            actionsOverlay.appendChild(downloadBtn);

            if (isAdmin) {
                const editBtn = document.createElement("button");
                editBtn.className = "action-icon-btn edit-style";
                editBtn.innerHTML = "📐";
                editBtn.title = "Adjust Focus Target";
                editBtn.onclick = (e) => { 
                    e.stopPropagation(); 
                    editPhotoFocus(memory.id, memory.focusY); 
                };
                actionsOverlay.appendChild(editBtn);

                const deleteBtn = document.createElement("button");
                deleteBtn.className = "action-icon-btn delete-style";
                deleteBtn.innerHTML = "🗑️";
                deleteBtn.title = "Delete Memory permanently";
                deleteBtn.onclick = (e) => { 
                    e.stopPropagation(); 
                    deletePhoto(memory.id); 
                };
                actionsOverlay.appendChild(deleteBtn);
            }

            photoDiv.appendChild(actionsOverlay);
            gridDiv.appendChild(photoDiv);
        });

        section.appendChild(gridDiv);

        if (photosArray.length > 4) {
            const toggleContainer = document.createElement("div");
            toggleContainer.className = "month-toggle-container";
            
            const monthToggleBtn = document.createElement("button");
            monthToggleBtn.className = "toggle-btn local-month-btn";
            
            let totalRemaining = photosArray.length - 4;
            monthToggleBtn.innerText = `Show More (+${totalRemaining}) 🌸`;
            
            monthToggleBtn.onclick = (e) => {
                e.stopPropagation(); 
                const hiddenPhotos = gridDiv.querySelectorAll(".photo.hidden-pic");
                const BATCH_SIZE = 4; 
                
                for (let i = 0; i < Math.min(BATCH_SIZE, hiddenPhotos.length); i++) {
                    hiddenPhotos[i].classList.remove("hidden-pic");
                    hiddenPhotos[i].classList.add("show-anim");
                }
                
                const newHiddenCount = gridDiv.querySelectorAll(".photo.hidden-pic").length;
                
                if (newHiddenCount === 0) {
                    toggleContainer.style.display = "none"; 
                    window.writeSystemLog(`All local assets revealed for layer group: ${monthYearName}`, "success");
                } else {
                    monthToggleBtn.innerText = `Show More (+${newHiddenCount} remaining) 🌸`;
                    window.writeSystemLog(`Progressive reveal stepped. Hidden stack count: ${newHiddenCount}`, "info");
                }
            };
            
            toggleContainer.appendChild(monthToggleBtn);
            section.appendChild(toggleContainer);
        }

        timelineContainer.appendChild(section);
    }
}

window.downloadPhoto = function(base64Data, filename) {
    window.writeSystemLog(`Triggered photo local file stream extraction download workflow...`, "info");
    const link = document.createElement("a");
    link.href = base64Data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.writeSystemLog(`File stream array downloaded successfully. Key: "${filename}"`, "success");
};

window.deletePhoto = async function(docId) {
    if (confirm("Are you sure you want to delete this beautiful memory from the cloud? 🥺")) {
        window.writeSystemLog(`Sending transaction block delete signal target: Doc ID "${docId}"`, "sys");
        try {
            await deleteDoc(doc(db, "memories", docId));
            window.writeSystemLog(`Document reference block successfully removed from remote cloud instance index.`, "success");
            loadLiveMemories();
        } catch (error) {
            window.writeSystemLog(`DELETION FAIL MALFUNCTION: ${error.message}`, "error");
            alert("Failed to delete memory module item.");
        }
    }
};

window.editPhotoFocus = async function(docId, currentFocusY) {
    const currentNumericValue = parseInt(currentFocusY) || 50;
    const targetPositionInput = prompt("Enter new alignment height ratio (0 = Top, 50 = Center, 100 = Bottom):", currentNumericValue);
    
    if (targetPositionInput !== null) {
        const parsedValue = parseInt(targetPositionInput);
        if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 100) {
            window.writeSystemLog(`Updating focus document tracking parameter matrix. ID: ${docId}, target focus height: ${parsedValue}%`, "sys");
            try {
                await updateDoc(doc(db, "memories", docId), {
                    focusY: `${parsedValue}%`
                });
                window.writeSystemLog(`Document layout configurations updated dynamically. Refreshing pipeline.`, "success");
                loadLiveMemories();
            } catch (error) {
                window.writeSystemLog(`DOCUMENT RATIO TWEAK MALFUNCTION FAILURE: ${error.message}`, "error");
                alert("Failed to save adjustments.");
            }
        } else {
            alert("Please insert a valid scale parameter constraint between 0 and 100.");
        }
    }
};

const passwordInput = document.getElementById("admin-password");
const uploadZone = document.getElementById("admin-upload-zone");

if (passwordInput) {
    passwordInput.addEventListener("input", (e) => {
        if (e.target.value.toLowerCase() === "ilovehillary") {
            isAdmin = true;
            if (uploadZone) uploadZone.style.display = "block";
            document.getElementById("admin-auth-zone").style.display = "none";
            window.writeSystemLog("Admin identity certified. Elevating privilege state parameters to internal master role.", "success");
            renderTimelineGrid(); 
        }
    });
}

function processAndUploadSingleFile(file, chosenDateStr) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onerror = () => reject(new Error(`Failed to read data stream for: ${file.name}`));
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onerror = () => reject(new Error(`Failed to map image element source for: ${file.name}`));
            img.onload = async () => {
                try {
                    const canvas = document.createElement("canvas");
                    let width = img.width;
                    let height = img.height;

                    const MAX_DIMENSION = 1200; 
                    if (width > height) {
                        if (width > MAX_DIMENSION) {
                            height *= MAX_DIMENSION / width;
                            width = MAX_DIMENSION;
                        }
                    } else {
                        if (height > MAX_DIMENSION) {
                            width *= MAX_DIMENSION / height;
                            height = MAX_DIMENSION;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);

                    const optimizedBase64String = canvas.toDataURL("image/jpeg", 0.75);
                    
                    await addDoc(collection(db, "memories"), {
                        imageUrl: optimizedBase64String,
                        focusY: `${focusInput.value}%`,
                        takenDate: chosenDateStr,
                        createdAt: new Date().toISOString()
                    });

                    window.writeSystemLog(`Successfully processed and saved "${file.name}" to cloud storage instance.`, "success");
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
        };
    });
}

const submitBtn = document.getElementById("upload-submit-btn");
if (submitBtn) {
    submitBtn.addEventListener("click", async () => {
        const statusText = document.getElementById("upload-status");
        
        if (selectedFilesQueue.length === 0) {
            statusText.style.color = "red";
            statusText.innerText = "Please select at least one photo first! 🛑";
            window.writeSystemLog("Upload execution blocked: Local source file object reference stack is empty.", "error");
            return;
        }

        const chosenDateStr = dateInput.value || new Date().toISOString().split('T')[0];
        window.writeSystemLog(`Beginning transmission pipeline protocol sequence for [${selectedFilesQueue.length}] memory assets matching capture date: ${chosenDateStr}`, "sys");

        statusText.style.color = "var(--dark-purple)";
        
        for (let i = 0; i < selectedFilesQueue.length; i++) {
            const currentFile = selectedFilesQueue[i];
            statusText.innerText = `Processing and compressing image (${i + 1}/${selectedFilesQueue.length})... 🪄`;
            window.writeSystemLog(`Packing data frame matrix for item [${i + 1}/${selectedFilesQueue.length}]: "${currentFile.name}"`, "info");
            
            try {
                await processAndUploadSingleFile(currentFile, chosenDateStr);
            } catch (error) {
                console.error("Pipeline failure on asset target index: ", error);
                window.writeSystemLog(`ASSET TRANSMIT FAILURE on item "${currentFile.name}": ${error.message}`, "error");
            }
        }

        window.writeSystemLog("Cloud Firestore transaction stack complete: All selected documents updated successfully.", "success");
        statusText.style.color = "green";
        statusText.innerText = `Published ${selectedFilesQueue.length} memories successfully! ✨🎉`;
        
        removePreview();
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
        
        loadLiveMemories();
        setTimeout(() => { toggleControlPanel(false); statusText.innerText = ""; }, 1500);
    });
}

function updateTimer() {
    const startDate = new Date("February 8, 2024 00:00:00").getTime();
    const now = new Date().getTime();
    const diff = now - startDate;

    const dEl = document.getElementById("days");
    const hEl = document.getElementById("hours");
    const mEl = document.getElementById("minutes");
    const sEl = document.getElementById("seconds");

    if (dEl) dEl.innerText = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (hEl) hEl.innerText = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (mEl) mEl.innerText = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (sEl) sEl.innerText = Math.floor((diff % (1000 * 60)) / 1000);
}

window.addEventListener('online', () => {
    window.writeSystemLog("Network framework environment report: Browser is ONLINE.", "success");
    window.updateDatabaseBadgeStatus("ONLINE", "badge-online");
});
window.addEventListener('offline', () => {
    window.writeSystemLog("Network framework environment warning: Local browser hardware context dropped connection. System went OFFLINE.", "error");
    window.updateDatabaseBadgeStatus("OFFLINE", "badge-offline");
});

// Structural initialization fix that resolves the DOMContentLoaded timing bug
function startSystemEngine() {
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    window.writeSystemLog("System Core Engine workspace boot cycle started. Connecting configuration properties to global web interface...", "sys");
    loadLiveMemories();
    setInterval(updateTimer, 1000);
    updateTimer();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startSystemEngine);
} else {
    startSystemEngine();
}