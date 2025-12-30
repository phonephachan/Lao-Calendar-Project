let currentMonthIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  const calendarGrid = document.getElementById("calendar-grid");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  // Data is loaded from data.js into 'calendarData' variable
  if (typeof calendarData === "undefined") {
    console.error("Calendar data not found.");
    return;
  }

  // Initial render
  const monthSelector = document.getElementById("monthSelector");
  
  if (monthSelector) {
      calendarData.months.forEach((month, index) => {
          const option = document.createElement("option");
          option.value = index;
          option.textContent = month.nameLao;
          monthSelector.appendChild(option);
      });

      monthSelector.addEventListener("change", (e) => {
          currentMonthIndex = parseInt(e.target.value, 10);
          renderCalendar(calendarData, currentMonthIndex);
          updateButtons();
      });
  }

  renderCalendar(calendarData, currentMonthIndex);
  updateButtons();
  if(monthSelector) monthSelector.value = currentMonthIndex;

  prevBtn.addEventListener("click", () => {
    if (currentMonthIndex > 0) {
      currentMonthIndex--;
      renderCalendar(calendarData, currentMonthIndex);
      updateButtons();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentMonthIndex < calendarData.months.length - 1) {
      currentMonthIndex++;
      renderCalendar(calendarData, currentMonthIndex);
      updateButtons();
    }
  });

      // Modal Handling
      const modal = document.getElementById("dayDetailModal");
      const closeBtn = document.querySelector(".close-modal");

      if (modal && closeBtn) {
          closeBtn.addEventListener("click", () => {
              modal.classList.remove("visible");
              setTimeout(() => { modal.style.display = "none"; }, 300); // Wait for animation
          });

          window.addEventListener("click", (e) => {
              if (e.target === modal) {
                  modal.classList.remove("visible");
                  setTimeout(() => { modal.style.display = "none"; }, 300);
              }
          });
      }

  // --- Download Handler ---
  const downloadBtn = document.getElementById("downloadBtn");


  if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
          const container = document.querySelector(".calendar-container"); 
          
          if (typeof html2canvas !== 'undefined') {
             // Hide controls for cleaner screenshot
             downloadBtn.style.display = 'none';
             const navControls = document.querySelector(".navigation-controls");
             if(navControls) navControls.style.display = 'none';
             
             // Add high-contrast class
             container.classList.add('capturing');
             
             html2canvas(container, {
                 scale: 3, // 3 is usually plenty, 4 might be too heavy causing timeouts
                 backgroundColor: "#FFFFFF",
                 useCORS: true, 
                 logging: false,
                 allowTaint: true,
                 onclone: (clonedDoc) => {
                     // Ensure webfonts are applied in clone if needed, usually handled by waiting
                     const clonedContainer = clonedDoc.querySelector('.calendar-container');
                     if(clonedContainer) clonedContainer.classList.add('capturing');
                 }
             }).then(canvas => {
                 // Restore controls and remove class
                 downloadBtn.style.display = '';
                 if(navControls) navControls.style.display = '';
                 container.classList.remove('capturing');

                 const link = document.createElement('a');
                 const monthName = calendarData.months[currentMonthIndex].nameEng || "calendar";
                 link.download = `LaoCalendar2026_${monthName}.png`;
                 link.href = canvas.toDataURL("image/png");
                 link.click();
             }).catch(err => {
                 console.error("Screenshot failed:", err);
                 downloadBtn.style.display = '';
                 if(navControls) navControls.style.display = '';
                 container.classList.remove('capturing');
                 alert("Failed to capture image.");
             });
          } else {
              alert("Library not loaded. Please try again.");
          }
      });
  }
});

function updateButtons() {
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    
    prevBtn.disabled = currentMonthIndex === 0;
    nextBtn.disabled = currentMonthIndex === calendarData.months.length - 1;
    
    // Sync Selector
    const monthSelector = document.getElementById("monthSelector");
    if (monthSelector) monthSelector.value = currentMonthIndex;
}

