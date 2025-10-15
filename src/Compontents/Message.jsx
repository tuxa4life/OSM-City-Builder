import { useError } from "../Context/ErrorContext";

const Message = () => {
    const { errorMessage, errorAnimation } = useError();

    return (
        <>
            <style>{`@keyframes popIn { 0% { transform: translate(-50%, -80px); opacity: 0; } 100% { transform: translate(-50%, -50%); opacity: 1; } } @keyframes popOut { 0% { transform: translate(-50%, -50%); opacity: 1; } 100% { transform: translate(-50%, -80px); opacity: 0; } }`}</style>
            <div
                style={{
                    zIndex: 3,
                    position: "fixed",
                    top: "50px",
                    left: "50%",
                    padding: "13px 20px 10px 20px",
                    transform: "translate(-50%,-50%)",
                    backgroundColor: "rgba(255,255,255,0.6)",
                    backdropFilter: "blur(5px)",
                    borderRadius: "7px",
                    boxShadow: "0px 3px 5px 0px rgba(0,0,0,0.4)",
                    animation: `${errorAnimation ? "popIn" : "popOut"} 0.4s ease forwards`,
                }}
            >
                <div className="message">{errorMessage}</div>
            </div>
        </>
    );
};

export default Message;
