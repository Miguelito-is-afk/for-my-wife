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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let localMemoriesArray = [];
let isAdmin = false; 

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

window.customDialog = function(options) {
    return new Promise((resolve) => {
        const modal = document.getElementById("custom-dialog-modal");
        const title = document.getElementById("dialog-title");
        const message = document.getElementById("dialog-message");
        const inputCont = document.getElementById("dialog-input-container");
        const input = document.getElementById("dialog-input");
        const cancelBtn = document.getElementById("dialog-cancel-btn");
        const confirmBtn = document.getElementById("dialog-confirm-btn");
        const icon = document.getElementById("dialog-icon");

        title.innerText = options.title || "Notice";
        message.innerText = options.message;
        icon.innerText = options.icon || "💜";

        if (options.type === "prompt") {
            inputCont.style.display = "block";
            input.value = options.default || "";
            input.focus();
        } else {
            inputCont.style.display = "none";
        }

        cancelBtn.style.display = (options.type === "confirm" || options.type === "prompt") ? "inline-block" : "none";

        modal.classList.add("visible");

        const close = (value) => {
            modal.classList.remove("visible");
            confirmBtn.onclick = null;
            cancelBtn.onclick = null;
            resolve(value);
        };

        confirmBtn.onclick = () => {
            if (options.type === "prompt") close(input.value);
            else close(true);
        };

        cancelBtn.onclick = () => close(false);
    });
};

window.customAlert = (message, icon="🛑") => window.customDialog({type: 'alert', message, title: 'Notice', icon});
window.customConfirm = (message) => window.customDialog({type: 'confirm', message, title: 'Are you sure?', icon: '🥺'});
window.customPrompt = (message, defaultVal) => window.customDialog({type: 'prompt', message, title: 'Action Required', default: defaultVal, icon: '📐'});

let activeModalMemories = [];
let activeModalIndex = 0;
let touchStartX = 0;
let touchEndX = 0;

window.openPhotoDetails = function(photosArray, index) {
    // Safety Guard: Ensure photosArray is valid and index is within bounds
    if (!Array.isArray(photosArray) || photosArray.length === 0) {
        window.writeSystemLog("Error handling alert: Attempted to open modal with invalid or empty photos array.", "error");
        return;
    }
    
    activeModalIndex = Math.max(0, Math.min(index, photosArray.length - 1));
    activeModalMemories = photosArray;
    
    updateModalContent();
    toggleDetailsModal(true);
};

function updateModalContent() {
    try {
        const memory = activeModalMemories[activeModalIndex];
        
        if (!memory) {
            window.writeSystemLog(`Error handling alert: Memory at index ${activeModalIndex} is undefined.`, "error");
            return;
        }

        const img = document.getElementById("details-img");
        const caption = document.getElementById("details-date-string");

        if (img) {
            img.classList.add("img-fade-out"); 
            setTimeout(() => {
                try {
                    img.src = memory.imageUrl || "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop";
                    img.style.objectPosition = `center ${memory.focusY || '50%'}`;
                    img.classList.remove("img-fade-out");
                } catch (imgErr) {
                    window.writeSystemLog("Error rendering details image: " + imgErr.message, "error");
                }
            }, 150);
        }

        if (caption) {
            const rawDate = memory.takenDate || memory.createdAt;
            const dateObj = rawDate ? new Date(rawDate) : new Date();
            
            if (!isNaN(dateObj.getTime())) {
                caption.innerText = `Captured on: ${dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} 💜`;
            } else {
                caption.innerText = `A Beautiful Moment 💜`; 
            }
        }
        
        const prevBtn = document.getElementById("modal-prev-btn");
        const nextBtn = document.getElementById("modal-next-btn");
        
        if (prevBtn) prevBtn.style.display = activeModalIndex === 0 ? "none" : "flex";
        if (nextBtn) nextBtn.style.display = activeModalIndex === activeModalMemories.length - 1 ? "none" : "flex";

    } catch (globalModalError) {
        window.writeSystemLog(`Critical failure caught inside updateModalContent: ${globalModalError.message}`, "error");
    }
}

