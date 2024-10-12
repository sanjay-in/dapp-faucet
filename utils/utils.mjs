import { toast } from "react-toastify";

export const toastMessage = (type, text) => {
  if (type == "error") {
    return toast.error(text, {
      position: "top-center",
      hideProgressBar: "true",
      autoClose: 3000,
      closeOnClick: true,
      pauseOnHover: true,
    });
  } else {
    {
      return toast.success(text, {
        position: "top-center",
        hideProgressBar: "true",
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
      });
    }
  }
};

export const getTimeUnit = (timeInSeconds) => {
  if (timeInSeconds < 60) {
    return [timeInSeconds, "seconds"];
  } else if (timeInSeconds >= 60 && timeInSeconds < 3600) {
    const roundValue = Math.round(timeInSeconds / 60);
    if (roundValue == 1) {
      return [1, "minute"];
    }
    return [roundValue, "minutes"];
  } else if (timeInSeconds >= 3600) {
    const roundValue = Math.round(timeInSeconds / 60 / 60);
    if (roundValue == 1) {
      return [1, "hour"];
    }
    return [roundValue, "hours"];
  }
};
