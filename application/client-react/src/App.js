import './App.css';
import AppRouter from './routes/AppRouter';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div>
      <AppRouter/>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}

export default App; 

//리액트 연동 테스트용 코드

// import React, { useState } from 'react';
// import WillForm from './components/WillForm';
// import WillList from './components/WillList';
// import WillDetails from './components/WillDetails';

// function App() {
//   const [selectedWillId, setSelectedWillId] = useState(null);

//   return (
//     <div className="container mt-4">
//       <h2>마침표 - 디지털 유언장</h2>
//       <WillForm />
//       <hr />
//       <WillList onSelect={setSelectedWillId} />
//       <hr />
//       <WillDetails willId={selectedWillId} />
//     </div>
//   );
// }

// export default App;

