import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyWills,
  fetchDesignatedWills,
} from "../../features/post/willSlice";
import { useNavigate } from "react-router-dom";
import {
  Container,
  ProfileSection,
  ProfileImage,
  ProfileInfo,
  CreateButton,
  DocumentList,
  DocumentItem,
  LeftSection,
  CenterSection,
  RightSection,
  DocumentTitle,
  InfoRow,
  HashText,
  CopyIcon,
  Label,
  DocumentInfo,
  ActionButtons,
  EditButton,
  DeleteButton,
  ButtonIcon,
} from "./style/WillListPageStyle";

const WillListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { myWills, designatedWills, loading } = useSelector(
    (state) => state.will
  );

  useEffect(() => {
    const storedUsername = sessionStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
      dispatch(fetchMyWills(storedUsername));
      dispatch(fetchDesignatedWills(storedUsername));
    }
  }, [dispatch]);

  const filterWills = (list) => {
    if (!searchTerm) return list;
    const keyword = searchTerm.toLowerCase();
    return list.filter(
      (item) =>
        (item.id || "").toString().toLowerCase().includes(keyword) ||
        (item.title || "").toLowerCase().includes(keyword)
    );
  };

  const handleItemClick = (id) => {
    if (id) navigate(`/will/${id}`);
  };

  const renderList = (title, list, type) => (
    <>
      <h3 style={{ marginTop: "24px" }}>{title}</h3>
      <DocumentList>
        {loading ? (
          <p>로딩 중...</p>
        ) : list.length > 0 ? (
          list.map((will) => (
            <DocumentItem
              key={will.id}
              onClick={() => handleItemClick(will.id)}
            >
              <LeftSection>📄</LeftSection>
              <CenterSection>
                <DocumentTitle>{will.title || "제목 없음"}</DocumentTitle>
                <InfoRow>
                  <HashText>{will.hash || "해시 없음"}</HashText>
                  <CopyIcon src="/images/E10.PNG" alt="복사" />
                  {will.blockchainRegistered && (
                    <Label $blockchain>블록체인 등록됨</Label>
                  )}
                  {will.notarized && <Label $notarized>공증 완료</Label>}
                </InfoRow>
                {type === "designated" && (
                  <DocumentInfo>작성자: {will.testatorId}</DocumentInfo>
                )}
              </CenterSection>
              <RightSection>
                <ActionButtons>
                  <EditButton>
                    <ButtonIcon src="/images/D2.PNG" alt="수정" />
                    수정하기
                  </EditButton>
                  <DeleteButton>
                    <ButtonIcon src="/images/D3.PNG" alt="삭제" />
                    삭제하기
                  </DeleteButton>
                </ActionButtons>
              </RightSection>
            </DocumentItem>
          ))
        ) : (
          <p>유언장이 없습니다.</p>
        )}
      </DocumentList>
    </>
  );

  return (
    <Container>
      <ProfileSection>
        <ProfileImage src="/images/back.PNG" alt="프로필" />
        <ProfileInfo>
          <h2>{username || "사용자"}</h2>
          <p>가입일: 2023년 8월</p>
          <p>{username}@example.com</p>
        </ProfileInfo>
        <CreateButton onClick={() => navigate("/write")}>
          유언장 작성 시작하기
        </CreateButton>
      </ProfileSection>

      <input
        className="form-control mb-3"
        placeholder="검색어를 입력하세요 (ID 또는 제목)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {renderList("나의 유언장", filterWills(myWills), "my")}
      {renderList(
        "내가 지정 열람자인 유언장",
        filterWills(designatedWills),
        "designated"
      )}
    </Container>
  );
};

export default WillListPage;
