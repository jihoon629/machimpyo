import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import willService from "../../services/willService";
import { showToastMessage } from "../common/uiSlice"; // 공통 토스트 메시지 액션

// ✅ 비동기 로그인 Thunk
export const loginUser = createAsyncThunk(
  "user/loginUser",
  async ({ username, password }, { dispatch, rejectWithValue }) => {
    try {
      const response = await willService.loginUser({ username, password });

      const userData = response.data?.user || {
        id: response.data?.id,
        username: username,
        phone: response.data?.phone,
      };

      sessionStorage.setItem("username", username);

      dispatch(
        showToastMessage({
          message: `${username}님, 환영합니다!`,
          status: "success",
        })
      );

      return userData;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "로그인에 실패했습니다.";

      dispatch(
        showToastMessage({
          message: errorMsg,
          status: "error",
        })
      );

      return rejectWithValue(errorMsg);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    isLoggedIn: false,
    loading: false,
    error: null,
  },
  reducers: {
    logoutUser: (state) => {
      state.user = null;
      state.isLoggedIn = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoggedIn = true;
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logoutUser } = userSlice.actions;
export default userSlice.reducer;
