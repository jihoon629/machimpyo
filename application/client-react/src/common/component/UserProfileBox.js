import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../features/user/userSlice';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import styled from 'styled-components';

const UserTab = styled.div`
  position: relative;
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
`;

const UserName = styled.span`
  font-weight: bold;
  font-size: 16px;
`;

const CustomDropdownMenu = styled.div`
  position: absolute;
  top: 40px;
  left: 0;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 0.7rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  width: 8rem;
  display: flex;
  flex-direction: column;
`;

const DropdownItem = styled.div`
  padding: 10px 14px;
  border-bottom: 1px solid #eee;
  cursor: pointer;

  &:hover {
    background-color: #f8f8f8;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const UserProfileBox = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { username } = useSelector((state) => state.user);
  const userRole = sessionStorage.getItem('userRole');
  const [open, setOpen] = useState(false);

  const toggleDropdown = () => setOpen((prev) => !prev);

  const handleLogout = () => {
    dispatch(logoutUser());
    sessionStorage.clear();
    navigate('/');
  };

  const handleGoMypage = () => {
    if (userRole === 'ADMIN') {
      navigate('/adminpage');
    } else if (userRole === 'COMPANY') {
      navigate('/mypage/company');
    } else {
      navigate('/mypage/user');
    }
    setOpen(false);
  };

  return (
    <UserTab>
      <UserProfile onClick={toggleDropdown}>
        <AccountCircleIcon style={{ color: '#6c9466' }} />
        <UserName>{userRole === 'ADMIN' ? '관리자' : username || '사용자'}</UserName>
        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      </UserProfile>

      {open && (
        <CustomDropdownMenu>
          <DropdownItem onClick={handleGoMypage}>
            {userRole === 'ADMIN' ? '관리자페이지' : '마이페이지'}
          </DropdownItem>
          <DropdownItem onClick={handleLogout}>로그아웃</DropdownItem>
        </CustomDropdownMenu>
      )}
    </UserTab>
  );
};

export default UserProfileBox;
