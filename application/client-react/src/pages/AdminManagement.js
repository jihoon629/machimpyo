import React, { useState, useEffect, useCallback } from "react";
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
} from "./Style/AdminManagementStyle";
import { MdArrowDownward, MdArrowUpward } from "react-icons/md";
import willService from "../../services/willService";

const AdminWillManagementPage = () => {
  const [wills, setWills] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedWillIds, setSelectedWillIds] = useState(new Set());
  // 정렬: key는 API 응답 필드명과 일치해야 함
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'descending' }); 

  const [searchParams, setSearchParams] = useState({
    condition: "", 
    keyword: "",
  });

  const [selectedWillDetail, setSelectedWillDetail] = useState(null);
  const [newStatusForAction, setNewStatusForAction] = useState("");

  const fetchWills = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {

      const data = await willService.getAllWillsByAdmin(); // 이 API 응답에 originalTitle, originalTestatorUsername 포함 가정
      console.log(data);
      let filteredData = data || [];
      if (searchParams.condition && searchParams.keyword) {
          const lowerKeyword = searchParams.keyword.toLowerCase();
          filteredData = data.filter(will => {
              let valueToSearch = '';
              // 검색 조건에 따라 검색 대상 필드 지정 (원본 값 우선)
              if (searchParams.condition === 'originalTitle') {
                valueToSearch = String(will.originalTitle || '').toLowerCase();
              } else if (searchParams.condition === 'originalTestatorUsername') {
                valueToSearch = String(will.originalTestatorUsername || '').toLowerCase();
              } else if (searchParams.condition === 'id') {
                valueToSearch = String(will.id || '').toLowerCase();
              } else if (searchParams.condition === 'title') { // 해시된 제목 검색 (대안)
                valueToSearch = String(will.title || '').toLowerCase();
              } else if (searchParams.condition === 'testatorId') { // 해시된 작성자 ID 검색 (대안)
                valueToSearch = String(will.testatorId || '').toLowerCase();
              } else if (searchParams.condition === 'status') {
                valueToSearch = String(will.status || '').toLowerCase();
              }
              return valueToSearch.includes(lowerKeyword);
          });
      }
      setWills(filteredData);

    } catch (err) {
      console.error("Error fetching wills:", err.data || err.message);
      setError(err.data?.error || err.message || '유언장 목록을 불러오는 데 실패했습니다.');
      setWills([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]); 

  useEffect(() => {
    fetchWills();
  }, [fetchWills]);

  const handleSearchParamChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    fetchWills();
    setSelectedWillIds(new Set());
  };
  
  const toggleSelect = (willId) => {
    setSelectedWillIds(prevSelectedIds => {
      const newSelectedIds = new Set(prevSelectedIds);
      if (newSelectedIds.has(willId)) {
        newSelectedIds.delete(willId);
      } else {
        newSelectedIds.add(willId);
      }
      return newSelectedIds;
    });
  };

  const toggleSelectAll = () => {
    if (selectedWillIds.size === wills.length && wills.length > 0) {
      setSelectedWillIds(new Set());
    } else {
      setSelectedWillIds(new Set(wills.map(w => w.id)));
    }
  };

  const handleChangeWillStatus = async () => {
    if (selectedWillIds.size === 0) {
      alert("상태를 변경할 유언장을 선택해주세요.");
      return;
    }
    if (!newStatusForAction) {
        alert("변경할 새로운 상태를 선택해주세요.");
        return;
    }

    setIsLoading(true);
    setError('');
    let successCount = 0;
    const willsToUpdate = Array.from(selectedWillIds);

    for (const willId of willsToUpdate) {
      try {
        // TODO: willService에 유언장 상태 변경 API 함수 추가 필요 (이전과 동일)
        // 예: await willService.updateWillStatusAdmin(willId, newStatusForAction);
        console.log(`(구현 필요) 유언장 ID ${willId}의 상태를 ${newStatusForAction}(으)로 변경 요청`);
        successCount++;
      } catch (err) {
        console.error(`Error updating status for will ${willId}:`, err.data || err.message);
        setError(err.data?.error || err.message || `${willId} 상태 변경 실패`);
      }
    }
    setIsLoading(false);
    alert(`${successCount}개 유언장 상태 변경 요청 완료. (실제 API 연동 시 메시지 수정)`);
    setSelectedWillIds(new Set()); 
    fetchWills(); 
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
      key = 'createdAt'; // 기본 정렬 (생성일 내림차순)
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedWills = React.useMemo(() => {
    let sortableItems = [...wills];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // 필드 유형에 따른 비교 (원본 값 우선)
        if (['id', 'title', 'testatorId', 'status', 'originalTitle', 'originalTestatorUsername'].includes(sortConfig.key)) {
            aValue = String(aValue || '').toLowerCase(); // null 또는 undefined 방지
            bValue = String(bValue || '').toLowerCase();
        } else if (sortConfig.key === 'createdAt'){
            aValue = aValue ? new Date(aValue) : new Date(0); // null 방지, 오래된 날짜로
            bValue = bValue ? new Date(bValue) : new Date(0);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [wills, sortConfig]);

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? <MdArrowUpward size={16} /> : <MdArrowDownward size={16} />;
    }
    return <MdArrowDownward size={16} style={{ opacity: 0.3 }}/>; 
  };

  const handleViewWillDetail = async (willId) => {
    setIsLoading(true);
    setError('');
    setSelectedWillDetail(null);
    try {
        const data = await willService.getWillDetailByIdAdmin(willId);
        setSelectedWillDetail(data);
    } catch (err) {
        console.error(`Error fetching will detail for ID ${willId} (admin):`, err.data || err.message);
        setError(err.data?.error || err.message || `ID가 ${willId}인 유언장 상세 정보를 불러오는 데 실패했습니다.`);
        setSelectedWillDetail(null);
    } finally {
        setIsLoading(false);
    }
  };


  if (selectedWillDetail) {
    return (
        <PageContainer>
            <Title>유언장 상세 정보 (ID: {selectedWillDetail?.blockchainData?.id || selectedWillDetail?.id})</Title>
            {isLoading && <div>상세 정보 로딩 중...</div>}
            {error && !isLoading && <div className="error-message" style={{color: 'red'}}>오류: {error}</div>}
            {!isLoading && selectedWillDetail && (
                <div className="will-detail-container" style={{ border: '1px solid #ccc', padding: '20px', marginTop: '20px', backgroundColor: '#f9f9f9', whiteSpace: 'pre-wrap' }}>
                    <pre>{JSON.stringify(selectedWillDetail, null, 2)}</pre>
                    <Button onClick={() => { setSelectedWillDetail(null); setError(''); }} style={{marginTop: '10px'}}>목록으로 돌아가기</Button>
                </div>
            )}
            {!isLoading && !selectedWillDetail && !error && <div>상세 정보를 불러올 수 없습니다.</div>}
        </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Title>관리자 유언장 관리 페이지</Title>

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>오류: {error}</div>}

      <TopControls>
        <SearchRow>
          <Label htmlFor="condition">조건 검색</Label>
          <Select id="condition" name="condition" value={searchParams.condition} onChange={handleSearchParamChange}>
            <option value="">선택</option>
            <option value="originalTitle">원본 제목</option>
            <option value="originalTestatorUsername">원본 작성자</option>
            <option value="id">유언장 ID (해시)</option>
            <option value="status">상태</option>
            <option value="title">제목 (해시)</option> {/* 혹시 몰라 남겨둠 */}
            <option value="testatorId">작성자 ID (해시)</option> {/* 혹시 몰라 남겨둠 */}
          </Select>
          <Input
            type="text"
            name="keyword"
            placeholder="검색어 입력"
            value={searchParams.keyword}
            onChange={handleSearchParamChange}
          />
          <Button onClick={handleSearch} disabled={isLoading}>검색</Button>
        </SearchRow>
        <FilterButtons>
          <Button onClick={() => {/* 전체 로직 */}}>전체</Button>
        </FilterButtons>
      </TopControls>

      <Actions>
        <ActionButton onClick={toggleSelectAll} disabled={isLoading || wills.length === 0}>
            {selectedWillIds.size === wills.length && wills.length > 0 ? "전체 해제" : "전체 선택"}
        </ActionButton>
        <Select 
            value={newStatusForAction} 
            onChange={(e) => setNewStatusForAction(e.target.value)}
            style={{marginRight: '10px', padding: '8px', height: '38px'}}
            disabled={isLoading}
        >
            <option value="">변경할 상태 선택</option>
            <option value="REGISTERED">REGISTERED</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="REVOKED_BY_TESTATOR">REVOKED_BY_TESTATOR</option>
            <option value="REVOKED_BY_ADMIN">REVOKED_BY_ADMIN</option>
        </Select>
        <ActionButton danger onClick={handleChangeWillStatus} disabled={isLoading || selectedWillIds.size === 0 || !newStatusForAction}>
          선택 항목 상태 변경
        </ActionButton>
      </Actions>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th style={{width: '5%'}}>
                <input type="checkbox" onChange={toggleSelectAll} checked={selectedWillIds.size === wills.length && wills.length > 0 && wills.length > 0} disabled={isLoading || wills.length === 0}/>
              </Th>
              <Th onClick={() => requestSort('id')} style={{cursor: 'pointer', width: '15%'}}>유언장 ID {getSortIndicator('id')}</Th>
              <Th onClick={() => requestSort('originalTitle')} style={{cursor: 'pointer', width: '20%'}}>원본 제목 {getSortIndicator('originalTitle')}</Th>
              <Th onClick={() => requestSort('originalTestatorUsername')} style={{cursor: 'pointer', width: '15%'}}>원본 작성자 {getSortIndicator('originalTestatorUsername')}</Th>
              <Th onClick={() => requestSort('status')} style={{cursor: 'pointer', width: '10%'}}>상태 {getSortIndicator('status')}</Th>
              <Th onClick={() => requestSort('createdAt')} style={{cursor: 'pointer', width: '15%'}}>생성일 {getSortIndicator('createdAt')}</Th>
              {/* 해시된 값도 필요하다면 컬럼 추가 가능 */}
              {/* <Th onClick={() => requestSort('title')} style={{cursor: 'pointer', width: '15%'}}>제목(해시) {getSortIndicator('title')}</Th> */}
              <Th style={{width: '10%'}}>관리</Th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
                <Tr><Td colSpan="7">유언장 목록을 불러오는 중...</Td></Tr>
            )}
            {!isLoading && error && (
                <Tr><Td colSpan="7" style={{color: 'red'}}>{error}</Td></Tr>
            )}
            {!isLoading && !error && sortedWills.length === 0 && (
              <Tr><Td colSpan="7">표시할 유언장이 없습니다.</Td></Tr>
            )}
            {!isLoading && !error && sortedWills.map((will) => (
              <Tr key={will.id}>
                <Td>
                  <input
                    type="checkbox"
                    checked={selectedWillIds.has(will.id)}
                    onChange={() => toggleSelect(will.id)}
                  />
                </Td>
                <Td>{will.id}</Td>
                {/* API 응답에 originalTitle 필드가 없다면 will.title (해시된 값)이 표시될 수 있도록 fallback 처리 */}
                <Td>{will.originalTitle || '(원본 제목 없음)'}</Td> 
                <Td>{will.originalTestatorUsername || '(원본 작성자 없음)'}</Td>
                <Td>{will.status}</Td>
                <Td>{will.createdAt ? new Date(will.createdAt).toLocaleString() : '-'}</Td>
                <Td>
                  <Button size="small" onClick={() => handleViewWillDetail(will.id)} disabled={isLoading}>상세보기</Button>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </PageContainer>
  );
};

export default AdminWillManagementPage;