import styled from 'styled-components';

/* 전체 컨테이너 */
export const MyPageContainer = styled.div`
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Pretendard', sans-serif;
  background-color: #f9fafb;
`;

/* 프로필 영역 */
export const MyPageProfile = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
`;

export const ProfileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

export const ProfileImage = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
`;

export const ProfileText = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ProfileName = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #111827;
`;

export const ProfileEmail = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

export const ProfileDate = styled.div`
  font-size: 13px;
  color: #9ca3af;
`;

export const EditProfileButton = styled.button`
  background-color: #6366f1;
  color: white;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
`;

/* 통계 카드 */
export const MyPageStats = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
`;

export const StatCard = styled.div`
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
`;

export const StatValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #111827;
`;

export const StatLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
`;

/* 빠른 작업 */
export const MyPageActions = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
`;

export const ActionButton = styled.div`
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);

  img {
    width: 32px;
    margin-bottom: 12px;
  }

  span {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
  }
`;

/* 2단 컬럼 */
export const MyPageColumns = styled.div`
  display: flex;
  gap: 32px;
`;

/* 최근 활동 */
export const MyPageRecent = styled.div`
  flex: 2;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);

  h4 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 16px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: #4b5563;
    margin-bottom: 12px;
  }

  .date {
    color: #9ca3af;
  }
`;

/* 사이드 영역 */
export const MyPageSide = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const Box = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);

  h4 {
    font-size: 15px;
    font-weight: 700;
    margin-bottom: 12px;
  }
`;

export const SettingsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    border-bottom: 1px solid #f3f4f6;
    &:last-child {
      border-bottom: none;
    }
  }
`;

export const SettingsItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;

  .icon {
    width: 18px;
    height: 18px;
    margin-right: 12px;
  }

  span {
    flex: 1;
    font-size: 14px;
    color: #374151;
  }

  .arrow {
    width: 16px;
    height: 16px;
    opacity: 0.5;
  }
`;

export const LinkedServicesText = styled.p`
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #4b5563;

  .active {
    color: #10b981;
    font-weight: 600;
  }
`;

export const LogoutButton = styled.button`
  background: #f3f4f6;
  color: #374151;
  font-size: 14px;
  padding: 10px 0;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  margin-top: auto;
`;

export const ActivityItem = styled.div`
  display: flex;
  align-items: center;

  .icon {
    width: 1em;
    height: 1em;
    margin-right: 0.5em;
  }
`;
