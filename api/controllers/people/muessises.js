import mongoose from "mongoose";
import Muessise from "../../../shared/models/muessiseModel.js";
import FavoriteMuessise from "../../../shared/model/partner/favoriteMuessises.js";

function sendFailedGeoLogs(failed = []) {
  return;
}

function buildFilterPipeline({
  filterType,
  search,
  muessise_category,
  card_id,
  pipeline = [],
  useGeo = false
}) {
  const stages = [];

  if (Array.isArray(muessise_category) && muessise_category.length > 0) {
    stages.push({
      $match: { muessise_category: { $in: muessise_category } },
    });
  }

  if (card_id) {
    let cid = null;
    try {
      cid = new mongoose.Types.ObjectId(card_id);
    } catch {}
    if (cid) stages.push({ $match: { cards: cid } });
  }

  if (search && typeof search === "string" && search.trim()) {
    const rx = new RegExp(search.trim(), "i");
    stages.push({
      $match: {
        $or: [{ muessise_name: rx }, { location: rx }, { address: rx }],
      },
    });
  }

  if (filterType === "distance") {
    pipeline.push({
      $sort: { distance: 1 },
    });
  } else if (filterType === "name" && search && search.trim()) {
    pipeline.push({
      $sort: useGeo
        ? { _score_name: -1, _score_loc: -1, distance: 1, muessise_name: 1 }
        : { _score_name: -1, _score_loc: -1, muessise_name: 1 },
    });
  } else {
    pipeline.push({
      $sort: useGeo
        ? { distance: 1, muessise_name: 1 }
        : { muessise_name: 1 },
    });
  }

  return stages;
}

