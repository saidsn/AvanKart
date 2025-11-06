import mongoose, { mongo } from "mongoose";
import Hesablasma from "../../shared/model/partner/Hesablasma.js";
import Muessise from "../../shared/models/muessiseModel.js";
import MuessiseSilinme from "../../shared/models/muessiseSilinme.js";
import TransactionsUser from "../../shared/models/transactionsModel.js";
import Cards from "../../shared/models/cardModel.js";
import Rekvizitler from "../../shared/models/rekvizitlerModel.js";
import PartnerUser from "../../shared/models/partnyorUserModel.js";
import RbacPermission from "../../shared/models/rbacPermission.model.js";
import { generateRandomPassword } from "../utils/generatePassword.js";
import { sendMail } from "../../shared/utils/otpHandler.js";
import argon2 from "argon2";
import fs from "fs";
import path from "path";
import MuqavilelerModel from "../../shared/model/partner/muqavilelerModel.js";
import { group } from "console";
import Duty from "../../shared/models/duties.js";
import Ticket from "../../shared/model/partner/ticket.js";
import { query } from "express";
import NotificationModel from "../../shared/models/notificationModel.js";
import PeopleUser from "../../shared/models/peopleUserModel.js";
import PeopleUsers from "../../shared/models/peopleUsersModel.js";

export const getMuessiseler = async (req, res) => {
    try {

        const muessiseler = await Muessise.find()
            .populate("creator_id", "name surname")
            // .populate("cards", "name icon background_color")
            .lean();
        const totalCompanies = {
            all: await Muessise.countDocuments({}),
            active: await Muessise.countDocuments({ company_status: 0 }),
            deactive: await Muessise.countDocuments({ company_status: 1 }),
            deleted: await Muessise.countDocuments({ company_status: 2 }),
            pending: await Muessise.countDocuments({ company_status: 3 })
        };
        const cards = await Cards.find();


        return res.render("pages/muessiseler/muessiseler", {
            error: "",
            csrfToken: req.csrfToken(),
            data: muessiseler,
            totalCompanies,
            cards
        });
    } catch (error) {
        console.error("delete-ticket error:", error);
        return res.status(500).send("Internal Server Error");
    }
};


