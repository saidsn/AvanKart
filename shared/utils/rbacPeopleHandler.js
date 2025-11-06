import RbacPeoplePermission from "../models/rbacPeopleModel.js";
import PeopleUser from "../models/peopleUserModel.js";

const DEBUG_MODE = true;

const permissionCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

const isDev = process.env.NODE_ENV === "development";

const getCachedPermissions = (userId) => {
  const cached = permissionCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    isDev &&
      console.log(`[CACHE HIT] User ${userId} permissions loaded from cache`);
    return cached.permissions;
  }
  return null;
};

const setCachedPermissions = (userId, permissions) => {
  permissionCache.set(userId, {
    permissions,
    timestamp: Date.now(),
  });
  isDev && console.log(`[CACHE SET] User ${userId} permissions cached`);
};

export const clearPermissionCache = (userId = null) => {
  if (userId) {
    permissionCache.delete(userId);
    isDev && console.log(`[CACHE CLEAR] User ${userId} cache cleared`);
  } else {
    permissionCache.clear();
    isDev && console.log(`[CACHE CLEAR] All cache cleared`);
  }
};

//TODO: This section will be update
const PERMISSION_MAPPING = {
  dashboard: "dashboard",
  operations: "emeliyyatlar",
  settlements: "hesablasma",
  workers_balance: "iscilerin_balansi",
  e_invoice: "e_qaime",
  workers: "isciler",
  company_info: "sirket_melumatlari",
  profile: "profil",
  users: "istifadeciler",
  role_groups: "salahiyyet_qruplari",
  requisites: "rekvizitler",
  contracts: "muqavileler",
};

const checkPermissionWithAction = (permissionValue, requiredAction) => {
  const invalidPermissions = ["none", null, undefined, ""];
  if (!permissionValue || invalidPermissions.includes(permissionValue)) {
    return false;
  }

  const action = requiredAction.toLowerCase();

  switch (action) {
    case "read":
    case "view":
    case "get":
      return permissionValue === "read" || permissionValue === "full";

    case "create":
    case "update":
    case "delete":
    case "manage":
    case "full":
    case "post":
      return permissionValue === "full";

    default:
      return permissionValue && permissionValue !== "none";
  }
};

const getUserPermissions = async (userId) => {
  if (!userId) {
    isDev && console.log("[RBAC] No userId provided");
    return null;
  }

  if (DEBUG_MODE) {
    isDev &&
      console.log(
        `[DEBUG MODE] Getting permissions for user: ${userId} - BYPASSING DATABASE`
      );
    return { debug: true };
  }

  const cachedPermissions = getCachedPermissions(userId);
  if (cachedPermissions) {
    return cachedPermissions;
  }

  try {
    isDev && console.log(`[RBAC] Fetching permissions for userId: ${userId}`);

    const user = await PeopleUser.findById(userId);

    if (!user) {
      isDev && console.log(`[RBAC] PeopleUser not found for userId: ${userId}`);
      return null;
    }

    const sirketOfUser = user.sirket_id;

    if (!sirketOfUser) {
      isDev && console.log(`[RBAC] No sirket_id found for userId: ${userId}`);
      return null;
    }

    isDev && console.log(`[RBAC] User sirket_id: ${sirketOfUser}`);

    const sirketPermission = await RbacPeoplePermission.findOne({
      sirket_id: sirketOfUser,
    });

    if (!sirketPermission) {
      console.log(`[RBAC] No permissions found for sirket_id: ${sirketOfUser}`);
      return null;
    }

    console.log(`[RBAC] Permissions found:`, sirketPermission.toObject());

    setCachedPermissions(userId, sirketPermission);
    return sirketPermission;
  } catch (err) {
    console.error("[RBAC] Get user permissions error:", err);
    return null;
  }
};

