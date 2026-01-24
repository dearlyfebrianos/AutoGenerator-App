import { toast } from "react-hot-toast";

export const showBadgeNotification = (title, message) => {
  toast.custom(
    (t) => (
      <div
        className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg rounded-lg pointer-events-auto flex p-4`}
      >
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-bold">{title}</p>
            <p className="text-xs opacity-90">{message}</p>
          </div>
        </div>
      </div>
    ),
    { duration: 6000 },
  );

  if (Notification.permission === "granted") {
    new Notification(`🏆 ${title}`, {
      body: message,
      icon: "/icon-192.png",
    });
  }
};