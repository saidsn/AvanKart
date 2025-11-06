import fs from "fs";
import path from "path";
import sharp from "sharp";
import TempMuessiseInfo from "../../../shared/model/partner/tempMuessiseInfo.js";
import Cards from "../../../shared/models/cardModel.js";
import PartnerUser from "../../../shared/models/partnyorUserModel.js";

const isDevelopment = process.env.NODE_ENV === "development";

export const editMuessiseInfo = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message:
          "İstifadəçi məlumatları tapılmadı. Zəhmət olmasa yenidən daxil olun.",
      });
    }

    const userId = req.user.id;

    const fullUser = await PartnerUser.findById(userId).select(
      "muessise_id _id email"
    );

    if (!fullUser) {
      return res.status(404).json({
        message: "İstifadəçi tapılmadı.",
      });
    }

    if (!fullUser.muessise_id) {
      return res.status(400).json({
        message: "İstifadəçi müəssisə ilə əlaqələndirilməyib.",
      });
    }

    const muessise_id = fullUser.muessise_id;
    const user_id = fullUser._id;

    const imageFields = [
      "xarici_cover_image",
      "daxili_cover_image",
      "profile_image",
    ];
    const imageMeta = {};

    for (const field of imageFields) {
      if (req.files && req.files[field] && req.files[field][0]) {
        const file = req.files[field][0];
        const { path: filePath, filename } = file;

        const metadata = await sharp(filePath).metadata();
        if (
          field === "profile_image" &&
          (metadata.width < 120 || metadata.height < 120)
        ) {
          fs.unlinkSync(filePath);
          return res
            .status(400)
            .json({ message: "Profil şəkli minimum 120x120 olmalıdır" });
        }
        if (
          (field === "xarici_cover_image" || field === "daxili_cover_image") &&
          (metadata.width < 200 || metadata.height < 200)
        ) {
          fs.unlinkSync(filePath);
          return res
            .status(400)
            .json({ message: `${field} minimum 200x200 olmalıdır` });
        }

        imageMeta[`${field}`] = filename;
        imageMeta[`${field}_path`] = `images/${muessise_id}/info/${filename}`;
      }
    }

    const {
      muessise_name = "",
      muessise_category = "",
      address = "",
      coordinates,
      services = "",
      description = "",
      cards = undefined,
      phone_number = [],
      phone_prefix = [],
      email = [],
      website = [],
      social = {},
    } = req.body;

    if (!coordinates && !address)
      return res.status(400).json({
        message: "Coordinates and address can't be empty",
      });

    const geocodingResult = await findCoord(coordinates, address);
    if (!geocodingResult || geocodingResult instanceof Error) {
      return res.status(400).json({
        message: "Koordinat və ya ünvan məlumatları emal edilə bilmədi",
      });
    }

    const {
      coordinates: finalCoordinates,
      address: finalAddress,
      lat,
      lng,
    } = geocodingResult;

    let cardsArray = cards;
    if (!cardsArray && req.body["cards[]"]) {
      cardsArray = req.body["cards[]"];
    }

    if (isDevelopment) {
      console.log(`Muessise ID: ${muessise_id}, User ID: ${user_id}`);
      console.log("🎯 Raw form data debug:");
      console.log("- req.body keys:", Object.keys(req.body));
      console.log("- cards raw:", cards, typeof cards);
      console.log("- cards[] from req.body:", req.body["cards[]"]);
      console.log("- services raw:", services, typeof services);
      console.log("- social raw:", social);
      console.log("- social type:", typeof social);
      console.log("- social keys:", social ? Object.keys(social) : "null");

      if (req.body["cards[]"]) {
        console.log("- cards[] found:", req.body["cards[]"]);
      }
      console.log("- cardsArray after processing:", cardsArray);
    }

    let processedServices = [];
    if (typeof services === "string") {
      processedServices = services
        ? services
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s)
        : [];
    } else if (Array.isArray(services)) {
      processedServices = services;
    }

    let processedCards = [];
    if (typeof cardsArray === "string") {
      processedCards = [cardsArray.trim()];
    } else if (Array.isArray(cardsArray)) {
      processedCards = cardsArray.filter(
        (c) => c && typeof c === "string" && c.trim()
      );
    }

    if (isDevelopment) {
      console.log("🎯 Cards after processing:", processedCards);
      console.log("🎯 Cards processing type check:");
      processedCards.forEach((card, index) => {
        console.log(
          `  Card ${index}: "${card}" (${typeof card}) - length: ${card.length}`
        );
      });
    }

    const scheduleDays = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    const finalSchedule = {};

    for (const day of scheduleDays) {
      const start = req.body[`${day}_start`];
      const end = req.body[`${day}_end`];
      if (start && end && start.trim() && end.trim()) {
        finalSchedule[day] = { start: start.trim(), end: end.trim() };
      }
    }

    for (const schedule in finalSchedule) {
      if (
        !finalSchedule[schedule].start ||
        finalSchedule[schedule].start.length !== 5
      ) {
        finalSchedule[schedule].start = "09:00";
      }
      if (
        !finalSchedule[schedule].end ||
        finalSchedule[schedule].end.length !== 5
      ) {
        finalSchedule[schedule].end = "22:00";
      }
    }

    let validCardIds = [];
    if (Array.isArray(processedCards) && processedCards.length > 0) {
      try {
        if (isDevelopment) {
          console.log("🔍 Validating cards...");
          console.log("Cards to validate:", processedCards);
        }

        const cleanedCards = processedCards.map((card) => card.trim());

        if (isDevelopment) {
          console.log("🧹 Cleaned cards:", cleanedCards);
        }

        const allActiveCards = await Cards.find({
          status: "active",
          deleted: { $ne: true },
        }).select("_id name");

        if (isDevelopment) {
          console.log("📋 All active cards in DB:");
          allActiveCards.forEach((card) => {
            console.log(`  - "${card.name}" (ID: ${card._id})`);
          });
        }

        let existingCards;

        const isObjectIdFormat = cleanedCards.every((card) => {
          return /^[0-9a-fA-F]{24}$/.test(card);
        });

        if (isObjectIdFormat) {
          if (isDevelopment) {
            console.log("🔍 Detected ObjectId format, searching by _id");
          }
          existingCards = await Cards.find({
            _id: { $in: cleanedCards },
            status: "active",
            deleted: { $ne: true },
          }).select("_id name");
        } else {
          if (isDevelopment) {
            console.log("🔍 Detected name format, searching by name");
          }

          existingCards = await Cards.find({
            name: { $in: cleanedCards },
            status: "active",
            deleted: { $ne: true },
          }).select("_id name");

          if (existingCards.length !== cleanedCards.length) {
            if (isDevelopment) {
              console.log(
                "⚠️ Exact match failed, trying case-insensitive search"
              );
            }

            const foundNames = existingCards.map((c) => c.name);
            const notFoundCards = cleanedCards.filter(
              (name) => !foundNames.includes(name)
            );

            if (isDevelopment) {
              console.log("Not found with exact match:", notFoundCards);
            }

            const caseInsensitiveCards = await Cards.find({
              name: {
                $in: notFoundCards.map((name) => new RegExp(`^${name}$`, "i")),
              },
              status: "active",
              deleted: { $ne: true },
            }).select("_id name");

            if (isDevelopment) {
              console.log(
                "Found with case-insensitive search:",
                caseInsensitiveCards.map((c) => c.name)
              );
            }

            existingCards = [...existingCards, ...caseInsensitiveCards];
          }
        }

        validCardIds = existingCards.map((card) => card._id);

        if (isDevelopment) {
          console.log("🔍 Card validation results:");
          console.log(
            "- Search method:",
            isObjectIdFormat ? "ObjectId" : "Name"
          );
          console.log("- Requested cards:", cleanedCards);
          console.log(
            "- Found cards in database:",
            existingCards.map((c) => ({ id: c._id, name: c.name }))
          );
          console.log("- Valid card IDs:", validCardIds);
          console.log("- Valid card IDs count:", validCardIds.length);
        }

        if (existingCards.length !== cleanedCards.length) {
          if (isObjectIdFormat) {
            const foundIds = existingCards.map((c) => c._id.toString());
            const notFoundCards = cleanedCards.filter(
              (cardId) => !foundIds.includes(cardId)
            );
            if (isDevelopment) {
              console.log("⚠️ Some cards not found by ID:", notFoundCards);
            }
          } else {
            const foundNames = existingCards.map((c) => c.name);
            const notFoundCards = cleanedCards.filter(
              (name) => !foundNames.includes(name)
            );
            if (isDevelopment) {
              console.log("⚠️ Some cards not found by name:", notFoundCards);
              console.log("🔍 Checking for similar names...");

              for (const notFound of notFoundCards) {
                const similarCards = allActiveCards.filter((dbCard) => {
                  const similarity =
                    dbCard.name
                      .toLowerCase()
                      .includes(notFound.toLowerCase()) ||
                    notFound.toLowerCase().includes(dbCard.name.toLowerCase());
                  return similarity;
                });

                if (similarCards.length > 0) {
                  console.log(
                    `  Similar to "${notFound}":`,
                    similarCards.map((c) => c.name)
                  );
                }
              }
            }
          }
        }
      } catch (error) {
        if (isDevelopment) {
          console.error("❌ Card validation error:", error.message);
        }
        validCardIds = [];
      }
    }

    if (isDevelopment) {
      console.log("💾 Final cards to save:");
      console.log("- validCardIds:", validCardIds);
      console.log("- validCardIds length:", validCardIds.length);
    }

    const phone = [];
    const phoneNumbers = Array.isArray(phone_number)
      ? phone_number
      : [phone_number];
    const phonePrefixes = Array.isArray(phone_prefix)
      ? phone_prefix
      : [phone_prefix];

    for (let i = 0; i < phoneNumbers.length; i++) {
      if (phoneNumbers[i] && phoneNumbers[i].toString().trim()) {
        phone.push({
          number: phoneNumbers[i].toString().trim(),
          prefix: phonePrefixes[i] || "+994",
        });
      }
    }

    const emailList = Array.isArray(email)
      ? email.filter((e) => e && e.toString().trim())
      : [];

    const websiteList = Array.isArray(website)
      ? website.filter((w) => w && w.toString().trim())
      : [];

    const socialMap = new Map();
    if (social && typeof social === "object") {
      if (isDevelopment) {
        console.log("🔍 Processing social object:", social);
        console.log("Social entries to process:", Object.entries(social));
      }

      for (const [platform, url] of Object.entries(social)) {
        if (isDevelopment) {
          console.log(
            `Platform: ${platform}, URL: "${url}", URL type: ${typeof url}, URL trimmed: "${
              url ? url.toString().trim() : "empty"
            }"`
          );
        }

        if (url && url.toString().trim() !== "") {
          socialMap.set(platform, url.toString().trim());
          if (isDevelopment) {
            console.log(
              `✅ Added to socialMap: ${platform} -> ${url.toString().trim()}`
            );
          }
        } else {
          if (isDevelopment) {
            console.log(`❌ Skipped empty URL for ${platform}`);
          }
        }
      }
    }

    if (isDevelopment) {
      console.log("📱 Social map created:", socialMap.size, "entries");
      console.log("Social entries:", [...socialMap.entries()]);
    }

    const dataToSave = {
      muessise_id,
      user_id,
      muessise_name,
      muessise_category,
      address: finalAddress,
      coordinates: finalCoordinates,
      lat,
      lng,
      services: processedServices,
      description,
      cards: validCardIds,
      schedule: finalSchedule,
      phone: phone,
      email: emailList,
      website: websiteList,
      social: socialMap,
      ...imageMeta,
    };

    await TempMuessiseInfo.deleteMany({ muessise_id, user_id });

    const newInfo = new TempMuessiseInfo(dataToSave);

    if (isDevelopment) {
      console.log("💾 Final save debug:");
      console.log("- Cards being saved count:", validCardIds.length);
      console.log("- Cards being saved IDs:", validCardIds);
      console.log("- Social being saved count:", socialMap.size);
      console.log("- Services being saved:", processedServices);
      console.log("- DataToSave keys:", Object.keys(dataToSave));
      console.log("- Before save - social Map:", socialMap);
      console.log("- Before save - newInfo.social:", newInfo.social);
      console.log("- Before save - newInfo.cards:", newInfo.cards);
    }

    await newInfo.save();

    if (isDevelopment) {
      console.log("✅ After save - checking saved record...");
      const savedRecord = await TempMuessiseInfo.findById(newInfo._id);
      console.log("- Saved record social:", savedRecord.social);
      console.log("- Saved record cards:", savedRecord.cards);
      console.log("- Saved record cards length:", savedRecord.cards.length);
      console.log("- Saved record services:", savedRecord.services);
      console.log("🎉 Məlumatlar uğurla saxlanıldı!");
    }

    return res.status(200).json({
      message: "Məlumatlar müvəqqəti yadda saxlanıldı.",
      debug: isDevelopment
        ? {
            savedCardsCount: validCardIds.length,
            savedCardsIds: validCardIds,
            savedServicesCount: processedServices.length,
            savedSocialCount: socialMap.size,
          }
        : undefined,
    });
  } catch (error) {
    if (isDevelopment) {
      console.error("❌ Controller error:", error.message);
      console.error("Error stack:", error.stack);
    }

    if (error.name === "ValidationError") {
      const validationMessages = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        message: "Məlumat xətası: " + validationMessages.join(", "),
        ...(isDevelopment && { errors: error.errors }),
      });
    }

    return res.status(500).json({
      message: "Serverdə xəta baş verdi.",
      ...(isDevelopment && { error: error.message }),
    });
  }
};

