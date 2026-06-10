import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          สวัสดีครับ นี่คือโปรเจคแรกของผมที่ใช้ React.js ในการพัฒนาเว็บแอปพลิเคชันสำหรับกิจกรรมในโรงเรียนของเรา หวังว่าทุกคนจะชอบและสนุกกับการใช้งานนะครับ!
        </a>
      </header>
    </div>
  );
}

export default App;
