// src/pages/AdminManagement/Style/AdminManagementStyle.js
import styled from "styled-components";

export const PageContainer = styled.div`
  padding: 2rem;
  background-color: #f4f6f8;
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
`;

export const Title = styled.h1`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
`;

export const TopControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

export const SearchRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const Label = styled.label`
  font-weight: 500;
  color: #333;
`;

export const Select = styled.select`
  padding: 0.4rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  height: 2.2rem;
  font-size: 0.9rem;
`;

export const Input = styled.input`
  padding: 0.4rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  height: 2.2rem;
  font-size: 0.9rem;
`;

export const Button = styled.button`
  background-color: #1976d2;
  color: #fff;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1565c0;
  }
`;

export const FilterButtons = styled.div`
  display: flex;
  gap: 0.3rem;
`;

export const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

export const ActionButton = styled.button`
  background-color: ${(props) => (props.danger ? "#d32f2f" : "#f5f5f5")};
  color: ${(props) => (props.danger ? "#fff" : "#333")};
  border: 1px solid #ccc;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${(props) => (props.danger ? "#b71c1c" : "#e0e0e0")};
  }
`;

export const TableContainer = styled.div`
  overflow-x: auto;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;

  th,
  td {
    border-bottom: 1px solid #e0e0e0;
    padding: 0.6rem 0.8rem;
    text-align: center;
    font-size: 0.9rem;
  }

  th {
    background-color: #f9f9f9;
    font-weight: 500;
  }

  td {
    background-color: #fff;
  }

  tr:hover td {
    background-color: #f5f5f5;
  }

  .dead {
    color: #c62828;
    font-weight: 500;
  }

  .alive {
    color: #2e7d32;
    font-weight: 500;
  }

  td:nth-child(6) {
    text-align: left;
  }
`;

export const Tr = styled.tr``;
export const Td = styled.td``;
export const Th = styled.th``;

export const DownloadBtn = styled.button`
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin-left: 0.5rem;
  cursor: pointer;

  &:hover {
    background-color: #e0e0e0;
  }
`;
