
// import 'bulma/css/bulma.min.css'
// import '@creativebulma/bulma-tooltip/dist/bulma-tooltip.min.css';

import './App.scss';

import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';


import Disp from './cont/Disp';
// import Footer from './cont/Footer';




function App() {


  return (

    <>
      <Router>

        <Routes>
          <Route exact path="/" element={<Disp />} />
          {/* <Route exact path="/help" element={<Info />} />
          <Route exact path="/raw" element={<Db />} /> */}
        </Routes>

      </Router>
      {/* <Footer /> */}
    </>

  );
}

export default App;
