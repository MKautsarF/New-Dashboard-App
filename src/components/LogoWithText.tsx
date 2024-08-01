import newlogo from "@/static/newLogo.jpg";

const LogoWithText = () => {
  return (
    <div className="flex gap-1 items-end justify-start w-fit">
      <img src={newlogo} alt="New Logo" height={100} />
      <p className="text-4xl font-bold pb-4">KCIC LRT Launcher</p>
    </div>
  );
};

export default LogoWithText;
