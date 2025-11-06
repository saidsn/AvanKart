// Helper function for making JSON POST requests

// Modal toggle functions
window.toggleRestaurantDetailPopup = function () {
  console.log("Restaurant Detail Popup Toggled");
  const popup = document.getElementById("restaurantDetailPopup");
  if (popup) {
    popup.classList.toggle("hidden");
  }
};

window.toggleTesdiqModal = function () {
  const modal = document.getElementById("tesdiqModal");
  if (modal) {
    modal.classList.toggle("hidden");
  }
};

window.toggleConfirmModal = function () {
  const modal = document.getElementById("confirmModal");
  if (modal) {
    modal.classList.toggle("hidden");
    if (!modal.classList.contains("hidden")) {
      // Start countdown if available
      if (window.startCountdown) {
        window.startCountdown();
      }
    }
  }
};

window.closeConfirmModal = function () {
  const modal = document.getElementById("confirmModal");
  if (modal) {
    modal.classList.add("hidden");
    if (window.countdownTimer) {
      clearInterval(window.countdownTimer);
    }
  }
};

window.toggleDeleteModal = function () {
  const modal = document.getElementById("deleteModal");
  if (modal) {
    modal.classList.toggle("hidden");
  }
};

window.toggleMuessiseVersiyalariModal = function () {
  const modal = document.getElementById("muessiseVersiyalari");
  if (modal) {
    modal.classList.toggle("hidden");
    if (!modal.classList.contains("hidden")) {
      // Start countdown if available
      if (window.startCountdown) {
        window.startCountdown();
      }
    }
  }
};

window.toggleDeAktivModal = function () {
  const modal = document.getElementById("deAktivModal");
  if (modal) {
    modal.classList.toggle("hidden");
  }
};

window.toggleSilinmeMuracietPopUp = function () {
  const modal = document.getElementById("silinmeMuracietPopUp");
  if (modal) {
    modal.classList.toggle("hidden");
  }
};

async function postJSON(url, body) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CSRF-Token": window.CSRF_TOKEN,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error making POST request:", error);
    throw error;
  }
}

// Confirm pending changes
async function confirmChanges(id) {
  try {
    await postJSON(`/sirketler/${id}/changes/confirm`, {});
    location.reload();
  } catch (error) {
    console.error("Error confirming changes:", error);
    alert(
      "Dəyişiklikləri təsdiqləmək mümkün olmadı. Xahiş edirik yenidən cəhd edin."
    );
  }
}

// Reject pending changes
async function rejectChanges(id) {
  try {
    await postJSON(`/sirketler/${id}/changes/reject`, {});
    location.reload();
  } catch (error) {
    console.error("Error rejecting changes:", error);
    alert(
      "Dəyişiklikləri rədd etmək mümkün olmadı. Xahiş edirik yenidən cəhd edin."
    );
  }
}

