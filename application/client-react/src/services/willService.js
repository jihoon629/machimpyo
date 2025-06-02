import axios from 'axios'; //백엔드 API 호출 모듈 (axios)

// 이 baseURL 설정은 유지합니다. 각 API 호출은 이 URL 뒤에 붙는 상대 경로를 사용합니다.
axios.defaults.baseURL = 'http://192.168.72.128:8001';

/**
 * 텍스트 기반 유언장을 등록합니다.
 * 백엔드 엔드포인트: POST /register (routes.js 기준)
 */
const registerWill = (data) => axios.post('/register', data);

/**
 * 특정 유언장의 상세 정보를 가져옵니다.
 * 백엔드 엔드포인트: GET /details/:willId?username=:username (routes.js 기준)
 */
const getWillDetails = async (id, username) => { // getWillDetailsService 대신 이 함수를 기본으로 사용
  if (!id) throw new Error("Will ID is required.");
  if (!username) throw new Error("Username is required for fetching will details.");

  try {
    const response = await axios.get(`/details/${id}`, {
      params: { username }
    });
    return response.data;
  } catch (error) {
    console.error(`willService.getWillDetails: Failed for ID ${id}, user ${username}`, error.response?.data || error.message);
    if (error.response) {
        const serviceError = new Error(error.response.data.message || error.response.data.error || 'Failed to get will details');
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
    const response = await axios.get('/wills/my-wills', {
      params: {
        username: username
      }
    });
    return response.data;
  } catch (error) {
    console.error(`willService.getMyWills: Failed to fetch wills for ${username}`, error.response?.data || error.message);
    if (error.response) {
        const serviceError = new Error(error.response.data.message || error.response.data.error || 'Failed to get user wills');
        serviceError.status = error.response.status;
        serviceError.data = error.response.data;
        throw serviceError;
    }
    throw error;
  }
};

/**
 * 이미지 파일에서 텍스트를 추출합니다 (OCR).
 * 백엔드 엔드포인트: POST /ocr/extract-text (routes.js 기준)
 */
const extractTextFromImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post('/ocr/extract-text', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * 사용자 로그인을 처리합니다.
 * 백엔드 엔드포인트: POST /auth/login (routes.js 기준)
 */
const loginUser = (credentials) => axios.post('/auth/login', credentials);

/**
 * 사용자 회원가입을 처리합니다.
 * 백엔드 엔드포인트: POST /auth/register (routes.js 기준)
 */
const registerUser = (userData) => axios.post('/auth/register', userData);

/**
 * 사용자 이름(username)으로 실제 이름(realName)을 조회합니다.
 * 백엔드 엔드포인트: GET /queryByName/:username (routes.js 기준)
 */
const queryByName = (username) => axios.get(`/queryByName/${username}`);

/**
 * 유언장 정보와 여러 이미지를 함께 등록합니다.
 * 백엔드 엔드포인트: POST /register-with-images (routes.js 에서 변경된 엔드포인트 이름 사용)
 */
const registerWillWithImage = (formData) => { // 함수 이름은 그대로 유지 (내부 호출 URL만 변경)
  return axios.post('/register-with-images', formData, { // URL 변경!
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * WillImages 테이블의 ID로 특정 유언장 이미지를 직접 가져옵니다.
 * 백엔드 엔드포인트: GET /image/:imageRecordId (routes.js 에서 변경된 파라미터명 사용)
 * @param {string} imageRecordId - 이미지를 가져올 WillImages 테이블의 레코드 ID
 */
const getWillImageByImageRecordId = (imageRecordId) => { // 함수 이름 및 파라미터명 변경
    return axios.get(`/image/${imageRecordId}`, { // URL 파라미터명 변경!
        responseType: 'blob'
    });
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
  getWillImageByImageRecordId // 함수 이름 변경에 맞춰 export 이름도 변경
};