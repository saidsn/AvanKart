$(document).ready(function () {
  // Get CSRF token from meta tag
  const csrfToken = $('meta[name="csrf-token"]').attr("content");

  // Function to fetch muessise info
  function fetchMuessiseInfo() {
    $.ajax({
      url: "/muessise-info/get-muessise-info",
      type: "GET",
      headers: {
        "CSRF-Token": csrfToken,
        "X-Requested-With": "XMLHttpRequest",
      },
      beforeSend: function () {
        // Show loading indicator if needed
      },
      success: function (response) {
        if (response.success) {
          // Handle successful response
          displayMuessiseInfo(response.muessise);
        } else {
          console.error("Error in response:", response.message);
          showErrorMessage(response.message || "Failed to fetch muessise info");
        }
      },
      error: function (xhr, status, error) {
        console.error("AJAX Error:", {
          status: xhr.status,
          statusText: xhr.statusText,
          error: error,
          responseText: xhr.responseText,
        });

        let errorMessage = "Failed to fetch muessise information";

        // Handle different error types
        if (xhr.status === 404) {
          errorMessage = "Muessise information not found";
        } else if (xhr.status === 401) {
          errorMessage = "Authentication required";
          // Redirect to login if needed
          // window.location.href = '/login';
        } else if (xhr.status === 500) {
          errorMessage = "Server error occurred";
        }

        showErrorMessage(errorMessage);
      },
      complete: function () {
        // Hide loading indicator if needed
      },
    });
  }

  // Function to display muessise information
  function displayMuessiseInfo(muessise) {
    try {
      // Update basic information
      if (muessise.muessise_name) {
        $(".muessise-name").text(muessise.muessise_name);
      }

      if (muessise._id) {
        $(".muessise-id").text(muessise.muessise_id);
      }

      if (muessise.muessise_category) {
        $(".muessise-category").text(muessise.muessise_category);
      }

      if (muessise.address) {
        $(".muessise-address").text(muessise.address);
      }

      if (muessise.description) {
        $(".muessise-description").text(muessise.description);
      }

      if (muessise.muessise_id) {
        $(".muessise-id").text(muessise.muessise_id);
      }

      // Update authorized person information
      if (muessise.authorized_person) {
        const authorizedPerson = muessise.authorized_person;

        if (authorizedPerson.name) {
          $(".authorized-person-name").text(authorizedPerson.name);
        }

        if (authorizedPerson.duty) {
          $(".authorized-person-duty").text(authorizedPerson.duty);
        }

        if (authorizedPerson.phone) {
          const phoneDisplay = authorizedPerson.phone_suffix
            ? `${authorizedPerson.phone_suffix} ${authorizedPerson.phone}`
            : authorizedPerson.phone;
          $(".authorized-person-phone").text(phoneDisplay);
        }

        if (authorizedPerson.email) {
          $(".authorized-person-email").text(authorizedPerson.email);
        }
      }

      // Update contact information
      if (muessise.phone && muessise.phone.length > 0) {
        let phoneHtml = "";
        muessise.phone.forEach(function (phone) {
          const phoneDisplay = phone.prefix
            ? `${phone.prefix} ${phone.number}`
            : phone.number;
          phoneHtml += `<div class="flex gap-[11px] items-center text-messages">
             <span class=" icon iconex-calling-1 !w-[16px] !h-[16px] dark:text-[#FFFFFF]"></span>
             <span class="opacity-65 text-[13px] font-normal dark:text-[#FFFFFF]">${phoneDisplay}</span>
           </div>`;
        });
        $(".muessise-phones").html(phoneHtml);
      }

      if (muessise.email && muessise.email.length > 0) {
        let emailHtml = "";
        muessise.email.forEach(function (email) {
          emailHtml += `<div class="flex gap-[11px] items-center text-messages">
           <span class=" icon iconex-case-1 !w-[17px] !h-[16px] dark:text-[#FFFFFF]"></span>
           <span class="opacity-65 text-[13px] font-normal dark:text-[#FFFFFF]">${email}</span>
          </div>`;
        });
        $(".muessise-emails").html(emailHtml);
      }

      if (muessise.website && muessise.website.length > 0) {
        let websiteHtml = "";
        muessise.website.forEach(function (website) {
          websiteHtml += `  <div class="icon iconex-link-1  w-[9px] h-[17px] dark:text-[#FFFFFF]"></div>
              <span class="text-[13px] font-medium text-messages dark:text-[#FFFFFF] opacity-65 ">${website}</span>`;
        });
        $(".muessise-websites").html(websiteHtml);

        // <div class="icon iconex-link-1  w-[9px] h-[17px] dark:text-[#FFFFFF]"></div>
        //             <span class="text-[13px] font-medium text-messages dark:text-[#FFFFFF] opacity-65 ">${website}</span>
      }

      // Update services
      if (muessise.services && muessise.services.length > 0) {
        let servicesHtml = "";
        muessise.services.forEach(function (service) {
          servicesHtml += `<div
           class="px-1 py-2 bg-focus text-[12px] text-on-primary flex items-center justify-center rounded-full">
           ${service}
         </div>`;
        });
        $(".muessise-services").html(servicesHtml);
      }

      // Update social media links
      if (muessise.social && Object.keys(muessise.social).length > 0) {
        let socialHtml = "";
        Object.entries(muessise.social).forEach(function ([platform, url]) {
          if (platform === "linkedin") {
            socialHtml += `<div class="p-3 flex gap-2 border-b-[0.5px] border-[#0000001A] hover:bg-table-hover dark:hover:bg-[#242C30] cursor-pointer">
                <img src="/images/muessise melumatlari images/devicon_linkedin.svg" alt="linkedin">
                <span class="text-[13px] font-medium text-messages dark:text-[#FFFFFF] opacity-65">${platform}</span>
              </div>`;
          }
          if (platform === "instagram") {
            socialHtml += `<div class="p-3 flex gap-2 border-b-[0.5px] border-[#0000001A] hover:bg-table-hover dark:hover:bg-[#242C30] cursor-pointer">
                <img src="/images/muessise melumatlari images/skill-icons_instagram.svg" alt="instagram">
                <span class="text-[13px] font-medium text-messages dark:text-[#FFFFFF] opacity-65">${platform}</span>
              </div>`;
          }
          if (platform === "facebook") {
            socialHtml += `<div class="p-3 flex gap-2 border-b-[0.5px] border-[#0000001A] hover:bg-table-hover dark:hover:bg-[#242C30] cursor-pointer">
                <img src="/images/muessise melumatlari images/devicon_facebook.svg" alt="facebook">
                <span class="text-[13px] font-medium text-messages dark:text-[#FFFFFF] opacity-65">${platform}</span>
              </div>`;
          }
        });
        $(".muessise-social").html(socialHtml);
      }

      // Update images
      if (muessise.profile_image) {
        const theme = localStorage.getItem("theme") || "light";
        if (theme === "dark") {
          $(".profile-image").attr("src", muessise.profile_image);
        } else {
          $(".profile-image").attr("src", muessise.profile_image);
        }
      }

      if (muessise.cards) {
        let cardsHtml = "";
        muessise.cards.forEach(function (card) {
          // <img class="w-[16px] h-[16px]" src="/images/muessise melumatlari images/ForkKnife.svg" alt="ForkKnife">
          cardsHtml += `<div class="flex gap-1 px-2 py-1 items-center justify-center bg-[#FFBC0D] rounded-full ">
              <span class="font-normal text-[12px] text-messages">${card.name}</span>
            </div>`;
        });

        // <div class="w-[84px] h-[27px] flex gap-1 items-center justify-center bg-[#FFBC0D] rounded-full ">
        //   <img class="w-[16px] h-[16px]" src="/images/muessise melumatlari images/ForkKnife.svg" alt="ForkKnife">
        //     <span class="font-normal text-[12px] text-messages">${card.name}</span>
        // </div>
        $(".muessise-cards").html(cardsHtml);
      }

      if (muessise.xarici_cover_image) {
        $(".xarici-cover-image").attr("src", muessise.xarici_cover_image);
      }

      if (muessise.daxili_cover_image) {
        $(".daxili-cover-image").attr("src", muessise.daxili_cover_image);
      }

      // Update other fields
      if (muessise.activity_type) {
        $(".activity-type").text(muessise.activity_type);
      }

      if (muessise.commission_percentage !== undefined) {
        $(".commission-percentage").text(muessise.commission_percentage + "%");
      }

      if (muessise.company_status !== undefined) {
        const statusText =
          muessise.company_status === 1 ? "Active" : "Inactive";
        $(".company-status").text(statusText);
      }

      if (muessise.rekvizitler && muessise.rekvizitler.length > 0) {
        let titleHtml = `
          <p class="text-[12px] font-semibold mb-4 text-[#1D222B] opacity-65 dark:text-[#FFFFFF]">
            Özsüt Restoran Bank Rekvizitləri ${muessise.muessise_name} Bank Rekvizitləri
          </p>
        `;

        $("#rekvizitler-content").html(titleHtml);

        muessise.rekvizitler.forEach(function (rekvizit) {
          let rekvizitHtml = `
          <div class="flex w-[50%]">
           <div
             class="flex-1 bg-[#FAFAFA] dark:bg-side-bar-bg-dark rounded-l-[12px] p-5 flex flex-col gap-3">
             <div
               class="text-[11px] font-medium text-[#1D222B] dark:text-[#FFFFFF] opacity-65">
               Şirkətin adı</div>
             <div
               class="text-[13px] text-[#1D222B] dark:text-[#FFFFFF] font-semibold">
               ${rekvizit.muessise_name}
               </div>

             <div
               class="text-[11px] font-medium text-[#1D222B] dark:text-[#FFFFFF] opacity-65">
               Bankın adı</div>
             <div
               class="text-[13px] text-[#1D222B] dark:text-[#FFFFFF] font-semibold">
               ${rekvizit.bank_info?.bank_name || "N/A"}
               </div>
             <div
               class="text-[11px] font-medium text-messages dark:text-[#FFFFFF] opacity-65">
               Swift</div>
             <div
               class="text-[13px] text-[#1D222B] dark:text-[#FFFFFF] font-semibold">
               ${rekvizit.bank_info?.swift || "N/A"}
             </div>
             <div
               class="text-[11px] font-medium text-[#1D222B] dark:text-[#FFFFFF] opacity-65">
               Hesablaşma hesabı</div>
             <div
               class="text-[13px] text-[#1D222B] font-semibold dark:text-[#FFFFFF] break-all">
               ${rekvizit.bank_info?.settlement_account || "N/A"}
             </div>
           </div>
           
           <div
             class="flex-1 gap-5 bg-[#FAFAFA]  dark:bg-side-bar-bg-dark rounded-r-[12px] p-5 flex flex-col">
             <div
               class="border-l-[0.5px] flex flex-col gap-1.5 border-[#0000001A] pl-3">
               <div
                 class="text-[11px] font-medium  text-messages dark:text-[#FFFFFF] opacity-65">
                 Hüquqi ünvan</div>
               <div
                 class="text-[13px] font-semibold dark:text-[#FFFFFF] text-messages">
                 ${rekvizit.huquqi_unvan || "N/A"}
                 </div>
             </div>
             <div
               class="border-l-[0.5px] flex flex-col gap-1.5 border-[#0000001A] pl-3">

               <div
                 class="text-[11px] font-medium text-messages dark:text-[#FFFFFF] opacity-65">
                 Bankın kodu</div>
               <div
                 class="text-[13px] font-semibold text-messages dark:text-[#FFFFFF]">
                 ${rekvizit.bank_info?.bank_code || "N/A"}
               </div>
             </div>

             <div
               class="border-l-[0.5px] flex-col flex gap-1.5 border-[#0000001A] pl-3">

               <div
                 class="text-[11px] font-medium text-messages  dark:text-[#FFFFFF] opacity-65">
                 Müxbir hesabı</div>
               <div
                 class="text-[13px] font-semibold text-messages dark:text-[#FFFFFF]">
                 ${rekvizit.bank_info?.muxbir_hesabi || "N/A"}
               </div>
             </div>
             <div
               class="border-l-[0.5px] flex gap-1.5 flex-col border-[#0000001A] pl-3">

               <div
                 class="text-[11px] font-medium text-messages dark:text-[#FFFFFF] opacity-65">
                 VÖEN</div>
               <div
                 class="text-[13px] font-semibold text-messages dark:text-[#FFFFFF]">
                  ${rekvizit.voen || "N/A"}
               </div>
             </div>
           </div>
         </div>
          `;
          $("#rekvizit-cards").append(rekvizitHtml);
        });
      }
    } catch (error) {
      console.error("Error displaying muessise info:", error);
      showErrorMessage("Error displaying muessise information");
    }
  }

  // Function to show error messages
  function showErrorMessage(message) {
    // You can customize this based on your toast/notification system
    if (typeof showToast === "function") {
      showToast(message, "error");
    } else {
      console.error("Error:", message);
      // Fallback: show alert or update a specific element
      alert(message);
    }
  }

  // Function to refresh muessise info
  window.refreshMuessiseInfo = function () {
    fetchMuessiseInfo();
  };

  // Auto-fetch on page load
  fetchMuessiseInfo();
  // Optional: Refresh data periodically (uncomment if needed)
  // setInterval(fetchMuessiseInfo, 300000); // Refresh every 5 minutes
});
