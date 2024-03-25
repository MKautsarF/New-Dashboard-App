import { CircularProgress } from "@mui/material";
import React, { FC } from "react";

interface FullPageLoadingProps {
  loading: boolean;
}

const FullPageLoading: FC<FullPageLoadingProps> = ({ loading }) => {
  return (
    <div
      className={`${
        loading ? "block" : "hidden"
      } fixed top-0 left-0 h-full w-full bg-black/[0.6] flex items-center justify-center text-blue-300 z-50`}
    >
      <CircularProgress size={64} />
    </div>
  );
};

export default FullPageLoading;
