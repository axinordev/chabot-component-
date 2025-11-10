import Chatbot from "./components/Chatbot";

function App() {
  return (
    <div>
      <Chatbot
        apiUrlEnglish="https://n8n.srv1012449.hstgr.cloud/webhook/english"
        apiUrlMalayalam="https://n8n.srv1012449.hstgr.cloud/webhook/malayalam"
      />

    </div>
  );
}

export default App;
