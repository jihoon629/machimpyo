import React from "react";
import { Routes, Route } from "react-router-dom";

// Layout
import AppLayOut from "../Layout/AppLayOut";

// Pages
import HomePage from "../pages/Homepage/HomePage";
import LoginPage from "../pages/LoginPage/LoginPage";
import MyPage from "../pages/MyPage/MyPage";
import RegisterPage from "../pages/RegisterPage/RegisterPage";
import WillWritePage from "../pages/WillWritePage";
import WillDetailPage from "../pages/WillDetailPage";
import NotFoundPage from "../pages/NotFoundPage";
import WillList from "../pages/WillListPage/WillListPage";
import WillDetails from "../pages/WillDetailPage";
import UserProfileComponent from "../components/UserProfileComponent";
import UserMyPage from "../pages/MyPage/MyPage";

const AppRouter = () => {
  return (
    <Routes>
      {/* Main App Layout - All pages below share the AppLayOut */}
      <Route element={<AppLayOut />}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* User Routes */}
        <Route path="/mypage" element={<MyPage />} />

        {/* Will Routes */}
        <Route path="/write" element={<WillWritePage />} />
        {/* Dynamic route for Will detail, supports backend integration */}
        <Route path="/will/:willId" element={<WillDetailPage />} />
        <Route path="/success" element={<WillList />} />
        <Route path="/detail/:willId" element={<WillDetails />} />
        <Route path="/name" element={<UserProfileComponent />} />
        <Route path="/MyPage" element={<UserMyPage />} />
      </Route>

      {/* Catch-All Not Found Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