window.navigateModal = function(direction) {
    try {
        const newIndex = activeModalIndex + direction;
        if (newIndex >= 0 && newIndex < activeModalMemories.length) {
            activeModalIndex = newIndex;
            updateModalContent();
        }
    } catch (navError) {
        window.writeSystemLog(`Navigation swipe error handled: ${navError.message}`, "error");
    }
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
    fileInput.addEventListener("change", async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const currentCount = selectedFilesQueue.length;
            const availableSlots = 5 - currentCount;

            if (availableSlots <= 0) {
                await window.customAlert("You can only upload a maximum of 5 photos at a time to prevent server overload!");
                window.writeSystemLog("Upload queue limit reached. Blocked additional file additions.", "error");
                // Clear the input so they can try again if they hit the limit via file dialog
                fileInput.value = ""; 
                return;
            }

            const filesToAdd = files.slice(0, availableSlots);
            
            if (files.length > availableSlots) {
                await window.customAlert("Only " + availableSlots + " more photo(s) can be added right now. The limit is 5 per batch!", "⚠️");
                window.writeSystemLog(`Queue capped. Trimmed ${files.length - availableSlots} items from selection.`, "info");
            }

            selectedFilesQueue = [...selectedFilesQueue, ...filesToAdd];
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
        
        // 🛡️ NEW ERROR HANDLING: Show a friendly message to the user if the cloud fails
        if (timelineContainer) {
            timelineContainer.innerHTML = `
                <div style="text-align: center; color: #ff7675; padding: 40px 20px; animation: popIn 0.5s ease forwards;">
                    <h3 style="font-family: 'Dancing Script', cursive; font-size: 2.5rem; color: #6c5ce7;">Oops! Connection Lost 🌧️</h3>
                    <p style="font-weight: 600;">We couldn't reach the cloud to load your memories.</p>
                    <p style="font-size: 0.9rem;">Please check your internet connection and refresh the page.</p>
                    <p style="font-size: 0.75rem; color: #888; margin-top: 15px; font-family: monospace;">Error details: ${error.message}</p>
                </div>
            `;
        }
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

    let sectionIndex = 0;

    const timelineFragment = document.createDocumentFragment();

    for (const [monthYearName, photosArray] of Object.entries(groupedMap)) {
        const section = document.createElement("section");
        section.className = "month-section month-collapsed"; 

        section.style.animationDelay = `${sectionIndex * 0.12}s`; 
        sectionIndex++;

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
            
            img.setAttribute("loading", "lazy");
            img.decoding = "async"; 

            img.onload = () => { 
                img.classList.add("loaded"); 
                photoDiv.classList.add("popped"); 
            };
            img.onerror = () => {
                window.writeSystemLog(`Render warning: Asset index [${index}] failed to decode. Hiding from grid to protect layout.`, "error");
                photoDiv.style.display = "none"; 
            };
            
            img.src = memory.imageUrl;
            
            if (img.complete) {
                img.classList.add("loaded");
                photoDiv.classList.add("popped"); 
            }
            
            img.alt = "Scrapbook Memory Card";
            img.style.objectPosition = `center ${memory.focusY || '50%'}`;
            
            img.onclick = (e) => {
                e.stopPropagation(); 
                openPhotoDetails(photosArray, index);
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

        // --- NEW WRAPPER FOR SMOOTH ACCORDION ANIMATION ---
        const contentWrapper = document.createElement("div");
        contentWrapper.className = "month-content-wrapper";
        const contentInner = document.createElement("div");
        contentInner.className = "month-content-inner";
        
        contentInner.appendChild(gridDiv);

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
                    hiddenPhotos[i].classList.add("popped"); // Triggers the bouncy effect
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
            contentInner.appendChild(toggleContainer);
        }

        contentWrapper.appendChild(contentInner);
        section.appendChild(contentWrapper);
        timelineFragment.appendChild(section);
    }

    timelineContainer.appendChild(timelineFragment);
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
    if (await window.customConfirm("Are you sure you want to delete this beautiful memory from the cloud?")) {
        window.writeSystemLog(`Sending transaction block delete signal target: Doc ID "${docId}"`, "sys");
        try {
            await deleteDoc(doc(db, "memories", docId));
            window.writeSystemLog(`Document reference block successfully removed from remote cloud instance index.`, "success");
            loadLiveMemories();
        } catch (error) {
            window.writeSystemLog(`DELETION FAIL MALFUNCTION: ${error.message}`, "error");
            await window.customAlert("Failed to delete memory module item.", "❌");
        }
    }
};

window.editPhotoFocus = async function(docId, currentFocusY) {
    const currentNumericValue = parseInt(currentFocusY) || 50;
    const targetPositionInput = await window.customPrompt("Enter new alignment height ratio (0 = Top, 50 = Center, 100 = Bottom):", currentNumericValue);
    
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
                await window.customAlert("Failed to save adjustments.", "❌");
            }
        } else {
            await window.customAlert("Please insert a valid scale parameter constraint between 0 and 100.", "⚠️");
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
        // 🛡️ NEW ERROR HANDLING: Strictly verify it is actually an image file first
        if (!file.type.startsWith('image/')) {
            return reject(new Error(`Invalid format: "${file.name}" is not a recognized image file.`));
        }

        const reader = new FileReader();
        reader.onerror = () => reject(new Error(`Failed to read local data stream for: ${file.name}`));
        reader.readAsDataURL(file);
        
        reader.onload = (event) => {
            const img = new Image();
            img.onerror = () => reject(new Error(`Failed to decode image data for: ${file.name}. File might be corrupted.`));
            img.src = event.target.result;
            
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

                    // 🛡️ NEW ERROR HANDLING: Prevent fractional pixels which can crash some mobile browsers
                    canvas.width = Math.floor(width);
                    canvas.height = Math.floor(height);
                    
                    const ctx = canvas.getContext("2d");
                    if (!ctx) {
                        throw new Error("Your browser failed to initialize the Canvas 2D engine required for compression.");
                    }

                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    const optimizedBase64String = canvas.toDataURL("image/jpeg", 0.80);
                    
                    if (!optimizedBase64String || optimizedBase64String === "data:,") {
                        throw new Error("Image compression failed. The canvas output yielded empty data.");
                    }
                    
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
        const progressContainer = document.getElementById("upload-progress-container");
        const progressBar = document.getElementById("upload-progress-bar");
        
        if (selectedFilesQueue.length === 0) {
            statusText.style.color = "red";
            statusText.innerText = "Please select at least one photo first! 🛑";
            window.writeSystemLog("Upload execution blocked: Local source file object reference stack is empty.", "error");
            return;
        }

        // 1. Lock the UI
        submitBtn.disabled = true;
        submitBtn.innerText = "Publishing... ⏳";
        if (progressContainer) {
            progressContainer.style.display = "block";
            progressBar.style.width = "0%";
        }

        const chosenDateStr = dateInput.value || new Date().toISOString().split('T')[0];
        window.writeSystemLog(`Beginning transmission pipeline protocol sequence for [${selectedFilesQueue.length}] memory assets matching capture date: ${chosenDateStr}`, "sys");

        statusText.style.color = "var(--dark-purple)";
        let successCount = 0;
        
        // 2. Process Files
        for (let i = 0; i < selectedFilesQueue.length; i++) {
            const currentFile = selectedFilesQueue[i];
            statusText.innerText = `Processing and compressing image (${i + 1}/${selectedFilesQueue.length})... 🪄`;
            window.writeSystemLog(`Packing data frame matrix for item [${i + 1}/${selectedFilesQueue.length}]: "${currentFile.name}"`, "info");
            
            try {
                await processAndUploadSingleFile(currentFile, chosenDateStr);
                successCount++;
                
                // Update Progress Bar
                if (progressBar) {
                    const percent = ((i + 1) / selectedFilesQueue.length) * 100;
                    progressBar.style.width = `${percent}%`;
                }
            } catch (error) {
                console.error("Pipeline failure on asset target index: ", error);
                window.writeSystemLog(`ASSET TRANSMIT FAILURE on item "${currentFile.name}": ${error.message}`, "error");
            }
        }

        // 3. Completion & Cleanup
        window.writeSystemLog("Cloud Firestore transaction stack complete: Selected documents processed.", "success");
        statusText.style.color = "green";
        statusText.innerText = `Published ${successCount} memories successfully! ✨🎉`;
        
        removePreview();
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
        
        loadLiveMemories();
        
        // 4. Reset UI after a short delay so they can see 100% completion
        setTimeout(() => { 
            toggleControlPanel(false); 
            statusText.innerText = ""; 
            
            submitBtn.disabled = false;
            submitBtn.innerText = "Publish Memory Live ✨";
            
            if (progressContainer) progressContainer.style.display = "none";
            if (progressBar) progressBar.style.width = "0%";
        }, 2000);
    });
}

