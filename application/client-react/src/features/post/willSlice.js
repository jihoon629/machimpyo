// ✅ willSlice.js - 기존 슬라이스 코드 리팩토링 (WillList 기반)

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import willService from "../../services/willService";
import { showToastMessage } from "../common/uiSlice";

// ✅ 유언장 목록 가져오기 (내가 작성한 유언장)
export const fetchMyWills = createAsyncThunk(
  "will/fetchMyWills",
  async (username, { dispatch, rejectWithValue }) => {
    try {
      const data = await willService.getMyWills(username);
      if (Array.isArray(data)) {
        dispatch(
          showToastMessage({
            message: `${data.length}개의 유언장이 조회되었습니다.`,
            status: "success",
          })
        );
      } else {
        dispatch(
          showToastMessage({
            message: "유언장 정보 응답 형식이 올바르지 않습니다.",
            status: "error",
          })
        );
      }
      return data;
    } catch (error) {
      dispatch(
        showToastMessage({
          message: "나의 유언장 조회 실패: " + (error.message || "오류 발생"),
          status: "error",
        })
      );
      return rejectWithValue(error.message || "유언장 목록 조회 실패");
    }
  }
);

// ✅ 유언장 상세 정보 가져오기
export const fetchWillDetails = createAsyncThunk(
  "will/fetchWillDetails",
  async ({ willId, username }, { rejectWithValue }) => {
    try {
      const data = await willService.getWillDetails(willId, username);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "유언장 상세 조회 실패");
    }
  }
);

// ✅ 유언장 등록
export const registerWill = createAsyncThunk(
  "will/registerWill",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      await willService.registerWillWithImage(formData);
      dispatch(
        showToastMessage({
          message: "유언장이 성공적으로 등록되었습니다.",
          status: "success",
        })
      );
      return true;
    } catch (error) {
      dispatch(
        showToastMessage({ message: "유언장 등록 실패", status: "error" })
      );
      return rejectWithValue(error.message || "유언장 등록 실패");
    }
  }
);

// ✅ OCR 텍스트 추출
export const extractTextFromImage = createAsyncThunk(
  "will/extractTextFromImage",
  async (file, { rejectWithValue }) => {
    try {
      const response = await willService.extractTextFromImage(file);
      return response.data.text;
    } catch (error) {
      return rejectWithValue(error.message || "텍스트 추출 실패");
    }
  }
);

// ✅ 지정된 유언장 목록 (열람권한 있는 유언장)
export const fetchDesignatedWills = createAsyncThunk(
  "will/fetchDesignatedWills",
  async (username, { dispatch, rejectWithValue }) => {
    try {
      const data = await willService.getDesignatedViewersWills(username);
      if (Array.isArray(data)) {
        dispatch(
          showToastMessage({
            message: `${data.length}개의 지정 유언장이 조회되었습니다.`,
            status: "success",
          })
        );
      } else {
        dispatch(
          showToastMessage({
            message: "지정 유언장 응답 형식이 올바르지 않습니다.",
            status: "error",
          })
        );
      }
      return data;
    } catch (error) {
      dispatch(
        showToastMessage({
          message: "지정 유언장 조회 실패: " + (error.message || "오류 발생"),
          status: "error",
        })
      );
      return rejectWithValue(error.message || "지정 유언장 조회 실패");
    }
  }
);

// ✅ 초기 상태
const initialState = {
  myWills: [],
  designatedWills: [],
  selectedWill: null,
  extractedText: "",
  loading: false,
  error: null,
};

// ✅ 슬라이스 정의
const willSlice = createSlice({
  name: "will",
  initialState,
  reducers: {
    clearSelectedWill: (state) => {
      state.selectedWill = null;
    },
    clearWillError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyWills.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyWills.fulfilled, (state, action) => {
        state.loading = false;
        state.myWills = action.payload;
      })
      .addCase(fetchMyWills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchWillDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWillDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedWill = action.payload;
      })
      .addCase(fetchWillDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerWill.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerWill.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerWill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(extractTextFromImage.pending, (state) => {
        state.loading = true;
      })
      .addCase(extractTextFromImage.fulfilled, (state, action) => {
        state.loading = false;
        state.extractedText = action.payload;
      })
      .addCase(extractTextFromImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDesignatedWills.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDesignatedWills.fulfilled, (state, action) => {
        state.loading = false;
        state.designatedWills = action.payload;
      })
      .addCase(fetchDesignatedWills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedWill, clearWillError } = willSlice.actions;
export default willSlice.reducer;