export const findCoord = async (coordinates, address) => {
  try {
    if (coordinates && address) {
      const coordsArray = coordinates.split(",");
      if (coordsArray.length === 2) {
        const lat = coordsArray[0].trim();
        const lng = coordsArray[1].trim();
        return { coordinates, address, lat, lng };
      }
    }

    if (!coordinates && address) {
      const encodedAddress = encodeURIComponent(address);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.GOOGLE_MAPS_API_KEY || "placeholder_key"}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const lat = data.results[0].geometry.location.lat.toString();
        const lng = data.results[0].geometry.location.lng.toString();
        const finalCoordinates = `${lat}, ${lng}`;

        return { coordinates: finalCoordinates, address, lat, lng };
      } else {
        return { coordinates: "", address, lat: null, lng: null };
      }
    }

    if (coordinates && !address) {
      const coordsArray = coordinates.split(",");
      if (coordsArray.length === 2) {
        const lat = coordsArray[0].trim();
        const lng = coordsArray[1].trim();

        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY || "placeholder_key"}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "OK" && data.results.length > 0) {
          const finalAddress = data.results[0].formatted_address;
          return { coordinates, address: finalAddress, lat, lng };
        } else {
          return { coordinates, address: "", lat, lng };
        }
      }
    }

    return { coordinates: "", address: "", lat: null, lng: null };
  } catch (error) {
    console.log("Geocoding error:", error.message);
    return {
      coordinates: coordinates || "",
      address: address || "",
      lat: null,
      lng: null,
    };
  }
};
