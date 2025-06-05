import React, { useState } from "react";
import {
  PageContainer,
  Title,
  TopControls,
  SearchRow,
  Label,
  Select,
  Input,
  Button,
  FilterButtons,
  Actions,
  ActionButton,
  TableContainer,
  Table,
  Tr,
  Td,
  Th,
  DownloadBtn,
} from "./Style/AdminManagementStyle";
import { MdArrowDownward, MdArrowUpward } from "react-icons/md";

const AdminManagement = () => {
  const [data, setData] = useState([
    {
      id: 1,
      name: "이상혁",
      gender: "남자",
      age: 29,
      file: "부동산등기부등본.pdf",
      fileSize: "2.3MB",
      status: "사망",
      selected: false,
    },
    {
      id: 2,
      name: "류금태",
      gender: "남자",
      age: 69,
      file: "유언정정서류.pdf",
      fileSize: "2.3MB",
      status: "사망",
      selected: false,
    },
    {
      id: 3,
      name: "이하늘",
      gender: "여자",
      age: 49,
      file: "가족등록.pdf",
      fileSize: "2.3MB",
      status: "사망",
      selected: false,
    },
    {
      id: 4,
      name: "이상호",
      gender: "남자",
      age: 49,
      file: "사망.pdf",
      fileSize: "2.3MB",
      status: "생존",
      selected: false,
    },
  ]);

  const [sortOrder, setSortOrder] = useState("latest"); // 최신순 기본

  const toggleSelect = (id) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const toggleSelectAll = () => {
    const isAllSelected = data.every((item) => item.selected);
    setData((prevData) =>
      prevData.map((item) => ({ ...item, selected: !isAllSelected }))
    );
  };

  const toggleDeathStatus = () => {
    setData((prevData) =>
      prevData.map((item) =>
        item.selected
          ? { ...item, status: item.status === "사망" ? "생존" : "사망" }
          : item
      )
    );
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "latest" ? "oldest" : "latest"));
  };

  const sortedData = [...data].sort((a, b) => {
    if (sortOrder === "latest") {
      return b.id - a.id;
    } else {
      return a.id - b.id;
    }
  });

  return (
    <PageContainer>
      <Title>관리자 사망 관리 페이지</Title>

      <TopControls>
        <SearchRow>
          <Label>조건 검색</Label>
          <Select>
            <option>선택</option>
            <option>이름</option>
            <option>성별</option>
          </Select>
          <Input type="text" placeholder="검색어 입력" />
          <Button>검색</Button>
        </SearchRow>

        <SearchRow>
          <Label>기간 검색</Label>
          <Select>
            <option>년도 확인</option>
          </Select>
          <Input type="date" /> ~ <Input type="date" />
        </SearchRow>

        <FilterButtons>
          <Button>전체</Button>
          <Button>전월</Button>
          <Button>오늘</Button>
          <Button>금주</Button>
          <Button>전월</Button>
          <Button>금월</Button>
          <Button>전년</Button>
          <Button>금년</Button>
        </FilterButtons>
      </TopControls>

      <Actions>
        <ActionButton onClick={toggleSelectAll}>전체 선택</ActionButton>
        <ActionButton danger onClick={toggleDeathStatus}>
          사망여부 변경
        </ActionButton>
      </Actions>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>
                번호{" "}
                <span
                  onClick={toggleSortOrder}
                  style={{ cursor: "pointer", verticalAlign: "middle" }}
                  title={sortOrder === "latest" ? "최신순" : "오래된순"}
                >
                  {sortOrder === "latest" ? (
                    <MdArrowDownward size={16} />
                  ) : (
                    <MdArrowUpward size={16} />
                  )}
                </span>
              </Th>
              <Th>선택</Th>
              <Th>이름</Th>
              <Th>성별</Th>
              <Th>나이</Th>
              <Th>증명서류</Th>
              <Th>사망여부</Th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item) => (
              <Tr key={item.id}>
                <Td>{item.id}</Td>
                <Td>
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => toggleSelect(item.id)}
                  />
                </Td>
                <Td>{item.name}</Td>
                <Td>{item.gender}</Td>
                <Td>{item.age}</Td>
                <Td align="left">
                  <a href="#">{item.file}</a> ({item.fileSize}){" "}
                  <DownloadBtn>다운로드</DownloadBtn>
                </Td>
                <Td className={item.status === "사망" ? "dead" : "alive"}>
                  {item.status}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </PageContainer>
  );
};

export default AdminManagement;
