// src/features/store.js
import { configureStore } from "@reduxjs/toolkit";
import userSlice from './user/userSlice';
import uiSlice from './common/uiSlice';
import postSlice from './post/willSlice';
// import yourSlice from './yourSlice';

const store = configureStore({
  reducer: {
    // yourReducer: yourSlice
    user: userSlice,
    ui: uiSlice,
    post:postSlice,
  },
});

export default store;
