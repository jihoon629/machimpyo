import axios from "axios"; //백엔드 API 호출 모듈 (axios)

// 이 baseURL 설정은 유지합니다. 각 API 호출은 이 URL 뒤에 붙는 상대 경로를 사용합니다.
axios.defaults.baseURL = "http://192.168.72.129:8001";

/**
 * 텍스트 기반 유언장을 등록합니다.
 * 백엔드 엔드포인트: POST /register (routes.js 기준)
 */
const registerWill = (data) => axios.post("/register", data);

/**
 * 특정 유언장의 상세 정보를 가져옵니다.
 * 백엔드 엔드포인트: GET /details/:willId?username=:username (routes.js 기준)
 */
const getWillDetails = async (id, username) => {
  // getWillDetailsService 대신 이 함수를 기본으로 사용
  if (!id) throw new Error("Will ID is required.");
  if (!username)
    throw new Error("Username is required for fetching will details.");

  try {
    const response = await axios.get(`/details/${id}`, {
      params: { username },
    });
    return response.data;
  } catch (error) {
    console.error(
      `willService.getWillDetails: Failed for ID ${id}, user ${username}`,
      error.response?.data || error.message
    );
    if (error.response) {
      const serviceError = new Error(
        error.response.data.message ||
          error.response.data.error ||
          "Failed to get will details"
      );
      serviceError.status = error.response.status;
      serviceError.data = error.response.data;
      throw serviceError;
    }
    throw error;
  }
};

/**
 * 현재 로그인된 사용자의 모든 유언장 목록을 가져옵니다.
 * 백엔드 엔드포인트: GET /wills/my-wills?username=:username (routes.js 기준)
 */
