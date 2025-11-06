function alertModal(message, type = "success", duration = 3000) {
  const container = document.getElementById("alertModalContainer");
  const box = document.getElementById("alertModalBox");
  const icon = document.getElementById("alertModalIcon");
  const msg = document.getElementById("alertModalMessage");
  const closeBtn = document.getElementById("alertModalClose");
  const closeContainer = document.getElementById("alertModalCloseContainer");

  let bgClass, textClass, iconClass, closeBg;
  if (type === "error") {
    bgClass = "bg-error-hover";
    textClass = "text-error";
    iconClass = "iconex iconex-shield-1";
    closeBg = "bg-error";
  } else if (type === "warning") {
    bgClass = "bg-[#FFDEAA66]";
    textClass = "text-[#FFA100]";
    iconClass = "iconex iconex-shield-1";
    closeBg = "bg-[#FFA100]";
  } else {
    bgClass = "bg-success-bg";
    textClass = "text-success";
    iconClass = "iconex iconex-shield-1-1";
    closeBg = "bg-success";
  }

  // ✅ Bütün FON və radius Box-da saxlanır!
  box.className = `overflow-hidden rounded-full w-[262px] flex items-center justify-between px-5 py-3 ${bgClass} ${textClass} opacity-0 -translate-y-10 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-auto`;

  icon.className = `${iconClass} w-4 h-5 px-3`;
  msg.textContent = message;
  msg.className = `text-[12px] font-medium ${textClass}`;
  closeContainer.className = `flex justify-center items-center rounded-full ${closeBg}`;

  // ✅ Göstər (Box animasiyası)
  setTimeout(() => {
    box.classList.remove("opacity-0", "-translate-y-10");
    box.classList.add("opacity-100", "translate-y-0");
  }, 10);

  // ✅ Auto close
  const autoClose = setTimeout(close, duration);

  // ✅ X düyməsi
  closeBtn.onclick = () => {
    close();
    clearTimeout(autoClose);
  };

  function close() {
    box.classList.remove("opacity-100", "translate-y-0");
    box.classList.add("opacity-0", "-translate-y-10");
  }
}

// Test:
alertModal("Success", "success", 3000);
// alertModal("Xəta baş verdi!", "error", 3000);
// alertModal("Diqqət!", "warning", 3000);
