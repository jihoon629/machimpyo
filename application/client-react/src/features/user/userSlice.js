// src/features/user/userSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import willService from "../../services/willService";
import { showToastMessage } from "../common/uiSlice";

// 로그인
export const loginUser = createAsyncThunk(
  "user/loginUser",
  async ({ username, password }, { dispatch, rejectWithValue }) => {
    try {
      const response = await willService.loginUser({ username, password });

      const { user } = response.data;
      const { id: userId, username: userNameFromServer, name: realName } = user;

      sessionStorage.setItem("username", username);
      sessionStorage.setItem("userId", userId);
      sessionStorage.setItem("realName", realName);

      dispatch(
        showToastMessage({
          message: `환영합니다, ${realName}님!`,
          status: "success",
        })
      );

      return { username: userNameFromServer, userId, realName };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "로그인에 실패했습니다.";
      error.response?.data?.message || "로그인에 실패했습니다.";

      dispatch(
        showToastMessage({
          message: errorMessage,
          status: "error",
          status: "error",
        })
      );

      return rejectWithValue(errorMessage);
    }
  }
);

// 회원가입
export const registerUser = createAsyncThunk(
  "user/registerUser",
  "user/registerUser",
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const response = await willService.registerUser(userData);

      dispatch(
        showToastMessage({
          message: "회원가입이 완료되었습니다. 로그인해주세요!",
          status: "success",
          message: "회원가입이 완료되었습니다. 로그인해주세요!",
          status: "success",
        })
      );

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "회원가입에 실패했습니다.";

      dispatch(
        showToastMessage({
          message: errorMessage,
          status: "error",
        })
      );

      return rejectWithValue(errorMessage);
    }
  }
);

// 공증인 회원가입
export const registerNotary = createAsyncThunk(
  "user/registerNotary",
  async ({ values, navigate }, { dispatch, rejectWithValue }) => {
    try {
      const response = await willService.registerNotary(values);

      dispatch(
        showToastMessage({
          message: "공증인 회원가입이 완료되었습니다. 로그인해주세요!",
          status: "success",
        })
      );

      navigate("/login");
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "공증인 회원가입에 실패했습니다.";

      dispatch(
        showToastMessage({
          message: errorMessage,
          status: "error",
        })
      );

      return rejectWithValue(errorMessage);
    }
  }
);

// 로그아웃
export const logoutUser = createAsyncThunk(
  "user/logoutUser",
  async (_, { dispatch }) => {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("userId");

    dispatch(
      showToastMessage({
        message: "성공적으로 로그아웃되었습니다.",
        status: "success",
      })
    );
    return;
  }
);

// 초기 상태
const initialState = {
  username: sessionStorage.getItem("username") || null,
  userId: sessionStorage.getItem("userId") || null,
  realName: sessionStorage.getItem("realName") || null,
  loading: false,
  error: null,
};

// 슬라이스
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 로그인
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.username = action.payload.username;
        state.userId = action.payload.userId;
        state.realName = action.payload.realName;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 회원가입
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 공증인 회원가입
      .addCase(registerNotary.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerNotary.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerNotary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 로그아웃
      .addCase(logoutUser.fulfilled, (state) => {
        state.username = null;
        state.userId = null;
        state.realName = null;
        sessionStorage.removeItem("realName");
      });
  },
});

export const { clearUserError } = userSlice.actions;
// 개별 export는 이미 위에서 했으므로 중복 제거
// export { loginUser, logoutUser, registerUser, registerNotary }; 삭제
export default userSlice.reducer;