const getMyWills = async (username) => {
  if (!username) {
    throw new Error("Username is required to fetch wills.");
  }
  try {
    const response = await axios.get("/wills/my-wills", {
      params: {
        username: username,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      `willService.getMyWills: Failed to fetch wills for ${username}`,
      error.response?.data || error.message
    );
    if (error.response) {
      const serviceError = new Error(
        error.response.data.message ||
          error.response.data.error ||
          "Failed to get user wills"
      );
      serviceError.status = error.response.status;
      serviceError.data = error.response.data;
      throw serviceError;
    }
    throw error;
  }
};

const getDesignatedViewersWills = async (username) => {
  if (!username) {
    // 이 username은 백엔드에서 요청 사용자를 식별하는 데 사용될 수 있으나,
    // 주로 인증된 세션(req.user.username)을 통해 사용자를 식별합니다.
    // 클라이언트에서 명시적으로 보내는 것은 API 호출의 명확성을 위함이거나,
    // 백엔드가 쿼리 파라미터를 보조적으로 사용할 경우를 대비할 수 있습니다.
    throw new Error("Username is required to fetch designated viewer wills.");
  }
  try {
    const response = await axios.get("/wills/designatedViewers-wills", {
      params: {
        // 백엔드 컨트롤러 getDesignatedViewersWills는 req.user.username을 사용하므로,
        // 이 파라미터는 백엔드 로직상 필수적이지 않을 수 있습니다.
        // 하지만, API 호출의 일관성과 명확성을 위해 포함할 수 있습니다.
        username: username,
      },
    });
    return response.data; // 백엔드에서 조회된 유언장 목록 (또는 빈 배열)
  } catch (error) {
    console.error(
      `willService.getDesignatedViewersWills: Failed for user ${username}`,
      error.response?.data || error.message
    );
    if (error.response) {
      const serviceError = new Error(
        error.response.data.message ||
          error.response.data.error ||
          "Failed to get designated viewer wills"
      );
      serviceError.status = error.response.status;
      serviceError.data = error.response.data;
      throw serviceError;
    }
    throw error; // 그 외 네트워크 오류 등
  }
};

/**
 * 이미지 파일에서 텍스트를 추출합니다 (OCR).
 * 백엔드 엔드포인트: POST /ocr/extract-text (routes.js 기준)
 */
const extractTextFromImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axios.post("/ocr/extract-text", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * 사용자 로그인을 처리합니다.
 * 백엔드 엔드포인트: POST /auth/login (routes.js 기준)
 */
const loginUser = (credentials) => axios.post("/auth/login", credentials);

/**
 * 사용자 회원가입을 처리합니다.
 * 백엔드 엔드포인트: POST /auth/register (routes.js 기준)
 */
const registerUser = (userData) => axios.post("/auth/register", userData);

/**
 * 사용자 이름(username)으로 실제 이름(realName)을 조회합니다.
 * 백엔드 엔드포인트: GET /queryByName/:username (routes.js 기준)
 */
const queryByName = (username) => axios.get(`/queryByName/${username}`);

/**
 * 유언장 정보와 여러 이미지를 함께 등록합니다.
 * 백엔드 엔드포인트: POST /register-with-images (routes.js 에서 변경된 엔드포인트 이름 사용)
 */
const registerWillWithImage = (formData) => {
  // 함수 이름은 그대로 유지 (내부 호출 URL만 변경)
  return axios.post("/register-with-images", formData, {
    // URL 변경!
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * WillImages 테이블의 ID로 특정 유언장 이미지를 직접 가져옵니다.
 * 백엔드 엔드포인트: GET /image/:imageRecordId (routes.js 에서 변경된 파라미터명 사용)
 * @param {string} imageRecordId - 이미지를 가져올 WillImages 테이블의 레코드 ID
 */
const getWillImageByImageRecordId = (imageRecordId) => {
  // 함수 이름 및 파라미터명 변경
  return axios.get(`/image/${imageRecordId}`, {
    // URL 파라미터명 변경!
    responseType: "blob",
  });
};

/**
 * 사용자 프로필 조회 (GET /mypage/profile)
 */
const getUserProfile = async (username) => {
  if (!username) {
    throw new Error("Username is required to fetch user profile.");
  }
  try {
    const response = await axios.get(`/kkk/${username}`); // URL 변경: 경로 파라미터 사용
    return response.data;
  } catch (error) {
    console.error(
      `willService.getUserProfile: Failed for user ${username}`,
      error.response?.data || error.message
    );
    if (error.response) {
      const serviceError = new Error(
        error.response.data.message ||
          error.response.data.error ||
          "Failed to get user profile"
      );
      serviceError.status = error.response.status;
      serviceError.data = error.response.data;
      throw serviceError;
    }
    throw error;
  }
};

/**
 * 사용자 비밀번호 변경 (POST /mypage/update-password)
 */
const updatePassword = async ({ username, currentPassword, newPassword }) => {
  return axios.post("/mypage/update-password", {
    username,
    currentPassword,
    newPassword,
  });
};

/**
 * 사용자 일반 프로필 업데이트 (POST /mypage/update-profile)
 */
const updateUserProfile = async ({ username, phone }) => {
  return axios.post("/mypage/update-profile", {
    username,
    phone,
  });
};

/**
 * 사용자 확장 정보 업데이트 (POST /mypage/update-profile-extended)
 */
const updateUserProfileExtended = async ({
  username,
  address,
  gender,
  role,
}) => {
  return axios.post("/mypage/update-profile-extended", {
    username,
    address,
    gender,
    role,
  });
};
const getWillStatusCounts = async (username) => {
  if (!username) {
    throw new Error("Username is required to fetch will status counts.");
  }
  try {
    const response = await axios.get(`/mypage/status-counts/${username}`);
    return response.data;
  } catch (error) {
    console.error(
      `willService.getWillStatusCounts: Failed for user ${username}`,
      error.response?.data || error.message
    );
    if (error.response) {
      const serviceError = new Error(
        error.response.data.message ||
          error.response.data.error ||
          "Failed to get will status counts"
      );
      serviceError.status = error.response.status;
      serviceError.data = error.response.data;
      throw serviceError;
    }
    throw error;
  }
};







// 정의된 모든 함수들을 export 합니다.
export default {
  registerWill,
  getWillDetails, // getWillDetailsService 대신 getWillDetails를 export (또는 반대로 통일)
  getMyWills,
  extractTextFromImage,
  loginUser,
  registerUser,
  queryByName,
  registerWillWithImage,
  getWillImageByImageRecordId,
  getDesignatedViewersWills,
  getUserProfile,
  updatePassword,
  updateUserProfile,
  updateUserProfileExtended,
  getWillStatusCounts
};