export const muessiselerTable = async (req, res) => {
    try {
        const {
            draw,
            start,
            length,
            search,
            status
        } = req.body;

        let match = {};
        const statusMap = {
            Aktiv: 0,
            Deaktiv: 1,
            Silinmişlər: 2,
            Silinmə: 3
        };
        if (status && status !== "all") match.company_status = statusMap[status];


        let statusSearch = statusMap[search];

        match.$or = [
            { muessise_name: new RegExp(search, "i") },
            { "authorized_person.name": new RegExp(search, "i") },
            ...(statusSearch !== undefined ? [{ company_status: statusSearch }] : []),
            { email: new RegExp(search, "i") }
        ];


        const muessiseler = await Muessise.find(match)
            .collection({ locale: "az", strength: 2 })
            .populate("creator_id", "name surname")
            .skip(start)
            .limit(length)
            .lean();

        const recordsFiltered = await Muessise.countDocuments(match);
        const recordsTotal = await Muessise.countDocuments();

        muessiseler.forEach(item => {
            const newDate = new Date(item.updatedAt);
            item.updatedAt = `${newDate.toLocaleDateString("az-AZ", { timeZone: "Asia/Baku" })}-${newDate.toLocaleTimeString("az-AZ", { timeZone: "Asia/Baku" })}`;
            switch (item.company_status) {
                case 0:
                    item.company_status = "Aktiv";
                    break;
                case 1:
                    item.company_status = "Deaktiv";
                    break;
                case 2:
                    item.company_status = "Silinmişlər";
                    break;
                case 3:
                    item.company_status = "gözləyir";
                    break;
            }
        });

        return res.status(200).json({
            message: "Muessiseler ugurla yuklendi",
            data: muessiseler,
            draw,
            recordsFiltered,
            recordsTotal
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server xətası", error: error.message });
    };
};


export const createMuessise = async (req, res) => {
    try {
        const {
            activity_type,
            commission_percentage,
            muessise_name,
            muessise_category,
            coordinates,
            address,
            huquqicoordinates,
            huquqiaddress,
            services,
            description,
            cards,
            phonePrefix,
            location_point,
            authorized_person_name,
            authorized_person_phone,
            authorized_person_phone_prefix,
            authorized_person_email,
            gender,
            company_name,
            bank_name,
            swift_code,
            iban,
            correspondent_account,
            voen,
            contact_phone,
            contact_email,
            contact_website,
            social_media,
            monday_enabled,
            tuesday_enabled,
            wednesday_enabled,
            thursday_enabled,
            friday_enabled,
            saturday_enabled,
            sunday_enabled,
            monday_start,
            monday_end,
            tuesday_start,
            tuesday_end,
            wednesday_start,
            wednesday_end,
            thursday_start,
            thursday_end,
            friday_start,
            friday_end,
            saturday_start,
            saturday_end,
            sunday_start,
            sunday_end,
        } = req.body;
        // const { xarici_cover_image,
        //     daxili_cover_image,
        //     profile_image } = req.files;

        if (
            // !activity_type ||
            !commission_percentage ||
            !muessise_name ||
            !muessise_category ||
            // !coordinates ||
            !address ||
            // !huquqicoordinates ||
            !huquqiaddress ||
            !services ||
            !description ||
            !cards ||
            !phonePrefix ||
            !authorized_person_name ||
            !authorized_person_phone ||
            !authorized_person_phone_prefix ||
            !authorized_person_email ||
            !gender ||
            !company_name ||
            !bank_name ||
            !swift_code ||
            !iban ||
            !correspondent_account ||
            !voen
        ) {
            return res.status(400).json({ error: "Lazımi sahələr doldurulmayıb." });
        }

        // Helper function to process array fields (handle duplicate form field names)
        const processArrayField = (field) => {
            if (Array.isArray(field)) {
                // Return first non-empty value from array
                return field.find(value => value && value.toString().trim() !== '') || '';
            }
            return field || '';
        };
        console.log('coordinates', coordinates.split(", ").map(coord => {
            coord.trim();
            return parseFloat(coord);
        }));

        // Process fields that might come as arrays due to duplicate form field names
        const processedSwiftCode = processArrayField(swift_code);
        const processedTuesdayEnabled = processArrayField(tuesday_enabled);
        const processedWednesdayEnabled = processArrayField(wednesday_enabled);
        const processedThursdayEnabled = processArrayField(thursday_enabled);
        const processedFridayEnabled = processArrayField(friday_enabled);

        console.log('checking data: ', {
            activity_type,
            muessise_category,
            authorized_person_name,
            authorized_person_email,
            social_media: social_media,
            social_media_type: typeof social_media,
            social_media_is_array: Array.isArray(social_media)
        });



        // Process social media data for Map type
        const processSocialMediaData = (socialData) => {
            console.log('Processing social media data:', socialData);

            if (!socialData) {
                return new Map();
            }

            // If it's already a Map, return it
            if (socialData instanceof Map) {
                return socialData;
            }

            // If it's a plain object, convert to Map
            if (typeof socialData === 'object' && socialData !== null && !Array.isArray(socialData)) {
                const socialMap = new Map();
                Object.entries(socialData).forEach(([platform, url]) => {
                    if (url && url.trim() !== '') {
                        socialMap.set(platform, url.trim());
                    }
                });
                return socialMap;
            }

            // If it's an array of objects with platform/url structure
            if (Array.isArray(socialData)) {
                const socialMap = new Map();
                socialData.forEach(item => {
                    if (item && typeof item === 'object' && item.platform && item.url) {
                        if (item.url.trim() !== '') {
                            socialMap.set(item.platform, item.url.trim());
                        }
                    }
                });
                return socialMap;
            }

            // If it's a string (JSON), try to parse it
            if (typeof socialData === 'string') {
                try {
                    const parsed = JSON.parse(socialData);
                    return processSocialMediaData(parsed);
                } catch (e) {
                    console.log('Failed to parse social media JSON:', e);
                    return new Map();
                }
            }

            // Default to empty Map
            return new Map();
        };
        // Check if mongoose is connected
        if (mongoose.connection.readyState !== 1) {
            console.error('❌ MongoDB not connected. State:', mongoose.connection.readyState);
            console.log('🔄 Attempting to reconnect...');

            try {
                // Try to reconnect
                await mongoose.connection.asPromise();
                console.log('✅ Reconnection successful. New state:', mongoose.connection.readyState);
            } catch (reconnectError) {
                console.error('❌ Reconnection failed:', reconnectError);
                return res.status(500).json({ error: "Verilənlər bazası əlaqəsi yoxdur" });
            }
        }

        // Create muessise without transaction first
        const newMuessise = new Muessise({
            activity_type: activity_type || muessise_category,
            commission_percentage,
            authorized_person: {
                name: authorized_person_name,
                gender,
                phone_suffix: authorized_person_phone_prefix,
                phone: authorized_person_phone ? parseInt(authorized_person_phone) : null,
                email: authorized_person_email,
            },
            muessise_name,
            muessise_category,
            address,
            locationPoint: {
                type: "Point",
                coordinates: coordinates.split(", ").map(coord => {
                    coord.trim();
                    return parseFloat(coord);
                })
            },
            services: services || [],
            description,
            cards: cards || [],
            schedule: {
                monday: {
                    enabled: monday_enabled === 'on',
                    open: monday_start,
                    close: monday_end
                },
                tuesday: {
                    enabled: processedTuesdayEnabled === 'on',
                    open: tuesday_start,
                    close: tuesday_end
                },
                wednesday: {
                    enabled: processedWednesdayEnabled === 'on',
                    open: wednesday_start,
                    close: wednesday_end
                },
                thursday: {
                    enabled: processedThursdayEnabled === 'on',
                    open: thursday_start,
                    close: thursday_end
                },
                friday: {
                    enabled: processedFridayEnabled === 'on',
                    open: friday_start,
                    close: friday_end
                },
                saturday: {
                    enabled: saturday_enabled === 'on',
                    open: saturday_start,
                    close: saturday_end
                },
                sunday: {
                    enabled: sunday_enabled === 'on',
                    open: sunday_start,
                    close: sunday_end
                }
            },
            phone: contact_phone ? [{ number: contact_phone, prefix: phonePrefix }] : [],
            email: contact_email ? [contact_email] : [],
            website: contact_website ? [contact_website] : [],
            social: processSocialMediaData(social_media),
            // Handle file uploads safely
            // ...(req.files?.xarici_cover_image && req.files.xarici_cover_image[0] ? {
            //     xarici_cover_image: req.files.xarici_cover_image[0].filename,
            //     xarici_cover_image_path: req.files.xarici_cover_image[0].path
            // } : {}),
            // ...(req.files?.daxili_cover_image && req.files.daxili_cover_image[0] ? {
            //     daxili_cover_image: req.files.daxili_cover_image[0].filename,
            //     daxili_cover_image_path: req.files.daxili_cover_image[0].path
            // } : {}),
            // ...(req.files?.profile_image && req.files.profile_image[0] ? {
            //     profile_image: req.files.profile_image[0].filename,
            //     profile_image_path: req.files.profile_image[0].path
            // } : {}),
            location_point,
            creator_id: req.user.id,
        });

        console.log('💾 Saving muessise to database...');
        await newMuessise.save();
        console.log('✅ Muessise saved successfully:', newMuessise.muessise_id);

        // Handle file uploads - move from temp to proper location
        let finalCoverImage;
        let finalProfileImage;

        if (req.files) {
            console.log('📁 Processing uploaded files...');
            const muessiseId = newMuessise.muessise_id;
            const finalDir = `public/images/${muessiseId}/info`;

            // Create final directory
            fs.mkdirSync(finalDir, { recursive: true });

            // Process cover image
            if (req.files.cover_sekil && req.files.cover_sekil[0]) {
                const coverFile = req.files.cover_sekil[0];
                const newCoverName = `${muessiseId}-cover-${Date.now()}${path.extname(coverFile.originalname)}`;
                const finalCoverPath = path.join(finalDir, newCoverName);

                // Move file from temp to final location
                fs.renameSync(coverFile.path, finalCoverPath);
                finalCoverImage = `/images/${muessiseId}/info/${newCoverName}`;
                console.log('✅ Cover image processed:', finalCoverImage);
            }

            // Process profile image
            if (req.files.profile_sekil && req.files.profile_sekil[0]) {
                const profileFile = req.files.profile_sekil[0];
                const newProfileName = `${muessiseId}-profile-${Date.now()}${path.extname(profileFile.originalname)}`;
                const finalProfilePath = path.join(finalDir, newProfileName);

                // Move file from temp to final location
                fs.renameSync(profileFile.path, finalProfilePath);
                finalProfileImage = `/images/${muessiseId}/info/${newProfileName}`;
                console.log('✅ Profile image processed:', finalProfileImage);
            }

            // Update muessise with final image paths
            // if (finalCoverImage !== xarici_cover_image || finalProfileImage !== profile_image) {
            //     newMuessise.xarici_cover_image = finalCoverImage;
            //     newMuessise.profile_image = finalProfileImage;
            //     await newMuessise.save();
            //     console.log('✅ Muessise updated with image paths');
            // }
        }

        // Create rekvizitler (requisites) if provided
        let rekvizitlerRecord = null;

        // Helper function to check if field has value (handles arrays)
        const hasValue = (field) => {
            if (Array.isArray(field)) {
                return field.some(value => value && value.trim() !== '');
            }
            return field && field.trim() !== '';
        };

        if (hasValue(company_name) || hasValue(bank_name) || hasValue(swift_code) || hasValue(iban) || hasValue(correspondent_account) || hasValue(voen)) {
            console.log('🏦 Creating rekvizitler record...');

            // Handle array data from form fields (multiple inputs with same name)
            const processArrayField = (field) => {
                if (Array.isArray(field)) {
                    // Return first non-empty value from array
                    return field.find(value => value && value.trim() !== '') || '';
                }
                return field || '';
            };

            rekvizitlerRecord = new Rekvizitler({
                muessise_id: newMuessise.muessise_id,
                muessise_name: processArrayField(company_name) || muessise_name,
                bank_info: {
                    bank_name: processArrayField(bank_name),
                    swift: processedSwiftCode,
                    settlement_account: processArrayField(iban),
                    muxbir_hesabi: processArrayField(correspondent_account)
                },
                huquqi_unvan: huquqiaddress,
                adder_id: req.user.id,
                fromModel: 'AdminUser',
                voen: processArrayField(voen)
            });

            await rekvizitlerRecord.save();
            console.log('✅ Rekvizitler saved successfully:', rekvizitlerRecord._id);

            // Link rekvizitler to muessise
            newMuessise.rekvizitler = rekvizitlerRecord._id;
            await newMuessise.save();
        }

        // Generate password for authorized person
        console.log('🔐 Generating password for authorized person...');
        const generatedPassword = generateRandomPassword();
        const hashedPassword = await argon2.hash(generatedPassword);

        // Create PartnerUser for authorized person
        console.log('👤 Creating partner user...');
        const partnerUser = new PartnerUser({
            name: authorized_person_name.split(' ')[0] || authorized_person_name,
            surname: authorized_person_name.split(' ').slice(1).join(' ') || '',
            muessise_id: newMuessise._id,
            email: authorized_person_email,
            phone_suffix: authorized_person_phone_prefix ? parseInt(authorized_person_phone_prefix) : null,
            phone: authorized_person_phone,
            password: hashedPassword,
            status: 1 // Active
        });

        await partnerUser.save();
        console.log('✅ Partner user created successfully:', partnerUser.partnyor_id);

        // Create the 3 required permission groups
        console.log('🔑 Creating RBAC permission groups...');
        const permissionPages = [
            'dashboard', 'accounting', 'avankart_partner', 'company_information',
            'profile', 'edit_users', 'role_groups', 'requisites', 'contracts'
        ];

        // System Administrator - read only
        const sistemInzibatcisi = new RbacPermission({
            name: "Sistem inzibatçısı",
            muessise_id: newMuessise._id,
            creator: partnerUser._id,
            default: false
        });

        permissionPages.forEach(page => {
            sistemInzibatcisi[page] = "read";
        });
        sistemInzibatcisi.users = [partnerUser._id];
        await sistemInzibatcisi.save();
        console.log('✅ System Administrator permissions created');

        // Super Admin - read only
        const superAdmin = new RbacPermission({
            name: "Super admin",
            muessise_id: newMuessise._id,
            creator: partnerUser._id,
            default: false
        });

        permissionPages.forEach(page => {
            superAdmin[page] = "read";
        });
        superAdmin.users = [partnerUser._id];
        await superAdmin.save();
        console.log('✅ Super Admin permissions created');

        // Admin - full access
        const admin = new RbacPermission({
            name: "Admin",
            muessise_id: newMuessise._id,
            creator: partnerUser._id,
            default: true
        });

        permissionPages.forEach(page => {
            admin[page] = "full";
        });
        admin.users = [partnerUser._id];
        await admin.save();
        console.log('✅ Admin permissions created');

        // Set the partner user's permission to Admin
        partnerUser.perm = admin._id;
        await partnerUser.save();
        console.log('✅ Partner user assigned Admin permissions');

        // Send email with credentials
        console.log('📧 Preparing to send credentials email...');
        const emailSubject = 'Avankart - Yeni hesab məlumatları';
        const emailBody = `Salam ${authorized_person_name},

        Sizin üçün yeni müəssisə hesabı yaradılmışdır.

        Giriş məlumatları:
        Email: ${authorized_person_email}
        Şifrə: ${generatedPassword}

        Zəhmət olmasa ilk girişdən sonra şifrənizi dəyişdirin.

        Hörmətlə,
        Avankart komandası`;

        // Send email (in development, just log it)
        const isDevelopment = process.env.NODE_ENV === "development";
        if (isDevelopment) {
            console.log("=== EMAIL WOULD BE SENT ===");
            console.log(`To: ${authorized_person_email}`);
            console.log(`Subject: ${emailSubject}`);
            console.log(`Body: ${emailBody}`);
            console.log("=== END EMAIL ===");
        } else {
            // For production, we'll create a custom email sender since sendMail is for OTP
        }

        // Return comprehensive response
        return res.status(201).json({
            message: "Müəssisə uğurla yaradıldı",
            muessise: {
                id: newMuessise._id,
                muessise_id: newMuessise.muessise_id,
                name: newMuessise.muessise_name,
                cover_image: finalCoverImage,
                profile_image: finalProfileImage
            },
            partnerUser: {
                id: partnerUser._id,
                email: partnerUser.email,
                partnyor_id: partnerUser.partnyor_id
            },
            rekvizitler: rekvizitlerRecord ? {
                id: rekvizitlerRecord._id,
                muessise_id: rekvizitlerRecord.muessise_id,
                voen: rekvizitlerRecord.voen
            } : null,
            permissions: {
                sistemInzibatcisi: sistemInzibatcisi._id,
                superAdmin: superAdmin._id,
                admin: admin._id
            },
            credentials: {
                email: authorized_person_email,
                password: generatedPassword // Only in development
            }
        });

    } catch (err) {
        console.error('❌ Controller error:', err);
        console.error('Error details:', {
            name: err.name,
            message: err.message,
            stack: err.stack
        });
        res.status(500).json({
            error: "Server xətası",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

export const askForDeleteMuessise = async (req, res) => {
    try {
        const {
            muessise_id,
            sebeb
        } = req.body;
        const otp = Math.floor(100000 + Math.random() * 900000);
        // Əvvəlki (başqasının) tapşırığına uyğun sadə silinmə istəyi məntiqi
        // Müəssisəni tap (try by _id first, fallback by field muessise_id if exists)

        let muessise = await Muessise.findOne({ muessise_id: muessise_id });
        if (!muessise) {
            muessise = await Muessise.findOne({ muessise_id: muessise_id });
        }
        if (!muessise) {
            return res.status(404).json({ message: "Müəssisə tapılmadı" });
        }

        const newSilinme = await MuessiseSilinme.create({
            admin_id: req?.user?.id,
            muessise_id: muessise._id,
            sebeb,
            otp
        });


        await newSilinme.save();
        muessise.company_status = 3;
        await muessise.save();
        console.log(muessise, "silinme id ye gore ", muessise.company_status);
        return res.status(201).json({
            message: "Silinmə istəyi yaradıldı",
            data: {
                id: newSilinme._id,
                muessise_id: muessise.muessise_id,
                sebeb,
                otp
            },
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    };
};


export const AskForDeaktiveOrAktiveMuessise = async (req, res) => {
    try {
        const {
            muessise_id,
            aktivStatus,
            deaktivStatus

        } = req.body;
        const muessise = await Muessise.findOne({ muessise_id: muessise_id });

        if (aktivStatus) muessise.company_status = 0;
        if (deaktivStatus) muessise.company_status = 1;
        await muessise.save();

        return res.status(200).json({
            message: "Müəssisə deaktiv edildi",
            success: true,
            data: muessise,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

export const getDaxiliPage = async (req, res) => {
    try {
        const { muessise_id } = req.params;
        

        const muessise = await Muessise.findOne({ muessise_id })
            .populate("creator_id", "name surname")
            .populate("cards", "name icon background_color");
        if (!muessise) {
            return res.status(404).render("pages/muessiseler/inside", {
                error: "Müəssisə tapılmadı",
                csrfToken: req.csrfToken(),
                transactions: [],
                cards: [],
                newMuessise: {},
                totalTransactionsCount: 0
            });
        }
        const transactionsCount = await TransactionsUser.countDocuments({to: muessise._id})

        const rekvizitler = await Rekvizitler.find({ muessise_id });

        const recordsTotal = await Rekvizitler.countDocuments({ muessise_id });
        // Related hesablasma
        const hesablasmaData = await Hesablasma.find({ muessise_id: muessise._id })
            .populate("muessise_id", "muessise_id");

        const hesablasmIds = hesablasmaData.map(h => h._id);

        // Transactions
        const transactions = await TransactionsUser.find({ hesablasma_id: { $in: hesablasmIds } })
            .populate("to", "muessise_id muessise_name")
            .populate("cards", "name background_color icon");

        const totalTransactionsCount = await TransactionsUser.countDocuments({
            hesablasma_id: { $in: hesablasmIds }
        });

        // Cards (all system cards)
        const cards = await Cards.find();
        // Build newMuessise object
        const newMuessise = { ...muessise.toObject() };
        switch (muessise.company_status) {
            case 0:
                newMuessise.status = "Aktiv";
                break;
            case 1:
                newMuessise.status = "Deaktiv";
                break;
            case 2:
                newMuessise.status = "Silinmiş";
                break;
            case 4:
                newMuessise.status = "Silinmə";
                break;
            default:
                newMuessise.status = "Naməlum";
        }

        const newCreatedAt = new Date(muessise.createdAt);
        const newUpdatedAt = new Date(muessise.updatedAt);

        newMuessise.creatorName = muessise.creator_id
            ? `${muessise.creator_id.name || ""} ${muessise.creator_id.surname || ""}`
            : "";

        newMuessise.createdAt = `${newCreatedAt.toLocaleDateString("az-AZ", {
            timeZone: "Asia/Baku"
        })} - ${newCreatedAt.toLocaleTimeString("az-AZ", {
            timeZone: "Asia/Baku",
            hour: "2-digit",
            minute: "2-digit"
        })}`;

        newMuessise.updatedAt = newUpdatedAt.toLocaleDateString("az-AZ", {
            timeZone: "Asia/Baku"
        });

        newMuessise._id = muessise._id;
        newMuessise.profileImg = muessise.profile_image;
        newMuessise.muessise_name = muessise.muessise_name;
        newMuessise.muessise_id = muessise.muessise_id;
        newMuessise.description = muessise.description;
        newMuessise.activity_type = muessise.activity_type;
        newMuessise.muessise_category = muessise.muessise_category;
        newMuessise.commission_percentage = muessise.commission_percentage;
        newMuessise.address = muessise.address;
        newMuessise.phone = muessise.phone
            ? Array.isArray(muessise.phone)
                ? muessise.phone
                : [muessise.phone]
            : [];
        newMuessise.email = muessise.email
            ? Array.isArray(muessise.email)
                ? muessise.email
                : [muessise.email]
            : [];
        newMuessise.cards = muessise.cards;
        newMuessise.schedule = muessise.schedule;
        newMuessise.services = muessise.services;
        newMuessise.social = muessise.social ? Array.from(muessise.social.entries()) : [];
        newMuessise.website = muessise.website;
        return res.render("pages/muessiseler/inside", {
            error: "",
            csrfToken: req.csrfToken(),
            transactions,
            cards,
            newMuessise,
            totalTransactionsCount,
            recordsTotal: recordsTotal ? recordsTotal : 0,
            rekvizitler,
            transactionsCount: transactionsCount ?? 0 
        });

    } catch (error) {
        console.error(error);
        return res.status(500).render("pages/muessiseler/inside", {
            error: "Daxili server xətası",
            csrfToken: req.csrfToken(),
            transactions: [],
            cards: [],
            newMuessise: {},
            totalTransactionsCount: 0
        });
    }
};


export const updateMuessise = async (req, res) => {
    try {
        console.log('🔄 Starting muessise update process...');
        console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
        console.log('📋 Social media data:', req.body.social_media);

        const {
            muessise_id,
            activity_type,
            commission_percentage,
            muessise_name,
            muessise_category,
            coordinates,
            address,
            huquqicoordinates,
            huquqiaddress,
            services,
            description,
            cards,
            phonePrefix,
            authorized_person_name,
            authorized_person_phone,
            authorized_person_phone_prefix,
            authorized_person_email,
            gender,
            company_name,
            bank_name,
            swift_code,
            iban,
            correspondent_account,
            voen,
            contact_phone,
            contact_email,
            contact_website,
            social_media,
            xarici_cover_image,
            profile_image,
            monday_enabled,
            monday_start,
            monday_end,
            tuesday_enabled,
            tuesday_start,
            tuesday_end,
            wednesday_enabled,
            wednesday_start,
            wednesday_end,
            thursday_enabled,
            thursday_start,
            thursday_end,
            friday_enabled,
            friday_start,
            friday_end,
            saturday_enabled,
            saturday_start,
            saturday_end,
            sunday_enabled,
            sunday_start,
            sunday_end,
        } = req.body;

        console.log("Social medias: ", social_media);


        console.log('📝 Update data received:', {
            muessise_id,
            muessise_name,
            activity_type,
            cards: cards || [],
            social_media: social_media
        });

        // Check if muessise exists
        const existingMuessise = await Muessise.findOne({
            $or: [
                { muessise_id: muessise_id },
                { _id: muessise_id }
            ]
        });

        if (!existingMuessise) {
            return res.status(404).json({ error: "Müəssisə tapılmadı." });
        }

        console.log('✅ Found existing muessise:', existingMuessise.muessise_id);

        // Validation - only check required fields for updates
        if (!muessise_name || !description) {
            return res.status(400).json({ error: "Vacib sahələr doldurulmalıdır." });
        }

        // Helper function to process array fields (handle duplicate form field names)
        const processArrayField = (field) => {
            if (Array.isArray(field)) {
                return field.find(value => value && value.toString().trim() !== '') || '';
            }
            return field || '';
        };

        // Process fields that might come as arrays due to duplicate form field names
        const processedSwiftCode = processArrayField(swift_code);
        const processedTuesdayEnabled = processArrayField(tuesday_enabled);
        const processedWednesdayEnabled = processArrayField(wednesday_enabled);
        const processedThursdayEnabled = processArrayField(thursday_enabled);
        const processedFridayEnabled = processArrayField(friday_enabled);

        // Process social media data for Map type
        const processSocialMediaData = (socialData) => {
            console.log('Processing social media data:', socialData);

            if (!socialData) {
                return new Map();
            }

            if (socialData instanceof Map) {
                return socialData;
            }

            if (typeof socialData === 'object' && socialData !== null && !Array.isArray(socialData)) {
                const socialMap = new Map();
                Object.entries(socialData).forEach(([platform, url]) => {
                    if (url && url.trim() !== '') {
                        socialMap.set(platform, url.trim());
                    }
                });
                return socialMap;
            }

            if (Array.isArray(socialData)) {
                const socialMap = new Map();
                socialData.forEach(item => {
                    if (item && typeof item === 'object' && item.platform && item.url) {
                        if (item.url.trim() !== '') {
                            socialMap.set(item.platform, item.url.trim());
                        }
                    }
                });
                return socialMap;
            }

            if (typeof socialData === 'string') {
                try {
                    const parsed = JSON.parse(socialData);
                    return processSocialMediaData(parsed);
                } catch (e) {
                    console.log('Failed to parse social media JSON:', e);
                    return new Map();
                }
            }

            return new Map();
        };

        console.log('🔄 Updating muessise fields...');

        // Update muessise fields
        const updateData = {
            activity_type: activity_type || muessise_category || existingMuessise.activity_type,
            commission_percentage: commission_percentage || existingMuessise.commission_percentage,
            muessise_name,
            muessise_category: muessise_category || existingMuessise.muessise_category,
            description,
            services: services || existingMuessise.services,
            cards: cards || existingMuessise.cards,
            updatedAt: new Date()
        };

        // Update address and coordinates if provided
        if (address) {
            updateData.address = address;
        }

        if (coordinates) {
            updateData.locationPoint = {
                type: "Point",
                coordinates: coordinates.split(", ").map(coord => {
                    coord.trim();
                    return parseFloat(coord);
                })
            };
        }

        // Update schedule if provided
        if (monday_enabled !== undefined) {
            updateData.schedule = {
                monday: {
                    enabled: monday_enabled === 'on',
                    open: monday_start || existingMuessise.schedule?.monday?.start,
                    close: monday_end || existingMuessise.schedule?.monday?.end
                },
                tuesday: {
                    enabled: processedTuesdayEnabled === 'on',
                    open: tuesday_start || existingMuessise.schedule?.tuesday?.start,
                    close: tuesday_end || existingMuessise.schedule?.tuesday?.end
                },
                wednesday: {
                    enabled: processedWednesdayEnabled === 'on',
                    open: wednesday_start || existingMuessise.schedule?.wednesday?.start,
                    close: wednesday_end || existingMuessise.schedule?.wednesday?.end
                },
                thursday: {
                    enabled: processedThursdayEnabled === 'on',
                    open: thursday_start || existingMuessise.schedule?.thursday?.start,
                    close: thursday_end || existingMuessise.schedule?.thursday?.end
                },
                friday: {
                    enabled: processedFridayEnabled === 'on',
                    open: friday_start || existingMuessise.schedule?.friday?.start,
                    close: friday_end || existingMuessise.schedule?.friday?.end
                },
                saturday: {
                    enabled: saturday_enabled === 'on',
                    open: saturday_start || existingMuessise.schedule?.saturday?.start,
                    close: saturday_end || existingMuessise.schedule?.saturday?.end
                },
                sunday: {
                    enabled: sunday_enabled === 'on',
                    open: sunday_start || existingMuessise.schedule?.sunday?.start,
                    close: sunday_end || existingMuessise.schedule?.sunday?.end
                }
            };
        }

        // Update contact information if provided
        if (contact_phone) {
            updateData.phone = [{ number: contact_phone, prefix: phonePrefix }];
        }
        if (contact_email) {
            updateData.email = [contact_email];
        }
        if (contact_website) {
            updateData.website = [contact_website];
        }

        // Update social media - handle both addition and deletion
        if (social_media !== undefined) {
            console.log('New social media data:', social_media);
            console.log('Existing social media data:', existingMuessise.social);

            if (social_media === null || social_media === '' || Object.keys(social_media || {}).length === 0) {
                // User deleted all social media links
                console.log('Clearing all social media data');
                updateData.social = new Map();
            } else {
                // Get existing social media as Map
                const existingSocial = existingMuessise.social || new Map();

                // Process new social media data
                const newSocialMap = processSocialMediaData(social_media);

                // Replace existing social media data entirely (don't merge)
                console.log('Replacing social media data with:', newSocialMap);
                updateData.social = newSocialMap;
            }
        }

        // Update authorized person if provided
        if (authorized_person_name || authorized_person_email || authorized_person_phone) {
            updateData.authorized_person = {
                name: authorized_person_name || existingMuessise.authorized_person?.name,
                gender: gender || existingMuessise.authorized_person?.gender,
                phone_suffix: authorized_person_phone_prefix || existingMuessise.authorized_person?.phone_suffix,
                phone: authorized_person_phone ? parseInt(authorized_person_phone) : existingMuessise.authorized_person?.phone,
                email: authorized_person_email || existingMuessise.authorized_person?.email,
            };
        }

        // Handle file uploads - move from temp to proper location
        let finalCoverImage = existingMuessise.xarici_cover_image;
        let finalProfileImage = existingMuessise.profile_image;

        if (req.files) {
            console.log('📁 Processing uploaded files...');
            const muessiseIdForFiles = existingMuessise.muessise_id;
            const finalDir = `public/images/${muessiseIdForFiles}/info`;

            // Create final directory
            fs.mkdirSync(finalDir, { recursive: true });

            // Process cover image
            if (req.files.cover_sekil && req.files.cover_sekil[0]) {
                const coverFile = req.files.cover_sekil[0];
                const newCoverName = `${muessiseIdForFiles}-cover-${Date.now()}${path.extname(coverFile.originalname)}`;
                const finalCoverPath = path.join(finalDir, newCoverName);

                // Delete old cover image if exists
                if (existingMuessise.xarici_cover_image) {
                    const oldCoverPath = `public${existingMuessise.xarici_cover_image}`;
                    if (fs.existsSync(oldCoverPath)) {
                        fs.unlinkSync(oldCoverPath);
                        console.log('🗑️ Deleted old cover image');
                    }
                }

                // Move file from temp to final location
                fs.renameSync(coverFile.path, finalCoverPath);
                finalCoverImage = `/images/${muessiseIdForFiles}/info/${newCoverName}`;
                console.log('✅ Cover image processed:', finalCoverImage);
            }

            // Process profile image
            if (req.files.profile_sekil && req.files.profile_sekil[0]) {
                const profileFile = req.files.profile_sekil[0];
                const newProfileName = `${muessiseIdForFiles}-profile-${Date.now()}${path.extname(profileFile.originalname)}`;
                const finalProfilePath = path.join(finalDir, newProfileName);

                // Delete old profile image if exists
                if (existingMuessise.profile_image) {
                    const oldProfilePath = `public${existingMuessise.profile_image}`;
                    if (fs.existsSync(oldProfilePath)) {
                        fs.unlinkSync(oldProfilePath);
                        console.log('🗑️ Deleted old profile image');
                    }
                }

                // Move file from temp to final location
                fs.renameSync(profileFile.path, finalProfilePath);
                finalProfileImage = `/images/${muessiseIdForFiles}/info/${newProfileName}`;
                console.log('✅ Profile image processed:', finalProfileImage);
            }
        }

        // Update image paths
        if (finalCoverImage !== existingMuessise.xarici_cover_image) {
            updateData.xarici_cover_image = finalCoverImage;
        }
        if (finalProfileImage !== existingMuessise.profile_image) {
            updateData.profile_image = finalProfileImage;
        }

        console.log('💾 Saving muessise updates to database...');

        // Update the muessise record
        const updatedMuessise = await Muessise.findOneAndUpdate(
            { muessise_id: existingMuessise.muessise_id },
            updateData,
            { new: true, runValidators: true }
        );

        console.log('✅ Muessise updated successfully:', updatedMuessise.muessise_id);

        // Update rekvizitler if provided and exists
        if (existingMuessise.rekvizitler) {
            const hasValue = (field) => {
                if (Array.isArray(field)) {
                    return field.some(value => value && value.trim() !== '');
                }
                return field && field.trim() !== '';
            };

            if (hasValue(company_name) || hasValue(bank_name) || hasValue(swift_code) || hasValue(iban) || hasValue(correspondent_account) || hasValue(voen)) {
                console.log('🏦 Updating rekvizitler record...');

                const rekvizitlerUpdateData = {};

                if (hasValue(company_name)) {
                    rekvizitlerUpdateData.muessise_name = processArrayField(company_name);
                }

                if (hasValue(bank_name) || hasValue(swift_code) || hasValue(iban) || hasValue(correspondent_account)) {
                    rekvizitlerUpdateData.bank_info = {};
                    if (hasValue(bank_name)) rekvizitlerUpdateData.bank_info.bank_name = processArrayField(bank_name);
                    if (hasValue(swift_code)) rekvizitlerUpdateData.bank_info.swift = processedSwiftCode;
                    if (hasValue(iban)) rekvizitlerUpdateData.bank_info.settlement_account = processArrayField(iban);
                    if (hasValue(correspondent_account)) rekvizitlerUpdateData.bank_info.muxbir_hesabi = processArrayField(correspondent_account);
                }

                if (huquqiaddress) {
                    rekvizitlerUpdateData.huquqi_unvan = huquqiaddress;
                }

                if (hasValue(voen)) {
                    rekvizitlerUpdateData.voen = processArrayField(voen);
                }

                if (Object.keys(rekvizitlerUpdateData).length > 0) {
                    await Rekvizitler.findByIdAndUpdate(
                        existingMuessise.rekvizitler,
                        rekvizitlerUpdateData,
                        { new: true, runValidators: true }
                    );
                    console.log('✅ Rekvizitler updated successfully');
                }
            }
        }

        // Update authorized person in PartnerUser if email or phone changed
        if (authorized_person_email || authorized_person_phone || authorized_person_name) {
            console.log('👤 Updating partner user...');

            const partnerUpdateData = {};
            if (authorized_person_name) {
                const nameParts = authorized_person_name.split(' ');
                partnerUpdateData.name = nameParts[0] || authorized_person_name;
                partnerUpdateData.surname = nameParts.slice(1).join(' ') || '';
            }
            if (authorized_person_email) partnerUpdateData.email = authorized_person_email;
            if (authorized_person_phone) partnerUpdateData.phone = authorized_person_phone;
            if (authorized_person_phone_prefix) partnerUpdateData.phone_suffix = parseInt(authorized_person_phone_prefix);

            if (Object.keys(partnerUpdateData).length > 0) {
                await PartnerUser.findOneAndUpdate(
                    { muessise_id: existingMuessise._id },
                    partnerUpdateData,
                    { new: true }
                );
                console.log('✅ Partner user updated successfully');
            }
        }

        // Return success response with updated muessise data
        return res.status(200).json({
            success: true,
            message: "Müəssisə uğurla yeniləndi",
            muessise: {
                id: updatedMuessise._id,
                muessise_id: updatedMuessise.muessise_id,
                name: updatedMuessise.muessise_name,
                cover_image: finalCoverImage,
                profile_image: finalProfileImage
            },
            // Return the full updated muessise data for sessionStorage update
            updatedData: {
                muessise_name: updatedMuessise.muessise_name,
                sirket_name: updatedMuessise.sirket_name,
                description: updatedMuessise.description,
                address: updatedMuessise.address,
                activity_type: updatedMuessise.activity_type,
                muessise_category: updatedMuessise.muessise_category,
                commission_percentage: updatedMuessise.commission_percentage,
                services: updatedMuessise.services,
                cards: updatedMuessise.cards,
                phone: updatedMuessise.phone,
                email: updatedMuessise.email,
                website: updatedMuessise.website,
                social: updatedMuessise.social ? Array.from(updatedMuessise.social.entries()) : [],
                schedule: updatedMuessise.schedule,
                authorized_person: updatedMuessise.authorized_person,
                profile_image_path: finalProfileImage,
                xarici_cover_image_path: finalCoverImage
            }
        });

    } catch (err) {
        console.error('❌ Update controller error:', err);
        console.error('Error details:', {
            name: err.name,
            message: err.message,
            stack: err.stack
        });
        res.status(500).json({
            error: "Server xətası",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

export const postDaxiliPage = async (req, res) => {
    try {
        const {
            start_date,
            end_date
        } = req.body;


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const createRekvizit = async (req, res) => {
    try {
        const {
            bank_name,
            swift,
            hesablasma,
            huquqi_unvan,
            bank_kodu,
            muxbir_hesabi,
            voen,
            muessise_id,
            sirket_name,
            rekvizit_id
        } = req.body;
        const muessise = await Muessise.findOne({ muessise_id: muessise_id }).select("muessise_name");
        if (!muessise) return res.status(401).json({
            message: "Muessise tapilmadi",
            success: false
        });

        let newRekvizit = [];
        if (rekvizit_id) {
            const updateData = {
                sirket_name,
                huquqi_unvan,
                bank_info: {
                    bank_name,
                    swift,
                    settlement_account: hesablasma,
                    bank_code: bank_kodu,
                    muxbir_hesabi
                }
            };

            await Rekvizitler.findByIdAndUpdate(
                rekvizit_id,
                updateData,
                { new: true }
            );
        }
        else if (!rekvizit_id) {
            const exists = await Rekvizitler.findOne({ voen });
            if (exists) {
                return res.status(400).json({ message: "Bu VÖEN artıq mövcuddur" });
            }

            newRekvizit = new Rekvizitler({
                muessise_id,
                muessise_name: muessise.muessise_name,
                sirket_name,
                bank_info: {
                    bank_name,
                    swift,
                    settlement_account: hesablasma,
                    bank_code: bank_kodu,
                    muxbir_hesabi,
                },
                huquqi_unvan,
                voen,
                adder_id: req.user?._id,
                fromModel: req.user?.role === "admin" ? "AdminUser" : "Muessise"
            });

            await newRekvizit.save();
            console.log(newRekvizit, "yeni rekvizit");
        }

        return res.json({
            error: "",
            csrfToken: req.csrfToken(),
            newRekvizit,
            redirect: `/muessiseler/${muessise_id}`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Xəta baş verdi" });
    }
};

export const editRekvizit = async (req, res) => {
    try {
        const rekId = req.params.id;
        const rekvizit = await Rekvizitler.findById(rekId);

        return res.status(200).json({
            message: "rekvizitler gonderildi",
            data: rekvizit
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
};


export const deleteRekvizit = async (req, res) => {
    try {
        const { id } = req.params;

        const rekvizitler = await Rekvizitler.findByIdAndDelete(id);
        return res.json({
            message: "Rekvizit uğurla silindi",
            success: true,
            csrfToken: req.csrfToken(),
            redirect: `/muessiseler/${rekvizitler.muessise_id}`,
            deletedId: id
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const uploadMuqavileler = async (req, res) => {
    try {
        if (!req.processedFiles || req.processedFiles.length === 0) {
            return res.status(400).jspn({
                success: false,
                message: "Fayl seçilməyib"
            });
        };
        const {
            muessise_id
        } = req.body;
        const added_user = req.user?.id;

        //    console.log(sirket_id,'sirket id -ye baxiriq')
        const muessise = await Muessise.findOne({ muessise_id });
        if (!muessise) throw new Error("Müəssisə tapılmadı!");
        const recordsTotal = await MuqavilelerModel.countDocuments();

        const recordsFiltered = await MuqavilelerModel.countDocuments();
        const data = await Promise.all(
            req.processedFiles.map(async (file) => {
                const newMuqavile = new MuqavilelerModel({
                    fileName: file.filename,
                    filePath: file.route,
                    muessise_id: muessise._id,
                    //   sirket_id,
                    added_user,
                });

                return await newMuqavile.save();
            })
        );

        return res.json({
            recordsTotal,
            recordsFiltered,
            data,
            redirect: `/muessiseler/${muessise_id}`
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};



export const getContracts = async (req, res) => {

    try {
        const { muessise_id, start_date, end_date } = req.body;

        const muessiseDoc = await Muessise.findOne({ muessise_id });
        if (!muessiseDoc) {
            return res.status(404).json({ message: "Muessise tapılmadı" });
        }
        const muessiseObjectId = muessiseDoc._id;
        let dateFilter = {};
        if (start_date || end_date) {
            dateFilter = {
                createdAt: {
                    $gte: new Date(start_date),
                    $lte: new Date(end_date + "T23:59:59.999Z")
                }
            };
        };
        const muqavileler = await MuqavilelerModel.find({ muessise_id: muessiseObjectId, ...dateFilter });
        const recordsTotal = await MuqavilelerModel.countDocuments({muessise_id: muessiseObjectId})
        const recordsFiltered = await MuqavilelerModel.countDocuments({ muessise_id: muessiseObjectId, ...dateFilter });
        const newMuqavileList = [];

        muqavileler.forEach(item => {
            const [baseName, extension] = item.fileName.split(".");
            const parts = baseName.split("-");
            const lastPart = parts.pop();
            const title = "Müqavilə-" + lastPart;
            let createdAt = new Date(item.createdAt);
            const startDate = createdAt.toLocaleDateString("az-AZ", { timeZone: "Asia/Baku" });
            const startTime = createdAt.toLocaleTimeString("az-AZ", { timeZone: "Asia/Baku", hour: "2-digit", minute: "2-digit" });
            newMuqavileList.push({
                muqavile_id: item._id,
                fileName: item.fileName,
                title,
                date: startDate,
                time: startTime,
                iconName: extension,
                muessise_id: muessise_id,
                sirket_id: item.sirket_id,
                file_path: item.filePath
            });
        });
        return res.json({
            data: newMuqavileList,
            recordsTotal,
            recordsFiltered
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const deleteContracts = async (req, res) => {
    try {
        const { muqavile_id } = req.body;
        const muqavile = await MuqavilelerModel.findByIdAndDelete(muqavile_id);
        const muessise = await Muessise.findById(muqavile.muessise_id).select("muessise_id");
        return res.json({
            message: "Muqavile uğurla silindi",
            success: true,
            csrfToken: req.csrfToken(),
            redirect: `/muessiseler/${muessise.muessise_id}`,
            deletedId: muqavile_id
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export  const loadDashboardData = async (req,res) => {
    try {
        const { 
            draw,
            muessise_id 
        } = req.query;
        const muessise = await Muessise.findOne({muessise_id: muessise_id});
        const muessiseId = muessise._id
        const recordsTotalHesablasma = await Hesablasma.countDocuments({muessise_id: muessiseId});
         const recordsTotalTransactions = await TransactionsUser.countDocuments({to: muessise._id});
         const transactionsData = await TransactionsUser.find({to: muessiseId});
         const hesablasma = await Hesablasma.find({muessise_id: muessiseId})
         .select("total totalBalance yekun_mebleg")
         const qrChart = await TransactionsUser.aggregate([
        { $match: { to: muessiseId } },
        { $group: { _id: null, amounts: { $push: "$amount" } } }
        ]);
          const transactions = await TransactionsUser.find({ to: muessiseId })
        .populate("cards", "name _id")
        .lean();

        const allCards = [];
        transactions.forEach((t) => {
        if (!t.cards || !t.cards._id) return;
        const cardId = t.cards._id;
        const cardName = t.cards.name;
        const amount = Number(Number(t.amount).toFixed(2));

        let existing = allCards.find((r) => String(r.cardId) === String(cardId));

        if (!existing) {
            allCards.push({
            cardId,
            cardName,
            amounts: [amount],
            });
        } else {
            existing.amounts[0] = Number((existing.amounts[0] + amount).toFixed(2));
        }
        })
        return res.status(200).json({
            data: [{
                transactionsData: transactionsData,
                hesablasma: hesablasma,
                qrChart: qrChart,
                allCards: allCards
            }],
            recordsTotalTransactions,
            recordsTotalHesablasma,
            draw
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};
export const transactionsChart = async (req,res) => {
    try {
         const {
            draw,
            start= 0, 
            length = 2,
            search = '',
            start_date,
            end_date,
            muessise_id
        } = req.body;

        const muessise = await Muessise.findOne({muessise_id});

        const now = new Date();
        let query = {
            to: muessise._id
        }
        if(search) {
            switch(search) {
                case "all": 
                break;
                case "15":
                query.createdAt = { $gte: new Date(now - 15 * 24 * 60 * 60 * 1000) }
                break;
                case "month":
                query.createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 1)) }
                break;
                case "3-m":
                query.createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 3 )) }
                break;
                case "6-m":
                query.createdAt = { $gte: new Date(now.setMonth(now.getMonth()- 6)) }
                break;
                case "year":
                query.createdAt = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) }
                break;
            }
        }

        if(end_date && start_date) {
                query.createdAt = { 
                $gte: new Date(start_date),
                $lte: new Date(end_date)
                }
        } else if(start_date) {
            query.createdAt = { 
                $gte: new Date(start_date),
                }
        } else if(end_date) {
            query.createdAt = { 
                $lte: new Date(end_date)
                }
        
            }
        const recordsTotal = await TransactionsUser.countDocuments({to: muessise._id});
         const recordsFiltered = await TransactionsUser.countDocuments(query);
         const transactions = await TransactionsUser.find(query)
         .sort({createdAt: -1 })

        return res.status(200).json({
            data: {
                data: transactions,
                recordsTotal,
                recordsFiltered
            },
            recordsTotal,
            recordsFiltered,
            redirect: `muessiseler/${muessise_id}`,
            csrfToken: req.csrfToken()
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        })
    }
};
export const hesablasmaChart = async (req,res) => {
    try {
         const {
            draw,
            start= 0, 
            length = 2,
            search = '',
            start_date,
            end_date,
            muessise_id
        } = req.body;


        const muessise = await Muessise.findOne({muessise_id});

        const now = new Date();
        let query = {
            muessise_id: muessise._id
        }
        if(search) {
            switch(search) {
                case "all": 
                break;
                case "15":
                query.createdAt = { $gte: new Date(now - 15 * 24 * 60 * 60 * 1000) }
                break;
                case "month":
                query.createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 1)) }
                break;
                case "3-m":
                query.createdAt = { $gte: new Date(now.setMonth(now.getMonth() - 3 )) }
                break;
                case "6-m":
                query.createdAt = { $gte: new Date(now.setMonth(now.getMonth()- 6)) }
                break;
                case "year":
                query.createdAt = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) }
                break;
            }
        }

        if(end_date && start_date) {
                query.createdAt = { 
                $gte: new Date(start_date),
                $lte: new Date(end_date)
                }
        } else if(start_date) {
            query.createdAt = { 
                $gte: new Date(start_date),
                }
        } else if(end_date) {
            query.createdAt = { 
                $lte: new Date(end_date)
                }
        }
         const recordsTotal = await Hesablasma.countDocuments();
         const recordsFiltered = await Hesablasma.countDocuments(query);
         const hesablasma = await Hesablasma.find(query)
         .select("total totalBalance yekun_mebleg")
         .skip(start)
         .limit(length)
         .sort({createdAt: -1 });

        return res.status(200).json({
            data: {
                data: hesablasma,
                recordsTotal,
                recordsFiltered
            },
            draw,
            recordsTotal,
            recordsFiltered,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        })
    }
};

export const qrChart = async (req,res) => {
    try {
        const {
            draw,
            start= 0, 
            length = 2,
            date = '',
            muessise_id
        } = req.body;

        const muessise  = await Muessise.findOne({muessise_id: muessise_id});
        let query = { to: muessise._id};
        const startYear = new Date(`${date}-01-01T00:00:00.000Z`);
        const endYear = new Date(`${Number(date) + 1}-01-01T00:00:00.000Z`);
        if(date) {
            query = [
        {
            $match: {
            to: muessise._id, 
            createdAt: { $gte: startYear, $lt: endYear },
            },
        },
        {
            $group: {
            _id: null,
            amounts: { $push: "$amount" },
            },
        },
        ]
        }
        const recordsTotal = await TransactionsUser.countDocuments({to: muessise._id});
        const recordsFiltered = await TransactionsUser.countDocuments(query);

        const transactionData = await TransactionsUser.aggregate(query)
        .skip(start)
        .limit(length)
        const transaction = transactionData.length > 0 ? transactionData : [{ amounts: [] }];
        return res.status(200).json({
            data: transaction,
            recordsTotal,
            recordsFiltered,
            draw
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        })
    };
};
export const kartChart = async (req,res) => {
    try {
        const {
            draw,
            start= 0, 
            length = 10,
            years = [],
            cards = [],
            muessise_id
        } = req.body;

        const muessise  = await Muessise.findOne({muessise_id: muessise_id});
        let query = { to: muessise._id};

        if (cards && cards.length > 0) {
            query.cards = { $in: cards };
        }
        if (years && years.length > 0) {
        query.date = {
            $gte: new Date(`${Math.min(...years)}-01-01`),
            $lte: new Date(`${Math.max(...years)}-12-31`),
        };
        }
        
        const recordsTotal = await TransactionsUser.countDocuments({to: muessise._id});
        const recordsFiltered = await TransactionsUser.countDocuments(query);

        const transaction = await TransactionsUser.find(query)
            .populate("cards","name _id createdAt")
            .lean();

        const result = [];
        transaction.forEach((t) => {
            if (!t.cards || !t.cards._id) return;
        const cardId = t.cards?._id;
        const cardName = t.cards?.name || "Naməlum kart";
        const year = new Date(t.createdAt).getFullYear();
        const amount = Number(t.amount || 0);
        const normalizedYears = years.map(y => Number(y));

        if (normalizedYears.length > 0 && !normalizedYears.includes(year)) return;

        if (cards.length > 0 && !cards.some(c => String(c) === String(cardId))) return;
        let existing = result.find(r => String(r.cardId) === String(cardId));
        if (!existing) {
            let amounts = normalizedYears.length > 0 
            ? normalizedYears.map(y => (y === year ? amount : 0))
            : [amount]; 
            result.push({
            cardId,
            cardName,
            amounts
            });
        } else {
            if (years.length > 0) {
            let idx = normalizedYears.findIndex(y => y === year);
            if (idx !== -1) {
                existing.amounts[idx] += amount || 0;
            }
            } else {
            existing.amounts[0] += amount || 0;
            }
        }
        console.log("Year:", year);
console.log("normalizedYears:", normalizedYears);
console.log("idx:", normalizedYears.findIndex(y => y === year));
console.log("amount:", t.amount);
        });
        
        console.log(result,"resulttttttttttttttttttttttttt")

        return res.status(200).json({
            data: result,
            recordsTotal,
            recordsFiltered,
            draw
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        })
    };
};

export const muessiseTransactionsTable = async (req,res) => {
    try {
        const {
            draw,
            start= 0, 
            length = 2,
            search = '',
            start_date,
            end_date
        } = req.body;
        // console.log(req.body,"body baxiriq")
        // console.log(req.params,"params baxiriq")
        // console.log(req.query,"query baxiriq")
        const query = {}

        const recordsTotal = await TransactionsUser.countDocuments();

        return res.status(200).json({
            data: [],
            recordsTotal
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal server error",
            success: false
        })
    }
};
export const usersTable = async (req,res) => {
    try {
        const { 
            draw ,
            start =  0,
            length = 1,
            search = '',
            muessise_id
        } = req.body;
        const muessise = await Muessise.findOne({muessise_id})
        const muessiseId = muessise._id
        const query = {muessise_id: muessise._id};
           if(search && search.trim() !== "") {
            const searchRegex = new RegExp(search,"i")
            query.$or = [
            {name: searchRegex},
            {surname: searchRegex},
            {email: searchRegex}
            ]
        }
        const users = await PartnerUser.find(query)
        .select("name surname partnyor_id gender email phone_suffix phone ")
        .populate("duty", "name")
        .skip(start)
        .limit(length)
        .lean()

        const recordsTotal = await PartnerUser.countDocuments({muessise_id: muessiseId});
        const recordsFiltered = await PartnerUser.countDocuments(query);
        users.forEach(user => ({
           name: user.name + " " + (user.surname ?? ""),
           partnyor_id: user.partnyor_id,
           phone: `+${user.phone_suffix} ${user.phone}`,
           gender: user.gender,
           email: user.email,
           department: "sirket",
           position: user.duty?.name || " - "
        }))

    return res.status(200).json({
        data: users,
        draw,
        recordsTotal,
        recordsFiltered,
        csrfToken: req.csrfToken()
    })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    };
};

export const selahiyyetTable = async (req,res) => {
    try {
        const {
            draw ,
            start =  0,
            length = 1,
            search = '',
            muessise_id
        } = req.body;

        const muessise = await Muessise.findOne({muessise_id: muessise_id});
        const muessiseId = muessise._id
        if(!muessiseId) return res.status(401).json({message: "Muessise not found"})
        const query = { muessise_id: muessiseId };
        if(search && search.trim() !== "") {
            const searchRegex = new RegExp(search, "i");
            query.$or = [
                { name: searchRegex },
            ]
        };
        const rbac = await RbacPermission.find(query)
        .skip(start)
        .limit(length)
        .populate("users")
        const recordsTotal = await RbacPermission.countDocuments();
        const recordsFiltered = await RbacPermission.countDocuments(query);
        const newRbac  = [];
        rbac.forEach(item => {
            newRbac.push({
            id: item._id,
            groupName: item.name,
            date: new Date(item.createdAt).toLocaleDateString("az-AZ",{
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }),
            permissions: item.permission || "-",
            peopleCount: item.user?.length || 0
        })
        });
        return res.status(200).json({
            data: newRbac,
            draw,
            recordsTotal,
            recordsFiltered,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    };
};

export const selahiyyetDetailTable = async (req,res) => {
    try {
        const {
            draw,
            start =  0,
            length = 1,
            search = '',
            id,
            start_date,
            end_date
        } = req.body;

        let query = { perm: new mongoose.Types.ObjectId(id)};
        const perm_id = new mongoose.Types.ObjectId(id)

        if(search && search.trim() !== "") {
            const searchRegex = new RegExp(search,"i")
            query.$or = [
                { name: searchRegex},
                { surname: searchRegex},
                { email: searchRegex},
            ]
        }
        if(start_date && end_date) {
            query.createdAt = {
                $gte: new Date(start_date),
                $lte: new Date(end_date)
            }
        } else if (start_date) {
            query.createdAt = {
                $gte: new Date(start_date),
            }
        } else if( end_date) {
            query.createdAt = {
                $lte: new Date(end_date)
            }
        }

        // partnerusersden perm ve rbac permin muessise id-si  
        const rbac = await RbacPermission.find({_id: perm_id})
        .skip(start)
        .limit(length)
        .lean();
        if(rbac && rbac.muessise_id) {
            query.muessise_id = rbac.muessise_id;
        }
        const partnerUser = await PartnerUser.find(query)
        .select("name surname gender email phone phone_suffix people_id")
        .skip(start)
        .limit(length)
        .populate("duty","name");
        // burda partnyor model olacaq people goruntu ucundur
        const recordsTotal = await PartnerUser.countDocuments({perm: perm_id});
        const recordsFiltered = await PartnerUser.countDocuments(query);
        partnerUser.forEach(item => {
            item.name = `${item.name ? item.name : ""} ${item.surname ? item.surname : ""}`;
            item.duty = item.duty || "-";
            item.phone = `+${item.phone_suffix}${item.phone}`
        })
        return res.status(200).json({
            data: partnerUser,
            draw,
            recordsTotal,
            recordsFiltered
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        })
    }
};

export const jobTable = async (req,res) => {
    try {
        const {
            draw ,
            start =  0,
            length = 1,
            search = '',
            muessise_id
        } = req.body;

        const muessise = await Muessise.findOne({muessise_id: muessise_id});
        const muessiseId = muessise._id
        if(!muessiseId) return res.status(401).json({message: "Muessise not found"})
        const query = { muessise_id: muessiseId };
        if(search && search.trim() !== "") {
            const searchRegex = new RegExp(search, "i");
            query.$or = [
                { name: searchRegex },
            ]
        };
        const duty = await Duty.find(query)
        .skip(start)
        .limit(length)
        const recordsTotal = await Duty.countDocuments();
        const recordsFiltered = await Duty.countDocuments(query);
        const newDuty  = [];
        duty.forEach(item => {
            newDuty.push({
            id: item._id,
            jobTitle: item.name,
            createdAt: new Date(item.created_at).toLocaleDateString("az-AZ",{
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }),
            employees: item.permission || "-",
            createdBy: item.user?.name || "-"
        })
        });
        return res.status(200).json({
            data: newDuty,
            draw,
            recordsTotal,
            recordsFiltered,
            redirect: `muessiseler/${muessise_id}`
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    };
};

export const jobDetailTable = async (req,res) => {
    try {
        const {
            draw ,
            start =  0,
            length = 1,
            search = '',
            id,
            start_date,
            end_date
        } = req.body;

        let query = {_id: new mongoose.Types.ObjectId(id)};

        if(search && search.trim() !== "") {
            const searchRegex = new RegExp(search,"i")
            query.$or = [
                { name: searchRegex},
                { surname: searchRegex},
                { email: searchRegex},

            ]
        }
        if(start_date && end_date) {
            query.createdAt = {
                $gte: new Date(start_date),
                $lte: new Date(end_date)
            }
        } else if (start_date) {
            query.createdAt = {
                $gte: new Date(start_date),
            }
        } else if( end_date) {
            query.createdAt = {
                $lte: new Date(end_date)
            }
        }
        const duty = await Duty.find(query)
        .select("name users")
        .skip(start)
        .limit(length)
        .populate("users", "name surname gender duty email phone phone_suffix")
        .lean();
        return res.status(200).json({
            data: duty.users
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        })
    }
};  


export const queries = async (req,res) => {
    try {
        const {
            muessise_id
        } = req.body;
        const muessise = await Muessise.findOne({muessise_id: muessise_id});
        if(!muessise) return res.status(404).json({ message: "Muessise tapilmadi"});
        const muessiseId = muessise._id;
        const queries = await Ticket.find({ muessise_id: muessiseId})
        .select("title content priority ticket_id status assigned userModel createdAt subject")
        .populate("user_id", "name");
        let newQueries = [];
        queries.forEach(query => newQueries.push(
        {
        title: query.title,
        ticket_id: query.ticket_id,
        description: query.content,
        priority: query.priority,
        date: new Date(query.createdAt).toLocaleDateString("az-AZ",{
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
        }),
        userType: query.userModel,
        status: query.status,
        responsible: `${query.user_id?.name ? query.user_id.name : '' } ${query.subject ? query.subject : '' }`
        }));
        return res.status(200).json({
            data: newQueries,
            csrfToken: req.csrfToken()
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

export const notifications = async (req,res) => {
    try {
        const { muessise_id } = req.body;
        const muessise = await Muessise.findOne({muessise_id: muessise_id});
        if(!muessise) return res.status(404).json({ message: "Muessise not found "});
        const notificationData = await NotificationModel.find({muessise_id: muessise._id})
        .select("title text status type data createdAt");
        console.log(notificationData,"data")
        return res.status(200).json({
            data: notificationData,
            csrfToken: req.csrfToken()
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        })
    };
};



 