export const getMuessises = async (req, res) => {
  try {
    const {
      lat: rawLat = null,
      lng: rawLng = null,
      filterType = "name",
      search = null,
      card_id = null,
      cards = [],
      muessise_category = [],
      page = 1,
      limit = 10,
    } = req.body;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNum - 1) * limitNum;

    let lat = rawLat != null ? Number(rawLat) : null;
    let lng = rawLng != null ? Number(rawLng) : null;

    const failed = [];
    let useGeo = true;

    if ((lat == null) !== (lng == null)) {
      useGeo = false;
      failed.push({
        lat: rawLat,
        lng: rawLng,
        reason: "either lat or lng is null",
      });
    }

    if (lat == null && lng == null) {
      lat = 40.4093;
      lng = 49.8671;
      useGeo = true;
    }

    if (
      lat != null &&
      lng != null &&
      (Number.isNaN(lat) || Number.isNaN(lng))
    ) {
      useGeo = false;
      failed.push({ lat: rawLat, lng: rawLng, reason: "lat/lng NaN" });
    }

    if (!useGeo && failed.length) sendFailedGeoLogs(failed);

    const lookupCards = {
      $lookup: {
        from: "cards",
        localField: "cards",
        foreignField: "_id",
        as: "cards",
      },
    };

    const filterActiveCards = {
      $addFields: {
        cards: {
          $filter: {
            input: "$cards",
            cond: {
              $and: [
                { $eq: ["$$this.status", "active"] },
                { $ne: ["$$this.category", null] },
                { $ne: ["$$this.category", undefined] },
              ],
            },
          },
        },
      },
    };
    const userId = new mongoose.Types.ObjectId(req.user);

    const lookupFavorites = {
      $lookup: {
        from: "favoritemuessises",
        let: { muessiseId: "$_id", userId: userId },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$muessise_id", "$$muessiseId"] },
                  { $eq: ["$isFavorite", true] },
                  { $eq: ["$sirket_user", "$$userId"] },
                ],
              },
            },
          },
        ],
        as: "favoriteData",
      },
    };

    const addFavoriteFlag = {
      $addFields: {
        isFavorite: {
          $cond: [{ $gt: [{ $size: "$favoriteData" }, 0] }, true, false],
        },
      },
    };

    const runWithRadiusKm = async (km) => {
      const pipeline = [];

      const baseFilters = buildFilterPipeline({
        filterType,
        search,
        muessise_category,
        card_id,
        pipeline,
        useGeo
      });
      pipeline.push(...baseFilters);

      if (useGeo) {
        pipeline.push({
          $match: {
            location_point: {
              $geoWithin: {
                $centerSphere: [[lng, lat], km / 6371],
              },
            },
          },
        });

        pipeline.push({
          $addFields: {
            distance: {
              $multiply: [
                6371,
                {
                  $acos: {
                    $max: [
                      -1,
                      {
                        $min: [
                          1,
                          {
                            $add: [
                              {
                                $multiply: [
                                  {
                                    $sin: {
                                      $multiply: [
                                        {
                                          $divide: [
                                            { $multiply: [lat, Math.PI] },
                                            180,
                                          ],
                                        },
                                        1,
                                      ],
                                    },
                                  },
                                  {
                                    $sin: {
                                      $multiply: [
                                        {
                                          $divide: [
                                            {
                                              $multiply: [
                                                {
                                                  $arrayElemAt: [
                                                    "$location_point.coordinates",
                                                    1,
                                                  ],
                                                },
                                                Math.PI,
                                              ],
                                            },
                                            180,
                                          ],
                                        },
                                        1,
                                      ],
                                    },
                                  },
                                ],
                              },
                              {
                                $multiply: [
                                  {
                                    $cos: {
                                      $multiply: [
                                        {
                                          $divide: [
                                            { $multiply: [lat, Math.PI] },
                                            180,
                                          ],
                                        },
                                        1,
                                      ],
                                    },
                                  },
                                  {
                                    $cos: {
                                      $multiply: [
                                        {
                                          $divide: [
                                            {
                                              $multiply: [
                                                {
                                                  $arrayElemAt: [
                                                    "$location_point.coordinates",
                                                    1,
                                                  ],
                                                },
                                                Math.PI,
                                              ],
                                            },
                                            180,
                                          ],
                                        },
                                        1,
                                      ],
                                    },
                                  },
                                  {
                                    $cos: {
                                      $multiply: [
                                        {
                                          $divide: [
                                            {
                                              $multiply: [
                                                {
                                                  $subtract: [
                                                    {
                                                      $arrayElemAt: [
                                                        "$location_point.coordinates",
                                                        0,
                                                      ],
                                                    },
                                                    lng,
                                                  ],
                                                },
                                                Math.PI,
                                              ],
                                            },
                                            180,
                                          ],
                                        },
                                        1,
                                      ],
                                    },
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          },
        });
      }

      pipeline.push(lookupCards);
      pipeline.push(filterActiveCards);
      pipeline.push(lookupFavorites);
      pipeline.push(addFavoriteFlag);

      if (filterType === "name" && search && search.trim()) {
        pipeline.push({
          $sort: useGeo
            ? { _score_name: -1, _score_loc: -1, distance: 1, muessise_name: 1 }
            : { _score_name: -1, _score_loc: -1, muessise_name: 1 },
        });
      } else {
        pipeline.push({
          $sort: useGeo
            ? { distance: 1, muessise_name: 1 }
            : { muessise_name: 1 },
        });
      }

      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limitNum });
      pipeline.push({
        $project: {
          _id: 1,
          muessise_name: 1,
          location: "$address",
          location_point: 1,
          profile_image_path: 1,
          xarici_cover_image_path: 1,
          schedule: 1,
          cards: 1,
          distance: 1,
          isFavorite: 1,
        },
      });

      return Muessise.aggregate(pipeline);
    };

    let result = [];
    if (useGeo) {
      result = await runWithRadiusKm(5);
      if (result.length < limitNum) {
        const result10 = await runWithRadiusKm(10);
        result = result10;
      }
      if (result.length < limitNum) {
        const result50 = await runWithRadiusKm(50);
        result = result50;
      }
    } else {
      const baseFilters = buildFilterPipeline({
        filterType,
        search,
        muessise_category,
        card_id,
      });

      const pipeline = [
        ...baseFilters,
        lookupCards,
        filterActiveCards,
        lookupFavorites,
        addFavoriteFlag,
        {
          $sort:
            filterType === "name" && search && search.trim()
              ? { _score_name: -1, _score_loc: -1, muessise_name: 1 }
              : { muessise_name: 1 },
        },
        { $skip: skip },
        { $limit: limitNum },
        {
          $project: {
            _id: 1,
            muessise_name: 1,
            location: "$address",
            location_point: 1,
            xarici_cover_image_path: 1,
            profile_image_path: 1,
            schedule: 1,
            cards: 1,
            distance: { $literal: null },
            isFavorite: 1,
          },
        },
      ];

      result = await Muessise.aggregate(pipeline);
    }

    const muessises = (result || []).map((d) => ({
      _id: d._id,
      muessise_name: d.muessise_name,
      location: d.location ?? null,
      location_point: d.location_point ?? null,
      cards: d.cards || [],
      profile_image_path: d.profile_image_path ?? null,
      xarici_cover_image_path: d.xarici_cover_image_path ?? null,
      schedule: d.schedule ?? {},
      distance: typeof d.distance === "number" ? d.distance : null,
      isFavorite: d.isFavorite ?? false,
    }));

    return res.json({
      page: pageNum,
      limit: limitNum,
      total: muessises.length,
      muessises,
    });
  } catch (e) {
    console.error("getMuessises error:", e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getFavoriteMuessises = async (req, res) => {
  try {
    const {
      cards = [],
      muessise_category = [],
      search = null,
      page = 1,
      limit = 10,
    } = req.body;
    const skip = (page - 1) * limit;
    let muessiseFilter = {};

    if (cards.length > 0) {
      muessiseFilter["cards"] = { $in: cards };
    }
    if (muessise_category.length > 0) {
      muessiseFilter["muessise_category"] = { $in: muessise_category };
    }
    if (search) {
      muessiseFilter["muessise_name"] = { $regex: search, $options: "i" };
    }

    const favorites = await FavoriteMuessise.find({ sirket_user: req.user, isFavorite : true })
      .populate({
        path: "muessise_id",
        match: muessiseFilter,
        select: "cards muessise_name location_point profile_image_path xarici_cover_image_path schedule",
        populate: {
          path: "cards",
          match: { status: "active" },
          select: "category status",
        },
      })
      .skip(skip)
      .limit(limit);

    // filter: boş gələn populate nəticələrini atmaq
    const muessises = favorites
      .filter((p) => p.muessise_id)
      .map((p) => p.muessise_id);

    res.json({ success: true, muessises });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const getMuessiseDetails = async (req, res) => {
  try {
    const { muessise_id, lat = null, lng = null } = req.body;

    if (!muessise_id) {
      return res.status(400).json({
        success: false,
        message: "muessise_id is required",
      });
    }

    const muessise = await Muessise.findOne({
      _id: muessise_id,
      // company_status: 0,
    }).populate("cards");

    if (!muessise) {
      return res.status(404).json({
        success: false,
        message: "Muessise not found or not active",
      });
    }

    let isFavorite = false;
    const favoriteRecord = await FavoriteMuessise.findOne({
      sirket_user: req.user._id,
      muessise_id: muessise_id,
    });

    if (favoriteRecord && favoriteRecord.isFavorite) {
      isFavorite = true;
    }

    let distance = null;
    let userLat = lat;
    let userLng = lng;

    if (userLat === null || userLng === null) {
      userLat = 40.4093;
      userLng = 49.8671;
    }

    if (muessise.location_point && muessise.location_point.coordinates) {
      const [muessiseLng, muessiseLat] = muessise.location_point.coordinates;

      const R = 6371;
      const dLat = ((muessiseLat - userLat) * Math.PI) / 180;
      const dLng = ((muessiseLng - userLng) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((userLat * Math.PI) / 180) *
          Math.cos((muessiseLat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distance = Math.round(R * c * 100) / 100;
    }

    const responseData = {
      _id: muessise._id,
      muessise_id: muessise.muessise_id,
      activity_type: muessise.activity_type,
      muessise_name: muessise.muessise_name,
      lat: muessise.location_point?.coordinates[1] || null,
      lng: muessise.location_point?.coordinates[0] || null,
      location_point: muessise.location_point,
      address: muessise.address,
      profile_image_path: muessise.profile_image_path,
      daxili_cover_image_path: muessise.daxili_cover_image_path,
      description: muessise.description,
      services: muessise.services,
      cards: muessise.cards,
      schedule: muessise.schedule,
      phone: muessise.phone,
      email: muessise.email,
      social: muessise.social,
      website: muessise.website,
      distance: distance,
      isFavorite: isFavorite,
    };

    return res.status(200).json({
      success: true,
      message: "Muessise details retrieved successfully",
      data: { responseData },
    });
  } catch (error) {
    console.error("getMuessiseDetails error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