// Edit functionality for inside page
$(function () {
  const $editBtn = $("#inside-edit-btn");
  const $form = $("#saveMuessiseForm");

  async function fetchCompany(id) {
    const res = await fetch(`/sirketler/api/${id}`, {
      headers: { "CSRF-Token": window.CSRF_TOKEN },
    });
    return res.json();
  }

  // Override the submitForm function specifically for the edit form
  function overrideSubmitForm() {
    // Find the submit button and override its onclick behavior
    const submitButton = document.querySelector(
      "button[onclick=\"submitForm('saveMuessise')\"]"
    );
    if (submitButton) {
      submitButton.onclick = function (e) {
        e.preventDefault();
        handleEditFormSubmission();
        return false;
      };
    }
  }

  async function handleEditFormSubmission() {
    const id = $form.find('[name="sirket_id"]').val();

    if (!id) {
      alert("Şirkət ID tapılmadı");
      return;
    }

    // Helper function to safely get and trim form values
    const getFormValue = (name) => {
      const value = $form.find(`[name="${name}"]`).val();
      return value ? value.toString().trim() : "";
    };

    const getFormValueById = (id) => {
      const value = $form.find(`#${id}`).val();
      return value ? value.toString().trim() : "";
    };

    // Prepare services array
    const servicesInput = getFormValue("services");
    const services = servicesInput
      ? servicesInput
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s)
      : [];

    // Prepare phone object
    const phoneNumber = getFormValue("phone_number");
    const phonePrefix = getFormValue("phone_prefix");
    const phone =
      phoneNumber && phonePrefix
        ? [{ number: phoneNumber, prefix: phonePrefix }]
        : undefined;

    // Prepare social object
    const socialFacebook = getFormValue("social_facebook");
    const socialInstagram = getFormValue("social_instagram");
    const socialLinkedin = getFormValue("social_linkedin");
    const socialTwitter = getFormValue("social_twitter");
    const social = {};
    if (socialFacebook) social.facebook = socialFacebook;
    if (socialInstagram) social.instagram = socialInstagram;
    if (socialLinkedin) social.linkedin = socialLinkedin;
    if (socialTwitter) social.twitter = socialTwitter;

    const payload = {
      sirket_name: getFormValue("sirket_name"),
      email: getFormValue("email"),
      commission_percentage: Number(getFormValue("commission_percentage") || 0),
      cashback_percentage: Number(getFormValue("cashback_percentage") || 0),
      authorized_person_name: getFormValue("authorized_person_name"),
      authorized_person_gender: getFormValue("authorized_person_gender"),
      authorized_person_duty: getFormValue("authorized_person_duty"),
      authorized_person_phone: getFormValue("authorized_person_phone"),
      authorized_person_phone_suffix: getFormValue(
        "authorized_person_phone_suffix"
      ),
      authorized_person_email: getFormValue("authorized_person_email"),
      address: getFormValue("address"),
      description: getFormValue("description"),
      sirket_category: getFormValueById("categoryInput"),
      activity_type: getFormValueById("activityTypeInput"),
      website: getFormValue("website"),
      services: services.length > 0 ? services : undefined,
      phone: phone,
      social: Object.keys(social).length > 0 ? social : undefined,
    };

    // Remove undefined values to avoid sending them
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined || payload[key] === "") {
        delete payload[key];
      }
    });

    try {
      const res = await fetch(`/sirketler/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": window.CSRF_TOKEN,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Update failed");
      }

      // Success - update UI elements
      const nameEl = document.querySelector("#company-name");
      if (nameEl && payload.sirket_name)
        nameEl.textContent = payload.sirket_name;

      const emailEl = document.querySelector("#company-email");
      if (emailEl && payload.email) emailEl.textContent = payload.email;

      const commissionEl = document.querySelector("#company-commission");
      if (commissionEl)
        commissionEl.textContent = `${payload.commission_percentage || 0}%`;

      const authorizedEl = document.querySelector("#company-authorized");
      if (authorizedEl && payload.authorized_person_name)
        authorizedEl.textContent = payload.authorized_person_name;

      const categoryEl = document.querySelector("#company-category");
      if (categoryEl && payload.sirket_category)
        categoryEl.textContent = payload.sirket_category;

      // Close modal
      if (window.closeMainEditPopup) window.closeMainEditPopup();

      // Show success message
      if (window.alertModal) {
        window.alertModal(
          "Şirkət məlumatları uğurla yeniləndi",
          "success",
          3000
        );
      } else {
        alert("Şirkət məlumatları uğurla yeniləndi");
      }
    } catch (err) {
      console.error("inside save error", err);
      if (window.alertModal) {
        window.alertModal(
          "Məlumatları yeniləmək mümkün olmadı. Xahiş edirik yenidən cəhd edin.",
          "error",
          3000
        );
      } else {
        alert(
          "Məlumatları yeniləmək mümkün olmadı. Xahiş edirik yenidən cəhd edin."
        );
      }
    }
  }

  function prefillEditForm(company) {
    if (!$form.length) return;

    // Helper function to safely set form values
    const setFormValue = (name, value) => {
      const $field = $form.find(`[name="${name}"]`);
      if ($field.length) {
        $field.val(value || "");
      }
    };

    const setFormValueById = (id, value) => {
      const $field = $form.find(`#${id}`);
      if ($field.length) {
        $field.val(value || "");
      }
    };

    setFormValue("sirket_id", company._id || "");
    setFormValue("sirket_name", company.sirket_name || "");
    setFormValue(
      "email",
      Array.isArray(company.email)
        ? company.email[0] || ""
        : company.email || ""
    );
    setFormValue("commission_percentage", company.commission_percentage ?? 0);
    setFormValue("cashback_percentage", company.cashback_percentage ?? 0);
    setFormValue(
      "authorized_person_name",
      company.authorized_person?.name || ""
    );
    setFormValue(
      "authorized_person_gender",
      company.authorized_person?.gender || ""
    );
    setFormValue(
      "authorized_person_duty",
      company.authorized_person?.duty || ""
    );
    setFormValue(
      "authorized_person_phone",
      company.authorized_person?.phone || ""
    );
    setFormValue(
      "authorized_person_phone_suffix",
      company.authorized_person?.phone_suffix || ""
    );
    setFormValue(
      "authorized_person_email",
      company.authorized_person?.email || ""
    );
    setFormValue("address", company.address || "");
    setFormValue("description", company.description || "");
    setFormValueById("categoryInput", company.sirket_category || "");
    setFormValueById("activityTypeInput", company.activity_type || "");
    setFormValue(
      "website",
      Array.isArray(company.website)
        ? company.website[0] || ""
        : company.website || ""
    );

    // Handle services array
    if (company.services && Array.isArray(company.services)) {
      setFormValue("services", company.services.join(", "));
    }

    // Handle phone array
    if (
      company.phone &&
      Array.isArray(company.phone) &&
      company.phone.length > 0
    ) {
      setFormValue("phone_number", company.phone[0].number || "");
      setFormValue("phone_prefix", company.phone[0].prefix || "");
    }

    // Handle social media
    if (company.social) {
      setFormValue("social_facebook", company.social.facebook || "");
      setFormValue("social_instagram", company.social.instagram || "");
      setFormValue("social_linkedin", company.social.linkedin || "");
      setFormValue("social_twitter", company.social.twitter || "");
    }

    // Update dropdown display
    const categoryDropdown = $form.find("#dropdownSelected");
    if (categoryDropdown.length && company.sirket_category) {
      categoryDropdown.text(company.sirket_category);
    }
  }

  $editBtn.off("click.inside").on("click.inside", async function () {
    const id = this.dataset.id;
    if (!id) return;
    try {
      const { ok, company } = await fetchCompany(id);
      if (!ok || !company) return;
      prefillEditForm(company);
      if (window.openMainEditPopup) {
        window.openMainEditPopup("edit");
        // Override the submit form after popup opens
        setTimeout(overrideSubmitForm, 100);
      }
    } catch (e) {
      console.error("inside prefill error", e);
    }
  });
});
