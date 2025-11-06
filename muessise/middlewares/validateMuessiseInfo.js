import Cards from "../../shared/models/cardModel.js";

const isDevelopment = process.env.NODE_ENV === "development";

export const validateMuessiseInfo = async (req, res, next) => {
  try {
    const {
      muessise_name,
      address,
      services,
      description,
      cards,
      phone_number = [],
      email = [],
      website = [],
    } = req.body;

    // Error array to collect all validation errors
    const errors = [];

    // 1. Check for at least 1 card
    let cardsArray = cards;
    if (!cardsArray && req.body["cards[]"]) {
      cardsArray = req.body["cards[]"];
    }

    let processedCards = [];
    if (typeof cardsArray === "string") {
      processedCards = [cardsArray.trim()];
    } else if (Array.isArray(cardsArray)) {
      processedCards = cardsArray.filter(
        (c) => c && typeof c === "string" && c.trim()
      );
    }

    if (!processedCards || processedCards.length === 0) {
      errors.push("Ən azı 1 kart seçilməlidir");
    } else {
      // Validate that all cards exist in database
      try {
        const cleanedCards = processedCards.map((card) => card.trim());

        // Check if cards are in ObjectId format or name format
        const isObjectIdFormat = cleanedCards.every((card) => {
          return /^[0-9a-fA-F]{24}$/.test(card);
        });

        let existingCards;
        if (isObjectIdFormat) {
          existingCards = await Cards.find({
            _id: { $in: cleanedCards },
            status: "active",
            deleted: { $ne: true },
          }).select("_id name");
        } else {
          existingCards = await Cards.find({
            name: { $in: cleanedCards },
            status: "active",
            deleted: { $ne: true },
          }).select("_id name");
        }

        if (existingCards.length !== cleanedCards.length) {
          const foundItems = isObjectIdFormat
            ? existingCards.map((c) => c._id.toString())
            : existingCards.map((c) => c.name);
          const notFoundCards = cleanedCards.filter(
            (card) => !foundItems.includes(card)
          );
          errors.push(
            `Aşağıdakı kartlar tapılmadı: ${notFoundCards.join(", ")}`
          );
        }
      } catch (cardError) {
        if (isDevelopment) {
          console.error("Card validation error:", cardError);
        }
        errors.push("Kartların yoxlanılması zamanı xəta baş verdi");
      }
    }

    // 2. Check for all required images
    const requiredImages = [
      { field: "xarici_cover_image", name: "Xarici üz şəkli" },
      { field: "daxili_cover_image", name: "Daxili üz şəkli" },
      { field: "profile_image", name: "Profil şəkli" },
    ];

    for (const imageField of requiredImages) {
      if (
        !req.files ||
        !req.files[imageField.field] ||
        !req.files[imageField.field][0]
      ) {
        errors.push(`${imageField.name} yüklənməlidir`);
      }
    }

    // 3. Check muessise name
    if (!muessise_name || !muessise_name.trim()) {
      errors.push("Müəssisə adı daxil edilməlidir");
    }

    // 4. Check address
    if (!address || !address.trim()) {
      errors.push("Ünvan daxil edilməlidir");
    }

    // 5. Check for at least one service
    let processedServices = [];
    if (typeof services === "string") {
      processedServices = services
        ? services
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s)
        : [];
    } else if (Array.isArray(services)) {
      processedServices = services.filter((s) => s && s.trim());
    }

    if (!processedServices || processedServices.length === 0) {
      errors.push("Ən azı 1 xidmət göstərilməlidir");
    }

    // 6. Check description (about location)
    if (!description || !description.trim()) {
      errors.push("Məkan haqqında məlumat daxil edilməlidir");
    }

    // 7. Check contact information - at least one from each type
    const contactTypes = [
      { data: phone_number, name: "telefon nömrəsi" },
      { data: email, name: "e-poçt ünvanı" },
      { data: website, name: "veb sayt" },
    ];

    for (const contactType of contactTypes) {
      let hasValidContact = false;

      if (Array.isArray(contactType.data)) {
        hasValidContact = contactType.data.some((item) => item && item.trim());
      } else if (typeof contactType.data === "string") {
        hasValidContact = contactType.data.trim().length > 0;
      }

      if (!hasValidContact) {
        errors.push(`Ən azı 1 ${contactType.name} daxil edilməlidir`);
      }
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Məlumatların yoxlanılması zamanı xətalar tapıldı",
        errors: errors,
      });
    }

    // If all validations pass, continue to the next middleware/controller
    next();
  } catch (error) {
    console.error("Validation middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Məlumatların yoxlanılması zamanı sistem xətası baş verdi",
      details: isDevelopment ? error.message : null,
    });
  }
};
