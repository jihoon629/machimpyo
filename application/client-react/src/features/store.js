// src/features/store.js
import { configureStore } from "@reduxjs/toolkit";
import userSlice from './user/userSlice';
import uiSlice from './common/uiSlice';
import willSlice from './post/willSlice';
// import yourSlice from './yourSlice';

const store = configureStore({
  reducer: {
    // yourReducer: yourSlice
    user: userSlice,
    ui: uiSlice,
    will:willSlice,
  },
});

export default store;
