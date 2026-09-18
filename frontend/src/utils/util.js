import commonObj from "../commonObj";

class util {

formatPermissions(text) {
  if (!text) return '';

  return text
    .split(':')
    .map(part =>
      part
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    )
    .join(': ');
}

  enumToOptions(obj = {}) {
    return Object.entries(obj).map(([key, value]) => ({
      key,
      label: key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      // label:key,
      value,
    }));
  }

  checkModuleAccess = (module) => {
    try {
      if (!module || typeof module !== "string") return false;

      const permissions = commonObj?.permissionsGrp;
      if (!Array.isArray(permissions)) return false;
      const modules = permissions.map((item) => item?.module);
      return modules.includes(module);

    } catch (err) {
      // console.error("Error in checkModuleAccess:", err);
      return false;
    }
  };

  getModulePermissions = (module) => {
    try {
      const group = commonObj?.permissionsGrp?.find(
        (item) => item?.module === module
      );
      if (!Array.isArray(group?.permissions)) return [];
      return group?.permissions.map((p) => p?.action);
    } catch (error) {
      console.log(`Failed to extract the permissions for module: ${module}`,  err);
      return [];
    }
  };

  checkRightAccess = (key) => {
    if (!key) {
      return commonObj?.role?.name === "Super Admin";
    }
    if (typeof key === "string") {
      return (
        commonObj?.role?.name === "Super Admin" || commonObj?.permissions?.includes(key)
      );
    }
  };