const dEl = document.getElementById("days");
const hEl = document.getElementById("hours");
const mEl = document.getElementById("minutes");
const sEl = document.getElementById("seconds");

function updateTimer() {
    const startDate = new Date("February 8, 2024 00:00:00").getTime();
    const now = new Date().getTime();
    const diff = now - startDate;

    function updateTimeEl(el, value) {
        if (el && el.innerText != value) {
            el.innerText = value;
            el.classList.add("tick");
            setTimeout(() => el.classList.remove("tick"), 150);
        }
    }

    updateTimeEl(dEl, Math.floor(diff / (1000 * 60 * 60 * 24)));
    updateTimeEl(hEl, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
    updateTimeEl(mEl, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)));
    updateTimeEl(sEl, Math.floor((diff % (1000 * 60)) / 1000));
}

document.addEventListener("DOMContentLoaded", () => {
    const prevBtn = document.getElementById("modal-prev-btn");
    const nextBtn = document.getElementById("modal-next-btn");
    const detailsCard = document.getElementById("details-card-container");
    
    if(prevBtn) prevBtn.addEventListener("click", (e) => { e.stopPropagation(); navigateModal(-1); });
    if(nextBtn) nextBtn.addEventListener("click", (e) => { e.stopPropagation(); navigateModal(1); });

    document.addEventListener("keydown", (e) => {
        const modalOverlay = document.getElementById("details-modal");
        if (modalOverlay && modalOverlay.classList.contains("visible")) {
            if (e.key === "ArrowLeft") navigateModal(-1);
            if (e.key === "ArrowRight") navigateModal(1);
            if (e.key === "Escape") toggleDetailsModal(false);
        }
    });

    function handleSwipe() {
        try {
            if (!activeModalMemories || activeModalMemories.length === 0) return;
            
            const SWIPE_THRESHOLD = 50; 
            if (touchEndX < touchStartX - SWIPE_THRESHOLD) navigateModal(1);  
            if (touchEndX > touchStartX + SWIPE_THRESHOLD) navigateModal(-1);
        } catch (swipeErr) {
            console.warn("Swipe gesture computation intercepted smoothly: ", swipeErr);
        }
    }

    if(detailsCard) {
        detailsCard.addEventListener("touchstart", (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, {passive: true});

        detailsCard.addEventListener("touchend", (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, {passive: true});
        
        // 4. Mouse Dragging (Alternative for PCs)
        detailsCard.addEventListener("mousedown", (e) => { touchStartX = e.screenX; });
        detailsCard.addEventListener("mouseup", (e) => { touchEndX = e.screenX; handleSwipe(); });
    }
});

window.addEventListener('online', () => {
    window.writeSystemLog("Network framework environment report: Browser is ONLINE.", "success");
    window.updateDatabaseBadgeStatus("ONLINE", "badge-online");
});
window.addEventListener('offline', () => {
    window.writeSystemLog("Network framework environment warning: Local browser hardware context dropped connection. System went OFFLINE.", "error");
    window.updateDatabaseBadgeStatus("OFFLINE", "badge-offline");
});

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