import Chatbot from "./components/Chatbot";

function App() {
  return (
    <div>
      <Chatbot
        // apiUrlEnglish={import.meta.env.VITE_API_URL_ENGLISH}
        // apiUrlMalayalam={import.meta.env.VITE_API_URL_MALAYALAM}
        apiUrl={import.meta.env.VITE_API_URL}
      />

    </div>
  );
}

export default App;
