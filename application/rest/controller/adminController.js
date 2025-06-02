const pool = require('../db');

// 관리자 권한 체크 함수
function isNotAdmin(req) {
    const username = req.query.username || req.body.username;
    console.log('[ 관리자 체크] username:', username);
    return username !== 'admin001';
}

// 전체 사용자 목록 조회
async function getAllUsers(req, res) {
    if (isNotAdmin(req)) return res.status(403).json({ error: '관리자 권한이 필요합니다.' });

    try {
        console.log('[👤 사용자 목록 요청]');
        const [rows] = await pool.execute('SELECT * FROM Users');
        console.log(`[사용자 수] ${rows.length}명`);
        res.json(rows);
    } catch (err) {
        console.error('[ getAllUsers 실패]:', err);
        res.status(500).json({ error: '전체 사용자 불러오기 실패' });
    }
}

// 사용자 삭제
async function deleteUser(req, res) {
    if (isNotAdmin(req)) return res.status(403).json({ error: '관리자 권한이 필요합니다.' });

    const { username } = req.params;
    if (!username) return res.status(400).json({ error: 'username이 필요합니다.' });

    try {
        console.log(`[사용자 삭제 시도] ${username}`);
        const [result] = await pool.execute('DELETE FROM Users WHERE username = ?', [username]);
        if (result.affectedRows === 0) {
            console.log('[ 사용자 없음]');
            return res.status(404).json({ error: '사용자 없음' });
        }
        console.log('[ 사용자 삭제 성공]');
        res.json({ message: '사용자 삭제 성공' });
    } catch (err) {
        console.error('[ deleteUser 실패]:', err);
        res.status(500).json({ error: '사용자 삭제 실패' });
    }
}

// 전체 유언장 목록 조회
async function getAllWills(req, res) {
    if (isNotAdmin(req)) return res.status(403).json({ error: '관리자 권한이 필요합니다.' });

    try {
        console.log('[ 전체 유언장 조회]');
        const [rows] = await pool.execute('SELECT * FROM Wills ORDER BY created_at DESC');
        console.log(`[ 유언장 수] ${rows.length}건`);
        res.json(rows);
    } catch (err) {
        console.error('[ getAllWills 실패]:', err);
        res.status(500).json({ error: '유언장 목록 불러오기 실패' });
    }
}

// 특정 유언장 상세 조회
async function getWillDetailById(req, res) {
    if (isNotAdmin(req)) return res.status(403).json({ error: '관리자 권한이 필요합니다.' });

    const { willId } = req.params;

    try {
        console.log(`[ 유언장 상세 요청] willId=${willId}`);
        const [rows] = await pool.execute('SELECT * FROM Wills WHERE id = ?', [willId]);
        if (rows.length === 0) {
            console.log('[ 유언장 없음]');
            return res.status(404).json({ error: '유언장 없음' });
        }
        console.log('[ 유언장 조회 성공]');
        res.json(rows[0]);
    } catch (err) {
        console.error('[ getWillDetailById 실패]:', err);
        res.status(500).json({ error: '유언장 조회 실패' });
    }
}

// 전체 WillMeta (유언장 상태) 목록 조회
async function getAllWillMeta(req, res) {
    if (isNotAdmin(req)) return res.status(403).json({ error: '관리자 권한이 필요합니다.' });

    try {
        console.log('[ WillMeta 전체 조회]');
        const [rows] = await pool.execute(`
            SELECT wm.*, w.testator_id
            FROM WillMeta wm
            LEFT JOIN Wills w ON wm.will_id = w.id
            ORDER BY wm.created_at DESC
        `);
        console.log(`[ WillMeta 수] ${rows.length}건`);
        res.json(rows);
    } catch (err) {
        console.error('[ getAllWillMeta 실패]:', err);
        res.status(500).json({ error: 'WillMeta 조회 실패' });
    }
}

// 유언장 상태(사망 여부) 승인/거절 업데이트
async function updateWillMetaStatus(req, res) {
    if (isNotAdmin(req)) return res.status(403).json({ error: '관리자 권한이 필요합니다.' });

    const { id } = req.params;
    const { status } = req.body;

    console.log(`[⚙ 상태 변경 시도] id=${id}, status=${status}`);

    if (!['confirmed_deceased', 'rejected'].includes(status)) {
        console.log('[ 잘못된 status 값]');
        return res.status(400).json({ error: 'status는 confirmed_deceased 또는 rejected 이어야 합니다.' });
    }

    try {
        const [result] = await pool.execute(
            'UPDATE WillMeta SET status = ? WHERE id = ?',
            [status, id]
        );

        if (result.affectedRows === 0) {
            console.log('[ WillMeta 항목 없음]');
            return res.status(404).json({ error: 'WillMeta 항목 없음' });
        }

        console.log(`[ 상태 업데이트 완료] → ${status}`);
        res.json({ message: `상태가 '${status}'로 변경되었습니다.` });
    } catch (err) {
        console.error('[ updateWillMetaStatus 실패]:', err);
        res.status(500).json({ error: '상태 변경 실패' });
    }
}

module.exports = {
    getAllUsers,
    deleteUser,
    getAllWills,
    getWillDetailById,
    getAllWillMeta,
    updateWillMetaStatus
};
