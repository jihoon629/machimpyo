import React, { useEffect, useState } from "react";
import {
  MyPageContainer,
  MyPageProfile,
  ProfileInfo,
  ProfileImage,
  ProfileText,
  ProfileName,
  ProfileEmail,
  ProfileDate,
  EditProfileButton,
  MyPageStats,
  StatCard,
  StatValue,
  StatLabel,
  MyPageActions,
  ActionButton,
  MyPageColumns,
  MyPageRecent,
  MyPageSide,
  Box,
  SettingsList,
  SettingsItem,
  LinkedServicesText,
  LogoutButton,
  ActivityItem,
} from "./style/MyPageStyle";
import { useSelector } from "react-redux";
import willService from "../../services/willService";

const MyPage = () => {
  const { username } = useSelector((state) => state.user);

  const [myWills, setMyWills] = useState([]);
  const [viewerWills, setViewerWills] = useState([]);
  const [profile, setProfile] = useState({
    name: "이름 없음",
    email: "이메일 없음",
    joinDate: "불명",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("📛 현재 로그인된 사용자 username:", username);

    const fetchWills = async () => {
      try {
        const myData = await willService.getMyWills(username);
        const viewerData = await willService.getDesignatedViewersWills(
          username
        );

        console.log("📜 getMyWills 응답:", myData);
        console.log("👁 getDesignatedViewersWills 응답:", viewerData);

        setMyWills(myData);
        setViewerWills(viewerData);
      } catch (error) {
        console.error("❌ 유언장 정보 로딩 실패:", error);
      }
    };

    const fetchProfile = async () => {
      try {
        const res = await willService.getUserProfile(username); // ✅ 백엔드 변경된 엔드포인트 사용
        console.log("🙋‍♀️ 사용자 프로필 응답:", res);

        setProfile({
          name: res.name || "이름 없음",
          email: res.email || "이메일 없음",
          joinDate: res.createdAt ? res.createdAt.slice(0, 10) : "불명",
        });
      } catch (error) {
        console.error("❌ 프로필 정보 로딩 실패:", error);
      }
    };

    if (username) {
      fetchWills();
      fetchProfile();
    } else {
      console.warn("⚠️ username이 없어서 API 요청을 생략합니다.");
    }

    setLoading(false);
  }, [username]);

  const countByStatus = (status) =>
    myWills.filter((will) => will.status === status).length;

  if (loading) return <div>⏳ 마이페이지 로딩 중...</div>;

  return (
    <MyPageContainer>
      <MyPageProfile>
        <ProfileInfo>
          <ProfileImage src="/images/kim.PNG" alt="프로필 사진" />
          <ProfileText>
            <ProfileName>{profile.name}</ProfileName>
            <ProfileEmail>{profile.email}</ProfileEmail>
            <ProfileDate>가입일: {profile.joinDate}</ProfileDate>
          </ProfileText>
        </ProfileInfo>
        <EditProfileButton>프로필 수정</EditProfileButton>
      </MyPageProfile>

      <MyPageStats>
        {["작성중", "공증중", "공증완료"].map((status, idx) => (
          <StatCard key={idx}>
            <StatValue>{countByStatus(status)}</StatValue>
            <StatLabel>
              {status === "작성중"
                ? "작성 중인 유언장"
                : status === "공증중"
                ? "공증 진행 중"
                : "공증 완료"}
            </StatLabel>
          </StatCard>
        ))}
        <StatCard>
          <StatValue>{viewerWills.length}</StatValue>
          <StatLabel>지정 열람자</StatLabel>
        </StatCard>
      </MyPageStats>

      <MyPageActions>
        {["E1", "E2", "E3"].map((icon, idx) => (
          <ActionButton key={idx}>
            <img src={`/images/${icon}.PNG`} alt={icon} />
            <span>
              {idx === 0
                ? "새 유언장 작성"
                : idx === 1
                ? "열람자 관리"
                : "보안 설정"}
            </span>
          </ActionButton>
        ))}
      </MyPageActions>

      <MyPageColumns>
        <MyPageRecent>
          <h4>최근 활동</h4>
          <ul>
            {[
              "주 유언장 내용 수정",
              "새로운 열람자 추가: 김미란",
              "유언장 공증 완료",
              "2단계 인증 활성화",
            ].map((text, i) => (
              <li key={i}>
                <ActivityItem>
                  <img
                    src="/images/E7.PNG"
                    alt="시계 아이콘"
                    className="icon"
                  />
                  {text}
                </ActivityItem>
                <span className="date">2023.11.{15 - i * 2}</span>
              </li>
            ))}
          </ul>
        </MyPageRecent>

        <MyPageSide>
          <Box>
            <h4>보안 설정</h4>
            <SettingsList>
              {["2단계 인증", "알림 설정", "계정 설정"].map((label, i) => (
                <li key={i}>
                  <SettingsItem>
                    <img
                      src={`/images/E${4 + i}.PNG`}
                      alt={label}
                      className="icon"
                    />
                    <span>{label}</span>
                    <img src="/images/E9.PNG" alt="화살표" className="arrow" />
                  </SettingsItem>
                </li>
              ))}
            </SettingsList>
          </Box>

          <Box>
            <h4>연동 서비스</h4>
            <LinkedServicesText>
              공증 서비스 <span className="active">연동됨</span>
            </LinkedServicesText>
            <LinkedServicesText>
              블록체인 지갑 <span className="active">연동됨</span>
            </LinkedServicesText>
          </Box>

          <LogoutButton>
            <img src="/images/E8.PNG" alt="로그아웃" className="icon" />
            로그아웃
          </LogoutButton>
        </MyPageSide>
      </MyPageColumns>
    </MyPageContainer>
  );
};

export default MyPage;
