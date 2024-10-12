import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import Home from "./components/Home/Home";
import ConnectMetaMask from "./components/ConnectMetamask/ConnectMetamask";
import { toastMessage } from "../utils/utils.mjs";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [connectMetamask, setConnectMetamask] = useState(false);

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum
          ?.request({
            method: "eth_requestAccounts",
          })
          .then(() => {
            setConnectMetamask(true);
          })
          .catch((error) => console.log(error));
      } catch (error) {}
    } else {
      toastMessage("error", "No metamask extension found");
    }
  };
  useEffect(() => {
    connectMetaMask();
  }, []);
  return (
    <>
      {connectMetamask ? <Home /> : <ConnectMetaMask connectMetaMask={connectMetaMask} />}
      <ToastContainer />
    </>
  );
}

export default App;
