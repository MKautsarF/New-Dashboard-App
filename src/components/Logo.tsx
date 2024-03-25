import React from "react";

import bptp from "@/static/BPTP.png";
import mot from "@/static/MoT.png";
import newlogo from "@/static/newLogo.jpg";
import { Title } from "@mui/icons-material";

const Logo = () => {
  return (
    <div className="flex gap-2 items-center justify-center ml-4">
      {/* <img src={mot} alt="MoT Logo" width={100} height={117} /> */}
      {/* <img src={bptp} alt="BPTP Logo" width={158} height={158} /> */}
      <img src={newlogo} alt="New Logo" height={130} />
    </div>
    // <div className="mx-2">
    //   <h1 className="text-6xl flex gap-5 items-center text-slate-400">
    //     <span>L</span>
    //     <span>M</span>
    //     <span>S</span>
    //   </h1>
    // </div>
  );
};

export default Logo;