function renderCalendar(data, monthIndex) {
  const container = document.getElementById("calendar-grid");
  container.innerHTML = "";

  // Update Global Header if first render (optional, or just do it once)
  if (data.globalHeader && document.querySelector('.main-header h2') === null) {
      const mainHeader = document.querySelector('.main-header');
      const globalH = document.createElement('h2');
      globalH.textContent = data.globalHeader;
      globalH.style.fontSize = "0.9em";
      globalH.style.marginBottom = "10px";
      mainHeader.insertBefore(globalH, mainHeader.querySelector('.navigation-controls'));
  }

  const month = data.months[monthIndex];
  if (!month) return;

    const monthBlock = document.createElement("div");
    monthBlock.className = "month-block";

    // Month Header
    const header = document.createElement("div");
    header.className = "month-header";
    
    // Parse header details to split Month Name from the rest
    let headerText = month.headerDetails || `${month.nameLao} - ${month.nameEng}`;
    const splitIndex = headerText.indexOf(')');
    
    if (splitIndex !== -1) {
        const mainTitle = headerText.substring(0, splitIndex + 1);
        const subDetails = headerText.substring(splitIndex + 1);
        
        const titleSpan = document.createElement("span");
        titleSpan.className = "header-month-title";
        titleSpan.textContent = mainTitle;
        
        const detailsSpan = document.createElement("span");
        detailsSpan.className = "header-details";
        detailsSpan.textContent = subDetails;
        
        header.appendChild(titleSpan);
        header.appendChild(document.createElement("br")); // Force line break
        header.appendChild(detailsSpan);
    } else {
        header.textContent = headerText;
    }

    monthBlock.appendChild(header);

    // Days Header (Sun-Sat)
    const daysHeader = document.createElement("div");
    daysHeader.className = "days-header";
    const dayNames = [
      { en: "SUN", lo: "ວັນອາທິດ" },
      { en: "MON", lo: "ວັນຈັນ" },
      { en: "TUE", lo: "ວັນອັງຄານ" },
      { en: "WED", lo: "ວັນພຸດ" },
      { en: "THU", lo: "ວັນພະຫັດ" },
      { en: "FRI", lo: "ວັນສຸກ" },
      { en: "SAT", lo: "ວັນເສົາ" },
    ];

    dayNames.forEach((d, index) => {
      const di = document.createElement("div");
      di.className = `day-name ${index === 0 ? "sunday" : ""}`;
      di.textContent = d.lo;
      daysHeader.appendChild(di);
    });
    monthBlock.appendChild(daysHeader);

    // Calendar Days Grid
    const grid = document.createElement("div");
    grid.className = "calendar-grid";

    // Calculate offset for empty cells
    const startDay = month.startDay;
    for (let i = 0; i < startDay; i++) {
      const empty = document.createElement("div");
      empty.className = "day-cell empty";
      grid.appendChild(empty);
    }

    month.days.forEach((day, index) => {
      const cell = document.createElement("div");
      const currentWeekday = (month.startDay + index) % 7;
      const isSunday = currentWeekday === 0;
      // Check for special 'red' flag
      const isRed = day.special === 'red';
      
      cell.className = `day-cell ${isSunday ? "sunday" : ""} ${isRed ? "red" : ""}`;

      // Solar Date
      const solar = document.createElement("div");
      solar.className = "solar-date";
      solar.textContent = day.date;
      cell.appendChild(solar);

      // Buddha Icon logic (Wan Sin)
      // Checks for 8, 14, or 15 Kham (Waxing or Waning)
      const isWanSin = day.lunar && /(?:ຂຶ້ນ|ແຮມ)\s*(?:8|14|15)\s*ຄ່ຳ/.test(day.lunar);

      if (day.isBuddha || isWanSin) {
          const icon = document.createElement("div");
          icon.className = "icon buddha";
          // Gold Dharma Wheel SVG
          icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFD700" stroke="#DAA520" stroke-width="1.5">
            <circle cx="12" cy="12" r="9" fill="none" />
            <circle cx="12" cy="12" r="2.5" />
            <path d="M12 3v18M3 12h18M5.64 5.64l12.72 12.72M5.64 18.36L18.36 5.64" stroke-linecap="round" />
          </svg>`;
          cell.appendChild(icon);
      }

      // Lunar Text
      if (day.lunar) {
        const lunar = document.createElement("div");
        lunar.className = "lunar-text desktop-only";
        lunar.textContent = day.lunar;
        cell.appendChild(lunar);
      }

      // Special Text (Standard)
      if (day.special && day.special !== 'red') {
        const special = document.createElement("div");
        special.className = "special-text desktop-only"; // Also hide on mobile? or keep? User didn't specify, but space is tight. Let's hide standard special text to rely on color/popup.
        special.textContent = day.special;
        cell.appendChild(special);
      }

      // Prediction Text
      if (day.prediction) {
          const prediction = document.createElement("div");
          prediction.className = "prediction-text desktop-only";
          prediction.textContent = day.prediction;
          cell.appendChild(prediction);
      }
      
      // Mobile Combined View
      const mobileInfo = document.createElement("div");
      mobileInfo.className = "mobile-info";
      
      // Row 2: Lunar
      const mobileLunar = document.createElement("div");
      mobileLunar.className = "mobile-lunar";
      mobileLunar.textContent = abbreviateLunar(day.lunar);
      mobileInfo.appendChild(mobileLunar);
      
      // Row 3: Prediction
      const mobilePred = document.createElement("div");
      mobilePred.className = "mobile-prediction";
      mobilePred.textContent = day.prediction || "";
      mobileInfo.appendChild(mobilePred);
      
      cell.appendChild(mobileInfo);

      // Click to Show Detail Popup
      cell.addEventListener("click", () => {
          const modal = document.getElementById("dayDetailModal");
          if (modal) {
              const modalDate = document.getElementById("modalDate");
              const modalDayName = document.getElementById("modalDayName");
              const modalLunar = document.getElementById("modalLunar");
              const modalPrediction = document.getElementById("modalPrediction");
              const modalSpecial = document.getElementById("modalSpecial");

              // Populate Data
              const dayOfWeek = dayNames[currentWeekday].lo;
              modalDate.textContent = `${day.date} ${month.nameLao} ${2026}`;
              modalDayName.textContent = dayOfWeek;
              
              modalLunar.textContent = day.lunar || "-";
              modalPrediction.textContent = day.prediction || "-";
              
              // Handle Special/Remarks
              let specialText = "";
              if (day.special && day.special !== 'red') specialText += day.special;
              if (isWanSin) specialText += (specialText ? ", " : "") + "ວັນສິນ";
              
              const specialRow = document.querySelector(".modal-item.special-row");
              if (specialText) {
                  modalSpecial.textContent = specialText;
                  if(specialRow) specialRow.style.display = "block";
              } else {
                  if(specialRow) specialRow.style.display = "none";
              }

              // Show Modal
              modal.style.display = "flex";
              // Small delay to allow display:flex to apply before adding visible class for transition
              requestAnimationFrame(() => {
                  modal.classList.add("visible");
              });
          }
      });

      grid.appendChild(cell);
    });

    monthBlock.appendChild(grid);
    
    // Month Footer
    if (month.footerText && month.footerText.length > 0) {
        const footer = document.createElement("div");
        footer.className = "month-footer";
        const ul = document.createElement("ul");
        month.footerText.forEach(text => {
            const li = document.createElement("li");
            li.textContent = text;
            ul.appendChild(li);
        });
        footer.appendChild(ul);
        monthBlock.appendChild(footer);
    }

    container.appendChild(monthBlock);
}

function abbreviateLunar(lunarStr) {
    if (!lunarStr) return "";
    // Regex to capture: (Phase)(Day) ... (Kham) ...
    // Matches "ຂຶ້ນ 13 ຄ່ຳ..." or "ແຮມ 1 ຄ່ຳ..."
    // Phase: ຂຶ້ນ (Waxing) -> ຂ, ແຮມ (Waning) -> ແຮມ or ແ? User said "ຂ.3.ຄ".
    // Let's use logic:
    
    let phase = "";
    let day = "";
    
    if (lunarStr.includes("ຂຶ້ນ")) {
        phase = "ຂ";
        const match = lunarStr.match(/ຂຶ້ນ\s*(\d+)/);
        if (match) day = match[1];
    } else if (lunarStr.includes("ແຮມ")) {
        phase = "ຮ"; // Using 'Hor' for Heam? Or 'ແ' for Aem? User didn't specify, but 'ຮ' is consonant. Let's try 'ຮ'.
        const match = lunarStr.match(/ແຮມ\s*(\d+)/);
        if (match) day = match[1];
    }
    
    // If complex parse failed, fallback?
    if (!phase || !day) return ""; // Or return original substring?
    
    return `${phase}.${day}.ຄ`;
}