export const checkRbacPermission = (
  requiredPermission,
  requiredAction = "read"
) => {
  return async (req, res, next) => {
    try {
      console.log(
        `[RBAC MIDDLEWARE] Checking permission: ${requiredPermission}, action: ${requiredAction}`
      );

      if (!req.user || !req.user.id) {
        console.log("[RBAC MIDDLEWARE] No user or user.id in request");
        return res.redirect("/auth/login");
      }

      console.log(
        `[RBAC MIDDLEWARE] User ID: ${req.user.id}, Required Permission: ${requiredPermission}, Required Action: ${requiredAction}`
      );

      if (DEBUG_MODE) {
        console.log(
          `[DEBUG MODE] Bypassing RBAC check for permission: ${requiredPermission}, action: ${requiredAction}`
        );
        req.userPermissions = { debug: true };
        return next();
      }

      const user = await PeopleUser.findById(req.user.id);
      if (!user || !user.sirket_id) {
        console.log(`[RBAC MIDDLEWARE] User or sirket_id not found`);
        return res.redirect("/auth/login");
      }

      const sirketOfUser = user.sirket_id;
      const sirketPermission = await RbacPeoplePermission.findOne({
        sirket_id: sirketOfUser,
      });

      console.log(
        "[RBAC MIDDLEWARE] Sirket Permission:",
        sirketPermission?.toObject()
      );

      if (!sirketPermission) {
        console.log(
          `[RBAC MIDDLEWARE] No permissions found, redirecting to login`
        );
        return res.redirect("/auth/login");
      }

      const dbFieldName =
        PERMISSION_MAPPING[requiredPermission] || requiredPermission;
      const permissionValue = sirketPermission[dbFieldName];

      console.log(
        `[RBAC MIDDLEWARE] Checking ${requiredPermission} -> ${dbFieldName} = ${permissionValue}, required action: ${requiredAction}`
      );

      const hasPermission = checkPermissionWithAction(
        permissionValue,
        requiredAction
      );

      if (!hasPermission) {
        console.log(
          `[RBAC MIDDLEWARE] Permission denied for ${requiredPermission} with action ${requiredAction}. User has: ${permissionValue}`
        );

        const dashboardPermission = sirketPermission["dashboard"];
        console.log(
          `[RBAC MIDDLEWARE] Checking dashboard fallback permission: ${dashboardPermission}`
        );

        if (dashboardPermission && dashboardPermission !== "none") {
          console.log(
            `[RBAC MIDDLEWARE] Dashboard permission found, redirecting to /`
          );
          return res.redirect("/");
        } else {
          console.log(
            `[RBAC MIDDLEWARE] No dashboard permission, redirecting to login`
          );
          return res.redirect("/auth/login");
        }
      }

      console.log(
        `[RBAC MIDDLEWARE] Permission granted for ${requiredPermission} with action ${requiredAction}`
      );
      req.userPermissions = sirketPermission;
      next();
    } catch (err) {
      console.error("[RBAC MIDDLEWARE] Error:", err);
      return res.status(500).send("Internal Server Error");
    }
  };
};

export const can = async (userId, permissionName, action = null) => {
  if (!userId) {
    return false;
  }

  if (DEBUG_MODE) {
    console.log(
      `[DEBUG MODE] Can check bypassed for user: ${userId}, permission: ${permissionName}`
    );
    return true;
  }

  try {
    const userPermissions = await getUserPermissions(userId);
    if (!userPermissions) {
      return false;
    }

    const dbFieldName = PERMISSION_MAPPING[permissionName] || permissionName;
    const permissionValue = userPermissions[dbFieldName];

    return permissionValue && permissionValue !== "none";
  } catch (err) {
    console.error("[RBAC] Can check error:", err);
    return false;
  }
};

export const canPerformAction = async (userId, permissionName, action) => {
  if (!userId || !action) {
    return false;
  }

  if (DEBUG_MODE) {
    console.log(
      `[DEBUG MODE] CanPerformAction bypassed for user: ${userId}, permission: ${permissionName}, action: ${action}`
    );
    return true;
  }

  try {
    const userPermissions = await getUserPermissions(userId);
    if (!userPermissions) {
      return false;
    }

    const dbFieldName = PERMISSION_MAPPING[permissionName] || permissionName;
    const permissionValue = userPermissions[dbFieldName];

    return checkPermissionWithAction(permissionValue, action);
  } catch (err) {
    console.error("[RBAC] CanPerformAction error:", err);
    return false;
  }
};

export const cannot = async (userId, permissionName, action = null) => {
  if (DEBUG_MODE) {
    console.log(
      `[DEBUG MODE] Cannot check bypassed (returning false) for user: ${userId}, permission: ${permissionName}`
    );
    return false;
  }

  if (action) {
    return !(await canPerformAction(userId, permissionName, action));
  }
  return !(await can(userId, permissionName));
};

export const canWithPermissions = (userPermissions, permissionName) => {
  if (DEBUG_MODE) {
    console.log(
      `[DEBUG MODE] CanWithPermissions bypassed for permission: ${permissionName}`
    );
    return true;
  }

  if (!userPermissions) {
    return false;
  }

  const dbFieldName = PERMISSION_MAPPING[permissionName] || permissionName;
  const permissionValue = userPermissions[dbFieldName];

  return permissionValue && permissionValue !== "none";
};

export const canPerformActionWithPermissions = (
  userPermissions,
  permissionName,
  action
) => {
  if (DEBUG_MODE) {
    console.log(
      `[DEBUG MODE] CanPerformActionWithPermissions bypassed for permission: ${permissionName}, action: ${action}`
    );
    return true;
  }

  if (!userPermissions || !action) {
    return false;
  }

  const dbFieldName = PERMISSION_MAPPING[permissionName] || permissionName;
  const permissionValue = userPermissions[dbFieldName];

  console.log(
    `[LOCALS] CanPerformActionWithPermissions: ${permissionName} -> ${dbFieldName} = ${permissionValue}, action: ${action}`
  );

  return checkPermissionWithAction(permissionValue, action);
};