  setUserData = async (data) => {
    window.localStorage.clear();
    window.localStorage.setItem("authorization", data.data.accessToken);
    window.localStorage.setItem("sessionId", data.data.sessionId);
    // window.localStorage.setItem("refreshToken", data.data.refreshToken);
    // window.localStorage.setItem("user_info", JSON.stringify(data.data.user));
    window.location.reload();
    // window.localStorage.setItem('type', data.type);
  };
  getUserData = ($key) => {
    if ($key) {
      return JSON.parse(window.localStorage["user"])[$key];
    } else {
      return JSON.parse(window.localStorage["user"]);
    }
  };
  setUserType = (data = "") => {
    window.localStorage.setItem("type", data);
  };
  userType = () => window.localStorage["type"];
  getToken = () => {
    return window.localStorage["authorization"] || "";
  };
  isLogged = () => {
    if (
      typeof window.localStorage["authorization"] !== "undefined" &&
      window.localStorage["authorization"] !== ""
    ) {
      return true;
    }
    return false;
  };
  logout = (e) => {
    if (e) e.preventDefault();
    window.localStorage.clear();
    window.location.reload();
  };
  setTheme($theme = "light") {
    window.localStorage.setItem("theme", $theme);
    return $theme;
  }
  getTheme() {
    return window.localStorage?.theme;
  }
  removeSpecialChars(key) {
    return key
      ?.trim()
      .toLowerCase()
      ?.replace(/[^a-z0-9 _-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }
  handleInteger($str, $len = 10) {
    let num = $str?.replace(/[^0-9]/g, "");
    return $len ? num?.substring(0, $len) : num;
  }
  handleFloat(value, maxValue) {
    value = value.replace(/[^0-9.]/g, "");
    let newValue = value.replace(/[\.\%]/g, function (match, offset, all) {
      return match === "." ? (all.indexOf(".") === offset ? "." : "") : "";
    });
    if (maxValue) {
      if (newValue * 1 > maxValue * 1) {
        newValue = maxValue;
      }
    }
    return newValue;
  }
  toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }
  queryStringToJSON(qs) {
    qs = qs || window.location.search.slice(1);
    if (qs.charAt(0) === "?") {
      qs = qs.slice(1);
    }

    var pairs = qs.split("&");
    var result = {};
    pairs.forEach(function (p) {
      var pair = p.split("=");
      var key = pair[0];
      var value = decodeURIComponent(pair[1] || "");
      if (result[key]) {
        if (Object.prototype.toString.call(result[key]) === "[object Array]") {
          result[key].push(value);
        } else {
          result[key] = [result[key], value];
        }
      } else {
        result[key] = value;
      }
    });

    return JSON.parse(JSON.stringify(result));
  }
  getFileFormat(data) {
    if (!Array.isArray(data)) {
      if (typeof data === "string") {
        return [
          {
            uid: data.split("/").pop(),
            name: data.split("/").pop(),
            url: data,
          },
        ];
      } else {
        return [
          {
            uid: data.uid || data._id,
            name: data.url.split("/").pop(),
            url: data.url,
            ...data,
          },
        ];
      }
    } else {
      return data.map((v) => {
        if (typeof v === "string") {
          return {
            uid: v.split("/").pop(),
            name: v.split("/").pop(),
            url: v,
          };
        } else {
          return {
            uid: v.uid || v._id,
            name: v.url.split("/").pop(),
            url: v.url,
            ...v,
          };
        }
      });
    }
  }
  getTimeInSec(timeString) {
    timeString = timeString.trim().replace(/^(.*?)([AaPp][mM])?$/, "$1");
    const [hours, minutes] = timeString.split(":");
    let hoursInSec = parseInt(hours, 10) * 3600;
    const minutesInSec = parseInt(minutes, 10) * 60;

    if (
      hours === "12" &&
      (timeString.endsWith("PM") || timeString.endsWith("pm"))
    ) {
      hoursInSec += 12 * 3600;
    }
    return hoursInSec + minutesInSec || 0;
  }
  getTimeString(seconds, includeAMPM = false) {
    if (seconds < 0) {
      seconds = Math.abs(seconds);
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const formattedHours = hours ? hours.toString().padStart(2, "0") : "00";
    const formattedMinutes = minutes
      ? minutes.toString().padStart(2, "0")
      : "00";
    let timeString = `${formattedHours}:${formattedMinutes}`;
    if (includeAMPM) {
      const isPM = hours >= 12;
      const twelveHourHours = hours % 12 || 12;
      timeString = `${twelveHourHours}:${formattedMinutes} ${
        isPM ? "PM" : "AM"
      }`;
    }
    return timeString;
  }
  getTableHeight() {
    return (
      (window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight ||
        1000) - 312
    );
  }
  amountFormat(amount = 0, options = {}) {
    const {
      formatName = "en-IN",
      minimumFractionDigits = 2,
      maximumFractionDigits = 2,
    } = options;
    return (
      isFinite(amount) &&
      Number(amount).toLocaleString(formatName, {
        minimumFractionDigits,
        maximumFractionDigits,
      })
    );
  }
  isValidMongooseId(id) {
    return /^[a-fA-F0-9]{24}$/.test(id);
  }

handleTableSortingData = (sorter, setSort, curr_sort, refetch, qData) => {
  const mapSortToApiParams = (sortArray) => {
    if (!sortArray || sortArray.length === 0) return {};
    const { column, desc } = sortArray[0];
    const columnMap = {
      source: 'source',
      stages: 'stage',
      assignedTo: 'assigned',
      created_at: 'created_at',
      updated_at: 'updated_at',
    };
    const backendColumn = columnMap[column];
    if (!backendColumn) return {}; // skip unsupported columns (e.g., 'id')
    return {
      sortBy: backendColumn,
      sortOrder: desc === 1 ? 'desc' : 'asc',
    };
  };

  const updateSortAndRefetch = (newSort) => {
    setSort(newSort);
    const apiSortParams = mapSortToApiParams(newSort);
    const { sort: _, ...restQData } = qData || {};
    const newParams = { ...restQData, ...apiSortParams };
    if (typeof refetch === 'function') {
      refetch(newParams);
    }
  };

  // Ant Design may pass an array in multi‑sort mode; we only support single sort, so take first item
  const sorterObj = Array.isArray(sorter) ? sorter[0] : sorter;

  // No sorter or missing field → clear sort
  if (!sorterObj || !sorterObj.field) {
    return updateSortAndRefetch([]);
  }

  const { field, order } = sorterObj;

  if (order) {
    // Apply new sort
    updateSortAndRefetch([{
      column: field,
      desc: order === 'ascend' ? 0 : 1,
    }]);
  } else {
    // Sort removed for this column → clear
    updateSortAndRefetch([]);
  }
};

  // renderTableText = (value, className) => value ? <span className={className}>{value}</span> : <span>NA</span>
}

export default new util();