export const cannotWithPermissions = (
  userPermissions,
  permissionName,
  action = null
) => {
  if (DEBUG_MODE) {
    console.log(
      `[DEBUG MODE] CannotWithPermissions bypassed (returning false) for permission: ${permissionName}`
    );
    return false;
  }

  if (action) {
    return !canPerformActionWithPermissions(
      userPermissions,
      permissionName,
      action
    );
  }
  return !canWithPermissions(userPermissions, permissionName);
};

export const attachPermissionsToLocals = async (req, res, next) => {
  try {
    console.log(
      `[LOCALS] Processing for user ID: ${req.user?.id || "No user"}`
    );

    if (req.user && req.user.id) {
      console.log(`[LOCALS] User found: ${req.user.id}`);

      let userPermissions = req.userPermissions;

      if (!userPermissions) {
        console.log(`[LOCALS] No req.userPermissions, fetching from database`);
        userPermissions = await getUserPermissions(req.user.id);
      } else {
        console.log(`[LOCALS] Using req.userPermissions from middleware`);
      }

      console.log(
        `[LOCALS] Final userPermissions:`,
        userPermissions?.toObject ? userPermissions.toObject() : userPermissions
      );

      res.locals.userPermissions = userPermissions;
      res.locals.can = (permissionName) => {
        const result = canWithPermissions(userPermissions, permissionName);
        console.log(`[LOCALS] can("${permissionName}") = ${result}`);
        return result;
      };
      res.locals.cannot = (permissionName) => {
        const result = cannotWithPermissions(userPermissions, permissionName);
        console.log(`[LOCALS] cannot("${permissionName}") = ${result}`);
        return result;
      };
      res.locals.canPerform = (permissionName, action) => {
        const result = canPerformActionWithPermissions(
          userPermissions,
          permissionName,
          action
        );
        console.log(
          `[LOCALS] canPerform("${permissionName}", "${action}") = ${result}`
        );
        return result;
      };
      res.locals.cannotPerform = (permissionName, action) => {
        const result = !canPerformActionWithPermissions(
          userPermissions,
          permissionName,
          action
        );
        console.log(
          `[LOCALS] cannotPerform("${permissionName}", "${action}") = ${result}`
        );
        return result;
      };
    } else {
      console.log("[LOCALS] No user, setting default permissions");
      res.locals.userPermissions = null;
      res.locals.can = () => (DEBUG_MODE ? true : false);
      res.locals.cannot = () => (DEBUG_MODE ? false : true);
      res.locals.canPerform = () => (DEBUG_MODE ? true : false);
      res.locals.cannotPerform = () => (DEBUG_MODE ? false : true);
    }

    next();
  } catch (err) {
    console.error("[LOCALS] Attach permissions error:", err);
    res.locals.userPermissions = null;
    res.locals.can = () => (DEBUG_MODE ? true : false);
    res.locals.cannot = () => (DEBUG_MODE ? false : true);
    res.locals.canPerform = () => (DEBUG_MODE ? true : false);
    res.locals.cannotPerform = () => (DEBUG_MODE ? false : true);
    next();
  }
};

export const handleRbacRedirect = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).send("You do not have permission");
    }

    if (DEBUG_MODE) {
      console.log(
        `[DEBUG MODE] HandleRbacRedirect bypassed for user: ${req.user.id}`
      );
      req.userPermissions = { debug: true };
      return next();
    }

    const userPermissions = await getUserPermissions(req.user.id);

    if (!userPermissions) {
      return res.status(401).send("You do not have permission");
    }

    const hasAccess = Object.values(userPermissions.toObject()).some(
      (permission) => permission !== "none"
    );

    if (!hasAccess) {
      return res.status(401).send("You do not have permission");
    }

    req.userPermissions = userPermissions;
    next();
  } catch (err) {
    console.error("[RBAC] HandleRbacRedirect error:", err);
    return res.status(500).send("Internal Server Error");
  }
};

export const checkMultiplePermissions = async (userId, permissions) => {
  if (!userId || !permissions || permissions.length === 0) {
    return {};
  }

  if (DEBUG_MODE) {
    console.log(
      `[DEBUG MODE] CheckMultiplePermissions bypassed for user: ${userId}`
    );
    return permissions.reduce((acc, perm) => {
      acc[perm] = true;
      return acc;
    }, {});
  }

  try {
    const userPermissions = await getUserPermissions(userId);
    if (!userPermissions) {
      return permissions.reduce((acc, perm) => {
        acc[perm] = false;
        return acc;
      }, {});
    }

    return permissions.reduce((acc, perm) => {
      acc[perm] = canWithPermissions(userPermissions, perm);
      return acc;
    }, {});
  } catch (err) {
    console.error("[RBAC] CheckMultiplePermissions error:", err);
    return permissions.reduce((acc, perm) => {
      acc[perm] = false;
      return acc;
    }, {});
  }
};
